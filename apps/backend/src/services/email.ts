import { Resend } from "resend"
import { LANDING_BASE_URL, WHATSAPP_SUPPORT_URL } from "../config.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = "Insta Checkout <noreply@instacheckouteg.com>"

// ─── Shared email layout ────────────────────────────────────────────

interface EmailLayoutOptions {
  locale: "en" | "ar"
  body: string
}

function emailLayout({ locale, body }: EmailLayoutOptions): string {
  const dir = locale === "ar" ? "rtl" : "ltr"
  const lang = locale === "ar" ? "ar" : "en"
  const fontFamily =
    locale === "ar"
      ? "'Cairo', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      : "'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#FAFAFA;font-family:${fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#2D0A4E;padding:24px 40px;text-align:center;">
              <img src="https://instacheckouteg.com/logo/logo-white.svg" alt="Insta Checkout" width="160" style="display:inline-block;height:auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;direction:${dir};">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F3EEFA;padding:20px 40px;text-align:center;border-top:1px solid #E4D8F0;">
              <p style="margin:0 0 4px;color:#6B5B7B;font-size:12px;">&copy; ${year} Insta Checkout</p>
              <a href="${WHATSAPP_SUPPORT_URL}" style="color:#6B5B7B;font-size:12px;text-decoration:underline;">
                ${locale === "ar" ? "تواصل معانا على واتساب" : "Contact us on WhatsApp"}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function heroIcon(emoji: string, bgColor: string): string {
  return `<div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background-color:${bgColor};font-size:32px;text-align:center;">${emoji}</div>
  </div>`
}

function ctaButton(text: string, href: string, style: "primary" | "outlined" = "primary"): string {
  const baseStyle = "display:block;width:100%;max-width:320px;margin:0 auto;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px;text-align:center;box-sizing:border-box;"
  if (style === "outlined") {
    return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 32px;">
      <a href="${href}" style="${baseStyle}background-color:#FFFFFF;color:#7C3AED;border:2px solid #7C3AED;">${text}</a>
    </td></tr></table>`
  }
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 32px;">
    <a href="${href}" style="${baseStyle}background-color:#7C3AED;color:#ffffff;">${text}</a>
  </td></tr></table>`
}

function detailCard(rows: Array<{ label: string; value: string; color?: string; mono?: boolean }>): string {
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:6px 0;color:#6B5B7B;font-size:13px;">${r.label}</td>
          <td style="padding:6px 0;color:${r.color ?? "#1E0A3C"};font-size:${r.mono ? "18px" : "14px"};font-weight:${r.mono ? "700" : "600"};text-align:${r.mono ? "right" : "left"};${r.mono ? "font-family:'JetBrains Mono',monospace;" : ""}">${r.value}</td>
        </tr>`
    )
    .join("")
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA;border:1px solid #E4D8F0;border-radius:8px;padding:12px 16px;margin-bottom:24px;">${rowsHtml}</table>`
}

// ─── 1. Seller Approved ─────────────────────────────────────────────

export async function sendSellerApprovedEmail(
  to: string,
  locale: "en" | "ar"
): Promise<void> {
  const dashboardUrl = `${LANDING_BASE_URL}/dashboard`

  const content =
    locale === "ar"
      ? {
          subject: "حسابك جاهز!",
          headline: "حسابك جاهز! \u{1F389}",
          body: "تم تفعيل حسابك على Insta Checkout. تقدر دلوقتي تعمل لينكات دفع وتبدأ تقبض من عملاءك.",
          cta: "افتح لوحة التحكم",
        }
      : {
          subject: "Your account is approved",
          headline: "Your account is approved.",
          body: "Your Insta Checkout account is now active. You can create payment links and start getting paid.",
          cta: "Open your dashboard",
        }

  const html = emailLayout({
    locale,
    body: `
      ${heroIcon("\u2705", "#EDE9FE")}
      <h2 style="margin:0 0 16px;color:#1E0A3C;font-size:24px;font-weight:700;text-align:center;">${content.headline}</h2>
      <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;text-align:center;">${content.body}</p>
      ${ctaButton(content.cta, dashboardUrl)}
    `,
  })

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject: content.subject, html })
  if (error) {
    console.error("[Email] Failed to send seller-approved email:", error)
    throw new Error(`Failed to send seller-approved email: ${error.message}`)
  }
  console.log(`[Email] Seller approved email sent to ${to}`)
}

