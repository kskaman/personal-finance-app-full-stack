import express from "express";
import cors from "cors";
import helmet from "helmet";

import router from "./routes/index.js";

const app = express();

//  Secure HTTP headers
app.use(helmet());

// Core middlewares
app.use(cors());
app.use(express.json());

// Middleware for authorization

// Routes
app.use("/api", router);

export default app;
