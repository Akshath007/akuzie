# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**
- `kebab-case.js` for most files (e.g., `auction-data.js`).
- `PascalCase.js` for some React components (e.g., `FeaturedCard.js`).
- `page.js`, `layout.js`, `route.js` follow Next.js App Router conventions.

**Functions:**
- `camelCase` for all functions (e.g., `placeBid`, `verifyPin`).
- `PascalCase` for React component names (e.g., `FeaturedCard`).

**Variables:**
- `camelCase` for variables.
- `UPPER_SNAKE_CASE` for global constants (e.g., `ADMIN_EMAILS` if any).

## Code Style

**Formatting:**
- Standard JavaScript formatting (no explicit Prettier config detected, but likely followed by editor).
- 2-space indentation.

**Linting:**
- ESLint via `eslint-config-next`.
- Run: `npm run lint`.

## Import Organization

**Order:**
1. React and Next.js built-ins (`react`, `next/navigation`).
2. External packages (`firebase`, `lucide-react`).
3. Internal utilities (`@/lib`, `@/context`).
4. Relative imports (`./components`, `../hooks`).

**Path Aliases:**
- `@/` maps to `src/` (configured in `jsconfig.json`).

## Error Handling

**Patterns:**
- **Client:** Uses `try/catch` and `alert()` for user notifications (e.g., `AuthContext.js`, `WorkspaceContext.js`).
- **Server (API):** Uses `try/catch` with `NextResponse.json` for error responses.
- **Fail-safes:** Firestore query fallbacks for missing indexes.

## Logging

**Framework:**
- `console.log` and `console.error` for development debugging.
- No dedicated production logging library detected.

## Comments

**When to Comment:**
- Occasional comments for complex logic (e.g., `auction-data.js` bidding logic).
- JSDoc is not consistently used.

## Function Design

**Size:**
- Most functions are kept relatively small and focused.
- Business logic is extracted into utility files in `src/lib/`.

---

*Convention analysis: 2026-03-27*
*Update when patterns change*
