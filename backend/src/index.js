import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { createServer } from "http";
import aiRouter from "./routes/ai.route.js";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

app.use(helmet());
// app.use(morgan("combined"));

// CORS Configuration - Simple and robust
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://mark-pre.vercel.app',
];

// Add environment variable origins if they exist
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...envOrigins);
}

console.log('🌐 Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) {
      console.log('✅ Request with no origin allowed');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      console.log('📋 Allowed origins are:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importing routes
import authRouter from "./routes/auth.route.js";
import themeRouter from "./routes/theme.route.js";
import presentationRouter from "./routes/presentation.route.js";

// applying routes
app.use("/api/auth", authRouter);
app.use("/api/themes", themeRouter);
app.use("/api/presentations", presentationRouter);
app.use("/api/ai", aiRouter);

// Add a health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MakeBreak Backend API is running',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start the server after connecting to the database
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error starting server:", error);
    });