/** A product as the catalogue API returns it (only the fields the UI reads). */
export type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images?: string[];
  quantity?: number;
  sold?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  category?: { _id?: string; name: string };
  brand?: { _id?: string; name: string; image?: string };
  createdAt?: string;
};

/** One row of the bag. `lineId` is the API's cart-item id; `productId` is the product's. */
export type CartLine = {
  lineId: string | null;
  productId: string;
  title: string;
  image: string;
  brand?: string;
  category?: string;
  /** Unit price the API charges for this line. */
  price: number;
  count: number;
};

export type Cart = {
  id: string | null;
  lines: CartLine[];
  /** Sum of line prices × counts, as the API reports it. */
  subtotal: number;
  /** After a coupon, when one is applied. */
  totalAfterDiscount: number | null;
  /** Units, not lines — what the bag badge shows. */
  units: number;
};

type ApiCartLine = {
  _id?: string;
  count?: number;
  price?: number;
  product?: {
    _id?: string;
    id?: string;
    title?: string;
    imageCover?: string;
    brand?: { name?: string };
    category?: { name?: string };
  };
};

type ApiCart = {
  _id?: string;
  id?: string;
  products?: ApiCartLine[];
  totalCartPrice?: number;
  totalAfterDiscount?: number;
};

export function normalizeCart(data: ApiCart | null | undefined): Cart {
  const lines: CartLine[] = (data?.products ?? [])
    .map((l): CartLine | null => {
      const productId = l.product?._id ?? l.product?.id;
      if (!productId) return null;
      return {
        lineId: l._id ?? null,
        productId,
        title: l.product?.title ?? "Product",
        image: l.product?.imageCover ?? "",
        brand: l.product?.brand?.name,
        category: l.product?.category?.name,
        price: l.price ?? 0,
        count: Math.max(1, l.count ?? 1),
      };
    })
    .filter((l): l is CartLine => l !== null);

  const subtotal = data?.totalCartPrice ?? lines.reduce((s, l) => s + l.price * l.count, 0);
  const after = data?.totalAfterDiscount;
  return {
    id: data?._id ?? data?.id ?? null,
    lines,
    subtotal,
    totalAfterDiscount: typeof after === "number" && after < subtotal ? after : null,
    units: lines.reduce((s, l) => s + l.count, 0),
  };
}

export function recomputeCart(cart: Cart, lines: CartLine[]): Cart {
  const subtotal = lines.reduce((s, l) => s + l.price * l.count, 0);
  return {
    ...cart,
    lines,
    subtotal,
    // A local edit invalidates the API's post-coupon figure until the server replies.
    totalAfterDiscount: null,
    units: lines.reduce((s, l) => s + l.count, 0),
  };
}

export const EMPTY_CART: Cart = { id: null, lines: [], subtotal: 0, totalAfterDiscount: null, units: 0 };

/** The API sends priceAfterDiscount: 0 for "no discount" (9 products) — only a positive, lower price is a sale. */
export function discountOf(p: Pick<Product, "price" | "priceAfterDiscount">) {
  return typeof p.priceAfterDiscount === "number" && p.priceAfterDiscount > 0 && p.priceAfterDiscount < p.price
    ? Math.round((1 - p.priceAfterDiscount / p.price) * 100)
    : 0;
}

export const unitPrice = (p: Pick<Product, "price" | "priceAfterDiscount">) =>
  discountOf(p) ? (p.priceAfterDiscount as number) : p.price;
