import { Router } from "express";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, getUsers, loginUser, registerUser, updateUser, changeRole, logout, verifyToken } from "../controllers/user.controller";
import { googleSignIn, googleSignOut } from "../controllers/google.controller";

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logout);
userRouter.post('/token', verifyToken);
userRouter.post('/signIn', googleSignIn);
userRouter.post('/signOut', googleSignOut);
userRouter.post('/role', changeRole);
userRouter.post('/list', getUsers);
userRouter.post('/current', getCurrentUser);
userRouter.post('/email', getUserByEmail);
userRouter.post('/username', getUserByUsername);
userRouter.post('/get', getUserById);
userRouter.post('/update', updateUser);

export default userRouter