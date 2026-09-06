import Link from 'next/link'

type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading'

export default function AccountMenu({
  status,
  displayName,
  displayEmail,
  onSignOut,
}: {
  status: SessionStatus
  displayName: string
  displayEmail: string
  onSignOut: () => void
}) {
  if (status !== 'authenticated') {
    return (
      <Link
        className="hidden lg:inline-flex items-center justify-center rounded-full bg-vault text-white px-5 py-2 text-sm font-semibold hover:bg-vault transition-colors"
        href="/login"
      >
        Sign In
      </Link>
    )
  }

  return (
    <div className="hidden lg:block relative group">
      <button className="relative p-2.5 rounded-full hover:bg-sunk transition-colors group" title="Account">
        <svg
          data-prefix="far"
          data-icon="circle-user"
          className="svg-inline--fa fa-circle-user text-xl text-ink-muted group-hover:text-gold transition-colors"
          role="img"
          viewBox="0 0 512 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6-35.6-37.3-57.5-87.9-57.5-143.6 0-114.9 93.1-208 208-208s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"
          />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-line-soft rounded-[20px] shadow-[var(--shadow-lift)] transition-all duration-200 origin-top-right opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
        <div className="p-4 border-b border-line-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <svg
                data-prefix="far"
                data-icon="circle-user"
                className="svg-inline--fa fa-circle-user text-xl text-gold"
                role="img"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6-35.6-37.3-57.5-87.9-57.5-143.6 0-114.9 93.1-208 208-208s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
              <p className="text-xs text-ink-muted truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
        <div className="py-2">
          <Link
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:text-gold hover:bg-gold/5 transition-colors"
            href="/profile/addresses"
          >
            <svg
              data-prefix="far"
              data-icon="user"
              className="svg-inline--fa fa-user w-4 text-ink-muted"
              role="img"
              viewBox="0 0 448 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"
              />
            </svg>
            My Profile
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:text-gold hover:bg-gold/5 transition-colors"
            href="/orders"
          >
            <svg
              data-prefix="fas"
              data-icon="box-open"
              className="svg-inline--fa fa-box-open w-4 text-ink-muted"
              role="img"
              viewBox="0 0 640 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"
              />
            </svg>
            My Orders
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:text-gold hover:bg-gold/5 transition-colors"
            href="/wishlist"
          >
            <svg
              data-prefix="far"
              data-icon="heart"
              className="svg-inline--fa fa-heart w-4 text-ink-muted"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"
              />
            </svg>
            My Wishlist
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:text-gold hover:bg-gold/5 transition-colors"
            href="/profile/addresses"
          >
            <svg
              data-prefix="far"
              data-icon="address-book"
              className="svg-inline--fa fa-address-book w-4 text-ink-muted"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M384 48c8.8 0 16 7.2 16 16l0 384c0 8.8-7.2 16-16 16L96 464c-8.8 0-16-7.2-16-16L80 64c0-8.8 7.2-16 16-16l288 0zM96 0C60.7 0 32 28.7 32 64l0 384c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L96 0zM240 248a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm-32 40c-44.2 0-80 35.8-80 80 0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16 0-44.2-35.8-80-80-80l-64 0zM512 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64zM496 192c-8.8 0-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64c0-8.8-7.2-16-16-16zm16 144c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64z"
              />
            </svg>
            Addresses
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:text-gold hover:bg-gold/5 transition-colors"
            href="/profile/settings"
          >
            <svg
              data-prefix="fas"
              data-icon="gear"
              className="svg-inline--fa fa-gear w-4 text-ink-muted"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"
              />
            </svg>
            Settings
          </Link>
        </div>
        <div className="border-t border-line-soft py-2">
          <button
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors w-full text-left"
            type="button"
            onClick={onSignOut}
          >
            <svg
              data-prefix="fas"
              data-icon="right-from-bracket"
              className="svg-inline--fa fa-right-from-bracket w-4"
              role="img"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M505 273c9.4-9.4 9.4-24.6 0-33.9L361 95c-6.9-6.9-17.2-8.9-26.2-5.2S320 102.3 320 112l0 80-112 0c-26.5 0-48 21.5-48 48l0 32c0 26.5 21.5 48 48 48l112 0 0 80c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2L505 273zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
