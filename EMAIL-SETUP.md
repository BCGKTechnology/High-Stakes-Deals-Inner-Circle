# Emailing yourself each new application

The page writes to `public.applications`. The database then fires a webhook, and an Edge Function turns that row into an email. Splitting it this way means a bad API key or an outage at the email provider costs you a notification, never the application itself — the row is already saved.

You need a sending service. Resend is used below (free tier covers 3,000 emails/month, no card). Postmark or SendGrid work the same way if you swap the API call.

---

## 1. Get a Resend API key

Sign up at resend.com → **API Keys** → Create. Copy it.

You can send immediately from `onboarding@resend.dev` while testing. To send from your own domain, add it under **Domains** and drop in the DNS records — worth doing before launch so the email doesn't land in spam.

## 2. Set the secrets

```bash
supabase login
supabase link --project-ref ishjibucgefymikiarko

supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set NOTIFY_TO=you@yourdomain.com
supabase secrets set NOTIFY_FROM="Inner Circle <applications@yourdomain.com>"
supabase secrets set HOOK_SECRET=$(openssl rand -hex 24)
supabase secrets set PROJECT_REF=ishjibucgefymikiarko
```

`NOTIFY_TO` takes a comma-separated list if more than one person should get these. Keep the `HOOK_SECRET` value — you'll paste it in step 4.

Leave `NOTIFY_FROM` unset and it falls back to `onboarding@resend.dev`.

## 3. Deploy the function

```bash
supabase functions deploy notify-application --no-verify-jwt
```

`--no-verify-jwt` is deliberate: the webhook isn't a logged-in user, so the shared secret from step 2 is what guards the endpoint instead.

## 4. Point the database at it

Supabase dashboard → **Database → Webhooks → Create a new hook**:

| Field | Value |
|---|---|
| Name | `notify_application` |
| Table | `public.applications` |
| Events | Insert only |
| Type | Supabase Edge Functions |
| Function | `notify-application` |
| HTTP Headers | add `x-hook-secret` = the value from step 2 |

Save.

## 5. Test

Submit the form on the live site. The email should arrive within a few seconds.

If it doesn't:

- **Database → Webhooks → Logs** shows whether the hook fired and what status came back.
- **Edge Functions → notify-application → Logs** shows the function's own errors. A rejected send logs Resend's exact response.
- `401` means the `x-hook-secret` header doesn't match the secret.
- `500 Not configured` means `RESEND_API_KEY` or `NOTIFY_TO` didn't get set.

---

## No-code alternative

If you'd rather not deploy a function, the webhook can post straight to Make instead:

1. In Make, create a scenario starting with a **Custom Webhook** and copy its URL.
2. In Supabase, create the same Database Webhook but choose **HTTP Request** and paste that URL.
3. Add an **Email → Send an email** module in Make, mapping the fields from `record`.

Slower per message and it burns Make operations, but it takes about five minutes and no terminal.