// ─── 2. Seller Rejected ─────────────────────────────────────────────

export async function sendSellerRejectedEmail(
  to: string,
  locale: "en" | "ar",
  approvalNote: string | null
): Promise<void> {
  const content =
    locale === "ar"
      ? {
          subject: "للأسف، طلبك لم يُقبل",
          headline: "للأسف، طلبك لم يُقبل",
          body: "راجعنا بياناتك ومقدرناش نوافق على حسابك في الوقت الحالي.",
          noteLabel: "ملاحظة الفريق:",
          footer: "لو عندك أي استفسار أو عايز تعرف أكتر، كلمنا وهنساعدك.",
          cta: "تواصل معانا على واتساب",
        }
      : {
          subject: "Your application wasn't approved",
          headline: "Your application wasn't approved.",
          body: "We reviewed your information and weren't able to approve your account at this time.",
          noteLabel: "Team note:",
          footer: "If you have questions or want to know more, get in touch and we'll help.",
          cta: "Contact us on WhatsApp",
        }

  const noteHtml = approvalNote
    ? `<div style="background-color:#F3EEFA;border:1px solid #E4D8F0;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0 0 4px;color:#6B5B7B;font-size:13px;font-weight:600;">${content.noteLabel}</p>
        <p style="margin:0;color:#1E0A3C;font-size:14px;line-height:1.5;">${approvalNote}</p>
      </div>`
    : ""

  const html = emailLayout({
    locale,
    body: `
      ${heroIcon("\u2139\uFE0F", "#EDE9FE")}
      <h2 style="margin:0 0 16px;color:#1E0A3C;font-size:24px;font-weight:700;text-align:center;">${content.headline}</h2>
      <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;text-align:center;">${content.body}</p>
      ${noteHtml}
      <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;text-align:center;">${content.footer}</p>
      ${ctaButton(content.cta, WHATSAPP_SUPPORT_URL, "outlined")}
    `,
  })

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject: content.subject, html })
  if (error) {
    console.error("[Email] Failed to send seller-rejected email:", error)
    throw new Error(`Failed to send seller-rejected email: ${error.message}`)
  }
  console.log(`[Email] Seller rejected email sent to ${to}`)
}

// ─── 3. Payment Received (notify seller) ────────────────────────────

interface PaymentReceivedData {
  productName: string
  amount: number
  buyerPhone: string
  paymentLinkId: string
}

export async function sendPaymentReceivedEmail(
  to: string,
  locale: "en" | "ar",
  data: PaymentReceivedData
): Promise<void> {
  const dashboardUrl = `${LANDING_BASE_URL}/dashboard/links`

  const amountStr =
    locale === "ar"
      ? `${data.amount} \u062C.\u0645`
      : `${data.amount} EGP`

  const content =
    locale === "ar"
      ? {
          subject: `فيه دفعة جديدة مستنياك — ${data.productName}`,
          headline: "فيه دفعة جديدة مستنياك",
          cta: "راجع الدفعة",
          productLabel: "المنتج",
          amountLabel: "المبلغ",
          buyerLabel: "رقم المشتري",
        }
      : {
          subject: `New payment to review — ${data.productName}`,
          headline: "You have a new payment to review.",
          cta: "Review payment",
          productLabel: "Product",
          amountLabel: "Amount",
          buyerLabel: "Buyer phone",
        }

  const html = emailLayout({
    locale,
    body: `
      ${heroIcon("\uD83D\uDD14", "#EDE9FE")}
      <h2 style="margin:0 0 24px;color:#1E0A3C;font-size:24px;font-weight:700;text-align:center;">${content.headline}</h2>
      ${detailCard([
        { label: content.productLabel, value: data.productName },
        { label: content.amountLabel, value: amountStr, color: "#7C3AED", mono: true },
        { label: content.buyerLabel, value: data.buyerPhone },
      ])}
      ${ctaButton(content.cta, dashboardUrl)}
    `,
  })

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject: content.subject, html })
  if (error) {
    console.error("[Email] Failed to send payment-received email:", error)
    throw new Error(`Failed to send payment-received email: ${error.message}`)
  }
  console.log(`[Email] Payment received email sent to ${to}`)
}

