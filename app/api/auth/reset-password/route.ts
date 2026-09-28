import { prisma } from "@/app/lib/prisma";
import { isValidEmail } from "@/app/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

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
          message: "Please provide the 6-digit OTP",
        },
        { status: 400 },
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          message: "New password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // Verify session exists, is verified and not expired (allow 15 mins window for reset)
    const session = await prisma.resetPasswordSession.findFirst({
      where: {
        email,
        otp,
        verified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          message: "Invalid or unverified reset session. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    // Session max validity from creation: 15 minutes
    const sessionAgeMs = Date.now() - new Date(session.createdAt).getTime();
    if (sessionAgeMs > 15 * 60 * 1000) {
      await prisma.resetPasswordSession.deleteMany({
        where: {
          email,
        },
      });
      return NextResponse.json(
        {
          message: "Reset session has expired. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User account not found",
        },
        { status: 404 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password by ID
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete all reset sessions for this email
    await prisma.resetPasswordSession.deleteMany({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json(
      {
        message: "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        message: "Failed to reset password. Please try again.",
      },
      { status: 500 },
    );
  }
}
