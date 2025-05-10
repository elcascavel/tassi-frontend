import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const res = await fetch(
      `${process.env.API_URL}/maps/points/${id}?code=${process.env.FUNCTION_KEY}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Error in maps/points route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
