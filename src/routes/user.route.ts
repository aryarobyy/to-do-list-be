import { Router } from "express";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, getUsers, updateUser, changeRole } from "../controllers/user.controller";

const userRouter = Router();

userRouter.post('/change-role', changeRole);
userRouter.post('/list', getUsers);
userRouter.post('/current', getCurrentUser);
userRouter.post('/email', getUserByEmail);
userRouter.post('/username', getUserByUsername);
userRouter.post('/detail', getUserById);
userRouter.post('/update', updateUser);

export default userRouter
