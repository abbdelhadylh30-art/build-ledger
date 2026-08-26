# Build Ledger

A local-first app for tracking the projects you build — what AI you used, where they're stored, whether they're in your portfolio, and whether they were delivered to a client.

![Build Ledger dashboard](download/tracker-dashboard.png)

---

## Three ways to run it

Pick whichever fits your needs. All three give you the exact same app.

| Option | What you get | Setup time | Best for |
|---|---|---|---|
| **A. Web app (PWA)** | Browser tab + installable desktop shortcut | 5 min | Quick trial, easiest |
| **B. Windows .exe (cloud build)** | Real native installer (.exe + .msi) | 10 min | Sharing with non-technical users |
| **C. Windows .exe (local build)** | Real native installer built on your PC | 20 min | Full control, offline dev |

---

## Option A — Web app / PWA (recommended for trying it out)

### 1. Install prerequisites

You need **Node.js 18.18+**. Download from <https://nodejs.org> if you don't have it.

```bash
node --version  # should print v18.18.0 or higher
```

### 2. Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### 3. Install as a desktop app (optional)

In Chrome or Edge, click the **install icon** in the address bar. You'll get a real desktop shortcut that opens in its own window — looks and feels like a native app, works offline.

For a production build (faster, smaller):

```bash
npm run build
npx serve out
```

Then open the printed URL and install.

---

## Option B — Windows .exe via GitHub Actions (cloud build)

This uses GitHub's free Windows runners to compile the .exe for you. No Rust installation needed on your PC.

### 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Build Ledger v1.0.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/build-ledger.git
git push -u origin main
```

### 2. Create a tagged release

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers the **Build Windows .exe** workflow in `.github/workflows/build-windows.yml`. Watch it build at:

```
https://github.com/YOUR_USERNAME/build-ledger/actions
```

### 3. Download the .exe

Once the build finishes (~5-10 min), go to:

```
https://github.com/YOUR_USERNAME/build-ledger/releases
```

Download either:
- **`Build-Ledger_1.0.0_x64-setup.exe`** — NSIS installer (recommended, smaller)
- **`Build-Ledger_1.0.0_x64_en-US.msi`** — MSI installer (enterprise-friendly)

Double-click to install. Requires Windows 10/11 with WebView2 (preinstalled on most modern systems; if missing, get it from <https://developer.microsoft.com/microsoft-edge/webview2/>).

### Manual trigger

You can also run the build without creating a tag:
1. Go to **Actions** tab in your GitHub repo
2. Select **Build Windows .exe** workflow
3. Click **Run workflow**

Artifacts will be available as workflow artifacts (downloadable for 90 days) instead of as a release.

---

## Option C — Windows .exe built locally

For full control, build the .exe on your own PC.

### 1. Install prerequisites

- **Node.js 18.18+** — <https://nodejs.org>
- **Rust** — <https://rustup.rs> (click, run the installer, restart terminal)
- **Microsoft Visual Studio C++ Build Tools** — <https://visualstudio.microsoft.com/visual-cpp-build-tools/> (select "Desktop development with C++" workload)
- **WebView2** — preinstalled on Windows 10/11, or download from <https://developer.microsoft.com/microsoft-edge/webview2/>

Verify Rust is installed:

```bash
rustc --version
cargo --version
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in dev mode (optional — see the app in a Tauri window)

```bash
npm run tauri:dev
```

The first run takes a few minutes (Rust compiles). Subsequent runs are much faster.

### 4. Build the .exe installer

```bash
npm run tauri:build
```

When done, find your installers in:

```
src-tauri/target/release/bundle/
├── nsis/Build Ledger_1.0.0_x64-setup.exe   ← NSIS installer
└── msi/Build Ledger_1.0.0_x64_en-US.msi    ← MSI installer
```

The portable `.exe` (no installer needed) is at:

```
src-tauri/target/release/Build Ledger.exe
```

---

## How data is stored

All your projects live in your browser's `localStorage` under the key `project-tracker-v1`. In the Tauri desktop app, this persists to:

