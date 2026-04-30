import { Router } from "express";
import {
  createSubtask,
  updateSubtask,
  changeSubtaskStatus,
  getSubtaskById,
  getSubtasksByTodo,
  deleteSubtask,
} from "../controllers/subtask.controller";

const subtaskRouter = Router();

subtaskRouter.post("/create", createSubtask);
subtaskRouter.post("/update", updateSubtask);
subtaskRouter.post("/status", changeSubtaskStatus);
subtaskRouter.post("/get", getSubtaskById);
subtaskRouter.post("/list", getSubtasksByTodo);
subtaskRouter.post("/delete", deleteSubtask);

export default subtaskRouter;
