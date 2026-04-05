#!/bin/bash
set -e

REPO_NAME="monorepo-nx-mf-dyn-modfed-rs"
BASE_HREF="/${REPO_NAME}/"
DIST_DIR="dist/apps"
GH_PAGES_DIR="dist/gh-pages"

echo "🧹 Cleaning previous gh-pages build..."
rm -rf "${GH_PAGES_DIR}"

echo "🔨 Building all apps in production mode..."
npx nx run-many --target=build --projects=main-host,mf_remote_a,mf_remote_b,mf_remote_c --configuration=production --parallel=4

echo "📦 Assembling gh-pages output..."
mkdir -p "${GH_PAGES_DIR}"

# Copy host build as the root
cp -r ${DIST_DIR}/main-host/browser/* "${GH_PAGES_DIR}/"

# Copy each remote into its own subfolder and patch publicPath
for remote in mf_remote_a mf_remote_b mf_remote_c; do
  mkdir -p "${GH_PAGES_DIR}/${remote}"
  cp -r ${DIST_DIR}/${remote}/browser/* "${GH_PAGES_DIR}/${remote}/"

  # Patch publicPath in remote mf-manifest.json so chunks resolve correctly
  if [ -f "${GH_PAGES_DIR}/${remote}/mf-manifest.json" ]; then
    sed -i.bak "s|\"publicPath\": *\"auto\"|\"publicPath\": \"${BASE_HREF}${remote}/\"|" "${GH_PAGES_DIR}/${remote}/mf-manifest.json"
    rm -f "${GH_PAGES_DIR}/${remote}/mf-manifest.json.bak"
  fi
done

# Patch index.html base href for gh-pages
sed -i.bak "s|<base href=\"/\"|<base href=\"${BASE_HREF}\"|" "${GH_PAGES_DIR}/index.html"
rm -f "${GH_PAGES_DIR}/index.html.bak"

# Patch host mf-manifest.json publicPath
if [ -f "${GH_PAGES_DIR}/mf-manifest.json" ]; then
  sed -i.bak "s|\"publicPath\": *\"auto\"|\"publicPath\": \"${BASE_HREF}\"|" "${GH_PAGES_DIR}/mf-manifest.json"
  rm -f "${GH_PAGES_DIR}/mf-manifest.json.bak"
fi

# Patch module-federation manifest to point to gh-pages URLs
cat > "${GH_PAGES_DIR}/module-federation.manifest.json" << EOF
{
  "mf_remote_a": "${BASE_HREF}mf_remote_a/mf-manifest.json",
  "mf_remote_b": "${BASE_HREF}mf_remote_b/mf-manifest.json",
  "mf_remote_c": "${BASE_HREF}mf_remote_c/mf-manifest.json"
}
EOF

# Add 404.html for SPA routing on GitHub Pages
cp "${GH_PAGES_DIR}/index.html" "${GH_PAGES_DIR}/404.html"

# Add .nojekyll to prevent GitHub Pages from ignoring files starting with _
touch "${GH_PAGES_DIR}/.nojekyll"

echo "✅ gh-pages build ready at: ${GH_PAGES_DIR}"
