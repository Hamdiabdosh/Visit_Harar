import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Toggle,
  SectionLabel,
} from '@/components/AdminLayout'
import { TagInput } from '@/components/admin/TagInput'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import {
  createGuide,
  getGuideById,
  updateGuide,
  uploadGuidePhoto,
} from '@/lib/guides-fns'
import { generateSlug } from '@/lib/slug'
import { guideInputSchema, type GuideInput } from '@/lib/validators/guides'
import { ArrowLeft, Camera } from 'lucide-react'

export const Route = createFileRoute('/admin/guides/$id')({
  component: GuideEditor,
})

const defaultValues: GuideInput = {
  name: '',
  slug: '',
  photo: undefined,
  bio: '',
  languages: [],
  specialties: [],
  experience_years: undefined,
  license_number: '',
  phone: '',
  email: '',
  is_available: true,
  is_published: false,
  sort_order: 0,
}

function GuideEditor() {
  const { id } = useParams({ from: '/admin/guides/$id' })
  const isNew = id === 'new'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'guide', id],
    queryFn: () => getGuideById({ data: id }),
    enabled: !isNew,
    retry: false,
  })

  const form = useForm<GuideInput>({
    resolver: zodResolver(guideInputSchema),
    defaultValues,
    values: existing
      ? {
          name: existing.name,
          slug: existing.slug,
          photo: existing.photo ?? undefined,
          bio: existing.bio ?? '',
          languages: existing.languages ?? [],
          specialties: existing.specialties ?? [],
          experience_years: existing.experience_years ?? undefined,
          license_number: existing.license_number ?? '',
          phone: existing.phone ?? '',
          email: existing.email ?? '',
          is_available: existing.is_available,
          is_published: existing.is_published,
          sort_order: existing.sort_order,
        }
      : undefined,
  })

  const name = form.watch('name')
  const bio = form.watch('bio') ?? ''
  const photo = form.watch('photo')
  const languages = form.watch('languages')
  const specialties = form.watch('specialties')
  const available = form.watch('is_available')
  const published = form.watch('is_published')

  useEffect(() => {
    if (!slugTouched && name && isNew) {
      form.setValue('slug', generateSlug(name))
    }
  }, [name, slugTouched, isNew, form])

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues()
      const payload: GuideInput = { ...values, is_published: publish }
      if (isNew) return createGuide({ data: payload })
      return updateGuide({ data: { id, data: payload } })
    },
    onSuccess: (result, publish) => {
      toast.success(publish ? 'Published' : 'Draft saved')
      queryClient.invalidateQueries({ queryKey: ['admin', 'guides'] })
      if (isNew && result?.id) {
        navigate({ to: '/admin/guides/$id' as never, params: { id: result.id } as never, replace: true })
      }
    },
    onError: () => toast.error('Failed to save'),
  })

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const base64 = await fileToBase64(file)
      const { url } = await uploadGuidePhoto({ data: { filename: file.name, data: base64 } })
      form.setValue('photo', url, { shouldDirty: true })
      toast.success('Photo uploaded')
    } catch {
      toast.error('Upload failed — check Cloudinary credentials or paste an image URL')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Edit Guide" breadcrumb="Guides">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    )
  }

  if (!isNew && !isLoading && !existing) {
    return (
      <AdminLayout title="Not found" breadcrumb="Guides">
        <AdminCard className="p-6">
          <p className="text-sm text-ink-muted">Guide not found.</p>
          <Link to="/admin/guides" className="text-brand text-sm mt-3 inline-block">
            Back to list
          </Link>
        </AdminCard>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isNew ? 'New Guide' : 'Edit Guide'}
      breadcrumb={`Guides › ${name || 'New'}`}
      action={
        <Link to="/admin/guides" className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <AdminCard className="p-6 space-y-5">
          <div className="flex flex-col items-center">
            <div className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-border grid place-items-center text-ink-muted relative overflow-hidden">
              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <Button variant="outline" className="mt-3 text-xs py-1" type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </Button>
            <Field label="Or photo URL">
              <Input {...form.register('photo')} placeholder="https://…" className="text-xs mt-3" />
            </Field>
          </div>

          <Field label="Name">
            <Input {...form.register('name')} placeholder="Ahmed Yusuf" />
          </Field>
          <Field label="Slug" hint="Auto-generated from name (editable)">
            <Input {...form.register('slug', { onChange: () => setSlugTouched(true) })} className="font-mono text-xs" placeholder="ahmed-yusuf" />
          </Field>
          <Field label="Bio">
            <RichTextEditor value={bio} onChange={(html) => form.setValue('bio', html, { shouldDirty: true })} />
          </Field>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Experience Years">
              <Input type="number" min={0} {...form.register('experience_years', { valueAsNumber: true })} />
            </Field>
            <Field label="License Number">
              <Input {...form.register('license_number')} placeholder="HRR-001" />
            </Field>
            <Field label="Phone">
              <Input {...form.register('phone')} placeholder="+251…" />
            </Field>
            <Field label="Email">
              <Input {...form.register('email')} placeholder="guide@visitharar.gov.et" />
            </Field>
          </div>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-6 space-y-5">
            <div>
              <SectionLabel>Languages</SectionLabel>
              <TagInput value={languages ?? []} onChange={(next) => form.setValue('languages', next, { shouldDirty: true })} />
            </div>
            <div>
              <SectionLabel>Specialties</SectionLabel>
              <TagInput value={specialties ?? []} onChange={(next) => form.setValue('specialties', next, { shouldDirty: true })} />
            </div>
          </AdminCard>

          <AdminCard className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available</span>
              <Toggle checked={available} onChange={(v) => form.setValue('is_available', v, { shouldDirty: true })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Published</span>
              <Toggle checked={published} onChange={(v) => form.setValue('is_published', v, { shouldDirty: true })} />
            </div>
            {!isNew && (
              <div className="pt-3 border-t border-border text-xs text-ink-muted">
                Booking requests: <span className="font-semibold text-ink">{existing?.booking_count ?? 0}</span>
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      <div className="mt-6 -mx-8 px-8 py-4 bg-white border-t border-border flex items-center justify-end gap-2 sticky bottom-0">
        <Button variant="outline" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(false)}>
          Save Draft
        </Button>
        <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(true)}>
          Publish
        </Button>
      </div>
    </AdminLayout>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

