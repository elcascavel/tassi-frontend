/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_URL}/beacons?code=${process.env.FUNCTION_KEY}`)
    const text = await res.text()
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()

    const res = await fetch(`${process.env.API_URL}/beacons/create?code=${process.env.FUNCTION_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    const text = await res.text()

    let parsed: any
    try {
      parsed = JSON.parse(text)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error("Failed to parse backend response:", text)
      return new NextResponse("Invalid backend response", { status: 502 })
    }

    if (!res.ok) {
      return NextResponse.json(parsed, { status: res.status })
    }

    return NextResponse.json({ data: { beacon: parsed.data } }, { status: res.status })
  } catch (error) {
    console.error('Proxy error (POST):', error)
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
