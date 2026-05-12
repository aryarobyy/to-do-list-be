import { Request, Response, NextFunction } from 'express';
import { errorRes, successRes } from '../utils/response';
import { UserService } from '../services/user.service';

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> =>{
  try{
    const data = await UserService.updateUser(req.body);
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
      const { token } = req.body;
      const data = await UserService.getCurrentUser(token);
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
    const { limit, offset } = req.body;
    const data = await UserService.getUsers(limit, offset);
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
    const data = await UserService.changeRole(userId, newRole);
    successRes(res, 200, data, "Role updated successfully");
  } catch (e: any) {
    console.error("Error changing role:", e);
    errorRes(res, 500, "Error changing role", e.message);
  }
}
