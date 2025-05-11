import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(
    `${process.env.API_URL}/maps/points/create?code=${process.env.FUNCTION_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  );

  const txt = await res.text();
  const parsed = txt ? JSON.parse(txt) : {};

  const point = parsed?.data;
  return NextResponse.json({ data: { point } }, { status: res.status });
}
