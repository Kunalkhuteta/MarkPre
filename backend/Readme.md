# MarkPre — Backend

> Express + TypeScript REST API powering the MarkPre presentation platform.

📦 **Repo:** [github.com/Kunalkhuteta/MarkPre](https://github.com/Kunalkhuteta/MarkPre)
🌐 **Frontend:** [markpre.vercel.app](https://markpre.vercel.app)

---

## Overview

The MarkPre backend is a **Node.js + Express + TypeScript** REST API. It handles user authentication (JWT + cookies + OTP email verification), presentation CRUD, AI slide generation, custom theme management, and image asset uploads via Cloudinary. Data is persisted in **MongoDB** via Mongoose.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access + refresh tokens) + bcryptjs |
| Email | Nodemailer (OTP + password reset) |
| File Upload | Multer + Cloudinary |
| PDF Export | Puppeteer (headless Chrome) |
| HTML Export | Custom Handlebars templates |
| Security | Helmet, CORS |
| Logging | Morgan |
| Deployment | Render (free tier) |

---

## API Routes

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register user, send OTP email | ❌ |
| POST | `/login` | Login, returns JWT cookies | ❌ |
| POST | `/logout` | Clear JWT cookies | ✅ |
| GET | `/me` | Get current logged-in user | ✅ |
| POST | `/forgot-password` | Send password reset email link | ❌ |
| POST | `/reset-password/:token` | Reset password via token | ❌ |
| POST | `/send-verification-otp` | Resend email verification OTP | ✅ |
| POST | `/verify-email` | Verify email with 6-digit OTP | ✅ |
| POST | `/refresh-token` | Rotate access + refresh tokens | ❌ |

### Presentations — `/api/presentations`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/create-new-presentation` | Create a new presentation | ✅ |
| GET | `/get-all-presentations-for-user` | List all user presentations | ✅ |
| GET | `/get-presentation/:id` | Get single presentation (increments views) | ✅ |
| PUT | `/update-presentation/:id` | Update title, content, theme | ✅ |
| DELETE | `/delete-presentation/:id` | Delete presentation | ✅ |
| GET | `/export/:id?format=pdf\|html` | Export presentation as PDF or HTML | ✅ |

### Themes — `/api/themes`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/add-theme` | Create custom theme | ✅ |
| GET | `/get-all-themes-for-user` | Get all user themes | ✅ |
| GET | `/get-theme/:id` | Get theme by ID | ✅ |
| PUT | `/update-theme/:id` | Update theme | ✅ |
| DELETE | `/delete-theme/:id` | Delete theme | ✅ |
| GET | `/public` | Get all themes (public) | ❌ |

### Assets — `/api/assets`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/upload` | Upload image to Cloudinary | ✅ |
| GET | `/` | Get all user assets | ✅ |
| GET | `/:id` | Get single asset | ✅ |
| PUT | `/:id` | Rename asset | ✅ |
| DELETE | `/:id` | Delete from Cloudinary + DB | ✅ |

### AI — `/api/ai`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/generate-slides` | Generate slides from topic | ✅ |
| POST | `/improve-slides` | Improve existing slide content | ✅ |
| POST | `/generate-speaker-notes` | Generate speaker notes for a slide | ✅ |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server status + timestamp |
| GET | `/health` | Health check |

---

## Authentication Flow

MarkPre uses a dual-token system with `httpOnly` cookies:

1. **Register** (`POST /api/auth/register`)
   - Creates user, hashes password with bcrypt
   - Generates 6-digit OTP, hashes it, stores with 10-minute expiry
   - Sends OTP to user's email via Nodemailer

2. **Login** (`POST /api/auth/login`)
   - Validates credentials
   - **If email not verified:** generates new OTP, sets auth cookies (so `/verify-email` is accessible), returns `requiresVerification: true`
   - **If verified:** sets `accessToken` + `refreshToken` cookies, returns user data

3. **Verify Email** (`POST /api/auth/verify-email`)
   - Compares submitted OTP with hashed OTP in DB
   - Checks expiry (10 minutes)
   - Sets `isEmailVerified = true`

4. **Token Refresh** (`POST /api/auth/refresh-token`)
   - Verifies refresh token from cookie
   - Rotates both access and refresh tokens

5. **Forgot Password**
   - Sends time-limited reset link to email
   - `POST /reset-password/:token` validates token and hashes new password

---

## Data Models

### User
```
name, email, password (hashed), isEmailVerified,
emailVerificationToken (hashed OTP), emailVerificationTokenExpiry,
refreshToken, plan, createdAt, updatedAt
```

### Presentation
```
title, content (Markdown string), theme (ref → Theme),
user (ref → User), slideCount, wordCount, viewCount,
exportCount, isPublic, lastEditedAt, createdAt, updatedAt
```
> Slide count is computed by splitting `content` on `---` separators.

### Theme
```
name, description, primaryColor, backgroundColor,
textColor, fontFamily, user (ref → User), createdAt, updatedAt
```

### Asset
```
user (ref → User), name, originalName, url (Cloudinary),
size, mimeType, width, height, createdAt, updatedAt
```

---

## AI Service

The AI service (`/services/ai.service.ts`) exposes three functions:

- **`generateSlidesWithAI({ topic, slideCount, style, language })`** — Generates complete Markdown presentation. Accepts styles: `professional`, `casual`, `academic`, `creative`. Slide count: 1–20.
- **`improveSlidesWithAI(content)`** — Takes existing Markdown content and returns enhanced version.
- **`generateSpeakerNotes(slideContent)`** — Generates speaker notes for a given slide.

---

## Export System

Presentations are exported via `exportUtils.ts`:

- **PDF** (`exportToPDF`) — Uses **Puppeteer** to render slides with full theme (colors, font family) into a temp PDF file, streams it to the response, then deletes the temp file.
- **HTML** (`exportToHTML`) — Renders slides into a self-contained HTML file using **Handlebars** templates with embedded CSS for theme styling, keyboard navigation support, and fullscreen mode.

Export count is incremented on each export call.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # MongoDB connection
│   │   ├── cloudinary.ts       # Cloudinary SDK setup
│   │   ├── mailer.ts           # Nodemailer transport + sendMail()
│   │   ├── OTPGenerator.ts     # generateSixDigitsOTP()
│   │   └── constants.ts        # cookieOptions, etc.
│   ├── controllers/
│   │   ├── auth.controller.ts  # Register, login, logout, OTP, reset
│   │   ├── presentation.controller.ts
│   │   ├── theme.controller.ts
│   │   ├── asset.controller.ts
│   │   └── ai.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── presentation.model.ts
│   │   ├── theme.model.ts
│   │   └── asset.model.ts
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── presentation.route.ts
│   │   ├── theme.route.ts
│   │   ├── asset.route.ts
│   │   └── ai.route.ts
│   ├── services/
│   │   ├── auth.service.ts     # register(), login(), logout(), forgotPassword(), resetPassword()
│   │   └── ai.service.ts       # generateSlidesWithAI(), improveSlidesWithAI(), generateSpeakerNotes()
│   ├── middleware/
│   │   └── auth.middleware.ts  # Verifies JWT from cookie, attaches req.user
│   ├── utils/
│   │   ├── asyncHandler.ts     # Wraps async controllers to catch errors
│   │   ├── ApiResponse.ts      # Standard { success, message, data } response
│   │   ├── ApiError.ts         # Standard error class with statusCode
│   │   └── exportUtils.ts      # exportToPDF(), exportToHTML() with Puppeteer + Handlebars
│   └── index.ts                # Express app setup, routes, CORS, server start
├── templates/                  # Handlebars (.hbs) templates for HTML export
├── .env                        # Environment variables (not committed)
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP email account (Gmail, Mailtrap, etc.)

### Installation

```bash
git clone https://github.com/Kunalkhuteta/MarkPre.git
cd MarkPre/backend
npm install
```

### Environment Variables

Create a `.env` file in `backend/`:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/markpre

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=MarkPre <your@gmail.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRY=3600000
```

### Running Locally

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

API runs at [http://localhost:8000](http://localhost:8000)  
Swagger / health check: [http://localhost:8000/health](http://localhost:8000/health)

---

## CORS Configuration

The server accepts requests from multiple origins configured via `FRONTEND_URL` (comma-separated for multiple):

```env
FRONTEND_URL=https://markpre.vercel.app,https://your-other-domain.com
```

Localhost origins `http://localhost:5173` and `http://localhost:3000` are always allowed in development.

---

## Deployment (Render)

1. Connect your GitHub repo on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/index.js`
5. Add all environment variables in the Render dashboard
6. Set `NODE_ENV=production`

> **Note:** The free tier on Render spins down after 15 minutes of inactivity. The first request after sleep may take 30–60 seconds to respond. Subsequent requests are fast.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with ts-node / nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start compiled production server |
| `npm run lint` | Run ESLint |

---

## Related

- 🖥️ [Frontend README](./README-frontend.md) — React + Vite web app
- 📦 [CLI README](./README-cli.md) — `pip install markpre` command-line tool

---

## License

MIT © [Kunal Khuteta](https://github.com/Kunalkhuteta)