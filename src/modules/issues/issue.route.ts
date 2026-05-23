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
router.get(
  "/:id",
  IssueController.getSingleIssue
);
router.patch(
  "/:id",
  auth,
  IssueController.updateIssue
);

export default router;