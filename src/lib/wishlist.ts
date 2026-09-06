const WISHLIST_API = 'https://ecommerce.routemisr.com/api/v1/wishlist'

export function notifyWishlistUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlistUpdated'))
  }
}

export async function getWishlist(token: string): Promise<Array<{ _id: string }>> {
  const res = await fetch(WISHLIST_API, { headers: { token } })
  if (!res.ok) throw new Error('Failed to load wishlist')
  const json = await res.json().catch(() => null)
  return (json?.data as Array<{ _id: string }> | undefined) ?? []
}

export async function addToWishlist(productId: string, token: string) {
  const res = await fetch(WISHLIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) throw new Error('Failed to add to wishlist')
}

export async function removeFromWishlist(productId: string, token: string) {
  const res = await fetch(`${WISHLIST_API}/${productId}`, {
    method: 'DELETE',
    headers: { token },
  })
  if (!res.ok) throw new Error('Failed to remove from wishlist')
}
