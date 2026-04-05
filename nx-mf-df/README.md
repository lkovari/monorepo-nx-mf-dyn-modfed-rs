# nx-mf-df

Nx workspace demonstrating **dynamic module federation**: a **main host** loads three Angular remotes at runtime using `@module-federation/enhanced` and a host manifest.

## Applications and ports

| App           | Port | Role |
|---------------|------|------|
| `main-host`   | 4200 | Host: shell layout, router, `module-federation.manifest.json` |
| `mf_remote_a` | 4201 | Remote A, exposes `./Routes` |
| `mf_remote_b` | 4202 | Remote B, exposes `./Routes` |
| `mf_remote_c` | 4203 | Remote C, exposes `./Routes` |

## Dynamic federation contract

- **Host manifest** (served by the host): [`apps/main-host/public/module-federation.manifest.json`](apps/main-host/public/module-federation.manifest.json) maps remote names to each remote’s `mf-manifest.json` URL (e.g. `http://localhost:4201/mf-manifest.json`).
- **Bootstrap**: [`apps/main-host/src/main.ts`](apps/main-host/src/main.ts) loads that manifest, calls `registerRemotes`, then bootstraps the Angular app.
- **Routes**: [`apps/main-host/src/app/app.routes.ts`](apps/main-host/src/app/app.routes.ts) uses `loadRemote('mf_remote_a/Routes')` (and `b`, `c`). These keys must stay aligned with:
  - **TS path aliases** in [`tsconfig.base.json`](tsconfig.base.json) (`mf_remote_a/Routes`, etc.)
  - **`exposes`** in each remote’s `module-federation.config.ts` (`./Routes` → `entry.routes.ts`)

Do not rename remote names or expose keys casually; the host, manifest, and paths must stay in sync.

## Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js compatible with this repo’s Angular/Nx versions

## Install

```sh
pnpm install
```

## Clear workspace caches

If remote UI or builds look stale (old `remoteEntry.js`, Nx task outputs, or `dist`), from `nx-mf-df`:

```sh
pnpm run clear-cache
```

See [`STALE_REMOTE_UI.md`](STALE_REMOTE_UI.md) for browser cache steps (`localhost:4200`–`4203`).

## Development: recommended startup (Option A)

Dynamic federation needs the remotes **serving** their `mf-manifest.json` before or while you use the host. Use **four terminals**:

```sh
pnpm exec nx serve mf_remote_a
```

```sh
pnpm exec nx serve mf_remote_b
```

```sh
pnpm exec nx serve mf_remote_c
```

```sh
pnpm exec nx serve main-host
```

Then open:

- Host: http://localhost:4200  
- Remote routes from host: http://localhost:4200/mf_remote_a , `/mf_remote_b`, `/mf_remote_c`

## Optional: host with dev remotes (Option B)

If your Nx setup supports it:

```sh
pnpm exec nx serve main-host --devRemotes=mf_remote_a,mf_remote_b,mf_remote_c
```

If this is unreliable locally, prefer Option A.

## Verify remotes independently

Before debugging the host, confirm each remote and its manifest:

1. Serve each remote (ports 4201–4203).
2. In the browser: `http://localhost:4201`, `4202`, `4203`.
3. Manifest URLs: `http://localhost:4201/mf-manifest.json` (and 4202, 4203).

Only then rely on the host loading federated routes.

## Shared UI library

[`libs/common-ui-lib`](libs/common-ui-lib) exposes `AngularVersion` and `NxVersion`. The host imports them via `@nx-mf-df/common-ui-lib` (see [`tsconfig.base.json`](tsconfig.base.json)).

## Tests

```sh
pnpm exec nx test main-host
pnpm exec nx test common-ui-lib
```

## Workspace graph

```sh
pnpm exec nx graph
```
