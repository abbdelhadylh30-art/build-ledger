#!/usr/bin/env bash
#
# build-ledger-deploy.sh — One-command deploy for Build Ledger v2
#
# What this does:
#   1. Initializes git (if needed)
#   2. Commits all your changes
#   3. Creates a version tag (v2.0.0 by default, or pass your own)
#   4. Pushes to GitHub (you'll need to create the repo first)
#   5. Opens the Actions page so you can watch the .exe build
#   6. When the build finishes (~10 min), opens the Releases page
#
# Usage:
#   ./build-ledger-deploy.sh                  # uses v2.0.0
#   ./build-ledger-deploy.sh v2.1.0           # uses your tag
#   ./build-ledger-deploy.sh v2.1.0 myuser    # uses your GitHub username
#
# Prerequisites:
#   - Git installed (https://git-scm.com)
#   - GitHub account
#   - A GitHub repo already created (empty) — see instructions below
#   - Either SSH key set up OR a Personal Access Token (used by git, not pasted anywhere)
#
# First-time setup (only do this once):
#   1. Go to https://github.com/new
#   2. Repository name: build-ledger
#   3. Set to Private or Public (your choice)
#   4. DO NOT check "Add a README" or any other initializer — leave it empty
#   5. Click Create repository
#   6. Note your GitHub username
#   7. If you haven't already, set up auth:
#      - Option A (recommended): SSH key — see https://docs.github.com/en/authentication/connecting-to-github-with-ssh
#      - Option B: Personal Access Token with "repo" scope — https://github.com/settings/tokens
#        When git prompts you for a password, paste the token. It gets saved to your
#        keychain automatically (Mac) or credential manager (Windows).
#
# Then run this script.

set -e

# --- Config ---
TAG="${1:-v2.0.0}"
GITHUB_USER="${2:-YOUR_GITHUB_USERNAME}"
REPO_NAME="build-ledger"
REMOTE_URL="git@github.com:$GITHUB_USER/$REPO_NAME.git"
# If you prefer HTTPS instead of SSH, comment out the line above and uncomment:
# REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Build Ledger Deploy ===${NC}"
echo "Tag: $TAG"
echo "Repo: $GITHUB_USER/$REPO_NAME"
echo ""

# --- Check prerequisites ---
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed.${NC}"
    echo "Install from https://git-scm.com"
    exit 1
fi

if [ "$GITHUB_USER" = "YOUR_GITHUB_USERNAME" ]; then
    echo -e "${YELLOW}Please provide your GitHub username as the second argument:${NC}"
    echo "  ./build-ledger-deploy.sh $TAG your_username"
    echo ""
    echo -e "${YELLOW}Or edit this script and set GITHUB_USER at the top.${NC}"
    exit 1
fi

# --- Step 1: Initialize git if needed ---
if [ ! -d ".git" ]; then
    echo -e "${GREEN}[1/6] Initializing git...${NC}"
    git init
    git branch -M main
else
    echo -e "${GREEN}[1/6] Git already initialized.${NC}"
fi

# --- Step 2: Configure git identity if not set ---
if [ -z "$(git config user.name)" ]; then
    echo -e "${YELLOW}Git user.name not set. Enter your name:${NC}"
    read -r git_name
    git config user.name "$git_name"
fi
if [ -z "$(git config user.email)" ]; then
    echo -e "${YELLOW}Git user.email not set. Enter your email:${NC}"
    read -r git_email
    git config user.email "$git_email"
fi

# --- Step 3: Add remote if not set ---
if ! git remote get-url origin &> /dev/null; then
    echo -e "${GREEN}[2/6] Adding remote origin...${NC}"
    git remote add origin "$REMOTE_URL"
else
    echo -e "${GREEN}[2/6] Remote already set.${NC}"
    # Update it in case the username changed
    git remote set-url origin "$REMOTE_URL"
fi

# --- Step 4: Stage and commit ---
echo -e "${GREEN}[3/6] Staging files...${NC}"
git add -A

# Check if there's anything to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit.${NC}"
else
    echo -e "${GREEN}[4/6] Committing...${NC}"
    git commit -m "Release $TAG — Build Ledger with marketing campaigns + calendar

What's new in v2:
- Campaigns tab: track marketing campaigns with goals + linked projects
- Calendar tab: month view with drag-and-drop rescheduling
- Posts: track individual posts across 11 platforms with manual metrics
- Dashboard: expanded with marketing stats + campaign goal progress
- Seed data: 4 campaigns + 16 posts across 8 platforms

Original v1 features:
- Projects tab: track projects with AI tools, storage, client status
- Dashboard: stat cards + charts (AI tools, storage, status)
- PWA: installable on desktop + mobile
- Tauri: ships as Windows .exe"
fi

# --- Step 5: Tag ---
echo -e "${GREEN}[5/6] Creating tag $TAG...${NC}"
if git tag -l "$TAG" | grep -q "$TAG"; then
    echo -e "${YELLOW}Tag $TAG already exists. Delete it and recreate? (y/N)${NC}"
    read -r confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        git tag -d "$TAG"
        git push origin :refs/tags/$TAG 2>/dev/null || true
        git tag "$TAG"
    else
        echo "Keeping existing tag."
    fi
else
    git tag "$TAG"
fi

# --- Step 6: Push ---
echo -e "${GREEN}[6/6] Pushing to GitHub...${NC}"
echo ""
echo -e "${YELLOW}If this is your first push, you may be prompted for credentials.${NC}"
echo -e "${YELLOW}For HTTPS: use your Personal Access Token as the password (not your GitHub password).${NC}"
echo -e "${YELLOW}For SSH: make sure your key is added with 'ssh-add ~/.ssh/id_ed25519'.${NC}"
echo ""

git push -u origin main
git push origin "$TAG"

# --- Open Actions page ---
echo ""
echo -e "${GREEN}✅ Pushed successfully!${NC}"
echo ""
echo -e "${GREEN}GitHub Actions is now building your .exe (takes ~10-15 minutes).${NC}"
echo -e "${GREEN}Watch the build here:${NC}"
echo "  https://github.com/$GITHUB_USER/$REPO_NAME/actions"
echo ""
echo -e "${GREEN}When the build finishes, download your .exe here:${NC}"
echo "  https://github.com/$GITHUB_USER/$REPO_NAME/releases/tag/$TAG"
echo ""

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open "https://github.com/$GITHUB_USER/$REPO_NAME/actions" 2>/dev/null || true
elif command -v open &> /dev/null; then
    open "https://github.com/$GITHUB_USER/$REPO_NAME/actions" 2>/dev/null || true
elif command -v start &> /dev/null; then
    start "https://github.com/$GITHUB_USER/$REPO_NAME/actions" 2>/dev/null || true
fi

echo -e "${GREEN}Done. The .exe will be ready in ~10-15 minutes.${NC}"
echo ""
echo -e "${YELLOW}What to do while you wait:${NC}"
echo "  1. Set up Gumroad listing (gumroad.com) — upload the .exe when ready"
echo "  2. Update your hub (stackmint-hub) with the real GitHub + Gumroad URLs"
echo "  3. Write your launch content (see LAUNCH-TWITTER-THREAD.md)"
echo "  4. When the build finishes, download the .exe from the Releases page"
