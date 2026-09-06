# ipie-web — Architecture Plan

The frontend counterpart to `IpieMicroservicesCurrent/ipie-platform-mca/ARCHITECTURE_WORKING_PLAN.md`, which covers the
backend estate. This document describes ipie-web completely: what it is built from, how it is put
together, how it authenticates, how it is configured and deployed, and what is known to be wrong
with it today.

Where a statement here is a decision, it says so. Where something is a known gap, it says that too —
a plan that only records the good parts is read once and trusted wrongly thereafter.

---

## 0. How to use this document

Read §2 for the stack, §5–§9 for how the application actually works, and §15 before proposing any
change to authentication. §16 is the live list of what is not done. Update §17 when a section stops
being true.

---

## 1. Purpose and scope

ipie-web is the browser client for the iPIE platform: public registration, authentication, and the
authenticated console for users, roles, linked stakeholder accounts and notifications. It is a
single-page application. It holds no business logic of record — every rule that matters is enforced
by the services behind it, and anything this application decides is a presentation decision.

It talks to three services directly (`ipie-user-service`, `ipie-iam-service`,
`ipie-communication-service`) and to Keycloak for tokens. It never talks to a database, a broker or
another frontend.

---

## 2. Technology stack

Everything the application is built from, at the versions currently pinned in `package.json`. The
frontend does not inherit the backend's Bill of Materials, so these versions are managed here and
are the ones to quote in the platform's version matrix (Development Environment Configuration §41).

### Runtime and language

| Component | Version | Role |
|---|---|---|
| Node.js | 24.18.0 (Active LTS) | Build and test runtime only; not a server at runtime |
| npm | 11.x (bundled with Node 24) | Package manager; `package-lock.json` is authoritative |
| TypeScript | ~6.0.2 | Strict typing across the whole source tree |

### Framework and build

| Component | Version | Role |
|---|---|---|
| React | 19.2.7 | UI library |
| React DOM | 19.2.7 | Browser renderer |
| Vite | 8.1.5 | Dev server and production bundler (Rolldown-based) |
| @vitejs/plugin-react | 6.0.3 | React fast refresh and JSX transform |

### State and data

| Component | Version | Role |
|---|---|---|
| Redux Toolkit | 2.12.0 | Store, slices, and RTK Query |
| React Redux | 9.3.0 | React bindings |
| RTK Query | (part of Redux Toolkit) | Server-state cache, one API per backend concern |
| axios | 1.18.1 | HTTP transport beneath RTK Query, and the interceptor seam |

### Routing

| Component | Version | Role |
|---|---|---|
| React Router | 7.18.1 | Client-side routing, nested layouts, route guards |

### UI and styling

| Component | Version | Role |
|---|---|---|
| Tailwind CSS | 4.3.3 | Utility-first styling |
| @tailwindcss/vite | 4.3.3 | Tailwind's Vite integration (no PostCSS pipeline) |
| Radix UI | 1.6.7 (plus `react-label` 2.1.11, `react-slot` 1.3.0) | Unstyled, accessible primitives |
| class-variance-authority | 0.7.1 | Typed component variants |
| clsx | 2.1.1 | Conditional class composition |
| tailwind-merge | 2.6.0 | Resolves conflicting Tailwind classes |
| lucide-react | 0.468.0 | Icon set |

### Quality and testing

| Component | Version | Role |
|---|---|---|
| Vitest | 4.1.10 | Test runner |
| jsdom | 25.0.1 | DOM environment for tests |
| @testing-library/react | 16.1.0 | Component testing, behaviour-first |
| @testing-library/jest-dom | 6.9.1 | DOM matchers |
| @testing-library/user-event | 14.6.1 | Realistic interaction simulation |
| oxlint | 1.74.0 | Linter — deliberately not ESLint; see §13 |
| Prettier | 3.9.5 | Formatting |

### Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Local dev server |
| `build` | `tsc -b && vite build` | Type-check, then bundle — a type error fails the build |
| `lint` | `oxlint` | Lint |
| `test` | `vitest run` | Test suite, once |
| `test:watch` | `vitest` | Test suite, watching |
| `format` / `format:check` | `prettier` | Write / verify formatting |
| `preview` | `vite preview` | Serve the built bundle locally |

---

## 3. Repository layout

```
public/            static assets served as-is, including config.json (§4)
src/
  main.tsx         entry point: loads runtime configuration, then the app
  bootstrap.tsx    everything that depends on that configuration
  App.tsx          route table
  api/             one RTK Query API per backend concern (10 of them)
  app/             store composition and typed hooks
  components/      shared components, including ui/ (the primitive kit)
  features/        Redux slices owning client state
  hooks/           cross-cutting hooks
  lib/             non-React infrastructure: axios, auth storage, PKCE, JWT, config
  pages/           one component per route, plus register/ for the wizard sections
  test/            shared test fixtures
```

The split that matters is `features/` versus `api/`: **client state** (what the user is doing) lives
in slices, **server state** (what the backend says) lives in RTK Query caches. A value should never
be in both.

---

## 4. Runtime configuration

**The bundle is built once and promoted unchanged through every environment.** It contains no
endpoint, realm or client id. On startup it fetches `/config.json`, and whatever serves the static
files supplies that file per environment.

This is a deliberate reversal of the obvious approach. Vite substitutes `import.meta.env.VITE_*` at
build time, so using it would produce five different artifacts for five environments — and the
artifact validated in UAT would not be the artifact that reaches Production, contradicting the
promotion rule the pipeline and branching model rest on (Development Environment Configuration §45).

| Key | Meaning |
|---|---|
| `userServiceBaseUrl` | ipie-user-service |
| `iamServiceBaseUrl` | ipie-iam-service |
| `communicationServiceBaseUrl` | ipie-communication-service |
| `keycloakBaseUrl`, `keycloakRealm` | Identity provider |
| `keycloakClientId`, `keycloakClientSecret` | Confidential client used by password login — see §15 |
| `keycloakSsoClientId` | Public, PKCE-only client for stakeholder SSO |

Mechanics, in `src/lib/runtimeConfig.ts` and `src/main.tsx`:

- `loadRuntimeConfig()` fetches with `cache: 'no-store'` — the bundle is immutable and long-cached,
  this file is not and must never come from a stale entry.
- Missing file or missing keys **reject**, and `main.tsx` renders the reason. An application that
  starts against the wrong endpoints looks like it is working; the first symptom is data going
  somewhere it should not.
- `bootstrap.tsx` exists because of import order, not tidiness: `lib/axios.ts` builds its clients at
  module scope, so a static import would run before the fetch resolved.
- Under Vitest there is no server, so `getRuntimeConfig()` falls back to `.env.test`. That fallback
  is limited to test mode on purpose.

`public/config.json` holds local values and is what `vite dev` serves. `public/config.example.json`
documents the shape for a deployed environment.

---

## 5. Application composition

`main.tsx` → `loadRuntimeConfig()` → dynamic import of `bootstrap.tsx` → `StrictMode` → Redux
`Provider` → `BrowserRouter` → `App`.

Routes (`src/App.tsx`):

