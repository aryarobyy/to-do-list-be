import { Request, Response, NextFunction } from 'express';
import { authRes, errorRes, successRes } from '../utils/response';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const registerUser = async (
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
    const { data, token } = await UserService.registerUser(req.body);
    authRes(res, 200, { data }, "User created successfully", token);
  } catch (e: any) {
    console.error("Error in register User:", e);
    errorRes(res, 400, "Error creating user", e.message);
  }
};

export const loginUser = async (
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

  try{
    const userRec = await signInWithEmailAndPassword(auth, email, password);
    const userId = userRec.user.uid;
    
    const { accessToken, session } = await AuthService.generateAndSaveTokens(userId);
    const data = await UserService.getUserById(userId);

    authRes(res, 200, { data, session },"Login successful", accessToken);
  } catch (e: any) {
    console.error("Error in login User:", e);
    errorRes(res, 500, "Error Login user", e.message);
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> =>{
  const { id } = req.body;
  const updatedData  = req.body;
  
  try{
    const data = await UserService.updateUser(id as string, updatedData);
    successRes(res, 200, { data }, "User update successful");
  } catch (e: any) {
    console.error("Error in updateUser:", e);
    errorRes(res, 500, "Error updating user", e.message);
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { id } = req.body;
      const data = await UserService.getUserById(id as string);
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong userId:", e);
      errorRes(res, 500, "Error userId", e.message);
  }
}

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { email } = req.body;
      const data = await UserService.getUserByEmail(email);
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong email:", e);
      errorRes(res, 500, "Error email", e.message);
  }
}

export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { username } = req.body;
      const data = await UserService.getUserByUsername(username);
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong username:", e);
      errorRes(res, 500, "Error username", e.message);
  }
}

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const data = await UserService.getCurrentUser();
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Error getting current user:", e);
      errorRes(res, 500, "Error getting current user", e.message);
  }
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await UserService.getUsers();
    successRes(res, 200, { data }, "Getting users successful");
  } catch (e: any) {
    console.error("Error getting users:", e);
    errorRes(res, 500, "Error getting users", e.message);
  }
}

export const changeRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, newRole } = req.body;

  try {
    if (!userId || !newRole) {
      errorRes(res, 400, "userId and newRole are required");
      return;
    }

    const data = await UserService.changeRole(userId, newRole);
    successRes(res, 200, data, "Role updated successfully");
  } catch (e: any) {
    console.error("Error changing role:", e);
    errorRes(res, 500, "Error changing role", e.message);
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> =>{
  const { id } = req.body;
  try {
    const data = await UserService.logout(id);
    successRes(res, 200, data, "Logout successful");
  } catch (e: any) {
    console.error('Logout error:', e);
    errorRes(res, 500, "Logout failed", e.message);
  }
}

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
