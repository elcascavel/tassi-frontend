import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_URL}/beacons/types?code=${process.env.FUNCTION_KEY}`)

    const text = await res.text()
    const json = JSON.parse(text)

    return NextResponse.json(json)
  } catch (error) {
    console.error("Error fetching beacon types:", error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
