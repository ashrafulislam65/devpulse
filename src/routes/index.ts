import express from "express";
import authRoutes from "../modules/auth/auth.route";
import issueRoutes from "../modules/issues/issue.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/issues", issueRoutes);


export default router;