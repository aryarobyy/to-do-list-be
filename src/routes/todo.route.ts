import { Router } from "express";
import {
  createTodo,
  updateTodo,
  getTodoById,
  getTodosByCreator,
  getLatestTodos,
  deleteTodo,
} from "../controllers/todo.controller";

const todoRouter = Router();

todoRouter.post("/create", createTodo);
todoRouter.post("/update", updateTodo);
todoRouter.post("/get", getTodoById);
todoRouter.post("/list", getTodosByCreator);
todoRouter.post("/latest", getLatestTodos);
todoRouter.post("/delete", deleteTodo);

export default todoRouter;
