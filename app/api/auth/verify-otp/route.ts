import { prisma } from "@/app/lib/prisma";
import { isValidEmail } from "@/app/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Please provide a valid email address",
        },
        { status: 400 },
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        {
          message: "Please provide a valid 6-digit OTP code",
        },
        { status: 400 },
      );
    }

    const session = await prisma.resetPasswordSession.findFirst({
      where: {
        email,
        otp,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          message: "Invalid verification code",
        },
        { status: 400 },
      );
    }

    if (new Date() > new Date(session.expiresAt)) {
      return NextResponse.json(
        {
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // Mark session as verified
    await prisma.resetPasswordSession.update({
      where: {
        id: session.id,
      },
      data: {
        verified: true,
      },
    });

    return NextResponse.json(
      {
        message: "OTP verified successfully",
        sessionId: session.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      {
        message: "Failed to verify OTP code",
      },
      { status: 500 },
    );
  }
}
