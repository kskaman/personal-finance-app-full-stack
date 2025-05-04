import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

const app = express();

app.use(cookieParser());

// Enable CORS for requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // allow cookies to be sent from frontend
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
