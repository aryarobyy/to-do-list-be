import { Router } from "express";
import { login, logout, register, verifyToken } from "../controllers/auth.controller";
import { googleSignIn, googleSignOut } from "../controllers/google.controller";

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/token', verifyToken);
authRouter.post('/sign-in', googleSignIn);
authRouter.post('/sign-out', googleSignOut);

export default authRouter;
