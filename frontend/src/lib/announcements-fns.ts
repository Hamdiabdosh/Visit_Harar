import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, count, desc, eq, inArray, ne, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { announcements } from '../../drizzle/schema/index'
import { auth } from '@/lib/auth.server'
import { createError, isAppError } from '@/lib/errors'
import { DB_SETUP_HINT, isDbUnavailableError } from '@/lib/db-errors'
import { deleteImage, publicIdFromUrl, uploadImageBuffer } from '@/lib/cloudinary.server'
import { ensureUniqueSlug, generateSlug } from '@/lib/slug'
import { announcementInputSchema } from '@/lib/validators/announcements'
import type { AnnouncementType, UserRole } from '@/lib/types'

async function requireEditorSession() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) throw createError('UNAUTHORIZED', 'Authentication required')
  const role = (session.user as { role?: string }).role as UserRole
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true
  if (!isActive) throw createError('FORBIDDEN', 'Account is disabled')
  if (role !== 'superadmin' && role !== 'editor') {
    throw createError('FORBIDDEN', 'Insufficient permissions')
  }
  return { id: session.user.id }
}

export type AnnouncementDto = {
  id: string
  title: string
  slug: string
  type: AnnouncementType
  body: string | null
  cover_image: string | null
  event_date: string | null
  event_location: string | null
  is_pinned: boolean
  is_published: boolean
  published_at: Date | null
  created_by: string | null
  updated_by: string | null
  created_at: Date
  updated_at: Date
}

function rowToDto(row: typeof announcements.$inferSelect): AnnouncementDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type as AnnouncementType,
    body: row.body ?? null,
    cover_image: row.coverImage ?? null,
    event_date: row.eventDate ? String(row.eventDate) : null,
    event_location: row.eventLocation ?? null,
    is_pinned: row.isPinned,
    is_published: row.isPublished,
    published_at: row.publishedAt ?? null,
    created_by: row.createdBy ?? null,
    updated_by: row.updatedBy ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

const listFiltersSchema = z
  .object({
    type: z.enum(['News', 'Event', 'Notice']).optional(),
    publishedOnly: z.boolean().optional(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(50).default(10),
  })
  .optional()

export const getAnnouncements = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => listFiltersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<{ items: AnnouncementDto[]; total: number; page: number; perPage: number }> => {
    try {
      const page = filters?.page ?? 1
      const perPage = filters?.perPage ?? 10
      const conditions = []
      if (filters?.type) conditions.push(eq(announcements.type, filters.type))
      if (filters?.publishedOnly) conditions.push(eq(announcements.isPublished, true))

      const where = conditions.length ? and(...conditions) : undefined

      const [{ total }] = await db
        .select({ total: count(announcements.id) })
        .from(announcements)
        .where(where)

      const rows = await db
        .select()
        .from(announcements)
        .where(where)
        .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt), desc(announcements.updatedAt))
        .limit(perPage)
        .offset((page - 1) * perPage)

      return { items: rows.map(rowToDto), total: Number(total ?? 0), page, perPage }
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to list announcements')
    }
  })

export const getAnnouncementBySlug = createServerFn({ method: 'GET' })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<AnnouncementDto | null> => {
    try {
      const row = await db.query.announcements.findFirst({
        where: and(eq(announcements.slug, slug), eq(announcements.isPublished, true)),
      })
      return row ? rowToDto(row) : null
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to load announcement')
    }
  })

export const getAnnouncementById = createServerFn({ method: 'GET' })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<AnnouncementDto | null> => {
    try {
      await requireEditorSession()
      const row = await db.query.announcements.findFirst({ where: eq(announcements.id, id) })
      return row ? rowToDto(row) : null
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to load announcement')
    }
  })

export const getLatestAnnouncements = createServerFn({ method: 'GET' })
  .inputValidator((n: unknown) => z.number().int().min(1).max(10).parse(n))
  .handler(async ({ data: n }): Promise<AnnouncementDto[]> => {
    try {
      const rows = await db
        .select()
        .from(announcements)
        .where(eq(announcements.isPublished, true))
        .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt), desc(announcements.updatedAt))
        .limit(n)
      return rows.map(rowToDto)
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error('[getLatestAnnouncements]', DB_SETUP_HINT)
        return []
      }
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to load latest')
    }
  })

export const createAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => announcementInputSchema.parse(raw))
  .handler(async ({ data }): Promise<AnnouncementDto> => {
    try {
      const editor = await requireEditorSession()

      const baseSlug = generateSlug(data.slug || data.title)
      const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
        const existing = await db.query.announcements.findFirst({ where: eq(announcements.slug, candidate) })
        return Boolean(existing)
      })

      const isEvent = data.type === 'Event'
      const eventDate = isEvent && data.event_date ? new Date(data.event_date) : null
      const eventLocation = isEvent ? data.event_location ?? null : null

      const now = new Date()
      const shouldPublish = Boolean(data.is_published)
      const publishedAt = shouldPublish ? now : null

      const [row] = await db
        .insert(announcements)
        .values({
          title: data.title,
          slug,
          type: data.type,
          body: data.body ?? null,
          coverImage: data.cover_image ?? null,
          eventDate,
          eventLocation,
          isPinned: Boolean(data.is_pinned),
          isPublished: shouldPublish,
          publishedAt,
          createdBy: editor.id,
          updatedBy: editor.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      if (data.is_pinned) {
        // enforce single pinned
        await db
          .update(announcements)
          .set({ isPinned: false })
          .where(and(ne(announcements.id, row!.id), eq(announcements.isPinned, true)))
      }

      return rowToDto(row!)
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to create announcement')
    }
  })

