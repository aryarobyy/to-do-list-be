import { admin, adminFirestore } from "../firebase/admin.sdk";
import { CATEGORY_COLLECTION, TODO_COLLECTION, USER_COLLECTION } from "../core/constants";
import { formatCategoryTitle } from "../utils/category";
import { sanitizeLimit, sanitizeOffset, stripTimestamps } from "../utils/query";

export const titleHandler = (title: string): string => {
  return formatCategoryTitle(title);
}

export class CategoryService {
  private static async updateTodosCategory(creatorId: string, oldCategory: string, newCategory?: string) {
    const todosSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(TODO_COLLECTION)
      .where("category", "==", oldCategory)
      .get();

    if (todosSnap.empty) {
      return 0;
    }

    let batch = adminFirestore.batch();
    let operationCount = 0;
    const commits: Promise<FirebaseFirestore.WriteResult[]>[] = [];

    todosSnap.docs.forEach((doc) => {
      if (operationCount === 499) {
        commits.push(batch.commit());
        batch = adminFirestore.batch();
        operationCount = 0;
      }

      batch.update(doc.ref, {
        category: newCategory || admin.firestore.FieldValue.delete(),
      });
      operationCount++;
    });

    if (operationCount > 0) {
      commits.push(batch.commit());
    }

    await Promise.all(commits);
    return todosSnap.size;
  }

  static async postCategory(creatorId: string, title: string, noteId: any[]) {
    const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId);
    const creatorSnap = await creatorRef.get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const titleFormat = titleHandler(title);
    const categoryRef = creatorRef.collection(CATEGORY_COLLECTION).doc(titleFormat);

    const postedData: { [key: string]: any } = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (Array.isArray(noteId) && noteId.length > 0) {
      postedData.noteId = admin.firestore.FieldValue.arrayUnion(...noteId);
    }

    await categoryRef.set(postedData, { merge: true });

    const storedSnap = await categoryRef.get();
    return {
      title: storedSnap.id,
      ...storedSnap.data()
    };
  }

  static async getAllCategory(creatorId: string, limit?: number, offset?: number) {
    const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
    }

    const queryLimit = sanitizeLimit(limit);
    const queryOffset = sanitizeOffset(offset);
    const categoryRef = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(CATEGORY_COLLECTION)
        .offset(queryOffset)
        .limit(queryLimit)
        .get();

    return categoryRef.docs.map((doc) => stripTimestamps({
        title: doc.id,
        ...doc.data()
    }));
  }

  static async updateCategoryTitle(creatorId: string, oldTitle: string, newTitle: string) {
    const oldTitleFormatted = titleHandler(oldTitle);
    const newTitleFormatted = titleHandler(newTitle);

    const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId)
    const oldRef = creatorRef.collection(CATEGORY_COLLECTION).doc(oldTitleFormatted)
    const newRef = creatorRef.collection(CATEGORY_COLLECTION).doc(newTitleFormatted)

    const oldSnap = await oldRef.get()

    if (!oldSnap.exists) {
      throw new Error("Old category not found");
    }

    if (oldTitleFormatted === newTitleFormatted) {
      return { newTitle: newTitleFormatted, updatedTodoCount: 0 };
    }

    const oldData = oldSnap.data();

    await newRef.set({
      ...oldData,
      title: newTitleFormatted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedTodoCount = await this.updateTodosCategory(creatorId, oldTitleFormatted, newTitleFormatted);

    await oldRef.delete();

    return { newTitle: newTitleFormatted, updatedTodoCount };
  }

  static async updateCategory(creatorId: string, title: string, addNoteId: any[], removeNoteId: any[]) {
    const formattedTitle = titleHandler(title);
    const categoryRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(CATEGORY_COLLECTION)
      .doc(formattedTitle);

    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      throw new Error(`Category '${formattedTitle}' not found`);
    }

    if (!categorySnap.get("noteId")) {
      await categoryRef.update({ noteId: [] });
    }

    if (addNoteId.length > 0) {
      await categoryRef.update({
        noteId: admin.firestore.FieldValue.arrayUnion(...addNoteId),
      });
    }

    if (removeNoteId.length > 0) {
      await categoryRef.update({
        noteId: admin.firestore.FieldValue.arrayRemove(...removeNoteId),
      });
    }

    const updatedSnap = await categoryRef.get();
    const updatedData = updatedSnap.data();

    return {
      creatorId,
      title: formattedTitle,
      ...updatedData,
    };
  }

  static async getCategoryByTitle(creatorId: string, title: string) {
    const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId);
    const creatorSnap = await creatorRef.get();

    if (!creatorSnap.exists) {
      throw new Error(`User with ID '${creatorId}' not found.`);
    }

    const formattedTitle = titleHandler(title);
    const categoryRef = creatorRef.collection(CATEGORY_COLLECTION).doc(formattedTitle);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      throw new Error(`Category item titled '${formattedTitle}' not found.`);
    }

    return {
      title: categorySnap.id,
      ...categorySnap.data()
    };
  }

  static async deleteCategory(creatorId: string, title: string) {
    const formattedTitle = titleHandler(title);
    const categoryRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(CATEGORY_COLLECTION)
      .doc(formattedTitle);

    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      throw new Error(`Category '${formattedTitle}' not found`);
    }

    const updatedTodoCount = await this.updateTodosCategory(creatorId, formattedTitle);

    await categoryRef.delete();
    return { deleted: true, updatedTodoCount };
  }
}
