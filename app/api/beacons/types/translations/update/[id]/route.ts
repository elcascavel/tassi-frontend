import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.text();
  const res = await fetch(
    `${process.env.API_URL}/beacons/types/translations/update/${(await params).id}?code=${process.env.FUNCTION_KEY}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body }
  );
  const txt = await res.text();
  return NextResponse.json(txt ? JSON.parse(txt) : null, {
    status: res.status,
  });
}
