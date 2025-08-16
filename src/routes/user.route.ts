import { Router } from "express";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, loginUser, registerUser, updateUser, logout, verifyToken } from "../controllers/user.controller";
import { googleSignIn, googleSignOut } from "../controllers/google.controller";

const userRouter = Router();

userRouter.post('/', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logout);
userRouter.post('/token', verifyToken);
userRouter.post('/signIn', googleSignIn);
userRouter.post('/signOut', googleSignOut);
userRouter.get('/current', getCurrentUser);
userRouter.get('/email/:email', getUserByEmail);
userRouter.get('/username/:username', getUserByUsername);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);

export default userRouter