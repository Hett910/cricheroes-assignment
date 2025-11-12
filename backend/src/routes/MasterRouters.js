import express from "express";
import cricketRoutes  from "./cricketRoutes.js";

const router = express.Router();

router.use(
    "/api",
    cricketRoutes
);

export default router;