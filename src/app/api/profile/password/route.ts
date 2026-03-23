import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const CHANGE_PASSWORD_API = 'https://ecommerce.routemisr.com/api/v1/users/changeMyPassword'

async function getAccessToken() {
  const session = await getServerSession(authOptions)
  return (session as { accessToken?: string } | null)?.accessToken ?? null
}

export async function PUT(request: Request) {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const res = await fetch(CHANGE_PASSWORD_API, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      token: accessToken,
      Authorization: `Bearer ${accessToken}`,
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
    },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? {}, {
      status: res.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const text = await res.text().catch(() => '')
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
