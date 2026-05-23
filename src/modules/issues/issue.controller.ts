import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IssueService } from "./issue.service";

const createIssue = catchAsync(async (
  req,
  res
) => {
  const reporterId = req.user!.id;

  const result =
    await IssueService.createIssue(
      req.body,
      reporterId
    );

  sendResponse(res, {
    success: true,
    message: "Issue created successfully",
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

export const IssueController = {
  createIssue,
};