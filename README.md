# TaskFlow

> A clean, local-first todo app that organizes projects, tasks, sub-tasks, attachments, comments, and time tracking — all in your browser, no backend.
<div align="center">
[![Live demo](https://img.shields.io/badge/demo-live-3525cd?style=flat-square)](https://kazumi500.github.io/todo-9f0dbea1/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)
![Made with vanilla ES modules](https://img.shields.io/badge/stack-ES%20modules%20%2B%20Tailwind-3525cd?style=flat-square)
</div>
<div align="center">

![TaskFlow preview](https://api.pikwy.com/web/6a4b96e22f00347bef413ee5.jpg)

</div>

---

## ✨ Features

- **📁 Projects** — group tasks into named projects; first project is auto-created as `Inbox`.
- **✅ Tasks** — create, edit, complete, delete; priority (low/medium/high) + due date with overdue highlighting.
- **🗒️ Sub-tasks** — nested checklists per task with live progress counter.
- **🎨 Detail modal** — single-page view per task: description, sub-tasks, notes, attachments, comments, time tracking, priority badge, assignee.
- **⏱ Time tracking** — start/stop timer on any task; per-minute tick; persisted in `localStorage`.
- **💬 Activity** — append-only comment thread per task; sorted newest first.
- **📎 Attachments** — named file placeholders per task.
- **🌗 Responsive** — desktop sidebar (`md+`) and a mobile drawer that fills the viewport (`<768px`).
- **⚡ Splash loader** — branded loading screen with rotating ring + spinner that respects `prefers-reduced-motion`.
- **💾 Local-first** — every change is persisted to `localStorage` synchronously, no server required.

## 🧱 Tech stack

- **[Tailwind CSS v4](https://tailwindcss.com/)** with a custom Material 3 palette (`@theme` tokens)
- **[date-fns](https://date-fns.org/)** for date formatting, comparisons, and "Today / Tomorrow" labels
- **Vanilla ES modules** — no framework runtime, no build step beyond webpack
- **[Webpack 5](https://webpack.js.org/)** + `HtmlWebpackPlugin` + PostCSS pipeline

## 🚀 Quick start

Requires Node.js 18+.

```bash
git clone https://github.com/Kazumi500/todo-9f0dbea1.git
cd todo-9f0dbea1
npm install
npm run dev      # webpack-dev-server with HMR at http://localhost:3000
```

For a production bundle:

```bash
npm run build    # outputs static assets into dist/
```

## 🗂 Project structure

```
src/
├── index.html              # static HTML scaffold
├── index.js                # entry: DOMContentLoaded → initUI()
├── modules/
│   ├── app.js              # App singleton + project/todo CRUD
│   ├── dom.js              # UI rendering + event handlers + modals + splash loader
│   ├── project.js          # Project factory with methods + active/done getters
│   ├── storage.js          # localStorage persistence (saveProjects / loadProjects)
│   └── todo.js             # Todo factory with methods + id + priority getters
└── styles/
    └── style.css           # Tailwind v4 entry + theme tokens + custom CSS

dist/                        # webpack output (gitignored; deployed to gh-pages)
webpack.config.js            # webpack + postcss pipeline
postcss.config.js            # tailwindcss + autoprefixer
```

## ⌨️ Scripts

| Script            | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | webpack-dev-server with HMR at `localhost:3000`    |
| `npm run build`   | production bundle into `dist/`                     |

## ⌨️ Keyboard shortcuts

| Shortcut                 | Action                  |
| ------------------------ | ----------------------- |
| `Cmd / Ctrl + K`         | Open **New Task** modal |
| `Cmd / Ctrl + Shift + N` | Open **New Project** modal |
| `Escape`                 | Close any open modal    |

## 🌐 Deployment

This repo deploys the bundled `dist/` folder to the `gh-pages` branch, which [GitHub Pages](https://pages.github.com/) serves at:

> **<https://kazumi500.github.io/todo-9f0dbea1/>**

The deployment flow is:

1. `npm run build` → writes `dist/index.html` + `dist/bundle.js`.
2. Push the contents of `dist/` to the `gh-pages` branch.
3. GitHub Pages builds the branch and serves it.

> ⚠ **Security note:** the current manual deployment embeds a personal access token (PAT) in the git remote URL. Treat any such token as ephemeral — **rotate it** at GitHub → Settings → Developer settings → Personal access tokens once you're done with this session.

## ♿ Accessibility

- `role="status"` + `aria-label` on the splash loader so screen readers announce the load.
- `aria-hidden="true"` on the decorative spinner ring.
- The splash spinner honors **`prefers-reduced-motion: reduce`** (becomes a static dot instead of a perpetually rotating ring).
- Modal close on `Escape` + backdrop click where applicable.
- Color tokens are Material 3 defaults chosen against WCAG AA contrast targets.

## 🌐 Browser support

Tested on modern Chromium, Firefox, and Safari (latest two versions each). Uses ES modules, CSS `:has`, `inset-0`, and CSS custom properties — older browsers may break.

## 🩺 Known limitations

- **One user, one device.** Data lives in `localStorage` only; no cross-device sync.
- **Single active time tracker at a time.** Starting a new one stops the previous timer implicitly.
- **Mobile → desktop resize edge case** — the drawer's positioning classes stick around if the viewport crosses 768px while open, until the next toggle. Mitigation: refresh or close/reopen the drawer.

## 🛣 Roadmap ideas

- Service worker for true offline support (PWA installable).
- GitHub Actions CI/CD deploying on every push to `main`, replacing the manual token-based flow.
- Code-splitting / lazy-loading the detail modal to drop the bundle under 250 KiB.
- Cross-device sync via GitHub Gist, IndexedDB export, or a free-tier KV store.

## 🪪 License

[MIT](./LICENSE) — Copyright © 2026 Kazumi500.