export const updateAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: announcementInputSchema.partial().extend({
        title: z.string().min(1).max(200).optional(),
        type: z.enum(['News', 'Event', 'Notice']).optional(),
      }),
    })
    return schema.parse(raw)
  })
  .handler(async ({ data: { id, data } }): Promise<AnnouncementDto> => {
    try {
      const editor = await requireEditorSession()
      const existing = await db.query.announcements.findFirst({ where: eq(announcements.id, id) })
      if (!existing) throw createError('NOT_FOUND', 'Announcement not found')

      let slug = existing.slug
      if (data.slug) {
        const desired = generateSlug(data.slug)
        slug = await ensureUniqueSlug(desired, async (candidate) => {
          const row = await db.query.announcements.findFirst({
            where: and(eq(announcements.slug, candidate), ne(announcements.id, id)),
          })
          return Boolean(row)
        })
      } else if (data.title) {
        const desired = generateSlug(data.title)
        if (desired && desired !== existing.slug) {
          slug = await ensureUniqueSlug(desired, async (candidate) => {
            const row = await db.query.announcements.findFirst({
              where: and(eq(announcements.slug, candidate), ne(announcements.id, id)),
            })
            return Boolean(row)
          })
        }
      }

      const nextType = (data.type ?? existing.type) as AnnouncementType
      const isEvent = nextType === 'Event'
      const nextEventDate = isEvent
        ? data.event_date !== undefined
          ? data.event_date
            ? new Date(data.event_date)
            : null
          : existing.eventDate
        : null
      const nextEventLocation = isEvent
        ? data.event_location !== undefined
          ? data.event_location ?? null
          : existing.eventLocation
        : null

      // published_at set once on first publish
      const nextPublished = data.is_published ?? existing.isPublished
      const nextPublishedAt =
        !existing.isPublished && nextPublished ? new Date() : existing.publishedAt

      if (data.cover_image && existing.coverImage && data.cover_image !== existing.coverImage) {
        const publicId = publicIdFromUrl(existing.coverImage)
        if (publicId) await deleteImage(publicId).catch(() => undefined)
      }

      const [updated] = await db
        .update(announcements)
        .set({
          title: data.title ?? existing.title,
          slug,
          type: nextType,
          body: data.body !== undefined ? data.body ?? null : existing.body,
          coverImage: data.cover_image !== undefined ? data.cover_image ?? null : existing.coverImage,
          eventDate: nextEventDate,
          eventLocation: nextEventLocation,
          isPinned: data.is_pinned ?? existing.isPinned,
          isPublished: nextPublished,
          publishedAt: nextPublishedAt,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id))
        .returning()

      if (data.is_pinned === true) {
        await db
          .update(announcements)
          .set({ isPinned: false })
          .where(and(ne(announcements.id, id), eq(announcements.isPinned, true)))
      }

      return rowToDto(updated!)
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to update announcement')
    }
  })

export const deleteAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      await requireEditorSession()
      const existing = await db.query.announcements.findFirst({ where: eq(announcements.id, id) })
      if (!existing) throw createError('NOT_FOUND', 'Announcement not found')
      if (existing.coverImage) {
        const publicId = publicIdFromUrl(existing.coverImage)
        if (publicId) await deleteImage(publicId).catch(() => undefined)
      }
      await db.delete(announcements).where(eq(announcements.id, id))
      return { success: true }
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to delete announcement')
    }
  })

export const togglePublished = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession()
      const row = await db.query.announcements.findFirst({ where: eq(announcements.id, id) })
      if (!row) throw createError('NOT_FOUND', 'Announcement not found')
      const next = !row.isPublished
      const publishedAt = !row.isPublished && next ? new Date() : row.publishedAt
      await db
        .update(announcements)
        .set({
          isPublished: next,
          publishedAt,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id))
      return { is_published: next }
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to toggle published')
    }
  })

export const pinAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      await requireEditorSession()
      await db.transaction(async (tx) => {
        await tx.update(announcements).set({ isPinned: false }).where(eq(announcements.isPinned, true))
        await tx.update(announcements).set({ isPinned: true }).where(eq(announcements.id, id))
      })
      return { success: true }
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to pin')
    }
  })

export const unpinAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      await requireEditorSession()
      await db.update(announcements).set({ isPinned: false }).where(eq(announcements.id, id))
      return { success: true }
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('INTERNAL', err instanceof Error ? err.message : 'Failed to unpin')
    }
  })

const uploadImageInputSchema = z.object({
  filename: z.string().min(1),
  data: z.string().min(1),
})

export const uploadAnnouncementCover = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => uploadImageInputSchema.parse(raw))
  .handler(async ({ data }): Promise<{ url: string; publicId: string }> => {
    try {
      await requireEditorSession()
      const buffer = Buffer.from(data.data, 'base64')
      return await uploadImageBuffer(buffer, data.filename, 'visit-harar/announcements')
    } catch (err) {
      if (isAppError(err)) throw err
      throw createError('UPLOAD_FAILED', err instanceof Error ? err.message : 'Upload failed')
    }
  })

