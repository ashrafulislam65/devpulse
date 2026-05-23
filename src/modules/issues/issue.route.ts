import express from "express";
import auth from "../../middleware/auth";
import { IssueController } from "./issue.controller";
import role from "../../middleware/role";

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
router.delete(
  "/:id",
  auth,
  role("maintainer"),
  IssueController.deleteIssue
);

export default router;