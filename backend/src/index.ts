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
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
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

// Start the server after connecting to the database
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error starting server:", error);
    });
