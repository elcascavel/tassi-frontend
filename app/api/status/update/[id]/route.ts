import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  {params}: {params: {id: string}}
) {
  try {
    const {id} = params;
    const body = await req.json();

    const apiRes = await fetch(
      `${process.env.API_URL}/status/update/${id}?code=${process.env.FUNCTION_KEY}`,
      {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      }
    );

    const text = await apiRes.text();
    const json = JSON.parse(text);

    return NextResponse.json(json, {status: apiRes.status});
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {status: 500}
    );
  }
}
