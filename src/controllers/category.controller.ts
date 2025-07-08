import { NextFunction, Request, Response } from "express";
import { errorRes, successRes } from "../utils/response";
import { admin, adminFirestore } from "../firebase/admin.sdk";

const USER_COLLECTION = 'users'
const CATEGORY_COLLECTION = 'category'

export const postCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, noteId, creatorId } = req.body;

        if (!creatorId || !title) {
        errorRes(res, 400, "creator, title, or noteId is empty or invalid");
        return;
        }

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
          } else if (Array.isArray(noteId) && noteId.length === 0) {
        }

        await categoryRef.set(postedData, { merge: true });

        const storedSnap = await categoryRef.get();
        successRes(res, 200, { data: {
          title: storedSnap.id,
          ...storedSnap.data()} 
        }, "Category saved successfully");
    } catch (e: any) {
        console.error("Error in postCategory:", e);
        errorRes(res, 500, "Failed to save category", e.message);
    }
};

export const getAllCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    try{
        const { creatorId } = req.params

        if(!creatorId ){
          errorRes(res, 400, "creatorId is empty");
        }

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
            .get()

        const data = categoryRef.docs.map((doc) => ({
            title: doc.id,
            ...doc.data()
        }));

        successRes(res, 200, { data }, "  successful");
    } catch (e: any) {
        console.error("Error in :", e);
        errorRes(res, 500, "Error ", e.message);
    }
}

export const updateCategoryTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { creatorId, oldTitle, newTitle } = req.body;

    if (!creatorId || !oldTitle || !newTitle) {
      errorRes(res, 400, "creatorId, oldTitle, or newTitle missing");
      return;
    }

    const oldTitleFormatted = titleHandler(oldTitle);
    const newTitleFormatted = titleHandler(newTitle);

    const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId)

    const oldRef = creatorRef
        .collection(CATEGORY_COLLECTION)
        .doc(oldTitleFormatted)

    const newRef = creatorRef
        .collection(CATEGORY_COLLECTION)
        .doc(newTitleFormatted)

    const oldSnap = await oldRef.get()

    if (!oldSnap.exists) {
      errorRes(res, 404, "Old category not found")
      return;
    }

    const oldData = oldSnap.data();

    await newRef.set({
      ...oldData,
      title: newTitleFormatted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await oldRef.delete();

    successRes(res, 200, { newTitle: newTitleFormatted }, "Category renamed successfully");
  } catch (e: any) {
    console.error("Error in renameCategoryCollection:", e)
    errorRes(res, 500, "Failed to rename category", e.message)
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { creatorId, title, addNoteId = [], removeNoteId = [] } = req.body;

  try {
    if (!creatorId || !title) {
      errorRes(res, 400, "creatorId and title are required");
      return;
    }

    const formattedTitle = titleHandler(title);
    const categoryRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(CATEGORY_COLLECTION)
      .doc(formattedTitle);

    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      errorRes(res, 404, `Category '${formattedTitle}' not found`);
      return;
    }

    if (addNoteId.length > 0 && !categorySnap.get("noteId")) {
      await categoryRef.update({ noteId: [] });
    }

    const updateData: Record<string, any> = {};

    if (addNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayUnion(...addNoteId)
    if (removeNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayRemove(...removeNoteId)

    await categoryRef.update(updateData);

    successRes(res, 200, { data: updateData }, "Category updated successfully");
  } catch (e: any) {
    console.error("Error in updateCategory:", e);
    errorRes(res, 500, "Failed to update category", e.message);
  }
};

export const getCategoryByTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { creatorId, title } = req.body;

    if (!creatorId || !title) {
      errorRes(res, 400, "Missing required fields: 'creatorId' or 'title'");
      return;
    }

    const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId);
    const creatorSnap = await creatorRef.get();

    if (!creatorSnap.exists) {
      errorRes(res, 404, `User with ID '${creatorId}' not found.`);
      return;
    }

    const formattedTitle = titleHandler(title);
    const categoryRef = creatorRef
    .collection(CATEGORY_COLLECTION)
    .doc(formattedTitle);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      errorRes(res, 404, `Category item titled '${formattedTitle}' not found.`);
      return;
    }

    const categoryDataWithId = {
      title: categorySnap.id,
      ...categorySnap.data()
    };

    successRes(res, 200, { data: categoryDataWithId }, "Category retrieved successfully.");
  } catch (error: any) {
    console.error("Error in getCategoryByTitle:", error);
    errorRes(res, 500, "Internal server error", error.message);
  }
};

const titleHandler = (title: string): string => {
  return title
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
}
