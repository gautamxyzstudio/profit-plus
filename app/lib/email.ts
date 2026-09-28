import path from "path";
import fs from "fs";

type DemoEmailData = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
};

type ForgotPasswordOtpData = {
  name: string;
  email: string;
  otp: string;
};

type ContactEmailData = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  referralCode?: string | null;
  message: string;
};

let cachedLogoBase64: string | null = null;

function getLogoBase64(): string {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      cachedLogoBase64 = fs.readFileSync(logoPath).toString("base64");
      return cachedLogoBase64;
    }
  } catch (err) {
    console.error("Failed to read logo.png for email attachment:", err);
  }
  return "";
}

async function sendBrevoEmail(
  subject: string,
  htmlContent: string,
  toEmail?: string,
  toName?: string,
) {
  const recipientEmail = toEmail || process.env.ADMIN_EMAIL!;
  const recipientName = toName || "Admin";

  const logoBase64 = getLogoBase64();
  const attachment = logoBase64
    ? [
        {
          name: "logo.png",
          content: logoBase64,
        },
      ]
    : undefined;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "ProfitPlus",
        email: process.env.BREVO_SENDER_EMAIL!,
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName,
        },
      ],
      subject,
      htmlContent,
      ...(attachment ? { attachment } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function sendDemoRequestEmail(data: DemoEmailData) {
  return sendBrevoEmail(
    `New Demo Request from ${data.name}`,
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      /* Keep the logo on the same light-green header; no white HTML box
         exists around the original logo, so dark mode cannot turn it black. */
      .pp-header {
        background-color: #dff3e6 !important;
        background-image: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%) !important;
      }

      .pp-title {
        color: #0d4f2b !important;
      }

      .pp-subtitle {
        color: #27613e !important;
      }

      .pp-outer {
        background-color: #111827 !important;
        background-image: none !important;
      }

      .pp-card {
        background-color: #111827 !important;
        border-color: #374151 !important;
      }

      .pp-body {
        background-color: #111827 !important;
      }

      .pp-label {
        color: #cbd5e1 !important;
        border-bottom-color: #374151 !important;
      }

      .pp-value {
        color: #f8fafc !important;
        border-bottom-color: #374151 !important;
      }

      .pp-value a {
        color: #4ade80 !important;
      }

      .pp-phone,
      .pp-phone a {
        color: #f8fafc !important;
      }

      .pp-message-label {
        color: #cbd5e1 !important;
      }

      .pp-message {
        background-color: #1f2937 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      .pp-footer {
        background-color: #0f172a !important;
        border-top-color: #374151 !important;
      }

      .pp-footer-text {
        color: #94a3b8 !important;
      }
    }

    /* Outlook dark-mode selectors */
    [data-ogsc] .pp-header {
      background-color: #dff3e6 !important;
      background-image: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%) !important;
    }

    [data-ogsc] .pp-title {
      color: #0d4f2b !important;
    }

    [data-ogsc] .pp-subtitle {
      color: #27613e !important;
    }

    [data-ogsc] .pp-outer {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-card,
    [data-ogsc] .pp-body {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-label {
      color: #cbd5e1 !important;
      border-bottom-color: #374151 !important;
    }

    [data-ogsc] .pp-value {
      color: #f8fafc !important;
      border-bottom-color: #374151 !important;
    }

    [data-ogsc] .pp-message {
      background-color: #1f2937 !important;
      border-color: #4b5563 !important;
      color: #e5e7eb !important;
    }

    [data-ogsc] .pp-footer {
      background-color: #0f172a !important;
      border-top-color: #374151 !important;
    }
  </style>
  <title>New Demo Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4faf6 !important; background: #f4faf6 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4faf6" class="email-outer pp-outer" style="background-color: #f4faf6 !important; background: #f4faf6 !important; padding: 35px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="email-card pp-card" style="max-width: 540px; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(5, 80, 39, 0.06);">
          
          <!-- Header with Brand Gradient & Compact Logo -->
          <tr>
            <td class="pp-header" bgcolor="#dff3e6" style="background-color: #dff3e6; background: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%); padding: 26px 20px; text-align: center;">
              
              <!-- Logo directly on gradient header -->
          <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 14px auto;">
            <tr>
              <td align="center" style="padding: 0; text-align: center;">
                <img
                  src="cid:logo.png"
                  alt="Profit Plus"
                  width="120"
                  style="display: block; width: 120px; max-width: 120px; height: auto; margin: 0 auto; border: 0;"
                />
              </td>
            </tr>
          </table>

              <h1 class="pp-title" style="color: #0d4f2b; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">
                New Demo Request
              </h1>
              <p class="pp-subtitle" style="color: #27613e; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">
                A prospective client has requested a platform walkthrough
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="email-body pp-body" style="padding: 26px 22px; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 0;">
                
                <!-- Name -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; width: 35%; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Requester Name
                  </td>
                  <td class="email-value email-row pp-value" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">
                    ${data.name}
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Email Address
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600;">
                    <a href="mailto:${data.email}" style="color: #199250; text-decoration: none;">
                      ${data.email}
                    </a>
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Phone Number
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; font-family: monospace; color: #0f172a;">
                    <a href="tel:${data.countryCode}${data.phone}" class="email-phone pp-phone" style="color: #0f172a; text-decoration: none;">
                      ${data.countryCode} ${data.phone}
                    </a>
                  </td>
                </tr>

                <!-- Requirements/Message Box -->
                <tr>
                  <td colspan="2" style="padding-top: 16px;">
                    <div class="pp-message-label" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Requirements / Notes
                    </div>
                    <div class="email-message pp-message" style="background-color: #f8fafc !important; background: #f8fafc !important; border: 1px solid #e2e8f0; border-left: 4px solid #199250; border-radius: 12px; padding: 14px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${data.message}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" class="email-footer pp-footer" style="background-color: #f8fafc !important; background: #f8fafc !important; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p class="email-footer-text pp-footer-text" style="margin: 0; font-size: 11px; color: #94a3b8;">
                Profit Plus Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  );
}

