import { admin, adminFirestore } from '../firebase/admin.sdk';
import { CATEGORY_COLLECTION, SUBTASK_COLLECTION, TODO_COLLECTION, USER_COLLECTION } from '../core/constants';
import { formatCategoryTitle } from '../utils/category';
import { v4 } from 'uuid';

export class TodoService {
  private static async ensureCategoryExists(creatorId: string, category: string) {
    const categorySnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(CATEGORY_COLLECTION)
      .doc(category)
      .get();

    if (!categorySnap.exists) {
      throw new Error(`Category '${category}' not found`);
    }
  }

  static async createTodo(payload: any) {
    const { creatorId, title, subTitle = '', tag = [], subTasks = [], noteId = [], category } = payload;

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

    const formattedCategory = category ? formatCategoryTitle(category) : "";

    if (formattedCategory) {
      await this.ensureCategoryExists(creatorId, formattedCategory);
    }

    const validSubTasks = Array.isArray(subTasks)
      ? subTasks.map((subTask) => {
          if (!subTask?.text) {
            throw new Error('Each subtask must have text');
          }

          return {
            id: v4(),
            text: subTask.text,
            isDone: !!subTask.isDone,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
        })
      : [];

    const data: Record<string, any> = {
      id,
      title,
      subTitle,
      tag: Array.isArray(tag) ? tag : [],
      noteId: Array.isArray(noteId) ? noteId : [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (formattedCategory) {
      data.category = formattedCategory;
    }

    const todoRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(id);

    const batch = adminFirestore.batch();
    batch.set(todoRef, data);

    validSubTasks.forEach((subTask) => {
      const subtaskRef = todoRef.collection(SUBTASK_COLLECTION).doc(subTask.id);
      batch.set(subtaskRef, subTask);
    });

    await batch.commit();

    return {
      ...data,
      subTasks: validSubTasks,
    };
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

    if (Object.prototype.hasOwnProperty.call(updatedData, 'category')) {
      if (updatedData.category) {
        const formattedCategory = formatCategoryTitle(updatedData.category);
        await this.ensureCategoryExists(creatorId as string, formattedCategory);
        updatedData.category = formattedCategory;
      } else {
        updatedData.category = admin.firestore.FieldValue.delete();
      }
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

  static async getTodosByCreator(creatorId: string, category?: string) {
    let query: FirebaseFirestore.Query = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION);

    if (category) {
      query = query.where('category', '==', formatCategoryTitle(category));
    }

    const querySnap = await query.get();

    return querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async getLatestTodos(creatorId: string, latest: boolean, category?: string) {
    let query: FirebaseFirestore.Query = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION);

    if (category) {
      query = query.where('category', '==', formatCategoryTitle(category));
    }

    const querySnap = await query
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

    const todoRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .doc(todoId);

    const todoSnap = await todoRef.get();

    if (!todoSnap.exists) {
      throw new Error('Todo not found');
    }

    // Delete all subtasks in subcollection before deleting the parent todo
    const subtasksSnap = await todoRef.collection(SUBTASK_COLLECTION).get();

    if (!subtasksSnap.empty) {
      let batch = adminFirestore.batch();
      let operationCount = 0;
      const commits: Promise<FirebaseFirestore.WriteResult[]>[] = [];

      subtasksSnap.docs.forEach((doc) => {
        if (operationCount === 499) {
          commits.push(batch.commit());
          batch = adminFirestore.batch();
          operationCount = 0;
        }
        batch.delete(doc.ref);
        operationCount++;
      });

      if (operationCount > 0) {
        commits.push(batch.commit());
      }

      await Promise.all(commits);
    }

    await todoRef.delete();

    return { deleted: true, subtasksDeleted: subtasksSnap.size };
  }
}
