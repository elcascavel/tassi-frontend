import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const res = await fetch(`${process.env.API_URL}/users/auth/${(await params).id}?code=${process.env.FUNCTION_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const text = await res.text()

    const json = JSON.parse(text)

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status })
    }

    return NextResponse.json(json)
  } catch (error) {
    console.error('Proxy error (POST):', error)
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
