# RMP Works — Stripe Founder sandbox webhook verification

Webhook target: `https://rmpworks.com/api/stripe-webhook`.

- The sandbox endpoint is restricted to test-mode Checkout events and to the configured RMPWorks sandbox payment link. Live events must not be processed by this endpoint.
- Set `STRIPE_WEBHOOK_SECRET_TEST` as a **secret** in Cloudflare Pages → rmpworks → Production. Never put the value in GitHub or in this file.
- After changing Cloudflare Pages secrets or bindings, create a new production deployment before testing. A green build from before the setting change does not prove the running function has received the secret.
- `GET /api/stripe-webhook` should return HTTP 405.
- An unsigned `POST /api/stripe-webhook` should return HTTP 400 `Invalid signature`, not 503 `Webhook not configured`.
- A successfully signed `checkout.session.completed` event from the **sandbox link**, with `payment_status=paid`, should record an entry in D1 `founder_orders` and its ID in `stripe_webhook_events`. Duplicate delivery should not create a second order.
- The webhook is not proof of successful end-to-end checkout until a genuine sandbox purchase and Stripe delivery have been observed. Do not grant service access from redirect URLs.
- Stripe Tax: separate sandbox and live registrations and tax codes must be checked before enabling live checkout.
- Public site checkout must remain disabled pending verified service terms, fulfillment scope, refund policy, tax treatment and payment-flow validation.

The deploy in this change is intentionally a configuration refresh following the addition of the Cloudflare secret; there are no live-payment changes.
