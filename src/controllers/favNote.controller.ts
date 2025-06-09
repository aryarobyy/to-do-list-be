import { NextFunction, Request, Response } from "express";
import { errorRes, successRes } from "../utils/response";
import { admin, adminFirestore } from "../firebase/admin.sdk";

const USER_COLLECTION = 'users'
const FAV_COLLECTION = 'favourite'

export const postFav = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, noteId = [], creatorId } = req.body;

        if (!creatorId || !title || !Array.isArray(noteId) || noteId.length === 0) {
        errorRes(res, 400, "creator, title, or noteId is empty or invalid");
        return;
        }

        const creatorRef = adminFirestore.collection(USER_COLLECTION).doc(creatorId);
        const creatorSnap = await creatorRef.get();

        if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
        }

        const titleFormat = titleHandler(title);

        const favRef = creatorRef.collection(FAV_COLLECTION).doc(titleFormat);

        await favRef.set(
        {
          noteId: admin.firestore.FieldValue.arrayUnion(...noteId),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
        );

        const storedSnap = await favRef.get();

        successRes(res, 200, { data: storedSnap.data() }, "Favourite saved successfully");
    } catch (e: any) {
        console.error("Error in postFav:", e);
        errorRes(res, 500, "Failed to save favourite", e.message);
    }
};

export const getAllFav = async (
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
        
        const favRef = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(FAV_COLLECTION)
            .get()

        const data = favRef.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        successRes(res, 200, { data }, "  successful");
    } catch (e: any) {
        console.error("Error in :", e);
        errorRes(res, 500, "Error ", e.message);
    }
}

export const updateFavCategory = async (
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
        .collection(FAV_COLLECTION)
        .doc(oldTitleFormatted)

    const newRef = creatorRef
        .collection(FAV_COLLECTION)
        .doc(newTitleFormatted)

    const oldSnap = await oldRef.get()

    if (!oldSnap.exists) {
      errorRes(res, 404, "Old favourite not found")
      return;
    }

    const oldData = oldSnap.data();

    await newRef.set({
      ...oldData,
      title: newTitleFormatted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await oldRef.delete();

    successRes(res, 200, { newTitle: newTitleFormatted }, "Favourite renamed successfully");
  } catch (e: any) {
    console.error("Error in renameFavCollection:", e)
    errorRes(res, 500, "Failed to rename favourite", e.message)
  }
};


export const updateFav = async (
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
    const favRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(FAV_COLLECTION)
      .doc(formattedTitle);

    const favSnap = await favRef.get();

    if (!favSnap.exists) {
      errorRes(res, 404, `Favorite '${formattedTitle}' not found`);
      return;
    }

    if (addNoteId.length > 0 && !favSnap.get("noteId")) {
      await favRef.update({ noteId: [] });
    }

    const updateData: Record<string, any> = {};

    if (addNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayUnion(...addNoteId)
    if (removeNoteId.length > 0) updateData.noteId = admin.firestore.FieldValue.arrayRemove(...removeNoteId)

    await favRef.update(updateData);

    successRes(res, 200, { data: updateData }, "Favorite updated successfully");
  } catch (e: any) {
    console.error("Error in updateFav:", e);
    errorRes(res, 500, "Failed to update favorite", e.message);
  }
};

export const getFavByTitle = async (
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
    const favRef = creatorRef
    .collection(FAV_COLLECTION)
    .doc(formattedTitle);
    const favSnap = await favRef.get();

    if (!favSnap.exists) {
      errorRes(res, 404, `Favorite item titled '${formattedTitle}' not found.`);
      return;
    }

    const favDataWithId = {
      id: favSnap.id,
      ...favSnap.data()
    };

    successRes(res, 200, { data: favDataWithId }, "Favorite retrieved successfully.");
  } catch (error: any) {
    console.error("Error in getFavByTitle:", error);
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
