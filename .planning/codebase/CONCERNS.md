# Codebase Concerns

**Analysis Date:** 2026-03-27

## Tech Debt

**Hardcoded Admin Emails:**
- Issue: Super admin and workspace admin emails are hardcoded in multiple files.
- Files: `src/context/AuthContext.js`, `src/components/AdminGuard.js`, `firestore.rules`.
- Why: Simple initial implementation.
- Impact: Scalability is limited; adding admins requires code changes and redeployment.
- Fix approach: Move admin roles to a `roles` field in the Firestore `users` collection.

**Direct Firestore Updates for Bidding:**
- Issue: Bidding logic in `src/lib/auction-data.js` attempts client-side updates to restricted collections.
- Files: `src/lib/auction-data.js`, `firestore.rules`.
- Why: Simplified real-time logic.
- Impact: Permission Denied errors for all non-admin users; auctions are currently non-functional for regular users.
- Fix approach: Move bidding logic to a secure API route using `firebase-admin` transactions.

## Known Bugs

**Missing Workspace Modal:**
- Symptoms: Admin workspace page crashes or fails to open the create/edit modal.
- Trigger: Clicking "Add Workspace" or "Edit" on the workspace management page.
- File: `src/app/akshath/workspaces/page.js` (imports non-existent `WorkspaceFormModal.js`).
- Workaround: None currently.
- Root cause: File missing or deleted during refactoring.

**Workspace API 404s:**
- Symptoms: Fetching workspaces returns Not Found.
- Trigger: Accessing the workspace list in the admin panel or starting a session.
- Files: `src/context/WorkspaceContext.js` (calls `/api/workspaces`), but folder is `/api/workspace`.
- Root cause: Pluralization mismatch in directory naming vs fetch calls.

## Security Considerations

**Unvalidated UserId in Checkout:**
- Risk: User impersonation. API trusts the `userId` in the body without checking the auth token.
- File: `src/app/api/checkout/auction/route.js`.
- Current mitigation: None.
- Recommendations: Verify the Firebase ID Token from the `Authorization` header on the server.

**Public Bid Visibility Rule:**
- Risk: Users can't see the bidding history of others.
- File: `firestore.rules`.
- Current mitigation: Private read access.
- Recommendations: Set `allow read: if true` for the `bids` collection to enable competitive bidding visibility.

## Performance Bottlenecks

**LRU Cache in Serverless:**
- Problem: Rate limiting and data caching are in-memory only.
- Files: `src/app/api/workspace/verify/route.js`, `src/lib/data-server.js`.
- Cause: Cold starts in serverless environments reset the cache frequently.
- Improvement path: Migrate to a remote cache like Redis (Upstash) for persistent rate limiting.

## Fragile Areas

**Auction Winner Cascading:**
- File: `src/lib/auction-data.js` (`passToNextBidder`).
- Why fragile: Complex recursive logic for handling payment failures and passing wins.
- Common failures: Potential for infinite loops or incorrect status updates if state transitions collide.
- Safe modification: Add comprehensive logging and wrap in robust try/catch blocks.

---

*Concerns audit: 2026-03-27*
*Update as issues are fixed or new ones discovered*
