# monorepo-nx-mf-dyn-modfed-rs
Monorepo Nx Microfrontend with Dynamic module federation - rspack
1. pnpm dlx create-nx-workspace@latest nx-mf-df --preset=apps
2. cd nx-mf-df
3. pnpm exec nx add @nx/angular
4. pnpm add -D @nx/module-federation
5. pnpm exec nx g @nx/angular:host apps/main-host \
  --remotes=mf_remote_a,mf_remote_b,mf_remote_c \
  --dynamic \
  --bundler=rspack \
  --prefix=nxmfdf \
  --style=css \
  --standalone \
  --interactive=false
  6. pnpm exec nx g @nx/angular:library libs/common-ui-lib \
  --buildable \
  --prefix=nxmfdf \
  --style=css \
  --standalone \
  --interactive=false
  7. pnpm exec nx g @nx/angular:component \
  --path=libs/common-ui-lib/src/lib/angular-version/angular-version \
  --standalone \
  --export \
  --no-interactive
  8. pnpm exec nx g @nx/angular:component \
  --path=libs/common-ui-lib/src/lib/nx-version/nx-version \
  --standalone \
  --export \
  --no-interactive
  9. pnpm exec nx g @nx/angular:component \
  --path=apps/main-host/src/app/shared/components/header/header \
  --standalone \
  --no-interactive
10. pnpm exec nx g @nx/angular:component \
  --path=apps/main-host/src/app/shared/components/main/main \
  --standalone \
  --no-interactive
11. pnpm exec nx g @nx/angular:component \
  --path=apps/main-host/src/app/shared/components/footer/footer \
  --standalone \
  --no-interactive
12. pnpm exec nx g @nx/angular:component \
  --path=apps/main-host/src/app/shared/components/layout/layout \
  --standalone \
  --no-interactive
  13. pnpm install tailwindcss @tailwindcss/postcss postcss --force
  14. create postcssrc.json into workspace root 
  15. add to all apps styles.css the @import "tailwindcss";
  16. Implement header, main, footer, and layout logic in the host shell
  17. Implement angular-version, nx-version components in the ui-common-lib
  18. Replaced root `App` template with `<nxmfdf-layout>` — removed `NxWelcome` and duplicate `<router-outlet>`.
  19. Set `App` CSS to `:host { display: block; min-height: 100dvh; }`.
  20. Created standalone `Home` component as the default route landing page.
  21. Rewired `app.routes.ts`: `''` → `Home`, remotes via `loadRemote()`, wildcard redirect to `''`.
  22. Fixed `footer.html` selectors from `<lib-angular-version>` / `<lib-nx-version>` to `<nxmfdf-angular-version>` / `<nxmfdf-nx-version>`.
  23. Updated `footer.css` selectors to target the correct custom element tags.
  24. Removed `apps/main-host/src/app/nx-welcome.ts` and all host references to it.
  25. Verified module federation contracts: `loadRemote` names, `exposes`, `tsconfig` paths, and manifest URLs.
  26. Removed `"dependsOn": ["main-host:serve"]` from `mf_remote_a`, `mf_remote_b`, and `mf_remote_c` `project.json` serve targets.
  27. Added `res.ok` check and error logging in `main.ts` for manifest fetch failures.
  28. Added `Home` link with `routerLink="/"` to `header.html`.
  29. Updated `app.spec.ts`, `layout.spec.ts`, and `header.spec.ts` with `provideRouter([])`.
  13. Replaced generic `README.md` with project-specific ports, manifest info, serve order, and test commands.
  30. Cleared stale remote bundles from `tmp/static-remotes/`, `dist/`, `.nx/cache`, `node_modules/.cache`, and `node_modules/.vite`.
  31. Ran `nx reset` and rebuilt all remotes with `--skip-nx-cache`.
  32. Hard-reloaded browser / cleared site data to flush cached `remoteEntry.js` and chunks.

---

## 1. Angular-Rspack

This workspace builds the host and remote Angular applications with **Rspack** through Nx’s **`@nx/angular-rspack`** integration, instead of the default Angular Webpack or Vite app builder.

**Purpose.** Rspack is the bundler that compiles TypeScript, templates, styles, and assets for each MFE app. Nx’s Angular-Rspack plugin turns the same style of options you expect from an Angular build (entry, `tsconfig`, assets, dev server, budgets) into an Rspack configuration that stays compatible with the wider Nx and Module Federation toolchain.

