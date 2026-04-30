import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { admin, adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION, TODO_COLLECTION } from '../core/constants';

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { creatorId, title, subTitle = '', tag = [], subTasks = [], noteId = [] } = req.body;

  try {
    if (!creatorId || !title) {
      errorRes(res, 400, 'creatorId and title are required');
      return;
    }

    const id = v4();

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const data = {
      id,
      title,
      subTitle,
      tag: Array.isArray(tag) ? tag : [],
      subTasks: Array.isArray(subTasks) ? subTasks : [],
      noteId: Array.isArray(noteId) ? noteId : [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(id)
      .set(data);

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
  const { creatorId, todoId } = req.body;
  const updatedData = req.body;

  try {
    if (!creatorId || !todoId) {
      errorRes(res, 400, 'creatorId and todoId are required');
      return;
    }

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId as string)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      errorRes(res, 400, 'No data to update');
      return;
    }

    const todoRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId as string)
      .collection(TODO_COLLECTION)
      .doc(todoId as string);

    await todoRef.update(updatedData);

    const updatedSnap = await todoRef.get();
    successRes(res, 200, { data: updatedSnap.data() }, 'Todo updated successfully');
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
    const { creatorId, todoId } = req.body;

    const docSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .get();

    if (!docSnap.exists) {
      errorRes(res, 404, 'Todo not found');
      return;
    }

    successRes(res, 200, { data: docSnap.data() }, 'Getting todo successful');
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
    const { creatorId } = req.body;

    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .get();

    const data = querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    const { creatorId, latest: latestBody } = req.body;
    const latest = latestBody !== false; // default true = descending

    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .orderBy('createdAt', latest ? 'desc' : 'asc')
      .get();

    const data = querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    const { creatorId, todoId } = req.body;

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .delete();

    successRes(res, 200, {}, 'Todo deleted successfully');
  } catch (e: any) {
    console.error('Error deleting todo:', e);
    errorRes(res, 500, 'Error deleting todo', e.message);
  }
};
