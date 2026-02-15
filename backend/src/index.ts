import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { createServer } from "http";
import aiRouter from "./routes/ai.route";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

app.use(helmet());
// app.use(morgan("combined"));

// CORS Configuration - Allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importing routes
import authRouter from "./routes/auth.route";
import themeRouter from "./routes/theme.route";
import presentationRouter from "./routes/presentation.route";

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
    allowedOrigins: allowedOrigins // Show allowed origins for debugging
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server after connecting to the database
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
        });
    })
    .catch((error) => {
        console.error("Error starting server:", error);
    });