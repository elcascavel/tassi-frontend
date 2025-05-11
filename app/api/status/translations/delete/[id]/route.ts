import { NextRequest, NextResponse } from 'next/server';
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await fetch(
    `${process.env.API_URL}/status/translations/delete/${(await params).id}?code=${process.env.FUNCTION_KEY}`,
    { method: 'DELETE' }
  );
  const txt = await res.text();
  return NextResponse.json(txt ? JSON.parse(txt) : null, {
    status: res.status,
  });
}
