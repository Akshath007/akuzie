# Roadmap: Akuzie Core Stability

## Overview

This roadmap defines the execution phases to stabilize and harden the Akuzie platform. It focuses on migrating client-side auction bidding to a secure API, restoring broken admin functionality, removing hardcoded permissions, and implementing persistent rate limiting.

## Phases

- [ ] **Phase 1: Secure Bidding** - Migrate bidding logic to a secure server-side API.
- [ ] **Phase 2: Admin Robustness** - Restore missing workspace management files and fix API paths.
- [ ] **Phase 3: Security & Roles** - Implement Firestore-based role management and token verification.
- [ ] **Phase 4: Rate Limiting** - Implement persistent rate limiting for workspace verification.

## Phase Details

### Phase 1: Secure Bidding
**Goal**: Allow regular users to place bids securely via a server-side API, bypassing client-side Firestore rules.
**Depends on**: Nothing
**Requirements**: AUC-01, AUC-02, AUC-03, AUC-04
**Success Criteria** (what must be TRUE):
  1. Regular (non-admin) users can successfully place a bid.
  2. Bids are processed transactionally via `firebase-admin`.
  3. All users can view the bidding history on an auction page.
  4. Client-side mutation of the `auctions` collection is explicitly denied in `firestore.rules`.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Create `/api/auction/bid` route and update `auction-data.js` to use it.
- [ ] 01-02: Update `firestore.rules` for `auctions` and `bids` collections.

### Phase 2: Admin Robustness
**Goal**: Fix the crashes currently preventing the management of workspaces in the admin panel.
**Depends on**: Nothing
**Requirements**: ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. The Workspace Settings page loads without errors.
  2. The Workspace Form Modal opens and functions correctly.
  3. API calls to fetch workspaces return successfully (no 404s).
**Plans**: 2 plans

Plans:
- [ ] 02-01: Re-implement the missing `WorkspaceFormModal.js` component.
- [ ] 02-02: Rename `/api/workspace` to `/api/workspaces` (or update calls) and fix related imports.

### Phase 3: Security & Roles
**Goal**: Remove hardcoded admin emails and secure payment APIs utilizing Firebase Auth tokens.
**Depends on**: Nothing
**Requirements**: SEC-01, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):
  1. `AuthContext.js` relies on an `isAdmin` flag from Firestore, not hardcoded strings.
  2. The `/api/checkout/auction` route rejects requests lacking a valid Firebase ID token matching the body `userId`.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Update `AuthContext` and `AdminGuard` to use Firestore roles, and create an init script for the first admin.
- [ ] 03-02: Implement token verification in `/api/checkout/auction/route.js`.

### Phase 4: Rate Limiting
**Goal**: Ensure workspace PIN verification cannot be easily brute-forced, even in a serverless environment.
**Depends on**: Phase 2
**Requirements**: RAT-01
**Success Criteria** (what must be TRUE):
  1. Workspace PIN verification uses a persistent rate limiter (Firestore or external service like Upstash).
  2. The system correctly blocks repeated failed attempts across serverless function invocations.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Replace `lru-cache` with a Firestore-backed rate limiter in `/api/workspace/verify/route.js`.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Secure Bidding | 2/2 | Complete | 2026-03-27 |
| 2. Admin Robustness | 2/2 | Complete | 2026-03-27 |
| 3. Security & Roles | 2/2 | Complete | 2026-03-27 |
| 4. Rate Limiting | 1/1 | Complete | 2026-03-27 |
