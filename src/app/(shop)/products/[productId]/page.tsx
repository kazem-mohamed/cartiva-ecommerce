import Link from 'next/link'
import CartQuantity from '@/component/cart/CartQuantity'
import WishlistButton from '@/component/wishlist/WishlistButton'
import ProductTabs from './ProductTabs'
import SimilarProductsCarousel from './SimilarProductsCarousel'
import ProductImageGallery from './ProductImageGallery'

interface ProductCategory {
  _id: string
  name: string
  slug: string
}

interface ProductBrand {
  _id: string
  name: string
  slug: string
}

interface ProductSubcategory {
  _id: string
  name: string
  slug: string
  category?: string
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  priceAfterDiscount?: number
  quantity: number
  ratingsAverage?: number
  ratingsQuantity?: number
  imageCover: string
  images: string[]
  category?: ProductCategory
  subcategory?: ProductSubcategory
  brand?: ProductBrand
  sold?: number
}

interface ProductResponse {
  data: Product
}

interface ReviewUser {
  name?: string
}

interface Review {
  _id: string
  review: string
  rating: number
  user?: ReviewUser
  createdAt?: string
}

interface ReviewsResponse {
  data: Review[]
}

interface ProductsResponse {
  data: Product[]
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products/${productId}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as ProductResponse
    return json.data ?? null
  } catch {
    return null
  }
}