export async function sendContactUsEmail(data: ContactEmailData) {
  const referralRow = data.referralCode
    ? `
      <tr>
        <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
          Referral Code
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; font-family: monospace; color: #199250;">
          ${data.referralCode}
        </td>
      </tr>
    `
    : "";

  return sendBrevoEmail(
    `New Contact Inquiry from ${data.name}`,
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      /* Keep the logo on the same light-green header; no white HTML box
         exists around the original logo, so dark mode cannot turn it black. */
      .pp-header {
        background-color: #dff3e6 !important;
        background-image: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%) !important;
      }

      .pp-title {
        color: #0d4f2b !important;
      }

      .pp-subtitle {
        color: #27613e !important;
      }

      .pp-outer {
        background-color: #111827 !important;
        background-image: none !important;
      }

      .pp-card {
        background-color: #111827 !important;
        border-color: #374151 !important;
      }

      .pp-body {
        background-color: #111827 !important;
      }

      .pp-label {
        color: #cbd5e1 !important;
        border-bottom-color: #374151 !important;
      }

      .pp-value {
        color: #f8fafc !important;
        border-bottom-color: #374151 !important;
      }

      .pp-value a {
        color: #4ade80 !important;
      }

      .pp-phone,
      .pp-phone a {
        color: #f8fafc !important;
      }

      .pp-message-label {
        color: #cbd5e1 !important;
      }

      .pp-message {
        background-color: #1f2937 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      .pp-footer {
        background-color: #0f172a !important;
        border-top-color: #374151 !important;
      }

      .pp-footer-text {
        color: #94a3b8 !important;
      }
    }

    /* Outlook dark-mode selectors */
    [data-ogsc] .pp-header {
      background-color: #dff3e6 !important;
      background-image: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%) !important;
    }

    [data-ogsc] .pp-title {
      color: #0d4f2b !important;
    }

    [data-ogsc] .pp-subtitle {
      color: #27613e !important;
    }

    [data-ogsc] .pp-outer {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-card,
    [data-ogsc] .pp-body {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-label {
      color: #cbd5e1 !important;
      border-bottom-color: #374151 !important;
    }

    [data-ogsc] .pp-value {
      color: #f8fafc !important;
      border-bottom-color: #374151 !important;
    }

    [data-ogsc] .pp-message {
      background-color: #1f2937 !important;
      border-color: #4b5563 !important;
      color: #e5e7eb !important;
    }

    [data-ogsc] .pp-footer {
      background-color: #0f172a !important;
      border-top-color: #374151 !important;
    }
  </style>
  <title>New Contact Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4faf6 !important; background: #f4faf6 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4faf6" class="email-outer pp-outer" style="background-color: #f4faf6 !important; background: #f4faf6 !important; padding: 35px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="email-card pp-card" style="max-width: 540px; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(5, 80, 39, 0.06);">
          
          <!-- Header with Brand Gradient & Compact Logo -->
          <tr>
            <td class="pp-header" bgcolor="#dff3e6" style="background-color: #dff3e6; background: linear-gradient(135deg, #dff3e6 0%, #bfe8ce 100%); padding: 26px 20px; text-align: center;">
              
              <!-- Logo directly on gradient header -->
          <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 14px auto;">
            <tr>
              <td align="center" style="padding: 0; text-align: center;">
                <img
                  src="cid:logo.png"
                  alt="Profit Plus"
                  width="120"
                  style="display: block; width: 120px; max-width: 120px; height: auto; margin: 0 auto; border: 0;"
                />
              </td>
            </tr>
          </table>

              <h1 class="pp-title" style="color: #0d4f2b; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">
                New Contact Inquiry
              </h1>
              <p class="pp-subtitle" style="color: #27613e; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">
                A new inquiry was submitted via the Contact Us form
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="email-body pp-body" style="padding: 26px 22px; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 0;">
                
                <!-- Name -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; width: 35%; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Sender Name
                  </td>
                  <td class="email-value email-row pp-value" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">
                    ${data.name}
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Email Address
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600;">
                    <a href="mailto:${data.email}" style="color: #199250; text-decoration: none;">
                      ${data.email}
                    </a>
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td class="email-label email-row pp-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Phone Number
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; font-family: monospace; color: #0f172a;">
                    <a href="tel:${data.countryCode}${data.phone}" class="email-phone pp-phone" style="color: #0f172a; text-decoration: none;">
                      ${data.countryCode} ${data.phone}
                    </a>
                  </td>
                </tr>

                ${referralRow}

                <!-- Message Box -->
                <tr>
                  <td colspan="2" style="padding-top: 16px;">
                    <div class="pp-message-label" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Message Content
                    </div>
                    <div class="email-message pp-message" style="background-color: #f8fafc !important; background: #f8fafc !important; border: 1px solid #e2e8f0; border-left: 4px solid #199250; border-radius: 12px; padding: 14px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${data.message}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" class="email-footer pp-footer" style="background-color: #f8fafc !important; background: #f8fafc !important; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p class="email-footer-text pp-footer-text" style="margin: 0; font-size: 11px; color: #94a3b8;">
                Profit Plus Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  );
}


