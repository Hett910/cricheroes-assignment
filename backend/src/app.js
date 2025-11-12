import express from "express";
import cors from "cors";
import MasterRouters from "./routes/MasterRouters.js";
// import cricketRoutes from "../src/index";

const app = express();

// ✅ Global Middleware
app.use(cors());
app.use(express.json());

app.use("/", MasterRouters);

// ✅ Basic Health Routes
app.get("/", (_req, res) => {
    res.json({
        status: "available",
        message:
            "NRR backend running. Try GET /health or /teams, or POST /scenario with match details.",
    });
});

export default app;