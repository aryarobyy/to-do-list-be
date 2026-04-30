import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { admin, adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION, TODO_COLLECTION, SUBTASK_COLLECTION } from '../core/constants';

export const createSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { creatorId, todoId, text, isDone = false } = req.body;

  try {
    if (!creatorId || !todoId || !text) {
      errorRes(res, 400, 'creatorId, todoId, and text are required');
      return;
    }

    const id = v4();

    const data = {
      id,
      text,
      isDone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(id)
      .set(data);

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
    const { creatorId, todoId, subtaskId } = req.body;
    const updatedData = req.body;

    if (!creatorId || !todoId || !subtaskId) {
      errorRes(res, 400, 'creatorId, todoId, and subtaskId are required');
      return;
    }

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const subtaskRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId);

    await subtaskRef.update(updatedData);

    const updatedSnap = await subtaskRef.get();
    successRes(res, 200, { data: updatedSnap.data() }, 'Subtask updated successfully');
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
    const { creatorId, todoId, subtaskId } = req.body;
    const { isDone } = req.body;

    if (isDone === undefined || isDone === null) {
      errorRes(res, 400, 'isDone is required');
      return;
    }

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .update({ isDone });

    successRes(res, 200, { isDone }, 'Subtask status updated successfully');
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
    const { creatorId, todoId, subtaskId } = req.body;

    const docSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .get();

    if (!docSnap.exists) {
      errorRes(res, 404, 'Subtask not found');
      return;
    }

    successRes(res, 200, { data: docSnap.data() }, 'Getting subtask successful');
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
    const { creatorId, todoId } = req.body;

    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .get();

    const data = querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    const { creatorId, todoId, subtaskId } = req.body;

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .delete();

    successRes(res, 200, {}, 'Subtask deleted successfully');
  } catch (e: any) {
    console.error('Error deleting subtask:', e);
    errorRes(res, 500, 'Error deleting subtask', e.message);
  }
};
