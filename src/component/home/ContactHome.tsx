export default function ContactHome() {
  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div
            className="bg-linear-to-br from-emerald-50 via-white to-teal-50 rounded-[2.5rem] border border-emerald-100/50 shadow-2xl shadow-emerald-500/10 overflow-hidden"
            style={{ opacity: 1, transform: 'none' }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-emerald-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-teal-200/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative grid lg:grid-cols-5 gap-8 p-8 lg:p-14">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="h-6 w-6 text-white" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Newsletter</h3>
                    <p className="text-xs text-gray-500">50,000+ subscribers</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
                    Get the Freshest Updates <span className="text-emerald-600">Delivered Free</span>
                  </h2>
                  <p className="text-gray-500 mt-3 text-lg">Weekly recipes, seasonal offers, and exclusive member perks.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-100 px-4 py-2.5 rounded-full shadow-sm">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-emerald-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M471.3 6.7C477.7 .6 487-1.6 495.6 1.2 505.4 4.5 512 13.7 512 24l0 186.9c0 131.2-108.1 237.1-238.8 237.1-77 0-143.4-49.5-167.5-118.7-35.4 30.8-57.7 76.1-57.7 126.7 0 13.3-10.7 24-24 24S0 469.3 0 456C0 381.1 38.2 315.1 96.1 276.3 131.4 252.7 173.5 240 216 240l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0c-39.7 0-77.3 8.8-111 24.5 23.3-70 89.2-120.5 167-120.5 66.4 0 115.8-22.1 148.7-44 19.2-12.8 35.5-28.1 50.7-45.3z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Fresh Picks Weekly</span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-100 px-4 py-2.5 rounded-full shadow-sm">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-emerald-600" role="img" viewBox="0 0 576 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Free Delivery Codes</span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-100 px-4 py-2.5 rounded-full shadow-sm">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-emerald-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M32.5 96l0 149.5c0 17 6.7 33.3 18.7 45.3l192 192c25 25 65.5 25 90.5 0L483.2 333.3c25-25 25-65.5 0-90.5l-192-192C279.2 38.7 263 32 246 32L96.5 32c-35.3 0-64 28.7-64 64zm112 16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Members-Only Deals</span>
                  </div>
                </div>

                <form className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        placeholder="you@example.com"
                        className="w-full pl-5 pr-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-base shadow-sm"
                        required
                        type="email"
                        name="email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                    >
                      <span>Subscribe</span>
                      <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 pl-1">Unsubscribe anytime. No spam, ever.</p>
                </form>
              </div>

              <div className="lg:col-span-2 lg:border-l lg:border-emerald-100 lg:pl-8">
                <div className="h-full flex flex-col justify-center">
                  <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl" />
                    <div className="relative space-y-5">
                      <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/30">
                        MOBILE APP
                      </div>
                      <h3 className="text-2xl font-bold leading-tight">Shop Faster on Our App</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Get app-exclusive deals and 15% off your first order.</p>

                      <div className="flex flex-col gap-3 pt-2">
                        <a
                          href="#"
                          className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                        >
                          <svg className="h-5 w-5" role="img" viewBox="0 0 384 512" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M319.1 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7-55.8 .9-115.1 44.5-115.1 133.2 0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.5 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                            />
                          </svg>
                          <div className="text-left">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Download on</div>
                            <div className="text-sm font-semibold -mt-0.5">App Store</div>
                          </div>
                        </a>

                        <a
                          href="#"
                          className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                        >
                          <svg className="h-5 w-5" role="img" viewBox="0 0 448 512" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M293.6 234.3L72.9 13 353.7 174.2 293.6 234.3zM15.3 0C2.3 6.8-6.4 19.2-6.4 35.3l0 441.3c0 16.1 8.7 28.5 21.7 35.3L271.9 255.9 15.3 0zM440.5 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM72.9 499L353.7 337.8 293.6 277.7 72.9 499z"
                            />
                          </svg>
                          <div className="text-left">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Get it on</div>
                            <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                          </div>
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-2 text-sm text-gray-400">
                        <span className="text-yellow-400">5-star rating</span>
                        <span>• 100K+ downloads</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
