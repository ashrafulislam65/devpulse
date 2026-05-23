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
const getAllIssues = catchAsync(
  async (req, res) => {
    const { sort, type, status } =
      req.query;

    const result =
      await IssueService.getAllIssues(
        sort as string,
        type as string,
        status as string
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);
const getSingleIssue = catchAsync(
  async (req, res) => {
    const id = Number(req.params.id);

    const result =
      await IssueService.getSingleIssue(
        id
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};