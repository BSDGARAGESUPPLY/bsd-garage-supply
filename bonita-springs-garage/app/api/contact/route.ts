import { NextResponse } from "next/server";

/**
 * Contact / estimate-request endpoint.
 *
 * This is a working stub: it validates input and returns success so the UI is
 * fully functional out of the box. To actually deliver leads, wire one of the
 * TODOs below (email via Resend/Nodemailer, a CRM webhook, or a database).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name and phone are required." },
      { status: 422 }
    );
  }

  // Basic phone sanity check (US-style, forgiving).
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid phone number." },
      { status: 422 }
    );
  }

  const lead = {
    name,
    phone,
    email: String(body.email ?? "").trim(),
    service: String(body.service ?? "").trim(),
    message: String(body.message ?? "").trim(),
    receivedAt: new Date().toISOString(),
  };

  // TODO: deliver the lead. For example:
  //   • Email:   await sendEmail(lead)            // Resend / Nodemailer
  //   • CRM:     await fetch(WEBHOOK_URL, {...})   // Zapier / HighLevel / etc.
  //   • Storage: await db.leads.create(lead)
  console.log("[contact] new lead:", lead);

  return NextResponse.json({ ok: true });
}
