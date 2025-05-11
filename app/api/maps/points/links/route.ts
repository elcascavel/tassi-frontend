import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.API_URL}/maps/points/links?code=${process.env.FUNCTION_KEY}`
    );

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error('Error in maps/points/links GET route:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
