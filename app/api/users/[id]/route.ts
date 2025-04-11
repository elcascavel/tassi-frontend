import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const res = await fetch(
      `${process.env.API_URL}/users/delete/${id}?code=${process.env.FUNCTION_KEY}`,
      {
        method: "DELETE",
      }
    )

    const text = await res.text()

    if (!res.ok) {
      throw new Error(text || `Failed to delete user with id ${id}`)
    }

    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch (error) {
    console.error("Proxy delete error:", error)
    return NextResponse.json(
      {
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
