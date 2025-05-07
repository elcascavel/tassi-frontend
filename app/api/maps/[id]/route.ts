import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const res = await fetch(
      `${process.env.API_URL}/maps/${(await params).id}?code=${process.env.FUNCTION_KEY}`,
      {
        method: "GET",
      }
    )

    const text = await res.text()
    const json = text ? JSON.parse(text) : null

    return NextResponse.json(json, { status: res.status })
  } catch (err) {
    console.error("Error fetching map by ID:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
