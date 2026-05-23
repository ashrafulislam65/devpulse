import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import type { IUser } from "./auth.interface";


const signupUser = async (payload: IUser) => {
  const { name, email, password, role } = payload;

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
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

const loginUser = async (
  email: string,
  password: string
) => {
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

export const AuthService = {
  signupUser,
  loginUser,
};