async function getSimilarProducts(product: Product): Promise<Product[]> {
  const categoryId = product.category?._id
  const brandId = product.brand?._id
  if (!categoryId && !brandId) return []

  const query = categoryId ? `category=${categoryId}` : `brand=${brandId}`
  try {
    const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products?${query}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as ProductsResponse
    return (json.data ?? []).filter((item) => item._id !== product._id).slice(0, 10)
  } catch {
    return []
  }
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products/${productId}/reviews`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = (await res.json()) as ReviewsResponse
    return json.data ?? []
  } catch {
    return []
  }
}

function Stars({ rating = 0 }: { rating?: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={index < filled ? 'h-4 w-4 text-yellow-400' : 'h-4 w-4 text-gray-300'}
          viewBox="0 0 576 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z"
          />
        </svg>
      ))}
    </div>
  )
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const safeProductId = decodeURIComponent(productId ?? '')
  const product = safeProductId ? await getProduct(safeProductId) : null

  if (!product) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-500 mb-6">The product may be unavailable or the link is invalid.</p>
            <Link
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold bg-green-600 text-white hover:bg-green-700 transition"
              href="/products"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const price = product.price
  const discounted = product.priceAfterDiscount
  const hasDiscount = discounted && discounted < price
  const savePercent = hasDiscount ? Math.round(((price - discounted) / price) * 100) : 0
  const reviews = await getReviews(product._id)
  const reviewTotal = reviews.length
  const reviewCount = reviewTotal || product.ratingsQuantity || 0
  const avgRating =
    reviewTotal > 0
      ? reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviewTotal
      : product.ratingsAverage ?? 0
  const similarProducts = await getSimilarProducts(product)

  return (
    <section id="product-detail" className="py-6">
      <div className="container mx-auto px-4">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="py-4">
          <ol className="flex items-center flex-wrap gap-1 text-sm">
            <li className="flex items-center">
              <Link className="text-gray-500 hover:text-green-600 transition flex items-center gap-1.5" href="/">
                <svg className="h-3 w-3" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path fill="currentColor" d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z" />
                </svg>
                Home
              </Link>
              <svg className="h-3 w-3 text-gray-400 mx-2" role="img" viewBox="0 0 320 512" aria-hidden="true">
                <path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
              </svg>
            </li>

            {product.category && (
              <li className="flex items-center">
                <Link className="text-gray-500 hover:text-green-600 transition flex items-center gap-1.5" href={`/categories/${product.category._id}`}>
                  {product.category.name}
                </Link>
                <svg className="h-3 w-3 text-gray-400 mx-2" role="img" viewBox="0 0 320 512" aria-hidden="true">
                  <path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                </svg>
              </li>
            )}

            <li className="text-gray-900 font-medium truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Images */}
          <ProductImageGallery
            title={product.title}
            imageCover={product.imageCover}
            images={product.images}
            hasDiscount={Boolean(hasDiscount)}
            savePercent={savePercent}
          />

          {/* Info */}
          <div id="product-info" className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-6">

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.category && (
                  <Link
                    className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full hover:bg-green-100 transition"
                    href={`/categories/${product.category._id}`}
                  >
                    {product.category.name}
                  </Link>
                )}
                {product.brand && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                    {product.brand.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

              {/* Stars */}
              <div className="flex items-center gap-3 mb-4">
                <Stars rating={product.ratingsAverage ?? 0} />
                <span className="text-sm text-gray-600">
                  {(product.ratingsAverage ?? 0).toFixed(1)} ({product.ratingsQuantity ?? 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center flex-wrap gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {(hasDiscount ? discounted : price) ?? price} EGP
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">{price} EGP</span>
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                      Save {savePercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity selector */}
              <CartQuantity
                productId={product._id}
                max={product.quantity}
                price={price}
                discounted={discounted}
              />

              {/* Add to Cart / Buy Now */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  className="flex-1 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 bg-green-600 cursor-pointer"
                  type="button"
                >
                  <svg className="h-4 w-4" role="img" viewBox="0 0 640 512" aria-hidden="true">
                    <path fill="currentColor" d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                  </svg>
                  Add to Cart
                </button>

                <button
                  className="flex-1 bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                    <path fill="currentColor" d="M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {/* Wishlist / Share */}
              <div className="flex gap-3 mb-6">
                <WishlistButton productId={product._id} />
                <button
                  className="border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:border-green-300 hover:text-green-600 transition cursor-pointer"
                  type="button"
                >
                  <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M384 192c53 0 96-43 96-96s-43-96-96-96-96 43-96 96c0 5.4 .5 10.8 1.3 16L159.6 184.1c-16.9-15-39.2-24.1-63.6-24.1-53 0-96 43-96 96s43 96 96 96c24.4 0 46.6-9.1 63.6-24.1L289.3 400c-.9 5.2-1.3 10.5-1.3 16 0 53 43 96 96 96s96-43 96-96-43-96-96-96c-24.4 0-46.6 9.1-63.6 24.1L190.7 272c.9-5.2 1.3-10.5 1.3-16s-.5-10.8-1.3-16l129.7-72.1c16.9 15 39.2 24.1 63.6 24.1z" />
                  </svg>
                </button>
              </div>

              {/* Trust badges */}
              <div className="border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="h-4 w-4" role="img" viewBox="0 0 640 512" aria-hidden="true">
                        <path fill="currentColor" d="M64 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L621.3 192c12 12 18.7 28.3 18.7 45.3L640 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-3.3 0c-35.3 0-64-28.7-64-64l0-48-40 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 240c-13.3 0-24-10.7-24-24s10.7-24 24-24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 144c-13.3 0-24-10.7-24-24S10.7 96 24 96l40 0zM576 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM256 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Free Delivery</h4>
                      <p className="text-xs text-gray-500">Orders over $50</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M256 64c-56.8 0-107.9 24.7-143.1 64l47.1 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 192c-17.7 0-32-14.3-32-32L0 32C0 14.3 14.3 0 32 0S64 14.3 64 32l0 54.7C110.9 33.6 179.5 0 256 0 397.4 0 512 114.6 512 256S397.4 512 256 512c-87 0-163.9-43.4-210.1-109.7-10.1-14.5-6.6-34.4 7.9-44.6s34.4-6.6 44.6 7.9c34.8 49.8 92.4 82.3 157.6 82.3 106 0 192-86 192-192S362 64 256 64z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">30 Days Return</h4>
                      <p className="text-xs text-gray-500">Money back</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Secure Payment</h4>
                      <p className="text-xs text-gray-500">100% Protected</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tabs: Product Details / Reviews / Shipping & Returns */}
        <ProductTabs
          productId={product._id}
          description={product.description}
          category={product.category}
          subcategory={product.subcategory}
          brand={product.brand}
          sold={product.sold}
          ratingsAverage={avgRating}
          ratingsQuantity={reviewCount}
          reviews={reviews}
        />

        {similarProducts.length > 0 && <SimilarProductsCarousel products={similarProducts} />}

      </div>
    </section>
  )
}




