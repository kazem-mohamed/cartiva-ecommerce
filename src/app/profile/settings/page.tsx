'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const PROFILE_API = '/api/profile'
const UPDATE_PROFILE_API = '/api/profile'
const CHANGE_PASSWORD_API = '/api/profile/password'

type ApiUser = {
  id?: string
  role?: string
  name?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

type ProfileForm = {
  name: string
  email: string
  phone: string
}

type PasswordForm = {
  currentPassword: string
  password: string
  rePassword: string
}

const INITIAL_PROFILE: ProfileForm = {
  name: '',
  email: '',
  phone: '',
}

const INITIAL_PASSWORD: PasswordForm = {
  currentPassword: '',
  password: '',
  rePassword: '',
}

const decodeRoleFromToken = (token: string | null) => {
  if (!token) return undefined
  try {
    const payload = token.split('.')[1]
    if (!payload) return undefined
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )
    const data = JSON.parse(json) as { role?: string; user?: { role?: string } }
    return data.role ?? data.user?.role
  } catch {
    return undefined
  }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? null

  const [profileForm, setProfileForm] = useState<ProfileForm>(INITIAL_PROFILE)
  const [profileMeta, setProfileMeta] = useState<{ id?: string; role?: string }>({})
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(INITIAL_PASSWORD)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message)
    } else {
      toast.error(message)
    }
  }

  const isAuthenticated = status === 'authenticated' && !!token

  const parseUserFromResponse = (
    json: any,
    prefer?: { id?: string | null; email?: string | null }
  ): ApiUser | null => {
    const raw =
      json?.data?.user ??
      json?.data?.users ??
      json?.data?.profile ??
      json?.data ??
      json?.user ??
      json?.users ??
      json?.profile ??
      json?.result ??
      json?.results ??
      null

    let data = raw

    if (Array.isArray(raw)) {
      const preferId = prefer?.id ?? undefined
      const preferEmail = prefer?.email?.toLowerCase() ?? undefined
      if (preferId || preferEmail) {
        const match = raw.find((item) => {
          if (!item) return false
          const itemId = item?._id ?? item?.id ?? item?.user?._id ?? item?.user?.id
          const itemEmail =
            (item?.email ?? item?.user?.email ?? '').toString().toLowerCase()
          if (preferId && itemId && itemId === preferId) return true
          if (preferEmail && itemEmail && itemEmail === preferEmail) return true
          return false
        })
        if (!match) return null
        data = match
      } else {
        data = raw[0]
      }
    }

    if (!data) return null

    return {
      id: data?._id ?? data?.id ?? data?.user?._id ?? data?.user?.id,
      role: data?.role ?? data?.user?.role,
      name:
        data?.name ??
        (`${data?.firstName ?? ''} ${data?.lastName ?? ''}`.trim() || undefined),
      email: data?.email,
      phone: data?.phone,
      firstName: data?.firstName,
      lastName: data?.lastName,
    }
  }
  const loadProfile = async (activeToken: string) => {
    try {
      setProfileLoading(true)
      setProfileError('')
      const fallbackRole = decodeRoleFromToken(activeToken)
      const res = await fetch(PROFILE_API, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      })

      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        const suffix = detail ? `: ${detail}` : ''
        throw new Error(`Failed to load profile (${res.status})${suffix}`)
      }

      const json = await res.json().catch(() => null)
      const user = parseUserFromResponse(json, {
        id: session?.user?.id,
        email: session?.user?.email,
      })

      if (!user) {
        const fallbackName = session?.user?.name ?? ''
        const fallbackEmail = session?.user?.email ?? ''
        if (fallbackName || fallbackEmail) {
          setProfileForm((prev) => ({
            name: fallbackName || prev.name,
            email: fallbackEmail || prev.email,
            phone: prev.phone,
          }))
          setProfileMeta({ id: session?.user?.id, role: fallbackRole })
          return
        }
        throw new Error('Profile not available')
      }

      setProfileForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      })
      setProfileMeta({
        id: user.id,
        role: user.role ?? fallbackRole,
      })
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to load your profile right now.'
      setProfileError(message)
      setProfileForm(INITIAL_PROFILE)
      setProfileMeta({
        id: session?.user?.id,
        role: decodeRoleFromToken(activeToken),
      })
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!token || status !== 'authenticated') {
      setProfileLoading(false)
      setProfileForm(INITIAL_PROFILE)
      setProfileMeta({})
      return
    }

    loadProfile(token)
  }, [status, token])

  const handleProfileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setProfileError('Please login first.')
      showToast('Please login first.', 'error')
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const res = await fetch(UPDATE_PROFILE_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const json = await res.json().catch(() => null)
      const user = parseUserFromResponse(json, {
        id: session?.user?.id,
        email: session?.user?.email,
      })

      if (user) {
        setProfileForm({
          name: user.name ?? profileForm.name,
          email: user.email ?? profileForm.email,
          phone: user.phone ?? profileForm.phone,
        })
        setProfileMeta((prev) => ({
          id: user.id ?? prev.id,
          role: user.role ?? prev.role ?? decodeRoleFromToken(token),
        }))
      }

      showToast('Profile updated successfully.', 'success')
    } catch {
      const message = 'Unable to update your profile. Please try again.'
      setProfileError(message)
      showToast(message, 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setPasswordError('Please login first.')
      showToast('Please login first.', 'error')
      return
    }

    if (passwordForm.password !== passwordForm.rePassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setPasswordSaving(true)
    setPasswordError('')

    try {
      const res = await fetch(CHANGE_PASSWORD_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      })

      if (!res.ok) {
        throw new Error('Failed to update password')
      }

      setPasswordForm(INITIAL_PASSWORD)
      showToast('Password updated successfully.', 'success')
    } catch {
      const message = 'Unable to update your password. Please try again.'
      setPasswordError(message)
      showToast(message, 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
          <div className="container mx-auto px-4 py-10 sm:py-12">
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
              <a className="hover:text-white transition-colors duration-200" href="/">
                Home
              </a>
              <span className="text-white/40">/</span>
              <span className="text-white font-medium">Settings</span>
            </nav>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
                <svg
                  data-prefix="fas"
                  data-icon="gear"
                  className="svg-inline--fa fa-gear text-3xl"
                  role="img"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-white/80 mt-1">Update your personal info and password</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <aside className="w-full lg:w-72 shrink-0">
              <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">My Account</h2>
                </div>
                <ul className="p-2">
                  <li>
                    <a
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      href="/profile/addresses"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-500 group-hover:bg-gray-200">
                        <svg
                          data-prefix="fas"
                          data-icon="location-dot"
                          className="svg-inline--fa fa-location-dot text-sm"
                          role="img"
                          viewBox="0 0 384 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium flex-1">My Addresses</span>
                      <svg
                        data-prefix="fas"
                        data-icon="chevron-right"
                        className="svg-inline--fa fa-chevron-right text-xs transition-transform text-gray-400"
                        role="img"
                        viewBox="0 0 320 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-32.8-12.5-45.3 0s32.8 12.5 45.3 0l192 192z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group bg-primary-50 text-primary-700"
                      href="/profile/settings"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-primary-500 text-white">
                        <svg
                          data-prefix="fas"
                          data-icon="gear"
                          className="svg-inline--fa fa-gear text-sm"
                          role="img"
                          viewBox="0 0 512 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium flex-1">Settings</span>
                      <svg
                        data-prefix="fas"
                        data-icon="chevron-right"
                        className="svg-inline--fa fa-chevron-right text-xs transition-transform text-primary-500"
                        role="img"
                        viewBox="0 0 320 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-32.8-12.5-45.3 0s32.8 12.5 45.3 0l192 192z"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Update your profile information and change your password
                  </p>
                </div>

              {!isAuthenticated && status !== 'loading' && (
                <div className="bg-white border border-amber-200 rounded-2xl p-6 text-sm text-amber-700">
                  Please login to manage your settings.
                </div>
              )}

              {isAuthenticated && profileError && (
                <p className="text-sm text-red-500">{profileError}</p>
              )}

              {isAuthenticated && profileLoading && (
                <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-500">
                  Loading your profile...
                </div>
              )}

              {isAuthenticated && !profileLoading && (
                <>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
                          <svg
                            data-prefix="fas"
                            data-icon="user"
                            className="svg-inline--fa fa-user text-2xl text-primary-600"
                            role="img"
                            viewBox="0 0 448 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Profile Information</h3>
                          <p className="text-sm text-gray-500">Update your personal details</p>
                        </div>
                      </div>

                      <form className="space-y-5" onSubmit={handleProfileSubmit}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            name="name"
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            required
                            type="text"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            name="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            required
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            name="phone"
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            required
                            type="tel"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="pt-4">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-600/25"
                            disabled={profileSaving}
                          >
                            <svg
                              data-prefix="fas"
                              data-icon="floppy-disk"
                              className="svg-inline--fa fa-floppy-disk"
                              role="img"
                              viewBox="0 0 448 512"
                              aria-hidden="true"
                            >
                              <path
                                fill="currentColor"
                                d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm32 96c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                              />
                            </svg>
                            {profileSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-50">
                      <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">User ID</span>
                          <span className="font-mono text-gray-700">{profileMeta.id ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Role</span>
                          {profileMeta.role ? (
                            <span className="px-3 py-1 rounded-lg bg-primary-100 text-primary-700 font-medium capitalize">
                              {profileMeta.role}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                          <svg
                            data-prefix="fas"
                            data-icon="lock"
                            className="svg-inline--fa fa-lock text-2xl text-amber-600"
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
                        <div>
                          <h3 className="font-bold text-gray-900">Change Password</h3>
                          <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                      </div>

                      <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              name="currentPassword"
                              placeholder="Enter your current password"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                              required
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowCurrentPassword((prev) => !prev)}
                            >
                              <svg
                                data-prefix="fas"
                                data-icon="eye"
                                className="svg-inline--fa fa-eye"
                                role="img"
                                viewBox="0 0 576 512"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              name="password"
                              placeholder="Enter your new password"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                              required
                              minLength={6}
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordForm.password}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                            >
                              <svg
                                data-prefix="fas"
                                data-icon="eye"
                                className="svg-inline--fa fa-eye"
                                role="img"
                                viewBox="0 0 576 512"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              name="rePassword"
                              placeholder="Confirm your new password"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                              required
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordForm.rePassword}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                              <svg
                                data-prefix="fas"
                                data-icon="eye"
                                className="svg-inline--fa fa-eye"
                                role="img"
                                viewBox="0 0 576 512"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

                        <div className="pt-4">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-lg shadow-amber-600/25"
                            disabled={passwordSaving}
                          >
                            <svg
                              data-prefix="fas"
                              data-icon="lock"
                              className="svg-inline--fa fa-lock"
                              role="img"
                              viewBox="0 0 384 512"
                              aria-hidden="true"
                            >
                              <path
                                fill="currentColor"
                                d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                              />
                            </svg>
                            {passwordSaving ? 'Updating...' : 'Change Password'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                </>
              )}
              </div>
            </main>
          </div>
        </div>
      </div>

    </>
  )
}
