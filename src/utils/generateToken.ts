import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  id: number;
  name: string;
  role: string;
}

const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
  });
};

export default generateToken;