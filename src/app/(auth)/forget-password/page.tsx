'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthPageShell, AuthCard } from '@/component/auth/AuthCard'
import { AuthField } from '@/component/auth/AuthField'
import { PasswordField } from '@/component/auth/PasswordField'
import { AuthSubmitButton } from '@/component/auth/AuthSubmitButton'

const FORGOT_PASSWORD_API = 'https://ecommerce.routemisr.com/api/v1/auth/forgotPasswords'
const VERIFY_RESET_CODE_API = 'https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode'
const RESET_PASSWORD_API = 'https://ecommerce.routemisr.com/api/v1/auth/resetPassword'

type Step = 1 | 2 | 3 | 4

type StepMeta = {
  title: string
  subtitle: string
}

const STEP_META: Record<Step, StepMeta> = {
  1: {
    title: 'Forgot Password?',
    subtitle: "No worries, we'll send you a reset code",
  },
  2: {
    title: 'Verify Reset Code',
    subtitle: 'Enter the code we sent to your email address',
  },
  3: {
    title: 'Set New Password',
    subtitle: 'Create a new secure password for your account',
  },
  4: {
    title: 'Password Updated',
    subtitle: 'You can now sign in with your new password',
  },
}

const getErrorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null)
  if (!data) return fallback
  return data?.message ?? data?.error ?? data?.errors?.[0]?.msg ?? fallback
}

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendResetCode = async () => {
    setFormError('')

    if (!email.trim()) {
      const message = 'Please enter your email address.'
      setFormError(message)
      return false
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(FORGOT_PASSWORD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const message = await getErrorMessage(res, 'Failed to send reset code.')
        throw new Error(message)
      }

      toast.success('Reset code sent. Check your email inbox.')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset code.'
      setFormError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyCode = async () => {
    setFormError('')

    if (!email.trim()) {
      const message = 'Please enter your email first.'
      setFormError(message)
      setStep(1)
      return false
    }

    if (resetCode.trim().length < 4) {
      const message = 'Please enter the verification code.'
      setFormError(message)
      return false
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(VERIFY_RESET_CODE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCode: resetCode.trim() }),
      })

      if (!res.ok) {
        const message = await getErrorMessage(res, 'Invalid reset code.')
        throw new Error(message)
      }

      toast.success('Code verified. You can now reset your password.')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify reset code.'
      setFormError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPassword = async () => {
    setFormError('')

    if (!email.trim()) {
      const message = 'Please enter your email first.'
      setFormError(message)
      setStep(1)
      return false
    }

    if (!newPassword.trim()) {
      const message = 'Please enter a new password.'
      setFormError(message)
      return false
    }

    if (newPassword.trim().length < 6) {
      const message = 'Password must be at least 6 characters.'
      setFormError(message)
      return false
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      const message = 'Passwords do not match.'
      setFormError(message)
      return false
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(RESET_PASSWORD_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword.trim(),
        }),
      })

      if (!res.ok) {
        const message = await getErrorMessage(res, 'Failed to reset password.')
        throw new Error(message)
      }

      toast.success('Password updated successfully.')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password.'
      setFormError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    if (step === 1) {
      const ok = await sendResetCode()
      if (ok) setStep(2)
      return
    }

    if (step === 2) {
      const ok = await verifyCode()
      if (ok) setStep(3)
      return
    }

    if (step === 3) {
      const ok = await resetPassword()
      if (ok) {
        setStep(4)
        setResetCode('')
        setNewPassword('')
        setConfirmPassword('')
      }
    }
  }

  const handleResendCode = async () => {
    if (isSubmitting) return
    const ok = await sendResetCode()
    if (ok) setStep(2)
  }

  const submitLabel =
    step === 1
      ? 'Send Reset Code'
      : step === 2
        ? 'Verify Code'
        : step === 3
          ? 'Reset Password'
          : 'Done'

  const stepMeta = STEP_META[step]

  return (
    <AuthPageShell>
      <AuthCard
        title={stepMeta.title}
        subtitle={stepMeta.subtitle}
        footer={
          step !== 4 && (
            <p>
              Remember your password?{' '}
              <Link className="font-semibold text-gold transition-colors duration-300 hover:text-gold-deep" href="/login">
                Sign in
              </Link>
            </p>
          )
        }
      >
        {step !== 4 && (
          <div className="mb-7 pl-7 sm:pl-8">
            <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
              {[1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    step > index ? 'bg-gold' : step === index ? 'bg-gold-lit' : 'bg-line'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 font-mono text-[11px] tracking-wide text-gold">STEP {step} OF 3</p>
          </div>
        )}

        {step === 4 ? (
          <div className="space-y-6 pl-7 text-center sm:pl-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <svg className="h-6 w-6" role="img" viewBox="0 0 448 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-ink-muted">Sign in with your new password to continue shopping.</p>
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-vault py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-transform duration-400 hover:scale-[1.02]"
              href="/login"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            {step === 1 && (
              <AuthField
                id="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}

            {step === 2 && (
              <>
                <p className="rounded-[16px] border border-gold/30 bg-gold/5 px-4 py-3.5 text-[13.5px] text-gold-deep">
                  We sent a reset code to <span className="font-semibold">{email}</span>.
                </p>
                <AuthField
                  id="resetCode"
                  label="Verification Code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  className="text-center font-mono text-2xl tracking-[0.5em]"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                />
              </>
            )}

            {step === 3 && (
              <>
                <p className="rounded-[16px] border border-gold/30 bg-gold/5 px-4 py-3.5 text-[13.5px] text-gold-deep">
                  Resetting password for <span className="font-semibold">{email}</span>.
                </p>
                <PasswordField
                  id="newPassword"
                  label="New Password"
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </>
            )}

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <AuthSubmitButton loading={isSubmitting} loadingLabel="Please wait…">
              {submitLabel}
            </AuthSubmitButton>

            {step === 2 && (
              <div className="flex flex-col items-center gap-2 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-gold transition-colors duration-300 hover:text-gold-deep"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Use a different email
                </button>
              </div>
            )}

            <div className="text-center">
              <Link
                className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors duration-300 hover:text-gold-deep"
                href="/login"
              >
                <svg className="h-3 w-3" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                  />
                </svg>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthPageShell>
  )
}
