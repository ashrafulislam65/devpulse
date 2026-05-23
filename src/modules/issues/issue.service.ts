import { pool } from "../../config/db";
import type { IIssue } from "./issue.interface";


const createIssue = async (
  payload: IIssue,
  reporterId: number
) => {
  const { title, description, type } =
    payload;

  const result = await pool.query(
    `
    INSERT INTO issues
    (title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, type, reporterId]
  );

  return result.rows[0];
};

const getAllIssues = async (
  sort = "newest",
  type?: string,
  status?: string
) => {
  let query = `SELECT * FROM issues`;
  const values: string[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(
      `type = $${values.length}`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(
      `status = $${values.length}`
    );
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(
      " AND "
    )}`;
  }

  query +=
    sort === "oldest"
      ? ` ORDER BY created_at ASC`
      : ` ORDER BY created_at DESC`;

  const issueResult = await pool.query(
    query,
    values
  );

  const issues = issueResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [
    ...new Set(
      issues.map((issue) => issue.reporter_id)
    ),
  ];

  const reporterQuery = `
    SELECT id,name,role
    FROM users
    WHERE id = ANY($1)
  `;

  const reporterResult =
    await pool.query(reporterQuery, [
      reporterIds,
    ]);

  const reporters =
    reporterResult.rows;

  const formattedIssues = issues.map(
    (issue) => {
      const reporter = reporters.find(
        (user) =>
          user.id === issue.reporter_id
      );

      return {
        id: issue.id,
        title: issue.title,
        description:
          issue.description,
        type: issue.type,
        status: issue.status,
        reporter: {
          id: reporter?.id,
          name: reporter?.name,
          role: reporter?.role,
        },
        created_at:
          issue.created_at,
        updated_at:
          issue.updated_at,
      };
    }
  );

  return formattedIssues;
};
const getSingleIssue = async (
  issueId: number
) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  const reporterResult =
    await pool.query(
      `
      SELECT id,name,role
      FROM users
      WHERE id=$1
      `,
      [issue.reporter_id]
    );

  const reporter =
    reporterResult.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};
const updateIssue = async (
  issueId: number,
  payload: Partial<IIssue>,
  user: {
    id: number;
    role: string;
  }
) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // contributor permission
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error(
        "You are not allowed to update this issue"
      );
    }

    if (issue.status !== "open") {
      throw new Error(
        "Only open issues can be updated"
      );
    }
  }

  const updatedTitle =
    payload.title || issue.title;

  const updatedDescription =
    payload.description ||
    issue.description;

  const updatedType =
    payload.type || issue.type;

  const result = await pool.query(
    `
    UPDATE issues
    SET
      title=$1,
      description=$2,
      type=$3,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$4
    RETURNING *
    `,
    [
      updatedTitle,
      updatedDescription,
      updatedType,
      issueId,
    ]
  );

  return result.rows[0];
};
const deleteIssue = async (
  issueId: number
) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  await pool.query(
    `DELETE FROM issues WHERE id=$1`,
    [issueId]
  );

  return null;
};

export const IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};