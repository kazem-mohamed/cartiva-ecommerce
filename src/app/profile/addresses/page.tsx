'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'

const ADDRESSES_API = 'https://ecommerce.routemisr.com/api/v1/addresses'

type Address = {
  _id: string
  name: string
  details: string
  phone: string
  city: string
}

type AddressesResponse = {
  data?: Address[]
}

type AddressForm = {
  name: string
  details: string
  phone: string
  city: string
}

const INITIAL_FORM: AddressForm = {
  name: '',
  details: '',
  phone: '',
  city: '',
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? null

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<AddressForm>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const isAuthenticated = status === 'authenticated' && !!token

  const totalAddresses = addresses.length

  const loadAddresses = async (activeToken: string) => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(ADDRESSES_API, {
        headers: { token: activeToken },
      })

      if (!res.ok) {
        throw new Error('Failed to load addresses')
      }

      const json = (await res.json()) as AddressesResponse
      setAddresses(json.data ?? [])
    } catch {
      setError('Unable to load addresses right now.')
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!token || status !== 'authenticated') {
      setAddresses([])
      setLoading(false)
      return
    }

    loadAddresses(token)
  }, [status, token])

  const handleOpenModal = () => {
    setFormError('')
    setActiveAddressId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormError('')
    setFormData(INITIAL_FORM)
    setActiveAddressId(null)
  }

  const handleEditAddress = (address: Address) => {
    setFormError('')
    setActiveAddressId(address._id)
    setFormData({
      name: address.name,
      details: address.details,
      phone: address.phone,
      city: address.city,
    })
    setIsModalOpen(true)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setFormError('Please login first.')
      return
    }

    setSaving(true)
    setFormError('')
    setToast(null)

    try {
      const url = activeAddressId ? `${ADDRESSES_API}/${activeAddressId}` : ADDRESSES_API
      const res = await fetch(url, {
        method: activeAddressId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to add address')
      }

      await loadAddresses(token)
      showToast(
        activeAddressId ? 'Address updated successfully.' : 'Address added successfully.',
        'success'
      )
      handleCloseModal()
    } catch {
      const errorMessage = activeAddressId
        ? 'Unable to update address. Please try again.'
        : 'Unable to add address. Please try again.'
      setFormError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = (addressId: string) => {
    setConfirmDeleteId(addressId)
  }

  const handleDeleteAddress = async () => {
    if (!token) {
      setError('Please login first.')
      showToast('Please login first.', 'error')
      return
    }

    if (!confirmDeleteId) return

    try {
      setDeletingId(confirmDeleteId)
      setToast(null)
      const res = await fetch(`${ADDRESSES_API}/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { token },
      })

      if (!res.ok) {
        throw new Error('Failed to delete address')
      }

      await loadAddresses(token)
      showToast('Address deleted successfully.', 'success')
    } catch {
      const message = 'Unable to delete address. Please try again.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
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
              <span className="text-white font-medium">My Account</span>
            </nav>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
                <svg
                  data-prefix="fas"
                  data-icon="user"
                  className="svg-inline--fa fa-user text-3xl"
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Account</h1>
                <p className="text-white/80 mt-1">Manage your addresses and account settings</p>
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group bg-primary-50 text-primary-700"
                      href="/profile/addresses"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-primary-500 text-white">
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
                        className="svg-inline--fa fa-chevron-right text-xs transition-transform text-primary-500"
                        role="img"
                        viewBox="0 0 320 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      href="/profile/settings"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-500 group-hover:bg-gray-200">
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
                        className="svg-inline--fa fa-chevron-right text-xs transition-transform text-gray-400"
                        role="img"
                        viewBox="0 0 320 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Addresses</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage your saved delivery addresses</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
                  type="button"
                  onClick={handleOpenModal}
                >
                  <svg
                    data-prefix="fas"
                    data-icon="plus"
                    className="svg-inline--fa fa-plus text-sm"
                    role="img"
                    viewBox="0 0 448 512"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                    />
                  </svg>
                  Add Address
                </button>
              </div>

              {!isAuthenticated && status !== 'loading' && (
                <div className="bg-white border border-amber-200 rounded-2xl p-6 text-sm text-amber-700">
                  Please login to view and manage your addresses.
                </div>
              )}

              {isAuthenticated && error && <p className="text-sm text-red-500 mb-4">{error}</p>}

              {isAuthenticated && loading && (
                <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-500">
                  Loading your addresses...
                </div>
              )}

              {isAuthenticated && !loading && totalAddresses === 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <svg
                      data-prefix="fas"
                      data-icon="location-dot"
                      className="svg-inline--fa fa-location-dot text-3xl text-gray-400"
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Add your first delivery address to make checkout faster and easier.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
                    type="button"
                    onClick={handleOpenModal}
                  >
                    <svg
                      data-prefix="fas"
                      data-icon="plus"
                      className="svg-inline--fa fa-plus"
                      role="img"
                      viewBox="0 0 448 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                      />
                    </svg>
                    Add Your First Address
                  </button>
                </div>
              )}

              {isAuthenticated && !loading && totalAddresses > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{address.name}</h3>
                          <p className="text-sm text-gray-500 mt-2">{address.details}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center transition-colors"
                            title="Edit address"
                            type="button"
                            onClick={() => handleEditAddress(address)}
                          >
                            <svg
                              data-prefix="fas"
                              data-icon="pen"
                              className="svg-inline--fa fa-pen text-sm"
                              role="img"
                              viewBox="0 0 512 512"
                              aria-hidden="true"
                            >
                              <path
                                fill="currentColor"
                                d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z"
                              />
                            </svg>
                          </button>
                          <button
                            className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Delete address"
                            type="button"
                            onClick={() => handleConfirmDelete(address._id)}
                            disabled={deletingId === address._id}
                          >
                            <svg
                              data-prefix="fas"
                              data-icon="trash"
                              className="svg-inline--fa fa-trash text-sm"
                              role="img"
                              viewBox="0 0 448 512"
                              aria-hidden="true"
                            >
                              <path
                                fill="currentColor"
                                d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 384 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"
                            />
                          </svg>
                          {address.city}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 512 512" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M493.4 24.6l-104-24c-11.1-2.6-22.7 3.3-27.5 13.9l-48 104c-4.5 9.7-1.8 21.2 6.9 28.1l60.6 49.6c-36.2 76.6-98.8 139.1-175.4 175.4l-49.6-60.6c-6.8-8.3-18.3-11.5-28.1-6.9l-104 48c-10.6 4.9-16.5 16.4-13.9 27.5l24 104c2.2 9.4 10.5 16.1 20.1 16.1C291.2 512 512 291.2 512 24.5c0-9.6-6.7-17.9-16.1-20.1z"
                            />
                          </svg>
                          {address.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {activeAddressId ? 'Update Address' : 'Add New Address'}
              </h2>
              <button
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                type="button"
                onClick={handleCloseModal}
              >
                <svg
                  data-prefix="fas"
                  data-icon="xmark"
                  className="svg-inline--fa fa-xmark"
                  role="img"
                  viewBox="0 0 384 512"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Name</label>
                <input
                  name="name"
                  placeholder="e.g. Home, Office"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  name="details"
                  placeholder="Street, building, apartment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                  required
                  value={formData.details}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="01xxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    name="city"
                    placeholder="Cairo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    required
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-600/25"
                  disabled={saving}
                >
                  {saving ? (activeAddressId ? 'Updating...' : 'Adding...') : activeAddressId ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900">Delete Address?</h3>
            <p className="text-sm text-gray-500 mt-2">
              This will permanently remove the address from your account.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                onClick={handleDeleteAddress}
                disabled={!!deletingId}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-[60]">
          <div
            className={`rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
}
