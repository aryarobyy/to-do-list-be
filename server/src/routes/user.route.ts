import { Router } from "express";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, loginUser, registerUser } from "../controllers/user.controller";

const userRouter = Router()

userRouter.post('/', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/:id', getUserById)
userRouter.get('/email/:email', getUserByEmail)
userRouter.get('/username/:username', getUserByUsername)
userRouter.get('/current', getCurrentUser)

export default userRouter