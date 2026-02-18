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
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access + refresh tokens) + bcryptjs |
| Email | Nodemailer (OTP verification + password reset) |
| File Upload | Multer + Cloudinary SDK |
| PDF Export | Puppeteer (headless Chrome) |
| HTML Export | Handlebars (`.hbs`) templates |
| Validation | Zod schemas + custom validation middleware |
| Security | Helmet, CORS |
| Logging | Morgan |
| Deployment | Render (free tier) |

---

## API Routes

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register user, hash password, send OTP email |
| POST | `/login` | ❌ | Login with email + password, set JWT cookies |
| POST | `/logout` | ✅ | Clear JWT cookies, invalidate refresh token |
| GET | `/me` | ✅ | Get current authenticated user |
| POST | `/forgot-password` | ❌ | Send password reset link to email |
| POST | `/reset-password/:token` | ❌ | Reset password via signed token |
| POST | `/send-verification-otp` | ✅ | Resend 6-digit OTP to user's email |
| POST | `/verify-email` | ✅ | Verify email with 6-digit OTP (10-min expiry) |
| POST | `/refresh-token` | ❌ | Rotate both access and refresh tokens |

### Presentations — `/api/presentations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-new-presentation` | ✅ | Create presentation, auto-compute slideCount + wordCount |
| GET | `/get-all-presentations-for-user` | ✅ | List all presentations for current user |
| GET | `/get-presentation/:id` | ✅ | Get single presentation (increments viewCount for non-owners) |
| PUT | `/update-presentation/:id` | ✅ | Update title, content, theme |
| DELETE | `/delete-presentation/:id` | ✅ | Delete presentation (ownership check) |
| GET | `/export/:id?format=pdf\|html` | ✅ | Export as PDF (Puppeteer) or HTML (Handlebars) |

### Themes — `/api/themes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/add-theme` | ✅ | Create custom theme |
| GET | `/get-all-themes-for-user` | ✅ | Get all themes belonging to current user |
| GET | `/get-theme/:id` | ✅ | Get theme by ID |
| PUT | `/update-theme/:id` | ✅ | Update theme fields |
| DELETE | `/delete-theme/:id` | ✅ | Delete theme |
| GET | `/public` | ❌ | Get all themes (public endpoint) |

### Assets — `/api/assets`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload` | ✅ | Upload image via Multer → Cloudinary |
| GET | `/` | ✅ | Get all assets for current user |
| GET | `/:id` | ✅ | Get single asset (ownership check) |
| PUT | `/:id` | ✅ | Rename asset |
| DELETE | `/:id` | ✅ | Delete from Cloudinary + MongoDB |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/generate-slides` | ✅ | Generate full presentation from topic |
| POST | `/improve-slides` | ✅ | Improve existing Markdown content |
| POST | `/generate-speaker-notes` | ✅ | Generate speaker notes for a slide |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server status, timestamp, environment |
| GET | `/health` | Simple `{ status: "healthy" }` check |

---

## Complete File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                        # Mongoose connection to MongoDB
│   │   ├── cloudinary.ts                # Cloudinary SDK init (cloud_name, api_key, api_secret)
│   │   ├── mailer.ts                    # Nodemailer transport + sendMail(to, subject, template, data)
│   │   ├── OTPGenerator.ts              # generateSixDigitsOTP() — returns 6-digit string
│   │   └── constants.ts                 # cookieOptions (httpOnly, secure, sameSite, maxAge)
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts           # registerUser, loginUser, logoutUser, getCurrentUser,
│   │   │                                #   forgotPassword, resetPassword,
│   │   │                                #   generateEmailVerificationToken, verifyEmail,
│   │   │                                #   refreshAccessToken
│   │   ├── presentation.controller.ts   # createPresentation, getPresentations, getPresentationById,
│   │   │                                #   updatePresentation, deletePresentation, exportPresentation
│   │   ├── theme.controller.ts          # addNewTheme, getThemes, getThemeById,
│   │   │                                #   updateTheme, deleteTheme, publicThemes
│   │   ├── asset.controller.ts          # uploadAsset, getUserAssets, getAssetById,
│   │   │                                #   updateAsset, deleteAsset
│   │   └── ai.controller.ts             # aiGenerateSlides, aiImproveSlides, aiGenerateSpeakerNotes
│   │
│   ├── models/
│   │   ├── user.model.ts                # User schema + generateAccessToken() + generateRefreshToken()
│   │   ├── presentation.model.ts        # Presentation schema with slideCount, wordCount, viewCount
│   │   ├── theme.model.ts               # Theme schema (colors, fontFamily, user ref)
│   │   └── asset.model.ts               # Asset schema (url, size, mimeType, width, height)
│   │
│   ├── routes/
│   │   ├── auth.route.ts                # Auth endpoints mapped to controllers
│   │   ├── presentation.route.ts        # Presentation CRUD routes (all protected)
│   │   ├── theme.route.ts               # Theme routes (mix of protected + public)
│   │   ├── asset.route.ts               # Asset routes with upload.middleware
│   │   └── ai.route.ts                  # AI routes (all protected)
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts               # Zod: registerSchema, loginSchema, forgotPasswordSchema,
│   │   │                                #   resetPasswordSchema, verifyEmailSchema
│   │   ├── presentation.schema.ts       # Zod: createPresentationSchema, updatePresentationSchema
│   │   ├── theme.schema.ts              # Zod: createThemeSchema, updateThemeSchema
│   │   └── user.schema.ts               # Zod: updateUserSchema (profile updates)
│   │
│   ├── services/
│   │   ├── auth.service.ts              # register(), login(), logout(), forgotPassword(), resetPassword()
│   │   └── ai.service.ts                # generateSlidesWithAI(), improveSlidesWithAI(),
│   │                                    #   generateSpeakerNotes()
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts           # Verifies JWT from cookie → attaches req.user
│   │   ├── upload.middleware.ts         # Multer config: disk storage, file type filter (images only),
│   │   │                                #   5MB size limit, temp uploads/ folder
│   │   └── validation.middleware.ts     # Accepts a Zod schema → validates req.body → 400 on failure
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts              # Wraps async route handlers, passes errors to next()
│   │   ├── ApiResponse.ts               # Standard response: { success, statusCode, message, data }
│   │   ├── ApiError.ts                  # Custom error class with statusCode property
│   │   └── exportUtils.ts               # exportToPDF() with Puppeteer, exportToHTML() with Handlebars
│   │
│   ├── types/
│   │   ├── types.d.ts                   # Extends Express Request: declares req.user type globally
│   │   └── user.type.ts                 # UserType interface: _id, name, email, isEmailVerified, plan
│   │
│   └── index.ts                         # Express app entry: CORS, Helmet, Morgan, routes, error handler
│
├── templates/                           # Handlebars email + export templates
│   ├── email-verification-otp.hbs       # OTP email: renders 6 digit boxes with user name
│   ├── email-verified-success.hbs       # Success email sent after verification
│   └── forgot-password-email.hbs        # Password reset email with signed reset link
│
├── uploads/                             # Temp folder for Multer before Cloudinary upload (auto-cleared)
├── .env                                 # Environment variables (never committed)
├── tsconfig.json
└── package.json
```

