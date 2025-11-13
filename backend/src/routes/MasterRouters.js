import express from "express";
import cricketRoutes  from "./cricketRoutes.js";

const router = express.Router();

// MasterRouters will have all route imports here
router.use(
    "/api",
    cricketRoutes
);

export default router;