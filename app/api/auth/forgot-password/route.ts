import { prisma } from "@/app/lib/prisma";
import { isValidEmail } from "@/app/lib/validation";
import { sendForgotPasswordOtpEmail } from "@/app/lib/email";
import { NextRequest, NextResponse } from "next/server";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Invalid email address",
        },
        { status: 400 },
      );
    }

    console.log(`[Forgot Password] Processing request for email: "${email}"`);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      console.warn(`[Forgot Password] No user found in database matching email: "${email}"`);
      return NextResponse.json(
        {
          message: "User with this email does not exist",
        },
        { status: 404 },
      );
    }

    console.log(`[Forgot Password] Found user "${user.name}" (${user.email}). Generating OTP...`);

    /*
     * Remove any previous unused reset sessions
     * for this email.
     */
    await prisma.resetPasswordSession.deleteMany({
      where: {
        email: user.email.toLowerCase(),
        verified: false,
      },
    });

    const otp = generateOtp();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000,
    );

    await prisma.resetPasswordSession.create({
      data: {
        email: user.email.toLowerCase(),
        otp,
        expiresAt,
      },
    });

    try {
      console.log(`[Forgot Password] Sending OTP email to ${user.email}...`);
      await sendForgotPasswordOtpEmail({
        name: user.name,
        email: user.email,
        otp,
      });
      console.log(`[Forgot Password] OTP email successfully sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        "[Forgot Password] Failed to send OTP email via Brevo:",
        emailError,
      );

      /*
       * Remove the session if the email was not sent.
       */
      await prisma.resetPasswordSession.deleteMany({
        where: {
          email: user.email.toLowerCase(),
          otp,
        },
      });

      return NextResponse.json(
        {
          message: "Failed to send OTP email. Please check email configuration.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "OTP sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[Forgot Password] Server error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Failed to process forgot password request",
      },
      { status: 500 },
    );
  }
}