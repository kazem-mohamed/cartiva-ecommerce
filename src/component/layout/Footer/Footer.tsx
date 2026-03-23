'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .footer-feature-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          border-radius: 12px;
          padding: 14px;
          background: transparent;
        }
        .footer-feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
          border: 1px solid rgba(22,163,74,0.15);
        }
        .footer-feature-card:hover::before { opacity: 1; }
        .footer-feature-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.08); }
        .footer-feature-card:hover .feature-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
          background: linear-gradient(135deg, #16a34a, #15803d);
          box-shadow: 0 6px 20px rgba(22,163,74,0.35);
        }
        .footer-feature-card:hover .feature-icon-wrap svg { color: #fff; }

        .feature-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px;
          background: #f0fdf4;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease;
        }

        .footer-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 0.8125rem;
          font-weight: 400;
          letter-spacing: 0.01em;
          transition: color 0.25s ease, padding-left 0.25s ease;
          text-decoration: none;
          padding: 2px 0;
        }
        .footer-nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          transition: width 0.3s ease;
        }
        .footer-nav-link::after {
          content: '→';
          font-size: 0.65rem;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          color: #16a34a;
        }
        .footer-nav-link:hover {
          color: #16a34a;
          padding-left: 4px;
        }
        .footer-nav-link:hover::before { width: 100%; }
        .footer-nav-link:hover::after { opacity: 1; transform: translateX(0); }

        .social-btn {
          width: 40px; height: 40px; border-radius: 10px;
          background: #1f2937;
          display: flex; align-items: center; justify-content: center;
          color: #6b7280;
          transition: background 0.3s ease, color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          text-decoration: none;
        }
        .social-btn:hover {
          background: #16a34a;
          color: #fff;
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 8px 20px rgba(22,163,74,0.4);
        }
        .social-btn svg { width: 14px; height: 14px; transition: transform 0.3s ease; }
        .social-btn:hover svg { transform: scale(1.15); }

        .contact-link {
          display: flex; align-items: center; gap: 10px;
          color: #9ca3af; font-size: 0.8125rem;
          text-decoration: none;
          transition: color 0.25s ease, gap 0.25s ease;
          padding: 4px 0;
        }
        .contact-link:hover { color: #4ade80; gap: 14px; }
        .contact-link .contact-icon {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .contact-link:hover .contact-icon { transform: scale(1.2); }

        .payment-badge {
          display: flex; align-items: center; gap: 6px;
          color: #6b7280; font-size: 0.75rem;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #374151;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
          cursor: default;
        }
        .payment-badge:hover {
          color: #d1fae5;
          border-color: rgba(22,163,74,0.4);
          background: rgba(22,163,74,0.06);
          transform: translateY(-1px);
        }

        .footer-col-heading {
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f9fafb;
          margin-bottom: 20px;
          position: relative;
          display: inline-block;
        }
        .footer-col-heading::after {
          content: '';
          position: absolute;
          left: 0; bottom: -6px;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .footer-col:hover .footer-col-heading::after { width: 100%; }

        .divider-gradient {
          height: 1px;
          background: linear-gradient(90deg, transparent, #374151, transparent);
        }

        .logo-wrap {
          display: inline-block;
          background: white;
          border-radius: 10px;
          padding: 8px 16px;
          margin-bottom: 20px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .logo-wrap:hover {
          box-shadow: 0 8px 30px rgba(22,163,74,0.25);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Feature strip */}
      <div style={{ background: 'linear-gradient(to bottom, #f0fdf4, #f7fee7)', borderTop: '1px solid #dcfce7', borderBottom: '1px solid #dcfce7' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                icon: <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/>,
                vb: "0 0 576 512", title: "Free Shipping", sub: "On orders over 500 EGP"
              },
              {
                icon: <path fill="currentColor" d="M256 64c-56.8 0-107.9 24.7-143.1 64l47.1 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 192c-17.7 0-32-14.3-32-32L0 32C0 14.3 14.3 0 32 0S64 14.3 64 32l0 54.7C110.9 33.6 179.5 0 256 0 397.4 0 512 114.6 512 256S397.4 512 256 512c-87 0-163.9-43.4-210.1-109.7-10.1-14.5-6.6-34.4 7.9-44.6s34.4-6.6 44.6 7.9c34.8 49.8 92.4 82.3 157.6 82.3 106 0 192-86 192-192S362 64 256 64z"/>,
                vb: "0 0 512 512", title: "Easy Returns", sub: "14-day return policy"
              },
              {
                icon: <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"/>,
                vb: "0 0 512 512", title: "Secure Payment", sub: "100% secure checkout"
              },
              {
                icon: <path fill="currentColor" d="M224 64c-79 0-144.7 57.3-157.7 132.7 9.3-3 19.3-4.7 29.7-4.7l16 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0c-53 0-96-43-96-96l0-64C0 100.3 100.3 0 224 0S448 100.3 448 224l0 168.1c0 66.3-53.8 120-120.1 120l-87.9-.1-32 0c-26.5 0-48-21.5-48-48s21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 0 40 0c39.8 0 72-32.2 72-72l0-20.9c-14.1 8.2-30.5 12.8-48 12.8l-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l16 0c10.4 0 20.3 1.6 29.7 4.7-13-75.3-78.6-132.7-157.7-132.7z"/>,
                vb: "0 0 448 512", title: "24/7 Support", sub: "Contact us anytime"
              }
            ].map(({ icon, vb, title, sub }) => (
              <div key={title} className="footer-feature-card flex items-center gap-3">
                <div className="feature-icon-wrap">
                  <svg viewBox={vb} style={{ width: 18, height: 18, color: '#16a34a' }} aria-hidden="true">
                    {icon}
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem', marginBottom: 2 }}>{title}</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div id="footer" style={{ background: '#0d1117', color: 'white' }}>
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">

            {/* Brand column */}
            <div className="lg:col-span-4">
              <Link className="logo-wrap" href="/">
                <Image alt="FreshCart Logo" width={140} height={28} className="h-7 w-auto" src="/freshcart-logo.49f1b44d.svg%20fill.png" />
              </Link>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', lineHeight: '1.7', marginBottom: 24 }}>
                FreshCart is your one-stop destination for quality products. From fashion to electronics, we bring you
                the best brands at competitive prices with a seamless shopping experience.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                <a href="tel:+18001234567" className="contact-link">
                  <span className="contact-icon" style={{ color: '#16a34a' }}>
                    <svg viewBox="0 0 512 512" style={{ width: 15, height: 15 }} fill="currentColor" aria-hidden="true">
                      <path d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"/>
                    </svg>
                  </span>
                  <span>+1 (800) 123-4567</span>
                </a>
                <a href="mailto:support@freshcart.com" className="contact-link">
                  <span className="contact-icon" style={{ color: '#16a34a' }}>
                    <svg viewBox="0 0 512 512" style={{ width: 15, height: 15 }} fill="currentColor" aria-hidden="true">
                      <path d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"/>
                    </svg>
                  </span>
                  <span>support@freshcart.com</span>
                </a>
                <div className="contact-link" style={{ cursor: 'default' }}>
                  <span className="contact-icon" style={{ color: '#16a34a', marginTop: 1 }}>
                    <svg viewBox="0 0 384 512" style={{ width: 12, height: 15 }} fill="currentColor" aria-hidden="true">
                      <path d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/>
                    </svg>
                  </span>
                  <span>123 Commerce Street, New York, NY 10001</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Facebook', path: 'M80 299.3l0 212.7 116 0 0-212.7 86.5 0 18-97.8-104.5 0 0-34.6c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4 .4 37 1.2l0-88.7C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4l0 42.1-66 0 0 97.8 66 0z', vb: '0 0 320 512' },
                  { label: 'Twitter', path: 'M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103l0-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z', vb: '0 0 512 512' },
                  { label: 'Instagram', path: 'M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z', vb: '0 0 448 512' },
                  { label: 'YouTube', path: 'M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z', vb: '0 0 576 512' },
                ].map(({ label, path, vb }) => (
                  <a key={label} href="#" className="social-btn" aria-label={label}>
                    <svg viewBox={vb} fill="currentColor" aria-hidden="true"><path d={path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {[
              {
                title: 'Shop', links: [
                  { label: 'All Products', href: '/products' },
                  { label: 'Categories', href: '/categories' },
                  { label: 'Brands', href: '/brand' },
                  { label: 'Electronics', href: '/products?category[in]=6439d58a0049ad0b52b9003f' },
                  { label: "Men's Fashion", href: '/products?category[in]=6439d2d167d9aa4ca970649f' },
                  { label: "Women's Fashion", href: '/products?category[in]=6439d5b90049ad0b52b90048' },
                ]
              },
              {
                title: 'Account', links: [
                  { label: 'My Account', href: '/profile/settings' },
                  { label: 'Order History', href: '/orders' },
                  { label: 'Wishlist', href: '/wishlist' },
                  { label: 'Shopping Cart', href: '/cart' },
                  { label: 'Sign In', href: '/login' },
                  { label: 'Create Account', href: '/register' },
                ]
              },
              {
                title: 'Support', links: [
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'Help Center', href: '/help' },
                  { label: 'Shipping Info', href: '/shipping' },
                  { label: 'Returns & Refunds', href: '/returns' },
                  { label: 'Track Order', href: '/track-order' },
                ]
              },
              {
                title: 'Legal', links: [
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                ]
              },
            ].map(({ title, links }) => (
              <div key={title} className="footer-col lg:col-span-2">
                <h3 className="footer-col-heading">{title}</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link className="footer-nav-link" href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-gradient" />

        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ color: '#6b7280', fontSize: '0.75rem', letterSpacing: '0.02em' }}>
              © {new Date().getFullYear()} FreshCart. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {['Visa', 'Mastercard', 'PayPal'].map((method) => (
                <div key={method} className="payment-badge">
                  <svg viewBox="0 0 512 512" style={{ width: 13, height: 13 }} fill="currentColor" aria-hidden="true">
                    <path d="M0 128l0 32 512 0 0-32c0-35.3-28.7-64-64-64L64 64C28.7 64 0 92.7 0 128zm0 80L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-176-512 0zM64 360c0-13.3 10.7-24 24-24l48 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-48 0c-13.3 0-24-10.7-24-24zm144 0c0-13.3 10.7-24 24-24l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0c-13.3 0-24-10.7-24-24z"/>
                  </svg>
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}