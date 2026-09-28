import { prisma } from "@/app/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { AuthError, requireAdmin } from "@/app/lib/auth";

type Routercontext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: Routercontext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "id is required",
        },
        { status: 400 },
      );
    }

    const demoRequest = await prisma.bookDemo.findUnique({
      where: {
        id,
      },
    });

    if (!demoRequest) {
      return NextResponse.json(
        {
          message: "demo request not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: demoRequest,
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

    console.log("error while fetching demo request : ", error);
    return NextResponse.json(
      {
        message: "error while fetching demo request",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: Routercontext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "id is required",
        },
        { status: 400 },
      );
    }

    const demoRequest = await prisma.bookDemo.findUnique({
      where: {
        id,
      },
    });

    if (!demoRequest) {
      return NextResponse.json(
        {
          message: "demo request not found",
        },
        { status: 404 },
      );
    }

    await prisma.bookDemo.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        message: "demo request deleted successfully",
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

    console.log("error while deleting demo request : ", error);
    return NextResponse.json(
      {
        message: "error while deleting demo request",
      },
      { status: 500 },
    );
  }
}

