import Link from 'next/link'

export default function Sale() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 p-8 text-white"
            style={{ opacity: 1, transform: 'none' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                <span className="font-semibold">Deal</span>
                <span>of the Day</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Fresh Organic Fruits</h3>
              <p className="text-white/80 mb-4">Get up to 40% off on selected organic fruits</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold">40% OFF</div>
                <div className="text-sm text-white/70">
                  Use code: <span className="font-bold text-white">ORGANIC40</span>
                </div>
              </div>
              <Link
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                href="/products"
              >
                Shop Now
                <svg data-prefix="fas" data-icon="arrow-right" className="h-4 w-4 shrink-0" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-400 to-rose-500 p-8 text-white"
            style={{ opacity: 1, transform: 'none' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                <span className="font-semibold">New</span>
                <span>Arrivals</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Exotic Vegetables</h3>
              <p className="text-white/80 mb-4">Discover our latest collection of premium vegetables</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold">25% OFF</div>
                <div className="text-sm text-white/70">
                  Use code: <span className="font-bold text-white">FRESH25</span>
                </div>
              </div>
              <Link
                className="inline-flex items-center gap-2 bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                href="/products?sort=newest"
              >
                Explore Now
                <svg data-prefix="fas" data-icon="arrow-right" className="h-4 w-4 shrink-0" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
