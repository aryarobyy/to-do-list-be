import { admin, adminFirestore } from "../firebase/admin.sdk";
import { CATEGORY_COLLECTION, USER_COLLECTION } from "../core/constants";

export const titleHandler = (title: string): string => {
  return title
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
}

export class CategoryService {
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

  static async getAllCategory(creatorId: string) {
    const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
    }
    
    const categoryRef = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(CATEGORY_COLLECTION)
        .get();

    return categoryRef.docs.map((doc) => ({
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

    const oldData = oldSnap.data();

    await newRef.set({
      ...oldData,
      title: newTitleFormatted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await oldRef.delete();

    return { newTitle: newTitleFormatted };
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

    const updateData: Record<string, any> = {};

    if (addNoteId.length > 0 && !categorySnap.get("noteId")) {
      await categoryRef.update(updateData);
    }

    const updatedSnap = await categoryRef.get();
    const updatedData = updatedSnap.data();

    if (addNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayUnion(...addNoteId)
    if (removeNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayRemove(...removeNoteId)

    await categoryRef.update(updateData);

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

    await categoryRef.delete();
    return true;
  }
}
