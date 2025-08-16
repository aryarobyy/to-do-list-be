import { NextFunction, Response, Request } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { admin, adminFirestore } from '../firebase/admin.sdk';
import { CATEGORY_COLLECTION, NOTES_COLLECTION, USER_COLLECTION } from '../core/constants';

enum noteStatus {
    ACTIVE = "ACTIVE",
    DEACTIVE = "DEACTIVE",
}

export const postNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    const { creatorId, schedule = '', updatedBy, title, content = '', status, priority, tags = [], collaborators, deadline, reminder, image, link, subTasks = [] } = req.body;
    try{
        const id = v4();

        const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

        if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
        }

        const validSubTasks = Array.isArray(subTasks) //pengecekan array
        ? subTasks.map((t) => ({
            text: t.text || "",
            isDone: !!t.isDone,
            isBold: !!t.isBold
        }))
        : [];

        const isValidStatus = (status: any): status is noteStatus =>
            Object.values(noteStatus).includes(status);
        
        const finalStatus = isValidStatus(status) ? status : noteStatus.ACTIVE;

        const formattedTags = Array.isArray(tags)
            ? tags.map((tag) => tag.toUpperCase())
            : [];
        //sementara segini dulu
        const data = {
            id,
            creatorId,
            title,
            content,
            schedule,
            status : finalStatus,
            tags: formattedTags, //harus auto capital semua
            subTasks: validSubTasks,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(NOTES_COLLECTION)
            .doc(id)
            .set(data)
            
        const storedSnap = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(NOTES_COLLECTION)
            .doc(id)
            .get()

        if (!storedSnap.exists) {
            console.warn(`Note document ${id} not found after setDoc.`);
        } else {
            console.log("Data successfully stored in Firestore:", storedSnap.data());
        }
        successRes(res, 200, { data }, "Notes created successful");
    } catch (e: any) {
        console.error("Error in :", e);
        errorRes(res, 500, "Error ", e.message);
    }
}

export const updateNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    const { noteId } = req.params;
    const { title, content, creatorId, status, subTasks, createdAt, updatedBy, schedule } = req.body
    try{
        if (!creatorId) {
            throw new Error("Creator is required");
        }

        const creatorSnap = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .get();

        if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
        }

        const data: Record<string, any> = {};
        
        if (title != null) data.title = title;
        if (content != null) data.content = content;
        if (schedule != null) data.schedule = schedule;
        if (status != null) data.status = status;
        if (updatedBy != null) data.updatedBy = updatedBy;
        if (subTasks != null) data.subTasks = subTasks;
        if (createdAt != null) data.createdAt = createdAt;
        data.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        const noteRef = adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(NOTES_COLLECTION)
            .doc(noteId);

        await noteRef.update(data);
        successRes(res, 200, { data }, "  successful");
    } catch (e: any) {
        console.error("Error in :", e);
        errorRes(res, 500, "Error ", e.message);
    }
}

export const getNoteById = async (
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> =>{
    try{
        const { creatorId, noteId } = req.params

        const creatorSnap = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .get();

        if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
        }

        const noteSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .doc(noteId)
        .get()
        if (!noteSnap.exists) {
            errorRes(res, 404, "Note not found");
            return;
        }
    
        const data = noteSnap.data();

        successRes(res, 200, { data }, "Getting note successful");
    } catch (e: any) {
        console.error("Wrong noteId:", e);
        errorRes(res, 500, "Error getting note", e.message);
    }
}

export const getNotesByCreator = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
    const { creatorId } = req.params;

    const notesRef = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .get();

    const data = notesRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

    successRes(res, 200, { data }, "Getting notes successful");
    } catch (e: any) {
        console.error("Error getting notes by creator:", e);
        errorRes(res, 500, "Error getting notes", e.message);
    }
};

export const getNotesByTags = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { tags, creatorId } = req.body;

        if (!Array.isArray(tags) || tags.length === 0) {
            errorRes(res, 400, "Tags must be a non-empty array");
        }

        const creatorDoc = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .get();
        if (!creatorDoc.exists) {
            errorRes(res, 404, "User not found");
        }

        const notesRef = adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(NOTES_COLLECTION);

        const snapshot = await notesRef
            .where('tags', 'array-contains-any', tags)
            .get();

        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        successRes(res, 200, { data }, "Getting notes successful");
    } catch (e: any) {
        console.error("Error getting notes by tags:", e);
        errorRes(res, 500, "Internal server error", e.message);
    }
};

export const deleteNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { creatorId, noteId } = req.params;

        const creatorSnap = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .get();

        if (!creatorSnap.exists) {
            throw new Error(`Unknown creator: ${creatorId}`);
        }

        const data = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(creatorId)
            .collection(NOTES_COLLECTION)
            .doc(noteId)
            .delete();

        successRes(res, 200, { data }, "Note deleted successfully");
    } catch (e: any) {
        console.error("Error deleting note:", e);
        errorRes(res, 500, "Error deleting note", e.message);
    }
};

