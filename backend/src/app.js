import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import router from "./routes/index.js";

const app = express();

//  Secure HTTP headers
app.use(helmet());

// Core middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Middleware for authorization

// Routes
app.use("/api", router);

export default app;
