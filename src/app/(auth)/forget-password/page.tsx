'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/component/ui/Spinner'

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

  const isStepComplete = (index: number) => step > index
  const isStepActive = (index: number) => step === index

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
    <>
      <div className="container py-16 mx-auto px-4" id="forgot-password-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="hidden lg:block">
            <div className="text-center space-y-6">
              <div className="w-full h-96 bg-gradient-to-br from-primary-50 via-green-50 to-emerald-50 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-primary-100/50" />
                <div className="absolute bottom-12 right-10 w-32 h-32 rounded-full bg-green-100/50" />
                <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-emerald-100/50" />
                <div className="relative flex flex-col items-center gap-6 z-10">
                  <div className="w-28 h-28 rounded-3xl bg-white shadow-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
                      <svg
                        data-prefix="fas"
                        data-icon="lock"
                        className="svg-inline--fa fa-lock text-primary-600 text-4xl"
                        role="img"
                        viewBox="0 0 384 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -left-16 top-4 w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center -rotate-12">
                    <svg
                      data-prefix="fas"
                      data-icon="envelope"
                      className="svg-inline--fa fa-envelope text-primary-500 text-xl"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -right-16 top-8 w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center rotate-12">
                    <svg
                      data-prefix="fas"
                      data-icon="shield-halved"
                      className="svg-inline--fa fa-shield-halved text-green-500 text-xl"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-400 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse [animation-delay:150ms]" />
                    <div className="w-3 h-3 rounded-full bg-primary-600 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">Reset Your Password</h2>
                <p className="text-lg text-gray-600">
                  Don't worry, it happens to the best of us. We'll help you get back into your account in no time.
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg
                      data-prefix="fas"
                      data-icon="envelope"
                      className="svg-inline--fa fa-envelope text-primary-600 mr-2"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"
                      />
                    </svg>
                    Email Verification
                  </div>
                  <div className="flex items-center">
                    <svg
                      data-prefix="fas"
                      data-icon="shield-halved"
                      className="svg-inline--fa fa-shield-halved text-primary-600 mr-2"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                      />
                    </svg>
                    Secure Reset
                  </div>
                  <div className="flex items-center">
                    <svg
                      data-prefix="fas"
                      data-icon="lock"
                      className="svg-inline--fa fa-lock text-primary-600 mr-2"
                      role="img"
                      viewBox="0 0 384 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                      />
                    </svg>
                    Encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    Fresh<span className="text-gray-800">Cart</span>
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{stepMeta.title}</h1>
                <p className="text-gray-600">{stepMeta.subtitle}</p>
              </div>

              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isStepComplete(1) || isStepActive(1)
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg
                      data-prefix="fas"
                      data-icon="envelope"
                      className="svg-inline--fa fa-envelope text-xs"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"
                      />
                    </svg>
                  </div>
                  <div
                    className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      step > 1 ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isStepComplete(2) || isStepActive(2)
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg
                      data-prefix="fas"
                      data-icon="key"
                      className="svg-inline--fa fa-key text-xs"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
                      />
                    </svg>
                  </div>
                  <div
                    className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      step > 2 ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isStepComplete(3) || isStepActive(3)
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg
                      data-prefix="fas"
                      data-icon="lock"
                      className="svg-inline--fa fa-lock text-xs"
                      role="img"
                      viewBox="0 0 384 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {step === 4 ? (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg
                      data-prefix="fas"
                      data-icon="check"
                      className="svg-inline--fa fa-check text-2xl"
                      role="img"
                      viewBox="0 0 448 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">Password reset successful</h2>
                    <p className="text-gray-600">Sign in with your new password to continue shopping.</p>
                  </div>
                  <a
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                    href="/login"
                  >
                    Go to Sign In
                  </a>
                </div>
              ) : (
                <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                          placeholder="Enter your email address"
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                        <svg
                          data-prefix="fas"
                          data-icon="envelope"
                          className="svg-inline--fa fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          role="img"
                          viewBox="0 0 512 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <>
                      <div className="rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm text-primary-700">
                        We sent a reset code to <span className="font-semibold">{email}</span>.
                      </div>
                      <div>
                        <label htmlFor="resetCode" className="block text-sm font-semibold text-gray-700 mb-2">
                          Verification Code
                        </label>
                        <div className="relative">
                          <input
                            id="resetCode"
                            maxLength={6}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                            placeholder="••••••"
                            type="text"
                            inputMode="numeric"
                            name="resetCode"
                            value={resetCode}
                            onChange={(event) => setResetCode(event.target.value)}
                          />
                          <svg
                            data-prefix="fas"
                            data-icon="shield-halved"
                            className="svg-inline--fa fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            role="img"
                            viewBox="0 0 512 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm text-primary-700">
                        Resetting password for <span className="font-semibold">{email}</span>.
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                          placeholder="Create a new password"
                          type="password"
                          name="newPassword"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                          placeholder="Confirm your password"
                          type="password"
                          name="confirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {formError && (
                    <p className="text-sm text-red-500" role="alert">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-busy={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Spinner className="text-white" />
                        <span>Please wait...</span>
                      </span>
                    ) : (
                      submitLabel
                    )}
                  </button>

                  {step === 2 && (
                    <div className="flex flex-col gap-3 text-center">
                      <button
                        type="button"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        onClick={handleResendCode}
                        disabled={isSubmitting}
                      >
                        Resend code
                      </button>
                      <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                      >
                        Use a different email
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <a
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      href="/login"
                    >
                      <svg
                        data-prefix="fas"
                        data-icon="arrow-left"
                        className="svg-inline--fa fa-arrow-left text-xs"
                        role="img"
                        viewBox="0 0 512 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                        />
                      </svg>
                      Back to Sign In
                    </a>
                  </div>
                </form>
              )}

              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <a className="text-primary-600 hover:text-primary-700 font-semibold transition-colors" href="/login">
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
