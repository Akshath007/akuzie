# Requirements: Akuzie Core Stability

**Defined:** 2026-03-27
**Core Value:** The platform must provide a secure, seamless, and real-time bidding experience for users, alongside a stable and accessible administrative panel for managing workspaces and users.

## v1 Requirements

Requirements for the immediate stability patch milestone.

### Secure Bidding (Auctions)

- [ ] **AUC-01**: Create secure API route (`/api/auction/bid`) to handle bid placements via `firebase-admin`.
- [ ] **AUC-02**: Update `placeBid` in `auction-data.js` to call the new API route instead of direct Firestore mutation.
- [ ] **AUC-03**: Update `firestore.rules` to strictly prevent client-side writes to the `auctions` collection.
- [ ] **AUC-04**: Update `firestore.rules` to allow public read access to the `bids` collection so users can see bid history.

### Admin Robustness

- [ ] **ADM-01**: Restore or recreate `WorkspaceFormModal.js` to fix the crashing admin page.
- [ ] **ADM-02**: Fix API route mismatch: ensure either the folder is named `/workspaces` or fetch calls use `/workspace`.
- [ ] **ADM-03**: Verify admin workspace management page loads and functions correctly without crashing.

### Security & Roles

- [ ] **SEC-01**: Update `AuthContext.js` to check an `isAdmin` field in the user's Firestore document instead of hardcoded emails.
- [ ] **SEC-02**: Create an initialization script/function to assign the first Super Admin role in Firestore.
- [ ] **SEC-03**: Update `/api/checkout/auction/route.js` to verify the user's Firebase ID token via headers instead of trusting the body `userId`.

### Rate Limiting

- [ ] **RAT-01**: Replace in-memory `LRUCache` in `/api/workspace/verify/route.js` with a database-backed rate limiter (e.g., Upstash Redis) or a Firestore-based fallback to survive serverless cold starts.

## v2 Requirements

Deferred to future releases.

### Feature Enhancements

- **FEAT-01**: Implement email notifications for outbid users.
- **FEAT-02**: Add comprehensive admin dashboard analytics.

## Out of Scope

| Feature | Reason |
|---------|--------|
| UI Redesign | UI is currently in a good state; focus must remain strictly on resolving backend logic and security flaws. |
| New Payment Gateways | Focus is on hardening the existing PayU integration to prevent user impersonation before expanding to more gateways. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUC-01 | Phase 1 | Pending |
| AUC-02 | Phase 1 | Pending |
| AUC-03 | Phase 1 | Pending |
| AUC-04 | Phase 1 | Pending |
| ADM-01 | Phase 2 | Pending |
| ADM-02 | Phase 2 | Pending |
| ADM-03 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| RAT-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after initial definition*
