import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(
      `${process.env.API_URL}/maps/points/delete/${id}?code=${process.env.FUNCTION_KEY}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Error in maps/points/delete route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
