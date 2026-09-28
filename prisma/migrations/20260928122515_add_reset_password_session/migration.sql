-- CreateTable
CREATE TABLE "ResetPasswordSession" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetPasswordSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResetPasswordSession_email_idx" ON "ResetPasswordSession"("email");