**Benefits.**

- **Performance.** Rspack is written in Rust and is aimed at faster cold and incremental builds than typical JavaScript bundlers, which helps when several apps (host + remotes) build and rebuild in parallel.
- **Webpack-aligned API.** Rspack’s configuration surface is close to Webpack’s, which makes it practical to **merge** small Webpack-only pieces (such as Nx Module Federation plugins) into the generated Rspack config without maintaining two separate full bundler stacks.
- **Nx integration.** Declared dependencies such as `@nx/angular-rspack`, `@nx/rspack`, and `@rspack/core` keep `nx build` / `nx serve` aligned with the rest of the Nx graph (caching, task inference).

**Where it is set.**

| Concern | Location |
|--------|----------|
| Rspack-related packages | `nx-mf-df/package.json` (`@nx/angular-rspack`, `@nx/rspack`, `@rspack/cli`, `@rspack/core`, `@rspack/dev-server`) |
| Nx infers `build` / `serve` from Rspack | `nx-mf-df/nx.json` — plugin `"@nx/rspack/plugin"` |
| Per-app Rspack + Angular options | `nx-mf-df/apps/main-host/rspack.config.ts`, `nx-mf-df/apps/mf_remote_a/rspack.config.ts`, `nx-mf-df/apps/mf_remote_b/rspack.config.ts`, `nx-mf-df/apps/mf_remote_c/rspack.config.ts` — each calls `createConfig` from `@nx/angular-rspack` and merges in the federation `webpack.config.ts` via `webpack-merge` |
| Module Federation plugins merged into the bundle config | `nx-mf-df/apps/*/webpack.config.ts` — `NxModuleFederationPlugin` and `NxModuleFederationDevServerPlugin` |

---

## 2. Dynamic Module Federation

**Purpose.** The shell (**main-host**) does not hard-code remote entry URLs only at build time. Instead it discovers **where each remote is served** (for example per environment) using a **host manifest**, then registers those remotes at **runtime** before Angular boots. Lazy routes load federated modules when the user navigates. That keeps deployments flexible: you can point the same host build at different remote URLs without rebuilding for every URL change.

**How it works (high level).**

1. On startup, the host fetches **`/module-federation.manifest.json`** (served from `nx-mf-df/apps/main-host/public/`), which maps logical remote names to each remote’s **`mf-manifest.json`** URL (for example `http://localhost:4201/mf-manifest.json`).
2. The host calls **`registerRemotes`** from `@module-federation/enhanced/runtime` with those entries so the runtime knows how to resolve each remote.
3. After registration succeeds, the host loads **`bootstrap`** and starts Angular.
4. In the router, **`loadRemote(...)`** loads the exposed module (for example `mf_remote_a/Routes`) when the user hits a remote route.

**Where it is set.**

| Piece | Location |
|------|----------|
| Runtime manifest fetch and `registerRemotes` | `nx-mf-df/apps/main-host/src/main.ts` |
| User-facing manifest (remote name → `mf-manifest.json` URL) | `nx-mf-df/apps/main-host/public/module-federation.manifest.json` |
| Host MF name and empty static `remotes` (remotes supplied at runtime) | `nx-mf-df/apps/main-host/module-federation.config.ts` |
| Lazy route loading of federated modules | `nx-mf-df/apps/main-host/src/app/app.routes.ts` — `loadRemote` from `@module-federation/enhanced/runtime` |
| Build-time federation wiring for host and remotes | `nx-mf-df/apps/*/webpack.config.ts` + `nx-mf-df/apps/*/module-federation.config.ts` (exposes, app name, dev server integration) |

**Important parts to keep in sync.**

- **Manifest URLs** in `module-federation.manifest.json` must match where each remote’s dev server or deployment actually serves **`mf-manifest.json`**.
- **`loadRemote` strings** in `app.routes.ts` must match the **`exposes`** keys in each remote’s `module-federation.config.ts` (for example `mf_remote_a/Routes`).
- **Remote names** in the manifest must match the names used in `loadRemote` and in each remote’s federation config `name`.
- **Ports** for host (4200) and remotes (4201–4203) are defined in each app’s `rspack.config.ts` `devServer` and should match the manifest in local development.

For day-to-day commands, ports, and serve order, see `nx-mf-df/README.md`.
