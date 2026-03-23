import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { jwtDecode } from 'jwt-decode'

const AUTH_API = 'https://ecommerce.routemisr.com/api/v1/auth/signin'

type JwtClaims = {
  sub?: string
  id?: string
  _id?: string
  name?: string
  email?: string
  firstName?: string
  lastName?: string
}

function decodeClaims(token?: string): JwtClaims | null {
  if (!token) return null
  try {
    return jwtDecode<JwtClaims>(token)
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const res = await fetch(AUTH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        if (!res.ok) return null

        const data = await res.json()
        const token =
          data?.token ??
          data?.accessToken ??
          data?.data?.token ??
          data?.data?.accessToken
        const decoded = decodeClaims(token)
        const user = data?.user ?? data?.data?.user ?? data?.data ?? decoded ?? {}

        if (!token && !user?._id && !user?.id) return null

        return {
          id: user?._id ?? user?.id ?? decoded?._id ?? decoded?.id ?? decoded?.sub ?? credentials.email,
          name:
            user?.name ??
            user?.firstName ??
            user?.lastName ??
            decoded?.name ??
            decoded?.firstName ??
            decoded?.lastName ??
            'User',
          email: user?.email ?? decoded?.email ?? credentials.email,
          accessToken: token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken
        token.user = {
          id: (user as { id?: string }).id,
          name: (user as { name?: string }).name,
          email: (user as { email?: string }).email,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        ;(session as { accessToken?: string }).accessToken = token.accessToken as string
      }
      if (token?.user) {
        session.user = token.user as { id?: string; name?: string; email?: string }
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: 'freshcart-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
