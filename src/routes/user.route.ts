import { Router } from "express";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, loginUser, registerUser, updateUser, logout, verifyToken } from "../controllers/user.controller";
import { googleSignIn, googleSignOut } from "../controllers/google.controller";

const userRouter = Router()

userRouter.post('/', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/:id', getUserById)
userRouter.get('/email/:email', getUserByEmail)
userRouter.get('/username/:username', getUserByUsername)
userRouter.get('/current', getCurrentUser)
userRouter.put('/:id', updateUser)
userRouter.post('/logout', logout)
userRouter.post('/token', verifyToken)
userRouter.post('/signIn', googleSignIn)
userRouter.post('/signOut', googleSignOut)

export default userRouter