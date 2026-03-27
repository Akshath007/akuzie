# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- JavaScript (ES6+) - All application code, API routes, and components.
- CSS (Tailwind CSS 4) - Styling and UI layout.

## Runtime

**Environment:**
- Node.js (Version managed via `package.json` engines, likely 20+)
- Browser (React 19, Next.js 15+)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 (Note: Version specified in `package.json` as 16.1.6, futuristic/experimental) - React framework for SSR, routing, and APIs.
- React 19.2.3 - UI library.

**UI/Styling:**
- Tailwind CSS 4.0.0 - Styling framework.
- Framer Motion 12.31.0 - Animation engine.
- Lucide React 0.563.0 - Icon set.

**Build/Dev:**
- ESLint 9.x - Linting.
- PostCSS - CSS transformation.

## Key Dependencies

**Critical:**
- Firebase 12.8.0 - Client-side SDK for Firestore and Auth.
- Firebase Admin 13.6.1 - Server-side SDK for privileged operations.
- PayU SDK 1.1.1 - Payment gateway integration.
- Cashfree JS 1.0.6 - Alternative payment integration.
- Lemon Squeezy JS 4.0.0 - Digital products/subscription handling.
- Cloudinary 2.9.0 - Image hosting and transformation.
- Crypto JS 4.2.0 - Cryptographic utilities.

## Configuration

**Environment:**
- `.env.local`, `.env.example` - Environment variable management.
- Firebase config object in `src/lib/firebase.js`.

**Build:**
- `next.config.mjs` - Next.js configuration.
- `tailwind.config.mjs` - Tailwind CSS configuration.
- `jsconfig.json` - Path mapping and JS configuration.

## Platform Requirements

**Development:**
- Node.js environment.
- No specific OS requirement (Windows confirmed for current user).

**Production:**
- Optimized for Vercel or similar Next.js hosting platforms.
- Firebase project for backend services.

---

*Stack analysis: 2026-03-27*
