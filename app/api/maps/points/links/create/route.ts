import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    const res = await fetch(`${process.env.API_URL}/maps/points/links/create?code=${process.env.FUNCTION_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })

    const text = await res.text()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any
    try {
      parsed = text ? JSON.parse(text) : {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error("Invalid JSON from backend:", text)
      return new NextResponse("Invalid backend response", { status: 502 })
    }

    if (!res.ok) {
      return NextResponse.json(parsed, { status: res.status })
    }

    return NextResponse.json({ data: { pointLink: parsed.data } }, { status: res.status })
  } catch (err) {
    console.error("Error in point link creation route:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
