'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import sliderBg from './asset/slider.png'

const paginationStyles = `
  .swiper-pagination {
    position: absolute;
    bottom: 16px !important;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    z-index: 10;
  }
  .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 9999px;
    opacity: 1;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .swiper-pagination-bullet-active {
    background: #ffffff;
    width: 28px;
    height: 10px;
    border-radius: 9999px;
  }
`

const slides = [
  {
    title: 'Fresh Products Delivered to your Door',
    subtitle: 'Get 20% off your first order',
    primaryBtn: { label: 'Shop Now', href: '/products' },
    secondaryBtn: { label: 'View Deals', href: '/deals' },
    primaryBtnClass: 'text-green-500',
  },
  {
    title: 'Premium Quality Guaranteed',
    subtitle: 'Fresh from farm to your table',
    primaryBtn: { label: 'Shop Now', href: '/products' },
    secondaryBtn: { label: 'Learn More', href: '/about' },
    primaryBtnClass: 'text-blue-500',
  },
  {
    title: 'Fast & Free Delivery',
    subtitle: 'Same day delivery available',
    primaryBtn: { label: 'Order Now', href: '/products' },
    secondaryBtn: { label: 'Delivery Info', href: '/delivery' },
    primaryBtnClass: 'text-purple-500',
  },
]

export default function MainSlider() {
  return (
    <div className="relative">
      <style>{paginationStyles}</style>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        pagination={{ clickable: true, el: '.swiper-pagination' }}
        navigation={{
          prevEl: '.custom-prev',
          nextEl: '.custom-next',
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                backgroundImage: `url(${sliderBg.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="h-[400px] flex items-center justify-center"
            >
              <div className="overlay py-20 text-white p-4 w-full h-full bg-gradient-to-r from-green-500/90 to-green-400/50">
                <div className="container h-full content-center">
                  <h2 className="text-white text-3xl font-bold mb-4 max-w-96">
                    {slide.title}
                  </h2>
                  <p>{slide.subtitle}</p>
                  <div className="mt-4">
                    <a
                      className={`btn bg-white border-2 border-white/50 ${slide.primaryBtnClass} inline-block px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform`}
                      href={slide.primaryBtn.href}
                    >
                      {slide.primaryBtn.label}
                    </a>
                    <a
                      className="btn bg-transparent border-2 border-white/50 text-white ml-2 inline-block px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
                      href={slide.secondaryBtn.href}
                    >
                      {slide.secondaryBtn.label}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Pagination */}
        <div className="swiper-pagination" />
      </Swiper>

      {/* Custom Prev Button */}
      <div className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/90 hover:bg-white text-green-500 hover:text-green-600 rounded-full w-12 h-12 hidden md:flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
          className="w-4 h-4"
          fill="currentColor"
        >
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
        </svg>
      </div>

      {/* Custom Next Button */}
      <div className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/90 hover:bg-white text-green-500 hover:text-green-600 rounded-full w-12 h-12 hidden md:flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
          className="w-4 h-4"
          fill="currentColor"
        >
          <path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
        </svg>
      </div>
    </div>
  )
}