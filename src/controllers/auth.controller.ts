import { NextFunction, Request, Response } from 'express';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { authRes, errorRes, successRes } from '../utils/response';

const auth = getAuth();

const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorRes(res, 400, "Email and password are required");
    return;
  }

  if (!isEmailValid(email)) {
    errorRes(res, 400, "Invalid email format");
    return;
  }

  try {
    const { data, token } = await AuthService.registerUser(req.body);
    authRes(res, 200, { data }, "User created successfully", token);
  } catch (e: any) {
    console.error("Error in register User:", e);
    errorRes(res, 400, "Error creating user", e.message);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorRes(res, 400, "Email and password are required");
    return;
  }

  if (!isEmailValid(email)) {
    errorRes(res, 400, "Invalid email format");
    return;
  }

  try {
    const userRec = await signInWithEmailAndPassword(auth, email, password);
    const userId = userRec.user.uid;

    const { accessToken, session } = await AuthService.generateAndSaveTokens(userId);
    const data = await UserService.getUserById(userId);

    authRes(res, 200, { data, session }, "Login successful", accessToken);
  } catch (e: any) {
    console.error("Error in login User:", e);
    errorRes(res, 500, "Error Login user", e.message);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.body;

  if (!id) {
    errorRes(res, 400, "User id is required");
    return;
  }

  try {
    const data = await AuthService.logout(id);
    successRes(res, 200, { data }, "Logout successful");
  } catch (e: any) {
    console.error('Logout error:', e);
    errorRes(res, 500, "Logout failed", e.message);
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    errorRes(res, 400, "No token provided");
    return;
  }

  try {
    const data = await AuthService.verifyUserToken(token);
    successRes(res, 200, data, "Token verified successfully");
  } catch (e: any) {
    console.error("Token verification failed:", e);
    errorRes(res, 400, "Invalid token", e.message);
  }
};
