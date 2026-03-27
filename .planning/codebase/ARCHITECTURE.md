# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Next.js Full-stack Application with Multi-tenant Workspace Pattern.

**Key Characteristics:**
- **App Router Architecture:** Uses Next.js 15+ App Router for layouts and nested routing.
- **Multi-tenancy:** Differentiates content based on workspace (e.g., "art", "crochet") with PIN protection.
- **Client-Side Firebase:** Heavy use of Firebase Client SDK for real-time updates (auctions) and auth.
- **Serverless API Routes:** Backend logic handled via Next.js API routes (`src/app/api/`) using `firebase-admin`.
- **Hybrid Data Fetching:** Server-side fetching for SEO/initial load, Client-side listeners for real-time states.

## Layers

**UI Layer (React Server & Client Components):**
- Purpose: Render views and handle user interactions.
- Contains: Pages (`page.js`), Layouts (`layout.js`), and UI Components (`src/components/`).
- Location: `src/app/` and `src/components/`.
- Depends on: Context layer for state, Data layer for fetching.

**Context Layer (React Context):**
- Purpose: Manage global state and cross-cutting concerns.
- Contains: `AuthContext.js` (User state), `WorkspaceContext.js` (Session/Tenant state).
- Location: `src/context/`.
- Used by: UI Layer.

**Data Layer (Firebase SDKs):**
- Purpose: Interface with Firestore, Storage, and Auth.
- Contains: Client utilities (`src/lib/data.js`, `src/lib/auction-data.js`) and Server/Admin utilities (`src/lib/data-server.js`, `src/lib/data-admin.js`).
- Location: `src/lib/`.
- Depends on: Firebase infrastructure.

**API Layer (Next.js Routes):**
- Purpose: Secure server-side processing and payment integrations.
- Contains: Route handlers for checkout, workspace verification, and admin tasks.
- Location: `src/app/api/`.
- Depends on: Firebase Admin SDK, External Payment SDKs.

## Data Flow

**Real-time Auction Bidding:**
1. User interacts with `AuctionDetail` page.
2. `useSnapshot` or `onSnapshot` (via `auction-data.js`) maintains a real-time connection to the Firestore document.
3. User places a bid via `placeBid` function.
4. (Current Issue) Client attempts to update Firestore document directly (fails due to security rules).
5. (Planned) UI sends request to `/api/auction/bid`, server validates and updates via `firebase-admin`.
6. Firestore update triggers client listener; UI updates automatically.

**State Management:**
- **Auth:** `AuthContext` syncs Firebase Auth state with the current user's profile in Firestore.
- **Workspaces:** `WorkspaceContext` manages a session token (stored in `localStorage` and `workspace_sessions` collection) to persist pinned workspace access.

## Key Abstractions

**Workspace Guard:**
- Purpose: Restrict access to specific workspace routes based on PIN verification.
- Pattern: Higher-Order Component or Context check in `AdminGuard.js` and `WorkspaceContext.js`.

**Auction Transaction:**
- Purpose: Ensure bids are atomic and prevent race conditions.
- Pattern: Firestore `runTransaction` in `src/lib/auction-data.js`.

## Entry Points

**Web Entry:**
- Location: `src/app/layout.js` and `src/app/page.js`.
- Triggers: Browser navigation to `akuzie.in`.

**API Entry:**
- Location: `src/app/api/[...route]/route.js`.
- Triggers: Client-side `fetch` calls.

---

*Architecture analysis: 2026-03-27*
