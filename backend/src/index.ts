import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { createServer } from "http";
import assetRouter from "./routes/asset.route";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 8000;

// ✅ CORS MUST be before everything else
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL
    .split(',')
    .map(url => url.trim())
    .forEach(url => {
      if (url && !allowedOrigins.includes(url)) {
        allowedOrigins.push(url);
      }
    });
}

console.log('🌐 Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
}));

// ✅ Handle preflight requests
app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRouter from "./routes/auth.route";
import themeRouter from "./routes/theme.route";
import presentationRouter from "./routes/presentation.route";
import aiRouter from "./routes/ai.route";

// Apply routes
app.use("/api/auth", authRouter);
app.use("/api/themes", themeRouter);
app.use("/api/presentations", presentationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/assets", assetRouter);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      startKeepAlive();
    });
  })
  .catch((error) => {
    console.error("❌ DB Error:", error);
    process.exit(1);
  });

  function startKeepAlive() {
  if (process.env.NODE_ENV !== "production" || !process.env.PROD_URL) return;
  const url = `${process.env.PROD_URL.replace(/\/+$/, "")}/health`;
  setInterval(async () => {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) console.warn("⚠️  Keep-alive ping returned:", r.status);
      else console.log("🏓 Keep-alive ping OK");
    } catch (err: any) {
      console.warn("⚠️  Keep-alive ping failed:", err.message);
    }
  }, 14 * 60 * 1000); // 14 minutes
  console.log(`🏓 Keep-alive enabled → ${url} (every 14 min)`);
}