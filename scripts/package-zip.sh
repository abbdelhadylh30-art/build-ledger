#!/bin/bash
# Package Stackmint Hub into a downloadable zip.

set -e

PROJECT_DIR="/home/z/my-project"
OUT_DIR="/home/z/my-project/download"
STAGING="/tmp/stackmint-pkg"
ZIP_PATH="$OUT_DIR/stackmint-hub.zip"

rm -rf "$STAGING"
mkdir -p "$STAGING/stackmint-hub"

INCLUDE=(
  "src"
  "public"
  "scripts"
  "src-tauri"
  ".github"
  "package.json"
  "tsconfig.json"
  "next.config.ts"
  "tailwind.config.ts"
  "postcss.config.mjs"
  "eslint.config.mjs"
  "components.json"
  "README.md"
  "9-DAY-PLAYBOOK.md"
  ".gitignore"
)

EXCLUDE_PATTERNS=(
  "node_modules"
  ".next"
  "out"
  "target"
  "dev.log"
  "server.log"
  "*.log"
  ".DS_Store"
  "gen"
  "bun.lock"
)

echo "[1/3] Copying files to staging..."
for item in "${INCLUDE[@]}"; do
  if [ -e "$PROJECT_DIR/$item" ]; then
    cp -r "$PROJECT_DIR/$item" "$STAGING/stackmint-hub/"
  fi
done

echo "[2/3] Cleaning excludes..."
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  find "$STAGING" -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
done

echo "[3/3] Creating zip..."
cd "$STAGING"
rm -f "$ZIP_PATH"
zip -rq "$ZIP_PATH" "stackmint-hub"

echo ""
echo "✅ Packaged to: $ZIP_PATH"
echo ""
echo "Top-level contents:"
ls -la "$STAGING/stackmint-hub/" | grep -v "^total" | grep -v "^\." | head -20
echo ""
echo "Zip stats:"
unzip -l "$ZIP_PATH" | tail -1
du -h "$ZIP_PATH" | cut -f1
