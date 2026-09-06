import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'

async function withJsonResponse(res: Response) {
  const text = await res.text()
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status })
  } catch {
    return new NextResponse(text, { status: res.status })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const token = session?.accessToken

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(CART_API, {
    headers: {
      token,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const response = await withJsonResponse(res)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const token = session?.accessToken

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  const res = await fetch(CART_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const response = await withJsonResponse(res)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  const token = session?.accessToken

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(CART_API, {
    method: 'DELETE',
    headers: {
      token,
      Authorization: `Bearer ${token}`,
    },
  })

  const response = await withJsonResponse(res)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
