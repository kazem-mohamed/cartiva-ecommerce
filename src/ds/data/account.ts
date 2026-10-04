/** Signed-in account calls (addresses, orders), shared by checkout, orders and profile. Client-side: they need the user's token. */
const API = "https://ecommerce.routemisr.com/api/v1";

export type Address = { _id: string; name?: string; details: string; phone: string; city: string };
export type ShippingAddress = { city: string; details: string; phone: string };

export type OrderItem = { _id?: string; count?: number; price?: number; product?: { _id?: string; title?: string; imageCover?: string } };
export type Order = {
  _id?: string;
  id?: number | string;
  createdAt?: string;
  totalOrderPrice?: number;
  isPaid?: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  paymentMethodType?: "cash" | "card" | string;
  cartItems?: OrderItem[];
  shippingAddress?: Partial<ShippingAddress>;
};

/** Egyptian mobile: 11 digits starting 010, 011, 012 or 015. */
export const EG_MOBILE = /^01[0125][0-9]{8}$/;
export const cleanPhone = (v: string) => v.replace(/[\s-]/g, "");

const headers = (token: string) => ({ "Content-Type": "application/json", token, Authorization: `Bearer ${token}` });

async function call<T>(path: string, token: string, init: RequestInit = {}, fallback = "Something went wrong. Try again."): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: headers(token), cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? fallback);
  return json as T;
}

export async function listAddresses(token: string) {
  const json = await call<{ data?: Address[] }>("/addresses", token, {}, "Couldn't load your addresses.");
  return json.data ?? [];
}

export async function saveAddress(token: string, address: Omit<Address, "_id">, id?: string) {
  const json = await call<{ data?: Address[] }>(
    id ? `/addresses/${id}` : "/addresses",
    token,
    { method: id ? "PUT" : "POST", body: JSON.stringify(address) },
    "Couldn't save that address.",
  );
  return json.data ?? [];
}

export async function deleteAddress(token: string, id: string) {
  const json = await call<{ data?: Address[] }>(`/addresses/${id}`, token, { method: "DELETE" }, "Couldn't remove that address.");
  return json.data ?? [];
}

export async function placeCashOrder(token: string, cartId: string, shippingAddress: ShippingAddress) {
  const json = await call<{ data?: Order }>(
    `/orders/${cartId}`,
    token,
    { method: "POST", body: JSON.stringify({ shippingAddress }) },
    "Couldn't place the order.",
  );
  return json.data ?? null;
}

/** Returns Stripe's hosted payment page. After paying, Stripe sends the shopper to `{returnUrl}/allorders` (redirected to /orders). */
export async function startCardCheckout(token: string, cartId: string, shippingAddress: ShippingAddress, returnUrl: string) {
  const json = await call<{ session?: { url?: string } }>(
    `/orders/checkout-session/${cartId}?url=${encodeURIComponent(returnUrl)}`,
    token,
    { method: "POST", body: JSON.stringify({ shippingAddress }) },
    "Couldn't start the card payment.",
  );
  const url = json.session?.url;
  if (!url) throw new Error("The payment page didn't open. Try cash on delivery.");
  return url;
}

export async function listOrders(token: string, userId: string) {
  const json = await call<Order[] | { data?: Order[] }>(`/orders/user/${userId}`, token, {}, "Couldn't load your orders.");
  const list = Array.isArray(json) ? json : (json.data ?? []);
  return [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
