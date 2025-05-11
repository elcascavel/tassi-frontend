import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const url = `${process.env.API_URL}/users/create?code=${process.env.FUNCTION_KEY}`;

    const body = await req.json();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();

    const contentType = res.headers.get('content-type') ?? '';

    if (!rawText.trim()) {
      return NextResponse.json(
        { message: 'Empty response from backend' },
        { status: 502 }
      );
    }

    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(rawText);
        return NextResponse.json(json, { status: res.status });
      } catch {
        return NextResponse.json(
          { message: 'Invalid JSON from backend', raw: rawText },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Non-JSON response', raw: rawText },
      { status: res.status }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        message: 'Proxy internal error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