- **Windows**: `%APPDATA%\com.buildledger.app\EBWebView\Local Storage\`

This means:

- ✅ No signup, no account
- ✅ Works offline
- ✅ Your data never leaves your device
- ⚠️ Clearing app data will wipe your projects — use the **Export** button (top-right) to back up regularly
- ⚠️ Data is per-device — use Export / Import to move between PC and laptop

---

## Features

- **Dashboard** with stat cards (total / in portfolio / delivered / for clients), bar chart of AI tools used, pie chart of storage locations, animated status breakdown, **client pipeline funnel** chart, and merged recent-activity feed (projects + campaigns + clients)
- **Projects list** with search, filters (storage / status / portfolio), and card grid
- **Add/edit form** with AI tool multi-select, conditional client name field, tags, repo/live URLs, markdown notes, and portfolio toggle
- **Clients CRM (new in v1.4.0)** — full client lifecycle: prospect → communication log (method + outcome + notes per touch) → won/lost, with a pipeline kanban board across all 6 stages. Won prospects convert into tracked Build Ledger projects in one click (client name + client status auto-set, client.projectId back-linked, project form pre-filled).
- **Project detail drawer** — slide-over with description, AI tools, tags, client, repo/live links, linked campaigns, recent posts, and markdown notes
- **Client detail drawer** — slide-over with contact meta, follow-up badge, linked-project CTA, full communications timeline, inline "Log" form, and markdown notes
- **Calendar** — month grid with drag-and-drop rescheduling, day detail dialog, per-platform filters, and upcoming-this-week strip
- **Activity timeline** — merged feed of project / campaign / post / client events with per-entity filter chips
- **Command palette** (⌘K) — global search across all entity types + quick actions (navigate / create / edit / export)
- **Keyboard-first** — `n` creates per tab, `/` focuses search, `Esc` closes overlay chain, `?` opens shortcuts reference
- **Onboarding dialog** on first visit with sample data seeding (6 projects, 6 clients across all stages, 4 campaigns, 16 posts)
- **Local-first**: all data in localStorage — no backend, no internet required
- **PWA**: installable from any modern browser
- **Tauri**: ships as a real native Windows .exe
- **Export/Import** to JSON for backups and migration between devices (round-trips projects + clients + campaigns + posts)

---

## File structure

```
build-ledger/
├── .github/
│   └── workflows/
│       └── build-windows.yml   # GitHub Action that builds .exe in cloud
├── public/
│   ├── icons/                  # PWA icons
│   ├── manifest.json
│   ├── sw.js                    # Service worker (for PWA mode)
│   └── favicon.ico
├── scripts/
│   ├── generate-icons.py        # Regenerate PWA + Tauri icons
│   └── package-zip.sh           # Re-package the project zip
├── src/
│   ├── app/
│   │   ├── layout.tsx           # PWA metadata
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── tracker/             # Main app components
│   │   ├── ui/                  # shadcn/ui library
│   │   └── ServiceWorkerRegister.tsx
│   ├── lib/
│   │   ├── projects.ts          # Types, constants
│   │   └── seed-projects.ts     # Sample projects (auto-seeded)
│   └── store/
│       └── projects-store.ts    # Zustand + localStorage
├── src-tauri/                   # Tauri (Rust) project — only needed for .exe build
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/                   # Windows .ico + Tauri icons
│   ├── build.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── next.config.ts               # output: 'export' for static build
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json
└── README.md
```

---

## Customizing

### Change sample seed data

Edit `src/lib/seed-projects.ts`. Once you create or edit any project, the seed is no longer applied.

### Add new AI tool options

Edit `AI_OPTIONS` in `src/lib/projects.ts`:

```ts
export const AI_OPTIONS = ['Claude', 'GPT-5', 'Cursor', /* ... */ , 'Your New Tool']
```

### Add a new storage location or status

Edit `STORAGE_LOCATIONS` or `CLIENT_STATUSES` in `src/lib/projects.ts`.

### Regenerate icons

If you change the brand colors or glyph:

```bash
pip install pillow
python scripts/generate-icons.py
```

For Tauri specifically (regenerates all sizes from the 1024px source):

```bash
npm run tauri:icon
```

### Change the brand name

Search the codebase for `Build Ledger` and replace with your name. Also update:
- `src-tauri/tauri.conf.json` → `productName`
- `src-tauri/Cargo.toml` → `name` and `description`
- `public/manifest.json` → `name` and `short_name`
- `src/app/layout.tsx` → `metadata.title` and `metadata.applicationName`
- `.github/workflows/build-windows.yml` → `releaseName` and `releaseBody`

---

## Tech stack

- **Next.js 16** with `output: 'export'` (static site)
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** + persist middleware
- **Recharts** (charts)
- **Framer Motion** (animations)
- **Tauri 2** (Windows .exe wrapper — optional)

---

## Troubleshooting

### Web app issues

**"next: command not found" after `npm install`**
Run `npx next dev` instead, or reinstall with `npm install next@latest`.

**Port 3000 is already in use**
Run `npm run dev -- -p 3001` to use a different port.

**PWA install option doesn't appear**
You need the production build (`npm run build && npx serve out`) — service workers don't register in dev mode by design.

### Tauri build issues

**`cargo: command not found`**
Install Rust from <https://rustup.rs>, then restart your terminal.

**`error: linker 'link.exe' not found`**
Install the Visual Studio C++ Build Tools (see Option C step 1).

**`tauri: command not found`**
Run `npm install` first — `@tauri-apps/cli` is in devDependencies.

**First build is very slow**
Rust compiles everything from scratch the first time (~5 min). Subsequent builds are much faster due to caching.

**App window opens but shows a blank screen**
Run `npm run dev` in a separate terminal first, then `npm run tauri:dev`. In dev mode Tauri loads from the Next.js dev server.

### GitHub Actions issues

**Build fails on GitHub**
Check the Actions log. Most common cause: a TypeScript error that `ignoreBuildErrors: true` in `next.config.ts` is hiding locally. Run `npm run build` locally to reproduce.

**Release didn't get created**
Make sure you pushed a tag (not just a commit), and that the tag starts with `v` (e.g. `v1.0.0`).

### Lost data

If you cleared your browser/app data, restore from a JSON export if you made one. Otherwise the seed projects will reappear on next launch.

---

## License

MIT — do whatever you want with this.
