'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthPageShell, AuthCard } from '@/component/auth/AuthCard'
import { AuthField } from '@/component/auth/AuthField'
import { PasswordField } from '@/component/auth/PasswordField'
import { AuthSubmitButton } from '@/component/auth/AuthSubmitButton'
import { PasswordStrengthMeter } from '@/component/auth/PasswordStrengthMeter'

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rePassword: z.string().min(8, 'Confirm your password'),
    phone: z.string().min(6, 'Phone number is required'),
    terms: z.boolean().refine((value) => value, { message: 'You must accept the terms' }),
  })
  .refine((values) => values.password === values.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'],
  })

type RegisterValues = z.infer<typeof schema>

const SIGNUP_API = 'https://ecommerce.routemisr.com/api/v1/auth/signup'

function FieldGroupLabel({ children }: { children: string }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{children}</p>
}

export default function RegisterPage() {
  const router = useRouter()
  const [formError, setFormError] = useState('')
  const { status } = useSession()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rePassword: '',
      phone: '',
      terms: false,
    },
  })

  const watchedPassword = watch('password', '')

  const onSubmit = async (values: RegisterValues) => {
    setFormError('')

    try {
      const res = await fetch(SIGNUP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          rePassword: values.rePassword,
          phone: values.phone,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.message ?? 'Failed to create account'
        setFormError(message)
        toast.error(message)
        return
      }

      toast.success('Account created successfully')

      const loginResult = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: '/',
      })

      if (loginResult?.error) {
        toast.error('Account created, but automatic sign-in failed. Please log in.')
        router.push('/login')
        return
      }

      router.push(loginResult?.url ?? '/')
    } catch {
      const message = 'Failed to create account'
      setFormError(message)
      toast.error(message)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  return (
    <AuthPageShell>
      <AuthCard
        title="Join Cartiva"
        subtitle="Create your membership in a minute"
        footer={
          <p>
            Already have an account?{' '}
            <Link className="font-semibold text-gold transition-colors duration-300 hover:text-gold-deep" href="/login">
              Sign in
            </Link>
          </p>
        }
      >
        <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FieldGroupLabel>Your details</FieldGroupLabel>
            <AuthField
              id="name"
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              error={errors.name?.message}
              {...register('name')}
            />
            <AuthField
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <AuthField
              id="phone"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              placeholder="+20 100 000 0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="space-y-4 border-t border-line-soft pt-5">
            <FieldGroupLabel>Security</FieldGroupLabel>
            <div>
              <PasswordField
                id="password"
                label="Password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrengthMeter password={watchedPassword} />
            </div>
            <PasswordField
              id="rePassword"
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              error={errors.rePassword?.message}
              {...register('rePassword')}
            />
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm text-ink-muted">
              <input
                id="terms"
                className="mt-0.5 h-4 w-4 rounded border-line text-gold accent-[var(--gold)]"
                type="checkbox"
                aria-describedby={errors.terms ? 'terms-error' : undefined}
                {...register('terms')}
              />
              {/* Plain text, not links. /terms and /privacy-policy do not
                  exist in this build, and the brand's honesty rules forbid
                  a control that renders but goes nowhere. When those pages
                  are written, these become links again. */}
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
            {errors.terms && (
              <p id="terms-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {errors.terms.message}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          <AuthSubmitButton loading={isSubmitting} loadingLabel="Creating account…">
            Create My Account
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthPageShell>
  )
}
