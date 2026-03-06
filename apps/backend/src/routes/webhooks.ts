import { Router, Request, Response } from "express"
import { validateOtp } from "../services/verification.js"

const router = Router()

function parseInboundWhatsApp(req: Request): { from: string; body: string } | null {
  const body = req.body as Record<string, unknown>

  if (body.From) {
    const from = (body.From as string).replace(/\D/g, "").replace(/^0/, "")
    const text = (body.Body as string) || ""
    return { from: from.startsWith("20") ? from : `20${from.slice(-10)}`, body: text.trim() }
  }

  const contact = body.contact as { wa_id?: string } | undefined
  const message = body.message as { text?: { body?: string } } | undefined
  if (contact?.wa_id) {
    const from = String(contact.wa_id)
    const text = (message?.text?.body as string) || ""
    return { from, body: text.trim() }
  }

  return null
}

router.post("/whatsapp", async (req: Request, res: Response) => {
  const parsed = parseInboundWhatsApp(req)
  if (!parsed) {
    console.log("[Webhook WhatsApp] Unrecognized payload:", JSON.stringify(req.body).slice(0, 200))
    res.status(200).send("OK")
    return
  }

  const { from, body } = parsed
  if (!body || body.length < 4) {
    res.status(200).send("OK")
    return
  }

  const result = await validateOtp(from, body)
  if (result.ok) {
    console.log(`[Webhook WhatsApp] Verified seller ${result.sellerId} from ${from}`)
  } else if (result.error === "INVALID_CODE" || result.error === "EXPIRED") {
    console.log(`[Webhook WhatsApp] Failed verification for ${from}: ${result.error}`)
  }

  res.status(200).send("OK")
})

export default router
