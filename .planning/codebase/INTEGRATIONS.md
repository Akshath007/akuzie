# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**Payment Processing:**
- PayU - Primary payment gateway for Indian transactions.
  - SDK/Client: `payu-sdk` npm package, custom integration in `src/lib/payu.js`.
  - Auth: Merchant Key and Salt in `PAYU_MERCHANT_KEY` and `PAYU_MERCHANT_SALT` env vars.
  - Endpoints used: `payu-initiate`, `payu-callback`, `payu-webhook`, `verify-payment`.
- Cashfree - Supporting payment gateway.
  - SDK/Client: `@cashfreepayments/cashfree-js`.
- Lemon Squeezy - Digital products and international payments.
  - SDK/Client: `@lemonsqueezy/lemonsqueezy.js`.

**Email/SMS:**
- Custom Email Service (via API route)
  - Integration: `src/lib/email.js` using templates.
  - Endpoint: `/api/send-email`.

## Data Storage

**Databases:**
- Firebase Firestore - Primary NoSQL document database.
  - Connection: via Firebase Client SDK and Admin SDK.
  - Auth: Firebase config and Service Account credentials.
  - Collections: `users`, `paintings`, `orders`, `auctions`, `bids`, `admin_logs`, `workspaces`, `workspace_sessions`.

**File Storage:**
- Firebase Storage - Likely used for some assets.
- Cloudinary - Used for image transformations and possibly hosting.
  - SDK/Client: `cloudinary` npm package.

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication - Google Sign-In and Email/Password.
  - Implementation: `src/context/AuthContext.js` using Firebase Client SDK.
  - Token storage: Client-side storage handled by Firebase.
  - Session management: Managed by Firebase SDK and custom `workspace_sessions` in Firestore.

**OAuth Integrations:**
- Google OAuth - Primary login method.
  - Scopes: email, profile.

## Monitoring & Observability

**Analytics:**
- Google Analytics (GA4)
  - Integration: `@next/third-parties/google` in `src/app/layout.js`.
  - ID: `G-157L7EBZZG`.

## CI/CD & Deployment

**Hosting:**
- Likely Vercel (standard for Next.js apps).
  - Domain: `akuzie.in`.

## Environment Configuration

**Development:**
- Required env vars: `NEXT_PUBLIC_FIREBASE_API_KEY`, `FIREBASE_PRIVATE_KEY`, `PAYU_MERCHANT_SALT`, etc.
- Secrets location: `.env.local` (gitignored).

## Webhooks & Callbacks

**Incoming:**
- PayU Webhook - `/api/payu-webhook` for asynchronous payment confirmation.
- PayU Callback - `/api/payu-callback` for immediate post-payment redirect.

---

*Integration audit: 2026-03-27*
