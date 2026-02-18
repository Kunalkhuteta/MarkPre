# MarkPre — Frontend

> Write Markdown. Get beautiful presentations. Instantly.

 **Live:** [markpre.vercel.app](https://markpre.vercel.app)
 **Repo:** [github.com/Kunalkhuteta/MarkPre](https://github.com/Kunalkhuteta/MarkPre)

---

## Overview

MarkPre's frontend is a **React 18 + Vite + TypeScript** single-page application (not Next.js). Users write Markdown in a live editor, preview rendered slides in real time, and can present, export, or share their work. The app communicates with the MarkPre Express backend API for all data operations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Bundler | Vite |
| Routing | React Router v6 |
| State Management | Redux Toolkit |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (via `apiClient`) |
| Notifications | Sonner (toast system) |
| OTP Input | `input-otp` (shadcn) |
| Deployment | Vercel |

---

## Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Redirects to `/login` via `useEffect` |
| `/login` | `Login` | Email + password login form, JWT cookie auth |
| `/register` | `Register` | Sign-up with name, email, password |
| `/verify-email` | `VerifyEmail` | 6-digit OTP input for email verification |
| `/forgot-password` | `ForgotPassword` | Request password reset link |
| `/reset-password-email-sent` | `ResetPasswordEmailSent` | Animated success confirmation |
| `/dashboard` | `Dashboard` | Presentation list, stats, export, delete |
| `/editor` | `Editor` | Create new presentation |
| `/editor/:id` | `Editor` | Edit existing presentation |
| `/present/:id` | `PresentationMode` | Full-screen presentation mode |
| `/presentation/:id` | `PresentationView` | Read-only slide viewer |
| `/themes` | `Themes` | Create and manage custom themes |
| `/assets` | `Assets` | Upload and manage images via Cloudinary |
| `/docs` | `Docs` | In-app documentation (sidebar navigation) |
| `/cli` | `CLI` | CLI tool reference and commands page |

---

## Complete File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── store.ts                  # Redux store setup (configureStore)
│   │   └── hooks.ts                  # Typed useAppDispatch, useAppSelector
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui component library
│   │   │   ├── alert-dialog.tsx      # Confirmation dialogs (delete, unsaved changes)
│   │   │   ├── button.tsx            # Button variants
│   │   │   ├── card.tsx              # Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction
│   │   │   ├── dialog.tsx            # Modal dialogs (AI generate, export, theme)
│   │   │   ├── form.tsx              # Form, FormField, FormItem, FormLabel, FormControl, FormMessage
│   │   │   ├── input-otp.tsx         # 6-digit OTP input for email verification
│   │   │   ├── input.tsx             # Text input
│   │   │   ├── label.tsx             # Form label
│   │   │   ├── radio-group.tsx       # AI style selector (Professional / Casual / Academic / Creative)
│   │   │   ├── sonner.tsx            # Toast notification provider
│   │   │   └── textarea.tsx          # Multiline input (theme description)
│   │   │
│   │   ├── GuestRoute.tsx            # Redirects authenticated users away from /login, /register
│   │   ├── Header.tsx                # Top navigation bar with dark mode toggle, user menu
│   │   ├── ProtectedRoute.tsx        # Redirects unauthenticated users to /login
│   │   ├── MarkdownEditor.tsx        # Markdown text editor component
│   │   ├── SlidePreview.tsx          # Parses markdown, renders slide preview pane
│   │   ├── AssetManager.tsx          # Image picker dialog for inserting assets into editor
│   │   └── theme-provider.tsx        # Dark / light mode context (useTheme hook)
│   │
│   ├── features/
│   │   └── auth/
│   │       ├── authSlice.ts          # Redux slice: user state, isAuthenticated, loading, error
│   │       ├── authThunk.ts          # Async thunks: loginUser, registerUser, logoutUser, getCurrentUser
│   │       └── types.ts              # Auth-related TypeScript types (User, AuthState, LoginPayload, etc.)
│   │
│   ├── hooks/
│   │   └── useAuthGuard.ts           # Custom hook: checks auth state, redirects if not authenticated
│   │
│   ├── layouts/
│   │   └── AppLayout.tsx             # Shared layout wrapper for authenticated pages (Header + Outlet)
│   │
│   ├── lib/
│   │   ├── apiClient.ts              # Axios instance: baseURL from VITE_API_URL, withCredentials: true
│   │   └── utils.ts                  # cn() utility — merges Tailwind class names with clsx + tailwind-merge
│   │
│   ├── pages/
│   │   ├── Home.tsx                  # Redirects to /login on mount
│   │   ├── Login.tsx                 # React Hook Form + Zod login form, Redux loginUser dispatch
│   │   ├── Register.tsx              # Registration form with validation
│   │   ├── VerifyEmail.tsx           # 6-digit OTP verification using input-otp component
│   │   ├── ForgotPassword.tsx        # Email input → POST /auth/forgot-password
│   │   ├── ResetPasswordEmailSent.tsx # Animated SVG success screen
│   │   ├── Dashboard.tsx             # Stats cards, presentation grid, inline rename, export
│   │   ├── Editor.tsx                # Split editor/preview, auto-save, AI, themes, assets
│   │   ├── PresentationMode.tsx      # Full-screen presenter with keyboard nav + grid overview
│   │   ├── PresentationView.tsx      # Read-only slide viewer with arrow navigation
│   │   ├── Themes.tsx                # Theme CRUD with live color preview
│   │   ├── Assets.tsx                # Asset upload, grid, rename, copy Markdown, delete
│   │   ├── Docs.tsx                  # Sidebar docs: intro, markdown syntax, themes, AI, export, CLI
│   │   └── CLI.tsx                   # CLI reference page with copy buttons for all commands
│   │
│   ├── schemas/
│   │   └── auth.schema.ts            # Zod schemas: loginSchema, registerSchema + inferred types
│   │
│   ├── App.tsx                       # Route definitions with ProtectedRoute / GuestRoute wrappers
│   └── main.tsx                      # Entry point: React root, Redux Provider, ThemeProvider
│
├── public/                           # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Features

###  Authentication & Routing

**`ProtectedRoute.tsx`** — Wraps all authenticated pages. If the user is not logged in (checked via Redux `isAuthenticated`), redirects to `/login`.

**`GuestRoute.tsx`** — Wraps public pages like `/login` and `/register`. If user is already authenticated, redirects to `/dashboard` to prevent going back to login.

**`useAuthGuard.ts`** — Custom hook used in components to imperatively guard actions that require auth. Reads from Redux state and handles redirect logic.

**`AppLayout.tsx`** — Shared layout for all authenticated pages. Wraps content with the `Header` component and an `Outlet` (React Router). All dashboard-level routes render through this layout.

**`auth/types.ts`** — TypeScript types for the auth feature: `User`, `AuthState`, `LoginPayload`, `RegisterPayload`, `LoginResponse`.

**`authSlice.ts`** — Redux slice managing `user`, `isAuthenticated`, `loading`, `error`. Updated by fulfilled/rejected thunks.

**`authThunk.ts`** — Contains `loginUser`, `registerUser`, `logoutUser`, `getCurrentUser` as Redux async thunks. `loginUser` checks `requiresVerification` in the response and triggers navigation to `/verify-email` if needed.

---

###  Editor (`/editor/:id`)

- Split-panel: Markdown editor left, live slide preview right
- Toggle preview on/off (`Ctrl+P`)
- Auto-save every 30 seconds (only when `hasUnsavedChanges` is true)
- Unsaved changes dialog on navigation — uses React Router v6 `useBlocker`
- Browser tab close protection via `beforeunload` event
- `useRef` pattern for `markdown`, `title`, `selectedTheme`, `id` — prevents stale closures in `handleSave` (which uses an empty `useCallback` dependency array)
- Theme selector dropdown — applies custom themes to preview live
- Asset Manager dialog — browse uploaded images, inserts `![name](url)` at cursor
- Dark mode toggle via `useTheme` context
- Keyboard shortcuts: `Ctrl+S` save, `Ctrl+P` toggle preview, `F11` fullscreen

---

###  AI Features

Accessed via toolbar buttons in the Editor:

- **AI Generate** (Dialog) — Enter topic, slide count (3–20), style (`professional` / `casual` / `academic` / `creative`) → `POST /api/ai/generate-slides` → replaces editor content
- **AI Improve** — Sends current markdown → `POST /api/ai/improve-slides` → replaces content with improved version

---

###  Presentation Mode (`/present/:id`)

- Full-screen slide renderer with custom theme colors + fonts
- Slides parsed from `content.split("---")`
- Auto-hiding controls (mouse-move resets 3-second timeout)
- Slide grid overview (`G` key) — thumbnail of all slides
- Progress bar at bottom showing completion percentage
- Custom `renderMarkdown()` — parses H1, H2, H3, bullet lists, images (`![alt](url)`), paragraphs
- Dark/light toggle mid-presentation
- Keyboard: `→`/`Space` next, `←` prev, `Home`, `End`, `F` fullscreen, `G` grid, `Esc` exit

---

###  Themes (`/themes`)

- Create themes: name, description, primary color, background color, text color, font family
- Color pickers with hex value display
- Live preview box using selected colors before saving
- Edit mode pre-fills form with existing theme data
- Delete with `window.confirm`

---

###  Assets (`/assets`)

- Upload images (JPEG, PNG, GIF, WebP, SVG — max 5MB) — validated by type and size before upload
- Stats bar: total assets, total storage used, uploads this week
- Grid view with hover overlay: copy Markdown, open URL, rename, delete
- Inline rename with `Enter` to confirm / `Escape` to cancel
- Delete triggers confirmation via `AlertDialog`, removes from Cloudinary + DB

---

###  Dashboard (`/dashboard`)

- Stats: total presentations, slides, words, views — aggregated client-side from API data
- Per card: View (`/presentation/:id`), Edit (`/editor/:id`), Export PDF, Export HTML
- Inline title rename — `Pencil` icon visible on hover, saves on `Enter`/`Check` click
- Delete with `AlertDialog` confirmation

---

###  Docs & CLI Pages

**`Docs.tsx`** — Sidebar-driven documentation with sections: Introduction, Getting Started, Markdown Syntax, Themes & Styling, AI Features, Presentation Mode, Export Options, Keyboard Shortcuts, CLI Tool.

**`CLI.tsx`** — Reference page for the `markpre` Python CLI package (`pip install markpre`). Shows all commands with one-click copy buttons, example output tables, and Windows-specific export examples.

---

## Authentication Flow (Frontend)

```
Register → OTP Email → /verify-email (input-otp) → /dashboard
Login → if !isEmailVerified → new OTP sent → /verify-email → /dashboard
Login → if isEmailVerified → /dashboard
Forgot Password → email link → reset password → /login
```

The `loginSchema` and `registerSchema` in `schemas/auth.schema.ts` are Zod schemas consumed by React Hook Form's `zodResolver`. They validate email format, password minimum length, and required fields before any API call is made.

---

## Utility Files

**`lib/utils.ts`** — Exports the `cn()` function used throughout all shadcn/ui components:
```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

**`lib/apiClient.ts`** — Axios instance:
```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends httpOnly JWT cookies
});
```

**`app/store.ts`** — Redux store with `auth` reducer. Typed `RootState` and `AppDispatch` exported for use with `useAppSelector` / `useAppDispatch` hooks.

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

For production on Vercel, set `VITE_API_URL` to your deployed backend URL.

### Run Locally

```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

1. Connect your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Framework Preset** → `Vite`
3. Set **Root Directory** → `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy — every push to `main` auto-deploys

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server at localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## Related

- 🔧 [Backend README](./README-backend.md) — Express + TypeScript API
- 📦 [CLI README](./README-cli.md) — `pip install markpre` command-line tool

---

## License

MIT © [Kunal Khuteta](https://github.com/Kunalkhuteta)