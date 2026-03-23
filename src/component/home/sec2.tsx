import React from 'react'

const features = [
  {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Free Shipping',
    subtitle: 'On orders over 500 EGP',
    svg: (
      <svg data-prefix="fas" data-icon="truck" className="svg-inline--fa fa-truck text-xl" role="img" viewBox="0 0 576 512" aria-hidden="true">
        <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    title: 'Secure Payment',
    subtitle: '100% secure transactions',
    svg: (
      <svg data-prefix="fas" data-icon="shield-halved" className="svg-inline--fa fa-shield-halved text-xl" role="img" viewBox="0 0 512 512" aria-hidden="true">
        <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    title: 'Easy Returns',
    subtitle: '14-day return policy',
    svg: (
      <svg data-prefix="fas" data-icon="arrow-rotate-left" className="svg-inline--fa fa-arrow-rotate-left text-xl" role="img" viewBox="0 0 512 512" aria-hidden="true">
        <path fill="currentColor" d="M256 64c-56.8 0-107.9 24.7-143.1 64l47.1 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 192c-17.7 0-32-14.3-32-32L0 32C0 14.3 14.3 0 32 0S64 14.3 64 32l0 54.7C110.9 33.6 179.5 0 256 0 397.4 0 512 114.6 512 256S397.4 512 256 512c-87 0-163.9-43.4-210.1-109.7-10.1-14.5-6.6-34.4 7.9-44.6s34.4-6.6 44.6 7.9c34.8 49.8 92.4 82.3 157.6 82.3 106 0 192-86 192-192S362 64 256 64z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: '24/7 Support',
    subtitle: 'Dedicated support team',
    svg: (
      <svg data-prefix="fas" data-icon="headset" className="svg-inline--fa fa-headset text-xl" role="img" viewBox="0 0 448 512" aria-hidden="true">
        <path fill="currentColor" d="M224 64c-79 0-144.7 57.3-157.7 132.7 9.3-3 19.3-4.7 29.7-4.7l16 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0c-53 0-96-43-96-96l0-64C0 100.3 100.3 0 224 0S448 100.3 448 224l0 168.1c0 66.3-53.8 120-120.1 120l-87.9-.1-32 0c-26.5 0-48-21.5-48-48s21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 0 40 0c39.8 0 72-32.2 72-72l0-20.9c-14.1 8.2-30.5 12.8-48 12.8l-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l16 0c10.4 0 20.3 1.6 29.7 4.7-13-75.3-78.6-132.7-157.7-132.7z" />
      </svg>
    ),
  },
]

export default function FeaturesBar() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className={`${feature.iconBg} ${feature.iconColor} w-12 h-12 rounded-full flex items-center justify-center shrink-0`}>
                {feature.svg}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}