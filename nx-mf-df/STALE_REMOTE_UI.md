# Stale remote UI (e.g. old “Welcome mf_remote_a 👋” text)

## Root cause

1. **The source of truth no longer contains that copy**  
   There is no `Hello there`, `Welcome mf_remote_a`, or `👋` anywhere under `nx-mf-df/` (search the repo). The welcome heading for remote A is defined only in the inline template in  
   `apps/mf_remote_a/src/app/remote-entry/nx-welcome.ts` (inside the `NxWelcome` component), and is shown because `RemoteEntry` renders `<nxmfdf-nx-welcome>`.

2. **Therefore the browser is not running the current TypeScript**  
   What you see is an **older JavaScript bundle** for the remote still being executed. The UI is “wrong” because **loaded assets are stale**, not because Angular is reading a hidden string from elsewhere.

3. **Why it happens most often (mechanisms)**

   | Mechanism | What goes wrong |
   |-----------|-----------------|
   | **Browser HTTP cache** | In dev, Module Federation often loads stable URLs such as `http://localhost:4201/remoteEntry.js` (and related chunks). Browsers may **cache** those responses. After you edit `nx-welcome.ts`, the **server** serves new JS, but the **browser** may still use the **cached** `remoteEntry.js` / chunks until cache is cleared or bypassed. |
   | **Host + remote lifecycle** | The host loads the remote from URLs in `apps/main-host/public/module-federation.manifest.json`. If the **remote dev server** was not running or was an **old process**, you might briefly get errors or old behavior; after fixes, a cached script can still stick until hard reload / clear storage. |
   | **`serve-static` / `dist/`** | If you run **`nx serve-static mf_remote_a`** (or similar) using output in `dist/apps/mf_remote_a`, you are serving **built files**. An old **`nx build`** output (or a build that **read Nx’s build cache**) can sit in `dist/` until you rebuild with **`--skip-nx-cache`** or delete `dist` and rebuild. **`nx serve`** normally compiles in memory; **`serve-static`** does not auto-track your latest edits. |
   | **SPA without full reload** | Less common, but a **full page reload** after remote restarts is the safest way to ensure a new remote container and scripts load. |

   **Nx task cache** (`nx.json` / `nx reset`) speeds up **`nx build`** and tests. It does **not** explain stale UI by itself when you only use **`nx serve`** with hot reload, unless you are actually **serving old `dist/`** as above.

4. **Mitigation in this repo**  
   Each app’s `rspack.config.ts` sets **`devServer.headers['Cache-Control']`** to **`no-store, no-cache, …`** so **rspack dev-server** tells the browser not to reuse cached `remoteEntry.js`, `mf-manifest.json`, and chunks on `localhost`. **Restart `nx serve` after pulling changes** so this applies. Any cache created **before** this change must still be cleared once (browser **Clear site data** or hard reload).

## Fix procedure (recommended order)

### Workspace tool caches (Nx, dist, bundler)

From the `nx-mf-df` directory:

```sh
pnpm run clear-cache
```

This runs [`scripts/clear-cache.sh`](scripts/clear-cache.sh): **`nx reset`**, removes **`dist/`**, **`.nx/cache`**, **`node_modules/.cache`**, **`node_modules/.vite`**. It does **not** clear the browser; do that separately below.

### A. Dev workflow (`nx serve` on host + remotes)

1. Stop **all** running `nx serve` processes (host and every remote).
2. Start **remotes** first (`mf_remote_a` / `b` / `c`), then **main-host**.
3. In the browser (for **both** origins you use, e.g. `localhost:4200` and `localhost:4201`):
   - Open DevTools → **Application** → **Storage** → **Clear site data**,  
     **or**
   - **Empty cache and hard reload** (Chrome: keep DevTools open → right‑click reload button).
4. Optional: use a **private/incognito** window once to confirm you see the latest template with no old cache.

### B. If you use `serve-static` or inspect `dist/`

1. Remove old output, e.g.  
   `rm -rf dist/apps/mf_remote_a dist/apps/mf_remote_b dist/apps/mf_remote_c`  
   (adjust to what you actually serve).
2. Rebuild without relying on a stale cache:  
   `pnpm exec nx run mf_remote_a:build --skip-nx-cache`  
   (repeat per remote as needed).

### C. Nx daemon / graph cache (when builds behave oddly)

```sh
pnpm exec nx reset
```

This clears the **Nx** local cache and daemon state; use when you suspect corrupted or confusing **build** cache behavior—not usually the first step for **`serve`** + browser cache.

### D. Verify you are hitting the right remote

- Host manifest: `apps/main-host/public/module-federation.manifest.json` → remote URLs (default `http://localhost:4201` etc.).
- After a remote restarts, ensure nothing else is bound to that port (**EADDRINUSE** can mean another old server is still serving).

## Quick verification

After clearing cache and restarting:

1. Open **only** the remote: `http://localhost:4201` (for A) and confirm the heading matches `nx-welcome.ts`.
2. Then open the host: `http://localhost:4200/mf_remote_a` and confirm it matches.

If (1) is correct but (2) is wrong, clear storage for **4200** as well (host may cache federation manifest or script references).
