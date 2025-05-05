import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const res = await fetch(
      `${process.env.API_URL}/support/categories/create?code=${process.env.FUNCTION_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }
    );

    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : null;
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { message: "Proxy error", error: String(e) },
      { status: 500 }
    );
  }
}
