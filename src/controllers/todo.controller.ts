import { NextFunction, Request, Response } from 'express';
import { errorRes, successRes } from '../utils/response';
import { TodoService } from '../services/todo.service';

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await TodoService.createTodo({ ...req.body, creatorId: req.user!.userId });
    successRes(res, 200, { data }, 'Todo created successfully');
  } catch (e: any) {
    console.error('Error in createTodo:', e);
    errorRes(res, 500, 'Error creating todo', e.message);
  }
};

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await TodoService.updateTodo({ ...req.body, creatorId: req.user!.userId });
    successRes(res, 200, { data }, 'Todo updated successfully');
  } catch (e: any) {
    console.error('Error in updateTodo:', e);
    errorRes(res, 500, 'Error updating todo', e.message);
  }
};

export const getTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId } = req.body;
    const creatorId = req.user!.userId;
    const data = await TodoService.getTodoById(creatorId, todoId);
    successRes(res, 200, { data }, 'Getting todo successful');
  } catch (e: any) {
    console.error('Error getting todo by id:', e);
    errorRes(res, 500, 'Error getting todo', e.message);
  }
};

export const getTodosByCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, limit, offset } = req.body;
    const creatorId = req.user!.userId;
    const data = await TodoService.getTodosByCreator(creatorId, category, limit, offset);
    successRes(res, 200, { data }, 'Getting todos successful');
  } catch (e: any) {
    console.error('Error getting todos by creator:', e);
    errorRes(res, 500, 'Error getting todos', e.message);
  }
};

export const getLatestTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { latest: latestBody, category, limit, offset } = req.body;
    const creatorId = req.user!.userId;
    const latest = latestBody !== false;
    const data = await TodoService.getLatestTodos(creatorId, latest, category, limit, offset);
    successRes(res, 200, { data }, 'Getting latest todos successful');
  } catch (e: any) {
    console.error('Error getting latest todos:', e);
    errorRes(res, 500, 'Error getting latest todos', e.message);
  }
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoId } = req.body;
    const creatorId = req.user!.userId;
    await TodoService.deleteTodo(creatorId, todoId);
    successRes(res, 200, {}, 'Todo deleted successfully');
  } catch (e: any) {
    console.error('Error deleting todo:', e);
    errorRes(res, 500, 'Error deleting todo', e.message);
  }
};
