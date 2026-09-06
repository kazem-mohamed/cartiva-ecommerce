'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
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
  const router = useRouter()
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

      // Changing the password INVALIDATES the old token server-side and
      // issues a new one. Without adopting it, the session keeps holding a
      // token the API now rejects: every authenticated call starts failing
      // while the UI still looks signed in, and the old password no longer
      // works either — so the account appears locked out.
      //
      // Re-authenticating with the password just set swaps the dead token
      // for the live one without making the user sign in again.
      const nextEmail = profileForm.email || session?.user?.email || ''
      const refreshed = await signIn('credentials', {
        redirect: false,
        email: nextEmail,
        password: passwordForm.password,
      })

      setPasswordForm(INITIAL_PASSWORD)

      if (refreshed?.error) {
        // The password did change; only the silent re-login failed. Send
        // them to sign in rather than leaving a session that cannot work.
        showToast('Password updated. Please sign in again.', 'success')
        await signOut({ redirect: false })
        router.push('/login')
        return
      }

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
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-ink">Account Settings</h2>
                  <p className="text-ink-muted text-sm mt-1">
                    Update your profile information and change your password
                  </p>
                </div>

              {!isAuthenticated && status !== 'loading' && (
                <div className="bg-white border border-warning/30 rounded-[20px] p-6 text-sm text-warning">
                  Please login to manage your settings.
                </div>
              )}

              {isAuthenticated && profileError && (
                <p className="text-sm text-danger">{profileError}</p>
              )}

              {isAuthenticated && profileLoading && (
                <div className="bg-white rounded-[24px] border border-line-soft p-10 text-center text-ink-muted">
                  Loading your profile...
                </div>
              )}

              {isAuthenticated && !profileLoading && (
                <>
                  <div className="bg-white rounded-[24px] border border-line-soft shadow-[var(--shadow)] overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-line-soft">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-[20px] bg-gold/10 flex items-center justify-center">
                          <svg
                            data-prefix="fas"
                            data-icon="user"
                            className="svg-inline--fa fa-user text-2xl text-gold"
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
                          <h3 className="font-bold text-ink">Profile Information</h3>
                          <p className="text-sm text-ink-muted">Update your personal details</p>
                        </div>
                      </div>

                      <form className="space-y-5" onSubmit={handleProfileSubmit}>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">Full Name</label>
                          <input
                            name="name"
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            required
                            type="text"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">
                            Email Address
                          </label>
                          <input
                            name="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            required
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">
                            Phone Number
                          </label>
                          <input
                            name="phone"
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            required
                            type="tel"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="pt-4">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] bg-vault text-white font-semibold transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-[var(--shadow)]"
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

                    <div className="p-6 sm:p-8 bg-sunk">
                      <h3 className="font-bold text-ink mb-4">Account Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted">User ID</span>
                          <span className="font-mono text-ink-soft">{profileMeta.id ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted">Role</span>
                          {profileMeta.role ? (
                            <span className="px-3 py-1 rounded-lg bg-gold/10 text-gold-deep font-medium capitalize">
                              {profileMeta.role}
                            </span>
                          ) : (
                            <span className="text-ink-muted">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-[24px] border border-line-soft shadow-[var(--shadow)] overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-[20px] bg-warning/10 flex items-center justify-center">
                          <svg
                            data-prefix="fas"
                            data-icon="lock"
                            className="svg-inline--fa fa-lock text-2xl text-warning"
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
                          <h3 className="font-bold text-ink">Change Password</h3>
                          <p className="text-sm text-ink-muted">Update your account password</p>
                        </div>
                      </div>

                      <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              name="currentPassword"
                              placeholder="Enter your current password"
                              className="w-full px-4 py-3 pr-12 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                              required
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
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
                          <label className="block text-sm font-medium text-ink-soft mb-2">New Password</label>
                          <div className="relative">
                            <input
                              name="password"
                              placeholder="Enter your new password"
                              className="w-full px-4 py-3 pr-12 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                              required
                              minLength={6}
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordForm.password}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
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
                          <p className="text-xs text-ink-muted mt-1">Must be at least 6 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              name="rePassword"
                              placeholder="Confirm your new password"
                              className="w-full px-4 py-3 pr-12 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                              required
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordForm.rePassword}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
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

                        {passwordError && <p className="text-sm text-danger">{passwordError}</p>}

                        <div className="pt-4">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] bg-warning text-white font-semibold hover:bg-warning transition-colors disabled:opacity-50 shadow-[var(--shadow-lift)] shadow-amber-600/25"
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

    </>
  )
}