---

## Authentication Flow

MarkPre uses a **dual-token system** with `httpOnly` cookies and bcrypt-hashed OTPs.

### Register
```
POST /api/auth/register
→ Check email uniqueness
→ Hash password (bcrypt)
→ Create user (isEmailVerified: false)
→ Generate 6-digit OTP → hash OTP → store with 10-min expiry
→ Send email-verification-otp.hbs via Nodemailer
→ Return { userId, email }
```

### Login
```
POST /api/auth/login
→ Validate credentials
→ If !isEmailVerified:
    → Generate new OTP → hash → store
    → Set accessToken + refreshToken cookies (so /verify-email works)
    → Send OTP email
    → Return { requiresVerification: true }
→ If isEmailVerified:
    → Set accessToken + refreshToken httpOnly cookies
    → Return { user, token, requiresVerification: false }
```

### Verify Email
```
POST /api/auth/verify-email  (requires auth cookie)
→ Find user by req.user.id
→ Check OTP not expired
→ bcrypt.compare(submittedOTP, hashedOTP)
→ Set isEmailVerified: true
→ Clear OTP fields
→ Return 200
```

### Token Refresh
```
POST /api/auth/refresh-token
→ Verify refreshToken from cookie (JWT)
→ Find user, compare stored refreshToken
→ Generate new accessToken + refreshToken
→ Update user.refreshToken in DB
→ Set new cookies
```

### Forgot Password
```
POST /api/auth/forgot-password
→ auth.service.forgotPassword(email)
→ Generate signed reset token → store hashed + expiry
→ Send forgot-password-email.hbs with reset link
```

---

## Middleware Details

### `auth.middleware.ts`
Reads `req.cookies.accessToken`, verifies with `ACCESS_TOKEN_SECRET`, attaches decoded user to `req.user`. Returns 401 if missing or invalid.

