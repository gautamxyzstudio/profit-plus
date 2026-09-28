import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/app/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);

    const result = await prisma.bookDemo.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(
      {
        message: "All unread demo requests are marked as read successfully",
        count: result.count,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }
    console.log("error while marking demo requests as read : ", error);
    return NextResponse.json(
      {
        message: "error while marking demo requests as read",
      },
      { status: 500 },
    );
  }
}
