import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import generateToken from "../../utils/generateToken";
import { AuthService } from "./auth.service";

const signup = catchAsync(async (req, res) => {
  const result = await AuthService.signupUser(
    req.body
  );

  sendResponse(res, {
    success: true,
    message: "User registered successfully",
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await AuthService.loginUser(
    email,
    password
  );

  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  sendResponse(res, {
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
        updated_at: user.updated_at,
      },
    },
  });
});

export const AuthController = {
  signup,
  login,
};