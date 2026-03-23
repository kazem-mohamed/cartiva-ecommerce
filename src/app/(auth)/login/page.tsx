'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner } from '@/component/ui/Spinner'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="container py-16 mx-auto px-4" id="login-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="hidden lg:block">
          <div className="text-center space-y-6">
            <img
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
              alt="fresh vegetables and fruits shopping cart illustration, modern clean style, green theme"
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/2e5810ff3e-e750761ebcd4ae5907db.png"
            />
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">
                FreshCart - Your One-Stop Shop for Fresh Products
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of happy customers who trust FreshCart for their daily grocery needs
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-primary-600 mr-2" role="img" viewBox="0 0 576 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                    />
                  </svg>
                  Free Delivery
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-primary-600 mr-2" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                    />
                  </svg>
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-primary-600 mr-2" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
                    />
                  </svg>
                  24/7 Support
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Sign in to continue your fresh shopping experience</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <svg className="h-5 w-5 text-red-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
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
              >
                <svg className="h-5 w-5 text-blue-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
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

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="Enter your email"
                    id="email"
                    type="email"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
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
                {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium"
                    href="/forget-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                    role="img"
                    viewBox="0 0 384 512"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                    />
                  </svg>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg className="h-4 w-4" role="img" viewBox="0 0 576 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
                      />
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    className="h-4 w-4 text-primary-600 accent-primary-600 border-2 border-gray-300 rounded focus:ring-primary-500"
                    type="checkbox"
                    name="rememberMe"
                  />
                  <span className="ml-3 text-sm text-gray-700">Keep me signed in</span>
                </label>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="text-white" />
                    <span>Signing In...</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                New to FreshCart?
                <Link className="text-primary-600 hover:text-primary-700 ms-2 font-semibold" href="/register">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
              <div className="flex items-center">
                <svg className="h-3 w-3 mr-1" role="img" viewBox="0 0 384 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                  />
                </svg>
                SSL Secured
              </div>
              <div className="flex items-center">
                <svg className="h-3 w-3 mr-1" role="img" viewBox="0 0 640 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"
                  />
                </svg>
                50K+ Users
              </div>
              <div className="flex items-center">
                <svg className="h-3 w-3 mr-1" role="img" viewBox="0 0 576 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"
                  />
                </svg>
                4.9 Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
