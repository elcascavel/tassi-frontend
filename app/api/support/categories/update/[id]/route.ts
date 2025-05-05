import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id)
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    const body = await req.text();

    const res = await fetch(
      `${process.env.API_URL}/support/categories/update/${id}?code=${process.env.FUNCTION_KEY}`,
      {
        method: "PUT",
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
