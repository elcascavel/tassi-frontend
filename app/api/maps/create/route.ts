import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const backendForm = new FormData();
    for (const [key, value] of formData.entries()) {
      backendForm.append(key, value);
    }

    const res = await fetch(
      `${process.env.API_URL}/maps/create?code=${process.env.FUNCTION_KEY}`,
      {
        method: "POST",
        body: backendForm,
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
    console.error("Error in maps/create route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
