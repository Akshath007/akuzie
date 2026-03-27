# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```
akuzie/
├── .planning/           # GSD planning documents and codebase map
├── .agent/              # GSD skills, workflows, and templates
├── src/                 # Application source code
│   ├── app/             # Next.js App Router: pages, layouts, and API routes
│   │   ├── api/         # Server-side API endpoints (Node.js/Firebase Admin)
│   │   ├── (auth)/      # Auth-related groups (optional usage)
│   │   ├── akshath/     # Super Admin panel (workspaces, settings)
│   │   ├── auction/     # Auction dynamic routes
│   │   └── workspace/   # Workspace dynamic routes and PIN entry
│   ├── components/      # Reusable React components (UI, Navigation, Guards)
│   ├── context/         # React Context providers (Auth, Workspace)
│   ├── hooks/           # Custom React hooks (useAuth, useWorkspace, etc.)
│   ├── lib/             # Utility functions and data fetching logic
│   └── styles/          # Global styles (Tailwind, animations)
├── public/              # Static assets (images, icons)
├── package.json         # Project manifest and dependencies
└── next.config.mjs      # Next.js configuration
```

## Directory Purposes

**src/app/api/:**
- Purpose: Backend logic for secure Firestore updates and payment flows.
- Contains: `route.js` files for each endpoint.
- Key files: `/api/checkout/auction/route.js`, `/api/workspace/verify/route.js`.

**src/app/[workspace]/:**
- Purpose: Dynamic workspace pages.
- Contains: Nested layouts and pages for specific sub-apps (art, crochet).

**src/components/:**
- Purpose: Shared UI elements.
- Contains: `Navbar.js`, `AdminGuard.js`, `FeaturedCard.js`, etc.

**src/lib/:**
- Purpose: Core data abstractions.
- Contains: `data.js` (client data), `data-server.js` (caching), `data-admin.js` (elevated).
- Special files: `auction-data.js` - complex real-time bidding logic.

## Key File Locations

**Entry Points:**
- `src/app/page.js`: Main landing page entry.
- `src/app/layout.js`: Root layout with providers and analytics.

**Configuration:**
- `jsconfig.json`: Path aliases (e.g., `@/components`).
- `firestore.rules`: Security rules for database.

**Core Logic:**
- `src/context/AuthContext.js`: Global user state listener and admin check.
- `src/context/WorkspaceContext.js`: Workspace-specific session and PIN logic.

## Naming Conventions

**Files:**
- `kebab-case.js` or `PascalCase.js`: Components usually use PascalCase, utilities use kebab-case.
- `page.js`, `layout.js`, `route.js`: Reserved Next.js filenames.

**Directories:**
- Plural collection names (e.g., `components`, `hooks`, `context`).
- Kebab-case for feature folders.

## Where to Add New Code

**New API Endpoint:**
- Definition: `src/app/api/[name]/route.js`.

**New Shared Component:**
- Implementation: `src/components/[ComponentName].js`.

**New Data Utility:**
- Logic: `src/lib/[feature]-data.js`.

---

*Structure analysis: 2026-03-27*
