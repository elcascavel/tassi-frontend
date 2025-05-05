import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id)
    return NextResponse.json({ error: "Missing status ID" }, { status: 400 });

  try {
    const res = await fetch(
      `${process.env.API_URL}/status/delete/${id}?code=${process.env.FUNCTION_KEY}`,
      { method: "DELETE" }
    );

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Proxy delete error", error: String(err) },
      { status: 500 }
    );
  }
}
