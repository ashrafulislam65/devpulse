import express from "express";
import auth from "../../middleware/auth";
import { IssueController } from "./issue.controller";

const router = express.Router();

router.post(
  "/",
  auth,
  IssueController.createIssue

);
router.get(
  "/",
  IssueController.getAllIssues
);

export default router;