export async function sendForgotPasswordOtpEmail(
  data: ForgotPasswordOtpData,
) {
  return sendBrevoEmail(
    "Profit Plus - Password Reset OTP",
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <style>
    @media (prefers-color-scheme: dark) {
      .pp-header {
        background-color: #dff3e6 !important;
        background-image: linear-gradient(
          135deg,
          #dff3e6 0%,
          #bfe8ce 100%
        ) !important;
      }

      .pp-title {
        color: #0d4f2b !important;
      }

      .pp-subtitle {
        color: #27613e !important;
      }

      .pp-outer {
        background-color: #111827 !important;
        background-image: none !important;
      }

      .pp-card,
      .pp-body {
        background-color: #111827 !important;
      }

      .pp-text {
        color: #e5e7eb !important;
      }

      .pp-otp-box {
        background-color: #1f2937 !important;
        border-color: #374151 !important;
      }

      .pp-otp {
        color: #4ade80 !important;
      }

      .pp-footer {
        background-color: #0f172a !important;
        border-top-color: #374151 !important;
      }

      .pp-footer-text {
        color: #94a3b8 !important;
      }
    }

    [data-ogsc] .pp-header {
      background-color: #dff3e6 !important;
      background-image: linear-gradient(
        135deg,
        #dff3e6 0%,
        #bfe8ce 100%
      ) !important;
    }

    [data-ogsc] .pp-title {
      color: #0d4f2b !important;
    }

    [data-ogsc] .pp-subtitle {
      color: #27613e !important;
    }

    [data-ogsc] .pp-outer {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-card,
    [data-ogsc] .pp-body {
      background-color: #111827 !important;
    }

    [data-ogsc] .pp-text {
      color: #e5e7eb !important;
    }

    [data-ogsc] .pp-otp-box {
      background-color: #1f2937 !important;
      border-color: #374151 !important;
    }

    [data-ogsc] .pp-otp {
      color: #4ade80 !important;
    }

    [data-ogsc] .pp-footer {
      background-color: #0f172a !important;
      border-top-color: #374151 !important;
    }
  </style>

  <title>Password Reset OTP</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f4faf6 !important;
    background:#f4faf6 !important;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
    color:#1e293b;
  "
>
  <table
    width="100%"
    border="0"
    cellspacing="0"
    cellpadding="0"
    bgcolor="#f4faf6"
    class="email-outer pp-outer"
    style="
      background-color:#f4faf6 !important;
      background:#f4faf6 !important;
      padding:35px 15px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          bgcolor="#ffffff"
          class="email-card pp-card"
          style="
            max-width:540px;
            border-radius:20px;
            overflow:hidden;
            border:1px solid #e2e8f0;
            box-shadow:0 10px 25px -5px rgba(5,80,39,0.06);
          "
        >

          <!-- Header -->
          <tr>
            <td
              class="pp-header"
              bgcolor="#dff3e6"
              style="
                background-color:#dff3e6;
                background:linear-gradient(
                  135deg,
                  #dff3e6 0%,
                  #bfe8ce 100%
                );
                padding:26px 20px;
                text-align:center;
              "
            >

              <!-- Logo -->
              <table
                border="0"
                cellspacing="0"
                cellpadding="0"
                align="center"
                style="margin:0 auto 14px auto;"
              >
                <tr>
                  <td
                    align="center"
                    style="padding:0;text-align:center;"
                  >
                    <img
                      src="cid:logo.png"
                      alt="Profit Plus"
                      width="120"
                      style="
                        display:block;
                        width:120px;
                        max-width:120px;
                        height:auto;
                        margin:0 auto;
                        border:0;
                      "
                    />
                  </td>
                </tr>
              </table>

              <h1
                class="pp-title"
                style="
                  color:#0d4f2b;
                  margin:0;
                  font-size:19px;
                  font-weight:800;
                  letter-spacing:-0.3px;
                "
              >
                Password Reset Request
              </h1>

              <p
                class="pp-subtitle"
                style="
                  color:#27613e;
                  margin:4px 0 0 0;
                  font-size:12px;
                  font-weight:500;
                "
              >
                Use the OTP below to reset your Profit Plus password
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td
              class="pp-body"
              style="
                padding:30px 22px;
                background-color:#ffffff;
              "
            >

              <p
                class="pp-text"
                style="
                  margin:0 0 12px 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#334155;
                "
              >
                Hello <strong>${data.name}</strong>,
              </p>

              <p
                class="pp-text"
                style="
                  margin:0 0 22px 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#334155;
                "
              >
                We received a request to reset your Profit Plus
                account password. Use the verification code below
                to continue.
              </p>

              <!-- OTP -->
              <div
                class="pp-otp-box"
                style="
                  background-color:#f0faf4;
                  border:1px solid #ccebd8;
                  border-radius:14px;
                  padding:22px 15px;
                  text-align:center;
                  margin:10px 0 24px 0;
                "
              >
                <p
                  style="
                    margin:0 0 8px 0;
                    font-size:11px;
                    font-weight:700;
                    color:#64748b;
                    text-transform:uppercase;
                    letter-spacing:1px;
                  "
                >
                  Verification Code
                </p>

                <div
                  class="pp-otp"
                  style="
                    color:#199250;
                    font-size:32px;
                    font-weight:800;
                    letter-spacing:8px;
                    line-height:1.2;
                  "
                >
                  ${data.otp}
                </div>
              </div>

              <p
                class="pp-text"
                style="
                  margin:0;
                  font-size:13px;
                  line-height:1.6;
                  color:#64748b;
                  text-align:center;
                "
              >
                This OTP is valid for
                <strong>5 minutes</strong>.
              </p>

              <p
                class="pp-text"
                style="
                  margin:22px 0 0 0;
                  font-size:12px;
                  line-height:1.6;
                  color:#94a3b8;
                  text-align:center;
                "
              >
                If you did not request a password reset,
                please ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              bgcolor="#f8fafc"
              class="pp-footer"
              style="
                background-color:#f8fafc !important;
                background:#f8fafc !important;
                padding:14px 20px;
                text-align:center;
                border-top:1px solid #e2e8f0;
              "
            >
              <p
                class="pp-footer-text"
                style="
                  margin:0;
                  font-size:11px;
                  color:#94a3b8;
                "
              >
                    Profit Plus Password Security
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
        `,
        data.email,
        data.name || "Admin",
      );
    }