### `upload.middleware.ts`
Multer configured with:
- **Storage:** `diskStorage` to `uploads/` temp directory
- **Filter:** Only allows `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- **Limit:** 5MB max file size
- After controller processes the file (uploads to Cloudinary), the temp file is cleaned up

### `validation.middleware.ts`
Higher-order middleware factory:
```ts
validate(schema: ZodSchema) → (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json(ApiError with Zod errors);
  next();
}
```
Applied per-route before controllers.

---

## Schemas (Zod)

### `auth.schema.ts`
- `registerSchema` — name (min 2), email (valid format), password (min 6)
- `loginSchema` — email, password
- `forgotPasswordSchema` — email
- `resetPasswordSchema` — password (min 6), confirmPassword (must match)
- `verifyEmailSchema` — token (exactly 6 chars)

### `presentation.schema.ts`
- `createPresentationSchema` — title (required), content (required), theme (optional ObjectId)
- `updatePresentationSchema` — all fields optional (partial)

### `theme.schema.ts`
- `createThemeSchema` — name, primaryColor (hex), backgroundColor (hex), textColor (hex), fontFamily, description (optional)
- `updateThemeSchema` — all optional

### `user.schema.ts`
- `updateUserSchema` — name (optional), email (optional)

---

## Types

### `types/types.d.ts`
Extends Express `Request` globally so TypeScript knows about `req.user`:
```ts
declare global {
  namespace Express {
    interface Request {
      user: UserType;
    }
  }
}
```

### `types/user.type.ts`
```ts
export interface UserType {
  id: string;
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  plan?: string;
}
```

---

## Email Templates (Handlebars)

All emails are rendered via Nodemailer using `.hbs` templates located in `templates/`:

### `email-verification-otp.hbs`
Renders a styled HTML email with:
- User's name in the greeting
- 6 individual digit boxes (OTP split into array: `otpDigits: otp.split("")`)
- 10-minute expiry notice

### `email-verified-success.hbs`
Confirmation email sent after successful verification. Contains success message and a link to the app.

### `forgot-password-email.hbs`
Password reset email with:
- User name
- Signed reset link (contains token in URL)
- Expiry notice (typically 1 hour)

---

## Data Models

### User
```
name: String (required)
email: String (required, unique, lowercase)
password: String (required, hashed)
isEmailVerified: Boolean (default: false)
emailVerificationToken: String (hashed OTP, optional)
emailVerificationTokenExpiry: Date (optional)
refreshToken: String (optional)
plan: String (default: "free")
timestamps: true
```
Methods: `generateAccessToken()`, `generateRefreshToken()`

### Presentation
```
title: String (required)
content: String (required, Markdown)
theme: ObjectId → Theme (optional, populated on fetch)
user: ObjectId → User (required)
slideCount: Number (auto-computed from content.split("---"))
wordCount: Number (auto-computed from content.split(/\s+/))
viewCount: Number (default: 0)
exportCount: Number (default: 0)
isPublic: Boolean (default: false)
lastEditedAt: Date
timestamps: true
```

### Theme
```
name: String (required)
description: String
primaryColor: String (hex)
backgroundColor: String (hex)
textColor: String (hex)
fontFamily: String
user: ObjectId → User (required)
timestamps: true
```

### Asset
```
user: ObjectId → User (required)
name: String (display name, renameable)
originalName: String (original filename)
url: String (Cloudinary secure_url)
size: Number (bytes)
mimeType: String
width: Number (from Cloudinary result)
height: Number (from Cloudinary result)
timestamps: true
```

---

## Export System

### PDF Export (`exportToPDF`)
1. Fetch presentation with populated theme
2. Split `content` by `---` into slides array
3. Build styled HTML string with theme colors, font family, slide-break CSS
4. Launch **Puppeteer** headless browser
5. Set page content, wait for network idle
6. Print to PDF (A4 landscape, no margins)
7. Save to temp file path → stream to response → delete temp file
8. Increment `exportCount`

### HTML Export (`exportToHTML`)
1. Load `Handlebars` template from `templates/`
2. Pass slides array + theme data to template
3. Template generates self-contained HTML with:
   - Embedded CSS (theme colors, fonts)
   - JavaScript for keyboard navigation (`→`, `←`, `Space`, `Esc`, `F`)
   - Fullscreen API support
   - Slide counter display
4. Return HTML string as response with `Content-Disposition: attachment`

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or MongoDB Atlas)
- Cloudinary account (free tier works)
- SMTP credentials (Gmail App Password, Mailtrap, SendGrid, etc.)

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

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend (CORS) — comma-separated for multiple
FRONTEND_URL=http://localhost:5173

# Email / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=MarkPre <your@gmail.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRY=3600000
```

> For Gmail: enable 2FA and generate an **App Password** at myaccount.google.com → Security → App Passwords.

### Run Locally

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run compiled production server
npm start
```

API: [http://localhost:8000](http://localhost:8000)
Health: [http://localhost:8000/health](http://localhost:8000/health)

---

## CORS Configuration

Allowed origins are read from `FRONTEND_URL` (supports comma-separated list). Localhost `5173` and `3000` are always permitted. Preflight (`OPTIONS`) requests are handled automatically.

```env
# Multiple origins example
FRONTEND_URL=https://markpre.vercel.app,https://staging.markpre.app
```

---

## Deployment (Render)

1. Connect GitHub repo on [render.com](https://render.com)
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/index.js`
5. Add all `.env` variables in the Render environment settings
6. Set `NODE_ENV=production`

> **Free tier note:** Render spins the server down after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds. The `markpre` CLI docs warn users about this and suggest retrying after a wait.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (ts-node/nodemon hot reload) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm run lint` | Run ESLint |

---

## Related

- 🖥️ [Frontend README](./README-frontend.md) — React + Vite SPA
- 📦 [CLI README](./README-cli.md) — `pip install markpre` CLI tool

---

## License

MIT © [Kunal Khuteta](https://github.com/Kunalkhuteta)