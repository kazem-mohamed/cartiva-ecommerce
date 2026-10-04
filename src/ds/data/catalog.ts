// Server-side data for pages (called from Server Components only).
import type { Review } from "../commerce/Reviews";
import type { Product } from "../commerce/types";

const API = "https://ecommerce.routemisr.com/api/v1";

export type Category = { _id: string; name: string; slug?: string; image?: string };
export type Brand = { _id: string; name: string; slug?: string; image?: string };

async function getJson<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${API}/${path}`, { next: { revalidate } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Every page of a list endpoint. The whole catalogue is small (56 products), so pages fetch it once and filter here. */
async function getAll<T>(path: string, revalidate = 3600): Promise<T[]> {
  type Page = { data?: T[]; metadata?: { numberOfPages?: number } };
  const first = await getJson<Page>(`${path}?limit=100`, revalidate);
  if (!first) return [];
  const pages = first.metadata?.numberOfPages ?? 1;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) => getJson<Page>(`${path}?limit=100&page=${i + 2}`, revalidate)),
  );
  return [first, ...rest].flatMap((p) => p?.data ?? []);
}

export const getProducts = () => getAll<Product>("products");
export const getCategories = () => getAll<Category>("categories");
export const getBrands = () => getAll<Brand>("brands");

export async function getProduct(id: string): Promise<Product | null> {
  const json = await getJson<{ data?: Product }>(`products/${id}`, 600);
  return json?.data ?? null;
}

export async function getReviews(productId: string): Promise<Review[]> {
  const json = await getJson<{ data?: Review[] }>(`products/${productId}/reviews`, 60);
  return json?.data ?? [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const json = await getJson<{ data?: Category }>(`categories/${id}`, 3600);
  return json?.data ?? null;
}

export async function getBrand(id: string): Promise<Brand | null> {
  const json = await getJson<{ data?: Brand }>(`brands/${id}`, 3600);
  return json?.data ?? null;
}

/** Ids of categories / brands that actually hold products. */
export function stockedIds(products: Product[]) {
  return {
    categories: new Set(products.map((p) => p.category?._id).filter(Boolean) as string[]),
    brands: new Set(products.map((p) => p.brand?._id).filter(Boolean) as string[]),
  };
}
