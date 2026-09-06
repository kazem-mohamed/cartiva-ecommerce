import Link from 'next/link'
import { CartivaMark } from '@/component/brand/CartivaMark'

/**
 * Footer — four columns, same idea as the reference, every link real.
 *
 * Deliberately NOT copied from the reference are its Support and Legal
 * columns (Contact Us, Help Center, Shipping Info, Returns, Track Order,
 * Privacy Policy, Terms, Cookie Policy) and its contact block. All nine of
 * those routes return 404 in this build, and the phone number, support
 * address and street address were invented. Shipping columns to dead pages
 * would break the brand's "no dead controls" rule, so the fourth column
 * carries real catalogue entry points instead.
 */

interface Category {
  _id: string
  name: string
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch('https://ecommerce.routemisr.com/api/v1/categories', {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Category[] }
    return (json.data ?? []).slice(0, 6)
  } catch {
    return []
  }
}

const SHOP = [
  { label: 'All products', href: '/products' },
  { label: 'Departments', href: '/categories' },
  { label: 'Brands', href: '/brand' },
  { label: 'Search', href: '/search' },
]

const ACCOUNT = [
  { label: 'My account', href: '/profile' },
  { label: 'Order history', href: '/orders' },
  { label: 'Saved items', href: '/wishlist' },
  { label: 'Shopping cart', href: '/cart' },
  { label: 'Sign in', href: '/login' },
  { label: 'Create account', href: '/register' },
]

const MANAGE = [
  { label: 'Profile & password', href: '/profile/settings' },
  { label: 'Addresses', href: '/profile/addresses' },
  { label: 'Compare items', href: '/compare' },
  { label: 'Checkout', href: '/checkout' },
]

/** Underline grows from the left on hover — the same gesture as Arrow Travel. */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative inline-block py-1.5 text-[14.5px] text-ink-muted transition-colors duration-[280ms] ease-[var(--ease-hover)] hover:text-gold"
    >
      {label}
      <span
        aria-hidden="true"
        className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-[280ms] ease-[var(--ease-hover)] group-hover:scale-x-100"
      />
    </Link>
  )
}

function Column({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  const id = `footer-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="label relative inline-block pb-2 text-ink">
        {title}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-7 rounded-full bg-gold"
        />
      </h2>
      <ul className="mt-5 flex flex-col gap-0.5">
        {links.map((l) => (
          <li key={l.href}>
            <FooterLink {...l} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default async function Footer() {
  const categories = await getCategories()

  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 pb-10">
        <div className="bento p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-4">
              <Link href="/" className="group inline-flex items-center gap-3" aria-label="Cartiva">
                <span className="transition-transform duration-[280ms] ease-[var(--ease-hover)] group-hover:rotate-[-8deg]">
                  <CartivaMark size={34} />
                </span>
                <span className="font-display-lg text-[24px]">Cartiva</span>
              </Link>

              <p className="mt-5 max-w-[38ch] text-[14.5px] font-light leading-relaxed text-ink-muted">
                Electronics, fashion, beauty, home, books and mobiles. One
                marketplace, tracked end to end from Cairo.
              </p>

              {categories.length > 0 && (
                <>
                  <h2 className="label mt-8 text-ink-muted">Popular departments</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <li key={c._id}>
                        <Link
                          href={`/categories/${c._id}`}
                          className="inline-block rounded-full border border-line px-3.5 py-2 text-[12.5px] text-ink-muted transition-colors duration-[280ms] ease-[var(--ease-hover)] hover:border-gold hover:text-gold"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="lg:col-span-2 lg:col-start-6">
              <Column title="Shop" links={SHOP} />
            </div>
            <div className="lg:col-span-3">
              <Column title="Account" links={ACCOUNT} />
            </div>
            <div className="lg:col-span-2">
              <Column title="Manage" links={MANAGE} />
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-line-soft pt-7">
            <p className="text-[12.5px] font-light text-ink-muted">
              © {new Date().getFullYear()} Cartiva
            </p>
            <p className="text-[12.5px] font-light text-ink-muted">
              A portfolio build on a public demo catalogue. No real orders are
              fulfilled.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
