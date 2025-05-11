import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.API_URL}/status?code=${process.env.FUNCTION_KEY}`
    );

    const text = await res.text();

    const json = JSON.parse(text);

    return NextResponse.json(json);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
