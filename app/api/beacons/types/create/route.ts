import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(
    `${process.env.API_URL}/beacons/types/create?code=${process.env.FUNCTION_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
  );
  const txt = await res.text();
  return NextResponse.json(txt ? JSON.parse(txt) : null, {
    status: res.status,
  });
}
