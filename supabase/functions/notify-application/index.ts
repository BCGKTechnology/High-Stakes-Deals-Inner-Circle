// ============================================================
//  notify-application
//  Fires when a row lands in public.applications and emails you
//  the details. Triggered by a Supabase Database Webhook.
//  Deploy:  supabase functions deploy notify-application --no-verify-jwt
// ============================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_TO      = Deno.env.get("NOTIFY_TO");
const NOTIFY_FROM    = Deno.env.get("NOTIFY_FROM") ?? "Inner Circle <onboarding@resend.dev>";
const HOOK_SECRET    = Deno.env.get("HOOK_SECRET");
const PROJECT_REF    = Deno.env.get("PROJECT_REF") ?? "";

const esc = (v: unknown) =>
  String(v ?? "—").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const row = (label: string, value: unknown) => `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid #e6e2da;font:500 11px/1.4 ui-monospace,monospace;
               letter-spacing:.12em;text-transform:uppercase;color:#8a7a45;white-space:nowrap;
               vertical-align:top;width:150px">${esc(label)}</td>
    <td style="padding:11px 0 11px 20px;border-bottom:1px solid #e6e2da;
               font:400 15px/1.5 -apple-system,Segoe UI,sans-serif;color:#0F1B2D">${esc(value)}</td>
  </tr>`;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Shared secret so only your webhook can invoke this
  if (HOOK_SECRET && req.headers.get("x-hook-secret") !== HOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!RESEND_API_KEY || !NOTIFY_TO) {
    console.error("Missing RESEND_API_KEY or NOTIFY_TO secret");
    return new Response("Not configured", { status: 500 });
  }

  let r: Record<string, unknown>;
  try {
    const payload = await req.json();
    r = payload.record ?? payload;            // webhook sends { record: {...} }
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const name  = String(r.full_name ?? "Someone");
  const email = String(r.email ?? "");
  const tableUrl = PROJECT_REF
    ? `https://supabase.com/dashboard/project/${PROJECT_REF}/editor`
    : "";

  const html = `
  <div style="background:#f5f3ef;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e6e2da">
      <div style="background:#0F1B2D;padding:22px 28px">
        <div style="font:500 10px/1.4 ui-monospace,monospace;letter-spacing:.22em;
                    text-transform:uppercase;color:#D4AF37">Deals &amp; Dollars Inner Circle</div>
        <div style="font:700 22px/1.25 Georgia,serif;color:#fff;margin-top:8px">New application</div>
      </div>
      <div style="padding:26px 28px">
        <table style="width:100%;border-collapse:collapse">
          ${row("Name", r.full_name)}
          ${row("Email", r.email)}
          ${row("Phone", r.phone)}
          ${row("Units owned", r.units_owned)}
          ${row("12-month target", r.target_units)}
          ${row("Biggest bottleneck", r.bottleneck)}
          ${row("Submitted", r.created_at)}
        </table>
        ${tableUrl ? `<p style="margin:26px 0 0">
          <a href="${tableUrl}" style="display:inline-block;background:#D4AF37;color:#0F1B2D;
             text-decoration:none;padding:13px 24px;font:500 11px/1 ui-monospace,monospace;
             letter-spacing:.16em;text-transform:uppercase">Open in Supabase</a></p>` : ""}
        <p style="margin:22px 0 0;font:400 13px/1.6 -apple-system,Segoe UI,sans-serif;color:#6b6558">
          Reply to this email to reach ${esc(name)} directly.</p>
      </div>
    </div>
  </div>`;

  const text = [
    `New Inner Circle application`,
    ``,
    `Name:              ${r.full_name ?? "—"}`,
    `Email:             ${r.email ?? "—"}`,
    `Phone:             ${r.phone ?? "—"}`,
    `Units owned:       ${r.units_owned ?? "—"}`,
    `12-month target:   ${r.target_units ?? "—"}`,
    `Biggest bottleneck:${r.bottleneck ?? "—"}`,
    `Submitted:         ${r.created_at ?? "—"}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: NOTIFY_TO.split(",").map((s) => s.trim()),
      reply_to: email || undefined,
      subject: `Inner Circle application — ${name}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend rejected the send:", res.status, detail);
    return new Response("Email failed", { status: 502 });
  }

  return new Response("ok", { status: 200 });
});