// ─── 4. Payment Confirmed (notify buyer) ────────────────────────────

interface PaymentConfirmedData {
  businessName: string
  productName: string
  amount: number
}

export async function sendPaymentConfirmedEmail(
  to: string,
  locale: "en" | "ar",
  data: PaymentConfirmedData
): Promise<void> {
  const amountStr =
    locale === "ar"
      ? `${data.amount} \u062C.\u0645`
      : `${data.amount} EGP`

  const content =
    locale === "ar"
      ? {
          subject: "تم تأكيد الدفعة بتاعتك",
          headline: "تم تأكيد الدفعة بتاعتك",
          body: "البائع أكّد استلام الدفعة بتاعتك. التأكيد ده من البائع مش من Insta Checkout. لو عندك أي سؤال، تواصل مع البائع مباشرة.",
          businessLabel: "البائع",
          productLabel: "المنتج",
          amountLabel: "المبلغ",
        }
      : {
          subject: "Your payment has been confirmed",
          headline: "Your payment has been confirmed.",
          body: "The seller has confirmed your payment. This confirmation is from the seller, not from Insta Checkout. If you have questions, contact the seller directly.",
          businessLabel: "Seller",
          productLabel: "Product",
          amountLabel: "Amount paid",
        }

  const html = emailLayout({
    locale,
    body: `
      ${heroIcon("\u2705", "#ECFDF5")}
      <h2 style="margin:0 0 24px;color:#1E0A3C;font-size:24px;font-weight:700;text-align:center;">${content.headline}</h2>
      ${detailCard([
        { label: content.businessLabel, value: data.businessName },
        { label: content.productLabel, value: data.productName },
        { label: content.amountLabel, value: amountStr, color: "#10B981", mono: true },
      ])}
      <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;text-align:center;">${content.body}</p>
    `,
  })

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject: content.subject, html })
  if (error) {
    console.error("[Email] Failed to send payment-confirmed email:", error)
    throw new Error(`Failed to send payment-confirmed email: ${error.message}`)
  }
  console.log(`[Email] Payment confirmed email sent to ${to}`)
}

// ─── 5. Team Invitation ─────────────────────────────────────────────

export async function sendInvitationEmail(
  to: string,
  inviteUrl: string,
  businessName: string,
  roleLabel: string
): Promise<void> {
  // Invitation emails are always in English since the invitee may not have a locale yet
  const html = emailLayout({
    locale: "en",
    body: `
      ${heroIcon("\uD83D\uDC65", "#EDE9FE")}
      <h2 style="margin:0 0 16px;color:#1E0A3C;font-size:24px;font-weight:700;text-align:center;">${businessName} invited you to join their team.</h2>
      ${detailCard([
        { label: "Business", value: businessName },
        { label: "Role", value: roleLabel },
        { label: "Expires", value: "Valid for 7 days" },
      ])}
      <p style="margin:0 0 24px;color:#6B5B7B;font-size:15px;line-height:1.6;text-align:center;">
        Accept the invitation to start working on ${businessName}'s account.
      </p>
      ${ctaButton("Join the team", inviteUrl)}
      <p style="margin:0;color:#A89BBF;font-size:12px;line-height:1.5;text-align:center;">
        If you weren't expecting this invitation, you can ignore this email.
      </p>
    `,
  })

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You've been invited to join ${businessName} on Insta Checkout`,
    html,
  })

  if (error) {
    console.error("[Email] Failed to send invitation email:", error)
    throw new Error(`Failed to send invitation email: ${error.message}`)
  }

  console.log(`[Email] Invitation sent to ${to}`)
}
