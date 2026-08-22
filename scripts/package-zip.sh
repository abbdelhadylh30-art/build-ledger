#!/bin/bash
# Package Build Ledger into a downloadable zip for local use.
# Includes all source + Tauri config + GitHub Actions workflow.
# Excludes: node_modules, .next, out, logs, sandbox-only files, dev artifacts.

set -e

PROJECT_DIR="/home/z/my-project"
OUT_DIR="/home/z/my-project/download"
STAGING="/tmp/build-ledger-pkg"
ZIP_PATH="$OUT_DIR/build-ledger.zip"

rm -rf "$STAGING"
mkdir -p "$STAGING/build-ledger"

# Files and directories to include
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
  ".gitignore"
)

# Explicitly exclude these even if they're inside included dirs
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
    cp -r "$PROJECT_DIR/$item" "$STAGING/build-ledger/"
  fi
done

echo "[2/3] Cleaning excludes from staging..."
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  find "$STAGING" -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
done

echo "[3/3] Creating zip..."
cd "$STAGING"
rm -f "$ZIP_PATH"
zip -rq "$ZIP_PATH" "build-ledger"

echo ""
echo "✅ Packaged to: $ZIP_PATH"
echo ""
echo "Top-level contents:"
ls -la "$STAGING/build-ledger/" | grep -v "^total" | grep -v "^\." | head -20
echo ""
echo "Zip file count + size:"
unzip -l "$ZIP_PATH" | tail -1
du -h "$ZIP_PATH" | cut -f1
