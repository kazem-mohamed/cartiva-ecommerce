'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner } from '@/component/ui/Spinner'

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

function getPasswordStrength(password: string): { label: string; width: string; color: string } {
  if (!password) return { label: 'Weak', width: '0%', color: 'bg-red-500' }
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/.test(password)
  const medium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
  if (strong) return { label: 'Strong', width: '100%', color: 'bg-green-500' }
  if (medium) return { label: 'Medium', width: '60%', color: 'bg-yellow-400' }
  return { label: 'Weak', width: '25%', color: 'bg-red-500' }
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
  const strength = getPasswordStrength(watchedPassword)

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

  const features = [
    {
      icon: (
        <svg
          data-prefix="fas"
          data-icon="star"
          className="svg-inline--fa fa-star h-5 w-5"
          role="img"
          viewBox="0 0 576 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"
          />
        </svg>
      ),
      title: 'Premium Quality',
      desc: 'Premium quality products sourced from trusted suppliers.',
    },
    {
      icon: (
        <svg
          data-prefix="fas"
          data-icon="truck-fast"
          className="svg-inline--fa fa-truck-fast h-5 w-5"
          role="img"
          viewBox="0 0 640 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M64 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L621.3 192c12 12 18.7 28.3 18.7 45.3L640 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-3.3 0c-35.3 0-64-28.7-64-64l0-48-40 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 240c-13.3 0-24-10.7-24-24s10.7-24 24-24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 144c-13.3 0-24-10.7-24-24S10.7 96 24 96l40 0zM576 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM256 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
          />
        </svg>
      ),
      title: 'Fast Delivery',
      desc: 'Same-day delivery available in most areas',
    },
    {
      icon: (
        <svg
          data-prefix="fas"
          data-icon="shield-halved"
          className="svg-inline--fa fa-shield-halved h-5 w-5"
          role="img"
          viewBox="0 0 512 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
          />
        </svg>
      ),
      title: 'Secure Shopping',
      desc: 'Your data and payments are completely secure',
    },
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  return (
    <main className="container py-16 mx-auto px-4" id="register-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12  max-w-7xl mx-auto">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-bold">
            Welcome to <span className="text-primary-600">FreshCart</span>
          </h1>
          <p className="text-xl mt-2 mb-4">
            Join thousands of happy customers who enjoy fresh groceries delivered right to their doorstep.
          </p>

          <ul className="*:flex *:items-start *:gap-4 space-y-6 my-8">
            {features.map(({ icon, title, desc }) => (
              <li key={title}>
                <div className="icon size-12 text-lg bg-primary-200 text-primary-600 rounded-full flex justify-center items-center">
                  {icon}
                </div>
                <div className="content">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="text-gray-600">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="review bg-white shadow-sm p-4 rounded-md">
            <div className="author flex items-center gap-4 mb-4">
              <Image
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-full object-cover"
                src="/review-author.jpg"
              />
              <div>
                <h3>Sarah Johnson</h3>
                <div className="rating *:text-yellow-300 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      data-prefix="fas"
                      data-icon="star"
                      className="svg-inline--fa fa-star h-4 w-4"
                      role="img"
                      viewBox="0 0 576 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"
                      />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <blockquote>
              <p className="italic text-gray-600">
                "FreshCart has transformed my shopping experience. The quality of the products is outstanding, and the
                delivery is always on time. Highly recommend!"
              </p>
            </blockquote>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary-600">
                Fresh<span className="text-gray-800">Cart</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Start your fresh journey with us today</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              aria-label="Sign up with Google"
            >
              <svg
                data-prefix="fab"
                data-icon="google"
                className="svg-inline--fa fa-google h-5 w-5 text-red-500"
                role="img"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M500 261.8C500 403.3 403.1 504 260 504 122.8 504 12 393.2 12 256S122.8 8 260 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9c-88.3-85.2-252.5-21.2-252.5 118.2 0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9l-140.8 0 0-85.3 236.1 0c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              aria-label="Sign up with Facebook"
            >
              <svg
                data-prefix="fab"
                data-icon="facebook"
                className="svg-inline--fa fa-facebook h-5 w-5 text-blue-600"
                role="img"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5l0-170.3-52.8 0 0-78.2 52.8 0 0-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4l0 70.8c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2l0 27.8 83.6 0-14.4 78.2-69.3 0 0 175.9C413.8 494.8 512 386.9 512 256z"
                />
              </svg>
              <span className="font-medium text-gray-700">Continue with Facebook</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name*
              </label>
              <input
                id="name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="Enter your name"
                type="text"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="create a strong password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.password.message}
                </p>
              )}

              <div className="password-requirements">
                <div className="flex items-center gap-2">
                  <div
                    className="bar grow h-1 bg-gray-200 rounded-md overflow-hidden"
                    role="progressbar"
                    aria-valuenow={
                      strength.width === '0%' ? 0 : strength.width === '25%' ? 25 : strength.width === '60%' ? 60 : 100
                    }
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Password strength: ${strength.label}`}
                  >
                    <div
                      className={`progress ${strength.color} h-full transition-all duration-300 ease-out`}
                      style={{ width: watchedPassword ? strength.width : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-[50px]">
                    {watchedPassword ? strength.label : 'Weak'}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="rePassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="rePassword"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="confirm your password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.rePassword}
                aria-describedby={errors.rePassword ? 'rePassword-error' : undefined}
                {...register('rePassword')}
              />
              {errors.rePassword && (
                <p id="rePassword-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.rePassword.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="+1 234 567 8900"
                type="tel"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <input
                  id="terms"
                  className="h-4 w-4 text-primary-600 accent-primary-600 border-2 border-gray-300 rounded focus:ring-primary-500"
                  type="checkbox"
                  aria-describedby={errors.terms ? 'terms-error' : undefined}
                  {...register('terms')}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link className="text-primary-600 hover:underline" href="/terms">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link className="text-primary-600 hover:underline" href="/privacy-policy">
                    Privacy Policy
                  </Link>{' '}
                  *
                </label>
              </div>
              {errors.terms && (
                <p id="terms-error" className="text-sm text-red-500 mt-2" role="alert">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* API-level error */}
            {formError && (
              <p className="text-sm text-red-500" role="alert">
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={isSubmitting}
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="text-white" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  'Create My Account'
                )}
              </span>
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?
              <Link className="text-primary-600 hover:text-primary-700 ms-2 font-semibold" href="/login">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
