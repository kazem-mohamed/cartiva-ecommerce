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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-ink">My Addresses</h2>
                  <p className="text-ink-muted text-sm mt-1">Manage your saved delivery addresses</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[16px] bg-vault text-white font-semibold transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.02] shadow-[var(--shadow)]"
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
                <div className="bg-white border border-warning/30 rounded-[20px] p-6 text-sm text-warning">
                  Please login to view and manage your addresses.
                </div>
              )}

              {isAuthenticated && error && <p className="text-sm text-danger mb-4">{error}</p>}

              {isAuthenticated && loading && (
                <div className="bg-white rounded-[24px] border border-line-soft p-10 text-center text-ink-muted">
                  Loading your addresses...
                </div>
              )}

              {isAuthenticated && !loading && totalAddresses === 0 && (
                <div className="bg-white rounded-[24px] border border-line-soft p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-sunk flex items-center justify-center mx-auto mb-5">
                    <svg
                      data-prefix="fas"
                      data-icon="location-dot"
                      className="svg-inline--fa fa-location-dot text-3xl text-ink-muted"
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
                  <h3 className="text-lg font-bold text-ink mb-2">No Addresses Yet</h3>
                  <p className="text-ink-muted mb-6 max-w-sm mx-auto">
                    Add your first delivery address to make checkout faster and easier.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] bg-vault text-white font-semibold transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.02] shadow-[var(--shadow)]"
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
                      className="bg-white rounded-[24px] border border-line-soft p-6 shadow-[var(--shadow)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-ink">{address.name}</h3>
                          <p className="text-sm text-ink-muted mt-2">{address.details}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="w-9 h-9 rounded-lg bg-sunk text-ink-muted hover:bg-gold/10 hover:text-gold flex items-center justify-center transition-colors"
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
                            className="w-9 h-9 rounded-lg bg-danger/5 text-danger hover:bg-danger/10 hover:text-danger flex items-center justify-center transition-colors disabled:opacity-50"
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
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-ink-muted">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-ink-muted"
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
                          <svg className="h-4 w-4 text-ink-muted" viewBox="0 0 512 512" aria-hidden="true">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink">
                {activeAddressId ? 'Update Address' : 'Add New Address'}
              </h2>
              <button
                className="w-9 h-9 rounded-lg bg-sunk text-ink-muted hover:bg-line flex items-center justify-center transition-colors"
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
                <label className="block text-sm font-medium text-ink-soft mb-2">Address Name</label>
                <input
                  name="name"
                  placeholder="e.g. Home, Office"
                  className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Full Address</label>
                <textarea
                  name="details"
                  placeholder="Street, building, apartment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                  required
                  value={formData.details}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="01xxxxxxxxx"
                    className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">City</label>
                  <input
                    name="city"
                    placeholder="Cairo"
                    className="w-full px-4 py-3 rounded-[16px] border border-line focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    required
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-danger">{formError}</p>}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 py-3 px-6 rounded-[16px] bg-sunk text-ink-soft font-semibold hover:bg-line transition-colors"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-[16px] bg-vault text-white font-semibold transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-[var(--shadow)]"
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
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-ink">Delete Address?</h3>
            <p className="text-sm text-ink-muted mt-2">
              This will permanently remove the address from your account.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-[16px] bg-sunk text-ink-soft font-semibold hover:bg-line transition-colors"
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-[16px] bg-danger text-white font-semibold hover:bg-danger transition-colors disabled:opacity-60"
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
            className={`rounded-[16px] px-4 py-3 shadow-[var(--shadow-lift)] text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-danger text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
}
