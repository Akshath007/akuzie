# Akuzie: Core Stability & System Hardening

## What This Is

Akuzie is a premium, multi-tenant eCommerce and auction platform designed for specific niches (e.g., "art", "crochet"). It features a modern Next.js 15+ frontend with Firebase acting as the real-time database and authentication layer, complemented by custom Next.js API routes for secure tasks and payment processing (PayU). 

This specific project phase focuses on resolving critical technical debt and security vulnerabilities identified during a comprehensive codebase audit, ensuring the platform is stable, secure, and fully functional for end-users and administrators.

## Core Value

The platform must provide a secure, seamless, and real-time bidding experience for users, alongside a stable and accessible administrative panel for managing workspaces and users.

## Requirements

### Validated

- ✓ Modern, premium UI/UX built with Next.js App Router and Tailwind CSS 4.
- ✓ Multi-tenant workspace architecture with PIN-based access control.
- ✓ Firebase Authentication integration (Google Sign-In).
- ✓ Initial PayU payment gateway integration.

### Active

- [ ] **Secure Bidding:** Move auction bidding logic from the client to a secure server-side API (`firebase-admin`) to bypass restrictive Firestore rules and allow regular users to bid.
- [ ] **Admin Robustness:** Restore missing files (e.g., `WorkspaceFormModal.js`) and fix API endpoint mismatches (`/api/workspaces` vs `/api/workspace`) to prevent admin panel crashes.
- [ ] **Security Hardening:** Implement server-side verification of Firebase ID Tokens in sensitive API routes (e.g., Checkout).
- [ ] **Role Management:** Replace hardcoded admin email checks with a scalable Firestore-backed role system (`isAdmin` flag).
- [ ] **Rate Limiting:** Implement a robust rate-limiting solution that survives serverless cold starts (replacing the current in-memory LRU cache).

### Out of Scope

- [UI Redesign] — The current UI (Tailwind 4, Framer Motion) is premium and functional; focus is strictly on backend logic and security.
- [New Payment Gateways] — Focus on hardening existing PayU checkout logic rather than adding new providers right now.

## Context

A recent deep-dive audit revealed that while the UI is excellent, the underlying logic has critical flaws. The most pressing issue is that regular users cannot participate in auctions due to Firestore security rules blocking client-side writes to the `auctions` collection. Furthermore, the Admin panel is broken due to missing files and mismatched API endpoints. The project currently relies heavily on hardcoded values (like admin emails) which need to be centralized.

## Constraints

- **Tech Stack**: Must use existing Next.js 15+ App Router, Firebase Client SDK, and Firebase Admin SDK.
- **Security**: All database mutations related to value (bids, orders) MUST occur on the server via API routes.
- **State Management**: Continue using React Context (`AuthContext`, `WorkspaceContext`) but ensure they reflect secure server state.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use API Routes for Bidding | Client-side bidding fails due to Firestore rules. API routes provide a secure environment to validate bids and use `firebase-admin` to bypass client rules. | — Pending |
| Firestore Role-based Auth | Hardcoded emails are unscalable. Storing roles in the `users` collection allows dynamic admin management. | — Pending |

---
*Last updated: 2026-03-27 after initialization*
