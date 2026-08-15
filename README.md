# ipie-web

React 19 + Vite frontend for the iPIE platform. Ships with Redux Toolkit/RTK Query, Tailwind CSS
v4 + shadcn/ui, Axios and Vitest, plus a login screen that authenticates against Keycloak and a
Users screen backed by `ipie-service-template`'s `UserController`.

## Prerequisites

Start the backend stack first (from the repo root):

```bash
docker compose up -d
```

This brings up Postgres, Kafka, Jaeger, Keycloak (realm `ipie`, seeded users `testuser` /
`readonlyuser`, both password `testpass`, on `http://localhost:8080`) and `ipie-service-template`
on `http://localhost:8091`.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and sign in with `testuser` / `testpass`.

`.env.development` already points at the local docker-compose stack (`VITE_API_BASE_URL`,
`VITE_KEYCLOAK_*`). Login performs a Resource Owner Password Credentials grant directly against
Keycloak's token endpoint (`ipie-service-template`'s Keycloak client has direct access grants
enabled and no standard/redirect flow) - see `docker-compose.yml`'s own quick-start comment for
the equivalent curl call, or `Development_Environment_Configuration.md`'s "Testing the API with
Postman" section for every endpoint, header and request body needed to build requests by hand in
Postman (no collection file is checked into this repository). The access token is then sent as a
Bearer token to the backend API.

Note: this embeds the Keycloak client secret in frontend code, matching the existing local-dev
Keycloak client config (confidential client, secret committed in
`deploy/keycloak/realm-export.json`). Fine for this local stack; do not reuse this pattern against
a real environment without first switching to a public client / PKCE.

## Scripts

- `npm run dev` - Vite dev server
- `npm run build` - typecheck + production build
- `npm run test` - Vitest + Testing Library (single run)
- `npm run test:watch` - Vitest in watch mode
- `npm run lint` - oxlint

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
