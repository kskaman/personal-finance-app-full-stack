import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

const app = express();

// Set security-related HTTP headers
// helmet as a secure-by-default plugin
// that sets your HTTP response headers
// properly to harden your Express app
// against many known attacks - like XSS,
// clickjacking, and insecure connections -
// without changing how your app works.
app.use(helmet());

// Enable CORS for requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // allow cookies to be sent from frontend
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies from incoming requests
app.use(cookieParser());

// Log HTTP requests in development mode
app.use(morgan("dev"));

app.use("/api", router);

app.use("/api", (req, res) => {
  res.send("Api is running.");
});

export default app;
