import { admin, adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION, TODO_COLLECTION } from '../core/constants';
import { v4 } from 'uuid';

export class TodoService {
  static async createTodo(payload: any) {
    const { creatorId, title, subTitle = '', tag = [], subTasks = [], noteId = [] } = payload;

    if (!creatorId || !title) {
      throw new Error('creatorId and title are required');
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

    return data;
  }

  static async updateTodo(payload: any) {
    const { creatorId, todoId, ...updatedData } = payload;

    if (!creatorId || !todoId) {
      throw new Error('creatorId and todoId are required');
    }

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId as string)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      throw new Error('No data to update');
    }

    const todoRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId as string)
      .collection(TODO_COLLECTION)
      .doc(todoId as string);

    await todoRef.update(updatedData);

    const updatedSnap = await todoRef.get();
    return updatedSnap.data();
  }

  static async getTodoById(creatorId: string, todoId: string) {
    const docSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId)
      .get();

    if (!docSnap.exists) {
      throw new Error('Todo not found');
    }

    return docSnap.data();
  }

  static async getTodosByCreator(creatorId: string) {
    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .get();

    return querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async getLatestTodos(creatorId: string, latest: boolean) {
    const querySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .orderBy('createdAt', latest ? 'desc' : 'asc')
      .get();

    return querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async deleteTodo(creatorId: string, todoId: string) {
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

    return true;
  }
}
