import { admin, adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION, TODO_COLLECTION, SUBTASK_COLLECTION } from '../core/constants';
import { sanitizeLimit, sanitizeOffset, stripTimestamps } from '../utils/query';
import { v4 } from 'uuid';

export class SubtaskService {
  static async createSubtask(payload: any) {
    const { creatorId, todoId, text, isDone = false } = payload;

    if (!creatorId || !todoId || !text) {
      throw new Error('creatorId, todoId, and text are required');
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

    return data;
  }

  static async updateSubtask(payload: any) {
    const { creatorId, todoId, subtaskId, ...updatedData } = payload;

    if (!creatorId || !todoId || !subtaskId) {
      throw new Error('creatorId, todoId, and subtaskId are required');
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
    return updatedSnap.data();
  }

  static async changeSubtaskStatus(creatorId: string, todoId: string, subtaskId: string, isDone: boolean) {
    if (isDone === undefined || isDone === null) {
      throw new Error('isDone is required');
    }

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .update({ isDone });

    return { isDone };
  }

  static async getSubtaskById(creatorId: string, todoId: string, subtaskId: string) {
    const docSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .get();

    if (!docSnap.exists) {
      throw new Error('Subtask not found');
    }

    return docSnap.data();
  }

  static async getSubtasksByTodo(creatorId: string, todoId: string, limit?: number, offset?: number) {
    const queryLimit = sanitizeLimit(limit);
    const queryOffset = sanitizeOffset(offset);
    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .offset(queryOffset)
      .limit(queryLimit)
      .get();

    return querySnap.docs.map((doc) => stripTimestamps({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async deleteSubtask(creatorId: string, todoId: string, subtaskId: string) {
    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .collection(SUBTASK_COLLECTION)
      .doc(subtaskId)
      .delete();

    return true;
  }
}
