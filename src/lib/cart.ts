const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'
const COUPON_API = 'https://ecommerce.routemisr.com/api/v2/cart/applyCoupon'

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    token,
    Authorization: `Bearer ${token}`,
  }
}

export function notifyCartUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

async function readJson(res: Response) {
  return res.json().catch(() => null)
}

export async function getCart(token: string) {
  const res = await fetch(CART_API, {
    headers: {
      token,
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to load cart')
  const json = await readJson(res)
  return json?.data ?? null
}

export async function addToCart(productId: string, token: string) {
  const res = await fetch(CART_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) throw new Error('Failed to add to cart')
  const json = await readJson(res)
  return json?.data ?? null
}

export async function updateCartQuantity(productId: string, count: number, token: string) {
  const res = await fetch(`${CART_API}/${productId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ count }),
  })
  if (!res.ok) throw new Error('Failed to update cart')
  const json = await readJson(res)
  return json?.data ?? null
}

export async function deleteCartItem(
  urlId: string,
  token: string,
  body: { productId: string; cartItemId?: string | null },
) {
  const res = await fetch(`${CART_API}/${urlId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to remove item')
  const json = await readJson(res)
  return json?.data ?? null
}

export async function removeFromCart(
  productId: string,
  token: string,
  cartItemId?: string | null,
) {
  return deleteCartItem(cartItemId ?? productId, token, { productId, cartItemId })
}

export async function clearCart(token: string) {
  const res = await fetch(CART_API, {
    method: 'DELETE',
    headers: {
      token,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to clear cart')
}

export async function applyCoupon(couponName: string, token: string) {
  const res = await fetch(COUPON_API, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ couponName }),
  })
  if (!res.ok) throw new Error('Failed to apply coupon')
  const json = await readJson(res)
  return json?.data ?? null
}
