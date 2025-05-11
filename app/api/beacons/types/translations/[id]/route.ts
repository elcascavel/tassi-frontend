import { NextRequest, NextResponse } from 'next/server';
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await fetch(
    `${process.env.API_URL}/beacons/types/${(await params).id}/translations?code=${process.env.FUNCTION_KEY}`,
    { method: 'GET' }
  );
  const txt = await res.text();
  return NextResponse.json(txt ? JSON.parse(txt) : null, {
    status: res.status,
  });
}
