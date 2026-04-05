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
