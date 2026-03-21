import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = "Insta Checkout <noreply@instacheckouteg.com>"

export async function sendInvitationEmail(
  to: string,
  inviteUrl: string,
  businessName: string,
  roleLabel: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You've been invited to join ${businessName} on Insta Checkout`,
    html: buildInvitationHtml(inviteUrl, businessName, roleLabel),
  })

  if (error) {
    console.error("[Email] Failed to send invitation email:", error)
    throw new Error(`Failed to send invitation email: ${error.message}`)
  }

  console.log(`[Email] Invitation sent to ${to}`)
}

function buildInvitationHtml(
  inviteUrl: string,
  businessName: string,
  roleLabel: string
): string {
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f0fa;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#7C3AED;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Insta Checkout</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1E0A3C;font-size:20px;font-weight:600;">You're invited!</h2>
              <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;">
                <strong style="color:#1E0A3C;">${businessName}</strong> has invited you to join their team as
                <strong style="color:#7C3AED;">${roleLabel}</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${inviteUrl}"
                       style="display:inline-block;background-color:#7C3AED;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#6B5B7B;font-size:13px;line-height:1.5;">
                This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
              <p style="margin:0;color:#A89BBF;font-size:12px;line-height:1.5;word-break:break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f7fc;padding:20px 40px;text-align:center;border-top:1px solid #E4D8F0;">
              <p style="margin:0;color:#A89BBF;font-size:12px;">&copy; ${new Date().getFullYear()} Insta Checkout</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
