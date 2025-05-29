import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

const app = express();

app.use(cookieParser());

// Enable CORS for requests from frontend
const allowedOrigins = [
  process.env.FRONTEND_URL ||
    "https://personal-finance-app-full-stack.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // allow curl, Postman, SSR, etc.
        allowedOrigins.includes(origin) || // production frontend
        origin.endsWith(".vercel.app") // preview branches
      ) {
        callback(null, true); // Allow
      } else {
        callback(new Error(`CORS blocked: ${origin}`)); // Block
      }
    },
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Log HTTP requests in development mode
app.use(morgan("dev"));

app.use("/api", router);

// Backend Status check
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

export default app;
