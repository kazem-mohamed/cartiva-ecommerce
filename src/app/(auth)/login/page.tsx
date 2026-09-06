'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthPageShell, AuthCard } from '@/component/auth/AuthCard'
import { AuthField } from '@/component/auth/AuthField'
import { PasswordField } from '@/component/auth/PasswordField'
import { AuthSubmitButton } from '@/component/auth/AuthSubmitButton'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [formError, setFormError] = useState('')
  const { status } = useSession()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginValues) => {
    setFormError('')
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: '/',
    })

    if (result?.error) {
      const message = 'Invalid email or password. Please try again.'
      setFormError(message)
      toast.error(message)
      return
    }

    toast.success('Welcome back!')
    router.push(result?.url ?? '/')
  }

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  return (
    <AuthPageShell>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your Cartiva account"
        footer={
          <p>
            New to Cartiva?{' '}
            <Link className="font-semibold text-gold transition-colors duration-300 hover:text-gold-deep" href="/register">
              Create an account
            </Link>
          </p>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthField
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <PasswordField
              id="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-2 text-right">
              <Link className="text-xs font-medium text-gold transition-colors duration-300 hover:text-gold-deep" href="/forget-password">
                Forgot password?
              </Link>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          <AuthSubmitButton loading={isSubmitting} loadingLabel="Signing in…">
            Sign In
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthPageShell>
  )
}
