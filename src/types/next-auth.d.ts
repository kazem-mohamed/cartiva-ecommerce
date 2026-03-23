import 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id?: string
      name?: string
      email?: string
    }
  }

  interface User {
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    user?: {
      id?: string
      name?: string
      email?: string
    }
  }
}
