# MarkPre — Frontend

> Write Markdown. Get beautiful presentations. Instantly.

🌐 **Live:** [markpre.vercel.app](https://markpre.vercel.app)
📦 **Repo:** [github.com/Kunalkhuteta/MarkPre](https://github.com/Kunalkhuteta/MarkPre)

---

## Overview

MarkPre's frontend is a **React + Vite + TypeScript** single-page application. Users write Markdown in a live editor, preview rendered slides in real time, and can present, export, or share their work. The app communicates with the MarkPre Express backend API for all data operations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Bundler | Vite |
| Routing | React Router v6 |
| State Management | Redux Toolkit |
| UI Components | shadcn/ui (Radix UI) |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (via `apiClient`) |
| Notifications | Sonner (toasts) |
| Deployment | Vercel |

---

## Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Redirects to `/login` |
| `/login` | `Login` | Email + password login with JWT |
| `/register` | `Register` | Sign up with name, email, password |
| `/verify-email` | `VerifyEmail` | 6-digit OTP email verification |
| `/forgot-password` | `ForgotPassword` | Request password reset link |
| `/reset-password-email-sent` | `ResetPasswordEmailSent` | Confirmation screen |
| `/dashboard` | `Dashboard` | View all presentations, stats, export |
| `/editor` | `Editor` | Create new presentation |
| `/editor/:id` | `Editor` | Edit existing presentation |
| `/present/:id` | `PresentationMode` | Full-screen presentation mode |
| `/presentation/:id` | `PresentationView` | Read-only slide viewer |
| `/themes` | `Themes` | Create and manage custom themes |
| `/assets` | `Assets` | Upload and manage images (Cloudinary) |
| `/docs` | `Docs` | In-app documentation |
| `/cli` | `CLI` | CLI tool reference page |

---

## Key Features

### ✍️ Editor (`/editor/:id`)
- Split-panel layout: Markdown editor on the left, live slide preview on the right
- Toggle preview on/off (`Ctrl+P`)
- Auto-save every 30 seconds
- Unsaved changes warning on navigation (uses `useBlocker`)
- Browser tab close protection (`beforeunload` event)
- Theme selector dropdown — apply custom themes live
- Asset Manager — insert uploaded images directly into Markdown
- Keyboard shortcuts: `Ctrl+S` (save), `Ctrl+P` (toggle preview), `F11` (fullscreen)
- Uses `useRef` + `useCallback` pattern to prevent stale closures during auto-save

### 🤖 AI Features
- **AI Generate** — Enter a topic, slide count (3–20), and style (Professional / Casual / Academic / Creative) to generate a full presentation
- **AI Improve** — Sends current Markdown to backend and returns improved content

### 🎞️ Presentation Mode (`/present/:id`)
- Full-screen slide renderer with custom theme support
- Auto-hiding controls (3-second inactivity timeout)
- Grid overview (`G` key) — see all slides at once
- Progress bar at the bottom
- Keyboard shortcuts: `→` / `Space` (next), `←` (prev), `Home`, `End`, `F` (fullscreen), `G` (grid), `Esc` (exit)
- Dark mode toggle during presentation

### 🎨 Themes (`/themes`)
- Create custom themes: primary color, background color, text color, font family
- Live preview before saving
- Edit and delete existing themes
- Themes apply to slides in the editor and presentation mode

### 🖼️ Assets (`/assets`)
- Upload images (JPEG, PNG, GIF, WebP, SVG — max 5MB)
- Images stored on **Cloudinary**
- View total asset count, total size, and uploads this week
- Rename, delete, copy Markdown snippet (`![name](url)`), open in new tab
- Inline image insertion from Asset Manager inside the editor

### 📤 Export
- **PDF** — Full theme colors, syntax highlighting, slide breaks
- **HTML** — Self-contained interactive file with keyboard navigation

### 📊 Dashboard (`/dashboard`)
- Stats: total presentations, total slides, total words, total views
- Per-presentation: View, Edit, Export PDF, Export HTML
- Inline title rename with `Enter` to confirm / `Escape` to cancel
- Delete with confirmation dialog

---

## Authentication Flow

1. **Register** — POST `/api/auth/register` → sends OTP to email
2. **Verify Email** — POST `/api/auth/verify-email` with 6-digit OTP (10-minute expiry)
3. **Login** — POST `/api/auth/login`
   - If email not verified → redirected to `/verify-email` with a new OTP
   - If verified → JWT tokens set as `httpOnly` cookies → redirected to `/dashboard`
4. **Forgot Password** → email link → reset password page
5. **Logout** → clears cookies, clears Redux state

State is managed in Redux with an `auth` slice. The `loginUser` thunk dispatches to the backend and handles the `requiresVerification` flag.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Redux store and typed hooks
│   │   └── hooks.ts
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui components (Button, Input, Dialog…)
│   │   ├── MarkdownEditor.tsx  # CodeMirror / textarea markdown editor
│   │   ├── SlidePreview.tsx    # Renders parsed markdown as slides
│   │   ├── AssetManager.tsx    # Image picker for inserting into editor
│   │   └── theme-provider.tsx  # Dark/light mode context
│   ├── features/
│   │   └── auth/
│   │       ├── authSlice.ts    # Redux slice for auth state
│   │       └── authThunk.ts    # loginUser, registerUser thunks
│   ├── lib/
│   │   └── apiClient.ts        # Axios instance with base URL + credentials
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPasswordEmailSent.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Editor.tsx
│   │   ├── PresentationMode.tsx
│   │   ├── PresentationView.tsx
│   │   ├── Themes.tsx
│   │   ├── Assets.tsx
│   │   ├── Docs.tsx
│   │   └── CLI.tsx
│   ├── schemas/
│   │   └── auth.schema.ts      # Zod schemas for login/register forms
│   ├── App.tsx                 # Route definitions
│   └── main.tsx                # Entry point, Redux Provider
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MarkPre backend running (see [Backend README](./README-backend.md))

### Installation

```bash
git clone https://github.com/Kunalkhuteta/MarkPre.git
cd MarkPre/frontend
npm install
```

### Environment Variables

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

The `apiClient.ts` reads `import.meta.env.VITE_API_URL` as the Axios base URL.

### Run Locally

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

1. Connect your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Framework Preset** to `Vite`
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy — every push to `main` auto-deploys

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## License

MIT © [Kunal Khuteta](https://github.com/Kunalkhuteta)