'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] text-primary-200 text-4xl animate-[float_6s_ease-in-out_infinite]">
          <svg
            data-prefix="fas"
            data-icon="apple-whole"
            className="svg-inline--fa fa-apple-whole"
            role="img"
            viewBox="0 0 448 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M224 112c-8.8 0-16-7.2-16-16l0-16c0-44.2 35.8-80 80-80l16 0c8.8 0 16 7.2 16 16l0 16c0 44.2-35.8 80-80 80l-16 0zM0 288c0-76.3 35.7-160 112-160 27.3 0 59.7 10.3 82.7 19.3 18.8 7.3 39.9 7.3 58.7 0 22.9-8.9 55.4-19.3 82.7-19.3 76.3 0 112 83.7 112 160 0 128-80 224-160 224-16.5 0-38.1-6.6-51.5-11.3-8.1-2.8-16.9-2.8-25 0-13.4 4.7-35 11.3-51.5 11.3-80 0-160-96-160-224z"
            />
          </svg>
        </div>
        <div className="absolute top-[20%] right-[10%] text-primary-200 text-3xl animate-[float_8s_ease-in-out_infinite_1s]">
          <svg
            data-prefix="fas"
            data-icon="carrot"
            className="svg-inline--fa fa-carrot"
            role="img"
            viewBox="0 0 640 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M453.1-36.7L440.9-24.6c-31.2 31.2-31.2 81.9 0 113.1 15.6 15.6 31.2 31.2 46.9 46.9 31.2 31.2 81.9 31.2 113.1 0l12.1-12.1c6.2-6.2 6.2-16.4 0-22.6L600.9 88.6c-31.2-31.2-81.9-31.2-113.1 0 31.2-31.2 31.2-81.9 0-113.1L475.7-36.7c-6.2-6.2-16.4-6.2-22.6 0zM331.6 96c-45.2 0-87.1 20.4-115 54.3L273.3 207c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L191.6 193.2 67.2 466.8c-5.5 12.1-2.9 26.4 6.5 35.9s23.7 12 35.9 6.5l141.6-64.4-43.8-43.8c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l56.5 56.5 95.3-43.3c53.1-24.1 87.2-77.1 87.2-135.5 0-82.2-66.6-148.8-148.8-148.8z"
            />
          </svg>
        </div>
        <div className="absolute bottom-[25%] left-[8%] text-primary-200 text-3xl animate-[float_7s_ease-in-out_infinite_0.5s]">
          <svg
            data-prefix="fas"
            data-icon="lemon"
            className="svg-inline--fa fa-lemon"
            role="img"
            viewBox="0 0 448 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M448 96c0-35.3-28.7-64-64-64-6.6 0-13 1-19 2.9-22.5 7-48.1 14.9-71 9-75.2-19.1-156.4 11-213.7 68.3S-7.2 250.8 11.9 326c5.8 22.9-2 48.4-9 71-1.9 6-2.9 12.4-2.9 19 0 35.3 28.7 64 64 64 6.6 0 13-1 19.1-2.9 22.5-7 48.1-14.9 71-9 75.2 19.1 156.4-11 213.7-68.3S455.2 261.2 436.1 186c-5.8-22.9 2-48.4 9-71 1.9-6 2.9-12.4 2.9-19.1zM222.7 143c-52 15.2-96.5 59.7-111.7 111.7-3.7 12.7-17.1 20-29.8 16.3S61.2 254 65 241.3c19.8-67.7 76.6-124.5 144.3-144.3 12.7-3.7 26.1 3.6 29.8 16.3s-3.6 26.1-16.3 29.8z"
            />
          </svg>
        </div>
        <div className="absolute bottom-[15%] right-[15%] text-primary-200 text-4xl animate-[float_9s_ease-in-out_infinite_2s]">
          <svg
            data-prefix="fas"
            data-icon="seedling"
            className="svg-inline--fa fa-seedling"
            role="img"
            viewBox="0 0 512 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M512 32C512 140.1 435.4 230.3 333.6 251.4 325.7 193.3 299.6 141 261.1 100.5 301.2 40 369.9 0 448 0l32 0c17.7 0 32 14.3 32 32zM0 96C0 78.3 14.3 64 32 64l32 0c123.7 0 224 100.3 224 224l0 192c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160C100.3 320 0 219.7 0 96z"
            />
          </svg>
        </div>
        <div className="absolute top-[50%] left-[15%] text-primary-100 text-2xl animate-[float_5s_ease-in-out_infinite_1.5s]">
          <svg
            data-prefix="fas"
            data-icon="apple-whole"
            className="svg-inline--fa fa-apple-whole"
            role="img"
            viewBox="0 0 448 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M224 112c-8.8 0-16-7.2-16-16l0-16c0-44.2 35.8-80 80-80l16 0c8.8 0 16 7.2 16 16l0 16c0 44.2-35.8 80-80 80l-16 0zM0 288c0-76.3 35.7-160 112-160 27.3 0 59.7 10.3 82.7 19.3 18.8 7.3 39.9 7.3 58.7 0 22.9-8.9 55.4-19.3 82.7-19.3 76.3 0 112 83.7 112 160 0 128-80 224-160 224-16.5 0-38.1-6.6-51.5-11.3-8.1-2.8-16.9-2.8-25 0-13.4 4.7-35 11.3-51.5 11.3-80 0-160-96-160-224z"
            />
          </svg>
        </div>
        <div className="absolute top-[40%] right-[5%] text-primary-100 text-2xl animate-[float_6s_ease-in-out_infinite_0.8s]">
          <svg
            data-prefix="fas"
            data-icon="carrot"
            className="svg-inline--fa fa-carrot"
            role="img"
            viewBox="0 0 640 512"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M453.1-36.7L440.9-24.6c-31.2 31.2-31.2 81.9 0 113.1 15.6 15.6 31.2 31.2 46.9 46.9 31.2 31.2 81.9 31.2 113.1 0l12.1-12.1c6.2-6.2 6.2-16.4 0-22.6L600.9 88.6c-31.2-31.2-81.9-31.2-113.1 0 31.2-31.2 31.2-81.9 0-113.1L475.7-36.7c-6.2-6.2-16.4-6.2-22.6 0zM331.6 96c-45.2 0-87.1 20.4-115 54.3L273.3 207c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L191.6 193.2 67.2 466.8c-5.5 12.1-2.9 26.4 6.5 35.9s23.7 12 35.9 6.5l141.6-64.4-43.8-43.8c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l56.5 56.5 95.3-43.3c53.1-24.1 87.2-77.1 87.2-135.5 0-82.2-66.6-148.8-148.8-148.8z"
            />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 w-64 h-52 sm:w-72 sm:h-60 bg-primary-100/50 rounded-[32px] blur-2xl" />
            <div className="relative w-64 h-52 sm:w-72 sm:h-60">
              <div className="absolute inset-x-0 top-4 mx-auto w-52 h-40 sm:w-60 sm:h-44 bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-transparent to-primary-100/40" />
                <svg
                  data-prefix="fas"
                  data-icon="cart-shopping"
                  className="svg-inline--fa fa-cart-shopping relative text-6xl sm:text-7xl text-primary-400/80"
                  role="img"
                  viewBox="0 0 640 512"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-white shadow-lg" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/40">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">404</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-400" />
                <div className="w-8 h-4 border-b-[3px] border-primary-400 rounded-b-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">Oops! Nothing Here</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            Looks like this page went out of stock! Don&apos;t worry, there&apos;s plenty more fresh content to explore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-1"
            href="/"
          >
            <svg
              data-prefix="fas"
              data-icon="house"
              className="svg-inline--fa fa-house group-hover:scale-110 transition-transform duration-300"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"
              />
            </svg>
            Go to Homepage
          </Link>
          <button
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1"
            type="button"
            onClick={() => router.back()}
          >
            <svg
              data-prefix="fas"
              data-icon="arrow-left"
              className="svg-inline--fa fa-arrow-left group-hover:-translate-x-1 transition-transform duration-300"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
              />
            </svg>
            Go Back
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Popular Destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link className="px-5 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors" href="/products">
              All Products
            </Link>
            <Link className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors" href="/categories">
              Categories
            </Link>
            <Link className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors" href="/deals">
              Today&apos;s Deals
            </Link>
            <Link className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors" href="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
