

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express4 from "express";
import cors from "cors";

// src/routes/index.ts
import express3 from "express";

// src/modules/auth/auth.route.ts
import express from "express";

// src/modules/auth/auth.controller.ts
import { StatusCodes } from "http-status-codes";

// src/utils/catchAsync.ts
var catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var catchAsync_default = catchAsync;

// src/utils/sendResponse.ts
var sendResponse = (res, payload) => {
  const {
    success,
    message,
    data,
    errors,
    statusCode
  } = payload;
  res.status(statusCode).json({
    success,
    message,
    data,
    errors
  });
};
var sendResponse_default = sendResponse;

// src/utils/generateToken.ts
import jwt from "jsonwebtoken";

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var env = {
  port: process.env.PORT || 5e3,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
};

// src/utils/generateToken.ts
var generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d"
  });
};
var generateToken_default = generateToken;

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/config/db.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// src/modules/auth/auth.service.ts
var signupUser = async (payload) => {
  const { name, email, password, role: role2 } = payload;
  const userExists = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  if (userExists.rows.length > 0) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );
  const result = await pool.query(
    `
      INSERT INTO users(name,email,password,role)
      VALUES($1,$2,$3,$4)
      RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    `,
    [name, email, hashedPassword, role2]
  );
  return result.rows[0];
};
var loginUser = async (email, password) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }
  return user;
};
var AuthService = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var signup = catchAsync_default(async (req, res) => {
  const result = await AuthService.signupUser(
    req.body
  );
  sendResponse_default(res, {
    success: true,
    message: "User registered successfully",
    statusCode: StatusCodes.CREATED,
    data: result
  });
});
var login = catchAsync_default(async (req, res) => {
  const { email, password } = req.body;
  const user = await AuthService.loginUser(
    email,
    password
  );
  const token = generateToken_default({
    id: user.id,
    name: user.name,
    role: user.role
  });
  sendResponse_default(res, {
    success: true,
    message: "Login successful",
    statusCode: StatusCodes.OK,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
  });
});
var AuthController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = express.Router();
router.post(
  "/signup",
  AuthController.signup
);
router.post(
  "/login",
  AuthController.login
);
var auth_route_default = router;

// src/modules/issues/issue.route.ts
import express2 from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    const decoded = jwt2.verify(
      token,
      env.jwtSecret
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: error
    });
  }
};
var auth_default = auth;

// src/modules/issues/issue.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";

// src/modules/issues/issue.service.ts
var createIssue = async (payload, reporterId) => {
  const { title, description, type } = payload;
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
var getAllIssues = async (sort = "newest", type, status) => {
  let query = `SELECT * FROM issues`;
  const values = [];
  const conditions = [];
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
  query += sort === "oldest" ? ` ORDER BY created_at ASC` : ` ORDER BY created_at DESC`;
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
    )
  ];
  const reporterQuery = `
    SELECT id,name,role
    FROM users
    WHERE id = ANY($1)
  `;
  const reporterResult = await pool.query(reporterQuery, [
    reporterIds
  ]);
  const reporters = reporterResult.rows;
  const formattedIssues = issues.map(
    (issue) => {
      const reporter = reporters.find(
        (user) => user.id === issue.reporter_id
      );
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: {
          id: reporter?.id,
          name: reporter?.name,
          role: reporter?.role
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    }
  );
  return formattedIssues;
};
var getSingleIssue = async (issueId) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const reporterResult = await pool.query(
    `
      SELECT id,name,role
      FROM users
      WHERE id=$1
      `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssue = async (issueId, payload, user) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
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
  const updatedTitle = payload.title || issue.title;
  const updatedDescription = payload.description || issue.description;
  const updatedType = payload.type || issue.type;
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
      issueId
    ]
  );
  return result.rows[0];
};
var deleteIssue = async (issueId) => {
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
var IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issue.controller.ts
var createIssue2 = catchAsync_default(async (req, res) => {
  const reporterId = req.user.id;
  const result = await IssueService.createIssue(
    req.body,
    reporterId
  );
  sendResponse_default(res, {
    success: true,
    message: "Issue created successfully",
    statusCode: StatusCodes2.CREATED,
    data: result
  });
});
var getAllIssues2 = catchAsync_default(
  async (req, res) => {
    const { sort, type, status } = req.query;
    const result = await IssueService.getAllIssues(
      sort,
      type,
      status
    );
    sendResponse_default(res, {
      success: true,
      statusCode: StatusCodes2.OK,
      data: result
    });
  }
);
var getSingleIssue2 = catchAsync_default(
  async (req, res) => {
    const id = Number(req.params.id);
    const result = await IssueService.getSingleIssue(
      id
    );
    sendResponse_default(res, {
      success: true,
      statusCode: StatusCodes2.OK,
      data: result
    });
  }
);
var updateIssue2 = catchAsync_default(
  async (req, res) => {
    const issueId = Number(
      req.params.id
    );
    const result = await IssueService.updateIssue(
      issueId,
      req.body,
      {
        id: req.user.id,
        role: req.user.role
      }
    );
    sendResponse_default(res, {
      success: true,
      message: "Issue updated successfully",
      statusCode: StatusCodes2.OK,
      data: result
    });
  }
);
var deleteIssue2 = catchAsync_default(
  async (req, res) => {
    const issueId = Number(
      req.params.id
    );
    await IssueService.deleteIssue(
      issueId
    );
    sendResponse_default(res, {
      success: true,
      message: "Issue deleted successfully",
      statusCode: StatusCodes2.OK,
      data: null
    });
  }
);
var IssueController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/role.ts
var role = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this route"
      });
    }
    next();
  };
};
var role_default = role;

// src/modules/issues/issue.route.ts
var router2 = express2.Router();
router2.post(
  "/",
  auth_default,
  IssueController.createIssue
);
router2.get(
  "/",
  IssueController.getAllIssues
);
router2.get(
  "/:id",
  IssueController.getSingleIssue
);
router2.patch(
  "/:id",
  auth_default,
  IssueController.updateIssue
);
router2.delete(
  "/:id",
  auth_default,
  role_default("maintainer"),
  IssueController.deleteIssue
);
var issue_route_default = router2;

// src/routes/index.ts
var router3 = express3.Router();
router3.use("/auth", auth_route_default);
router3.use("/issues", issue_route_default);
var routes_default = router3;

// src/app.ts
var app = express4();
app.use(cors());
app.use(express4.json());
app.use("/api", routes_default);
app.get("/", (req, res) => {
  res.send("DevPulse API Running...");
});
var app_default = app;

// src/config/initDB.ts
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor'
        CHECK (role IN ('contributor','maintainer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(30) NOT NULL
        CHECK (type IN ('bug','feature_request')),
        status VARCHAR(30) DEFAULT 'open'
        CHECK (
          status IN (
            'open',
            'in_progress',
            'resolved'
          )
        ),
        reporter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables initialized");
  } catch (error) {
    console.log("Database init error:", error);
  }
};
var initDB_default = initDB;

// src/server.ts
var startServer = async () => {
  await initDB_default();
  app_default.listen(env.port, () => {
    console.log(
      `Server running on port ${env.port}`
    );
  });
};
startServer();
//# sourceMappingURL=server.js.map