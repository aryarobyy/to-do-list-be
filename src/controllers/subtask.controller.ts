import { NextFunction, Request, Response } from 'express';
import { errorRes, successRes } from '../utils/response';
import { SubtaskService } from '../services/subtask.service';

export const createSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await SubtaskService.createSubtask({ ...req.body, creatorId: req.user!.userId });
    successRes(res, 200, { data }, 'Subtask created successfully');
  } catch (e: any) {
    console.error('Error in createSubtask:', e);
    errorRes(res, 500, 'Error creating subtask', e.message);
  }
};

export const updateSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await SubtaskService.updateSubtask({ ...req.body, creatorId: req.user!.userId });
    successRes(res, 200, { data }, 'Subtask updated successfully');
  } catch (e: any) {
    console.error('Error in updateSubtask:', e);
    errorRes(res, 500, 'Error updating subtask', e.message);
  }
};

export const changeSubtaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId, subtaskId, isDone } = req.body;
    const creatorId = req.user!.userId;
    const data = await SubtaskService.changeSubtaskStatus(creatorId, todoId, subtaskId, isDone);
    successRes(res, 200, data, 'Subtask status updated successfully');
  } catch (e: any) {
    console.error('Error in changeSubtaskStatus:', e);
    errorRes(res, 500, 'Error changing subtask status', e.message);
  }
};

export const getSubtaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId, subtaskId } = req.body;
    const creatorId = req.user!.userId;
    const data = await SubtaskService.getSubtaskById(creatorId, todoId, subtaskId);
    successRes(res, 200, { data }, 'Getting subtask successful');
  } catch (e: any) {
    console.error('Error getting subtask by id:', e);
    errorRes(res, 500, 'Error getting subtask', e.message);
  }
};

export const getSubtasksByTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId, limit, offset } = req.body;
    const creatorId = req.user!.userId;
    const data = await SubtaskService.getSubtasksByTodo(creatorId, todoId, limit, offset);
    successRes(res, 200, { data }, 'Getting subtasks successful');
  } catch (e: any) {
    console.error('Error getting subtasks:', e);
    errorRes(res, 500, 'Error getting subtasks', e.message);
  }
};

export const deleteSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId, subtaskId } = req.body;
    const creatorId = req.user!.userId;
    await SubtaskService.deleteSubtask(creatorId, todoId, subtaskId);
    successRes(res, 200, {}, 'Subtask deleted successfully');
  } catch (e: any) {
    console.error('Error deleting subtask:', e);
    errorRes(res, 500, 'Error deleting subtask', e.message);
  }
};
