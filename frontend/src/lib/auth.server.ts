import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { db } from '../../db/index'
import * as schema from '../../drizzle/schema/index'

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? 'http://localhost:3000'

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: user.email,
            subject: 'Reset your Visit Harar CMS password',
            html: `<p>Reset your password: <a href="${url}">${url}</a></p><p>This link expires in 1 hour.</p>`,
          }),
        })
        if (!res.ok) {
          console.error('Resend failed:', await res.text())
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`[dev] Password reset for ${user.email}: ${url}`)
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'editor',
        input: false,
      },
      isActive: {
        type: 'boolean',
        required: true,
        defaultValue: true,
        fieldName: 'is_active',
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const row = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.id, session.userId),
          })
          if (row && !row.isActive) {
            throw new APIError('FORBIDDEN', {
              message: 'Account is disabled',
            })
          }
          return { data: session }
        },
      },
    },
  },
})

export type AuthSession = typeof auth.$Infer.Session