| Path | Page | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/set-password` | SetPasswordPage | Public — authorised by the one-time token in the link |
| `/sso/callback` | SsoCallbackPage | Public — the OIDC redirect target |
| `/dashboard` | DashboardPage | Protected |
| `/users` | UsersPage | Protected |
| `/roles` | RolesPage | Protected, `RBAC_DEFINE` |
| `/linked-accounts` | LinkedAccountsPage | Protected |
| `/notifications` | NotificationsPage | Protected, `NOTIFICATIONS_VIEW` |

Protected routes nest inside `ProtectedRoute` (authentication) and then `AppLayout` (chrome: top
bar, tab bar, locale toggle, session guard).

`/set-password` is public by necessity, not oversight — the caller has no credential yet, which is
the situation the page exists to end.

---

## 6. State management

**Client state** — four slices under `features/`:

| Slice | Owns |
|---|---|
| `authSlice` | Access/refresh tokens, the issuing client, derived identity |
| `localeSlice` | Selected locale, persisted through `localeStorage` |
| `tabsSlice` | Open tabs in the console shell |
| `registrationWizardSlice` | The multi-step registration form's in-progress state |

**Server state** — ten RTK Query APIs under `api/`: `keycloakApi`, `usersApi`, `sessionApi`,
`registrationApi`, `registrationLookupsApi`, `credentialApi`, `rolesApi`, `stakeholderLinksApi`,
`notificationsApi`, `organisationsApi`. Each is registered in `app/store.ts` with its reducer and
middleware, and uses tag-based invalidation rather than manual refetching.

Components use the typed `useAppDispatch` / `useAppSelector` from `app/hooks.ts`, never the untyped
originals.

---

## 7. API layer

`src/lib/axios.ts` is the single place HTTP behaviour is defined. It exports one client per target:

| Client | Target | Interceptors |
|---|---|---|
| `userServiceClient` | user-service | Auth header, refresh-and-retry, `Accept-Language` |
| `iamServiceClient` | iam-service | Same |
| `communicationServiceClient` | communication-service | Same |
| `keycloakClient` | Keycloak token endpoint | **None** — obtaining a token is the request |
| `publicIamServiceClient` | iam, unauthenticated | **None** — set-password has no session to refresh |

The two bare clients are deliberate. A login attempt must not trigger refresh-and-retry, and a 422
for an expired set-password link must not be retried as though it were an auth failure.

`axiosBaseQuery.ts` adapts these clients to RTK Query; `apiError.ts` normalises the platform's
`ApiError` shape so every page reports failures the same way.

---

## 8. Authentication and session

Two login paths, one console.

**Password login.** Resource-owner password grant against Keycloak, using the confidential client.
Tokens are stored via `lib/authStorage.ts`.

**Stakeholder SSO** ("Login with IBBI"). OIDC Authorization Code with PKCE, using the public SSO
client — `lib/pkce.ts` creates the verifier/challenge, `SsoCallbackPage` exchanges the code.
Identity brokering needs the redirect flow, which the password client does not support.

**Refresh.** `refreshAccessToken` presents whichever client issued the token — secret included only
for the confidential one. Keycloak requires the refresh to come from the issuing client, which is
why `StoredAuth` records `clientId`.

**Session timeout.** `SessionTimeoutGuard` polls `sessionApi`, warns before expiry, and offers
extend or end. Server-side session state is the authority; the guard only surfaces it.

**Permissions.** `usePermissions()` decodes the access token's `permissions` claim to decide what to
*show* — nav items, buttons. Enforcement is always server-side via `@RequiresPermission`. A
malformed token yields an empty list, never a throw. Hiding a control is a usability decision, never
a security one.

---

## 9. UI, styling and accessibility

`components/ui/` is a small primitive kit — accordion, button, card, checkbox, dialog, input, label,
password-input, popover, radio-group, select, tabs, textarea — built on Radix primitives, styled
with Tailwind, varied through `class-variance-authority`, and composed with `clsx` +
`tailwind-merge`. Radix is the reason keyboard interaction, focus management and ARIA wiring are
correct by default rather than by remembering.

The registration wizard (`pages/register/`) is section-based: account, personal, professional,
identity proof, entity search and details, with a shared footer bar and dropzone.

---

## 10. Internationalisation

Two locales, English and Hindi. The mechanism is deliberately thin: `localeSlice` holds the choice,
`localeStorage` persists it, and `axios.ts` sends it as `Accept-Language` on every authenticated
call, so **server-produced messages come back translated** (the services carry
`messages_hi.properties`).

**There is no UI string catalogue.** Static text in components is English only. That is a real gap
against a bilingual-government expectation and is listed in §16 — the transport is in place, the
catalogue is not.

---

## 11. Testing

Vitest with jsdom and Testing Library, asserting behaviour through the DOM rather than component
internals. Current coverage: `authSlice`, `authStorage`, `localeStorage`, `axios`, `axiosBaseQuery`,
`utils`, `ProtectedRoute`, `SessionTimeoutGuard`, `TopBar`, `UserRolesPanel`, `LoginPage`,
`RegisterPage`, `SetPasswordPage`, `RolesPage`, `UsersPage`. Shared fixtures live in
`test/authFixtures.ts`.

`.env.test` supplies the runtime-config fallback values (§4).

---

## 12. Build and artifact

`npm run build` runs `tsc -b` and then `vite build`; a type error fails the build rather than
producing a bundle. Output is `dist/`, containing hashed assets plus the contents of `public/`.

Verified property: no endpoint, realm or client id appears anywhere in the emitted JavaScript. That
is what makes one artifact promotable across environments, and it is worth re-checking whenever
configuration handling changes.

---

## 13. Quality gates

| Gate | Tool | Enforced |
|---|---|---|
| Types | `tsc -b` | Yes — part of `build` |
| Lint | oxlint | Manual today |
| Format | Prettier | Manual today |
| Tests | Vitest | Manual today |

**oxlint rather than ESLint** is a deliberate choice for speed, and a deviation from what most React
projects assume; anyone adding a rule should know they are configuring oxlint.

"Manual today" is the honest state: none of these run automatically, because ipie-web has no CI —
see §16.

---

## 14. Deployment

The build output is static and served by the platform's serving layer; there is no Node process in
production. Promotion follows the same branch-to-environment ladder as every service —
`develop`→DEV, `test`→SIT, `uat`→UAT, `preprod`→PPE, `master`→PROD (Development Environment
Configuration §45) — with the same artifact promoted at each step and only `/config.json` differing.

---

## 15. Security posture, including what is wrong

Correct today:

- No secret of consequence is stored client-side beyond what the token flow requires.
- Permission checks in the UI are presentation-only; the services enforce independently.
- The set-password flow carries its one-time token in the request body and uses a client with no
  refresh-and-retry interceptor.
- SSO uses PKCE with a public client.

**Known weaknesses, recorded rather than implied:**

1. **A confidential client's secret is shipped to the browser** (`keycloakClientSecret`). It
   protects nothing there — whether compiled into a bundle or fetched beside it, anyone can read it.
   The password login should move to a public client with PKCE, as the SSO path already does. This
   is the single most valuable change in this document.
2. **Tokens live in `localStorage`**, which is readable by any script that reaches the page, so a
   cross-site scripting flaw becomes account takeover. The alternative — access token in memory,
   refresh token in an HttpOnly cookie — costs a coordinated change with Keycloak and the gateway.
3. **`config.json` is shipped inside `dist/` with local values.** A deployment that forgets to
   replace it starts against `localhost` and fails on first call. Visible rather than silent, but
   the serving layer must overwrite it.
4. **No Content-Security-Policy** is defined by this repository; it must come from the serving layer.

---

## 16. Open items

- [ ] **CI for ipie-web.** No pipeline exists: type-check, lint, format check, tests and build all
      run only when someone remembers. The service template's `Jenkinsfile` is the pattern.
- [ ] **No Dockerfile.** Every backend service has one; ipie-web does not, so there is no defined
      artifact to promote and the deployment story in §14 is aspirational.
- [ ] **Move password login to a public client with PKCE** (§15.1).
- [ ] **UI string catalogue** for Hindi (§10) — the transport works, the strings are not translated.
- [ ] **Code splitting.** The build warns that chunks exceed 500 kB; routes are an obvious split
      boundary.
- [ ] **Reconsider token storage** (§15.2).
- [ ] **Content-Security-Policy** agreed with whoever owns the serving layer.
- [ ] **Accessibility audit** against GIGW 3.0 — Radix gives a good baseline, which is not the same
      as having checked.

---

## 17. Change log

| Date | Change |
|---|---|
| 2026-08-15 | Created. Records the stack as pinned today, and the runtime-configuration change that replaced build-time `VITE_*` substitution so one bundle can be promoted across environments unchanged. |
