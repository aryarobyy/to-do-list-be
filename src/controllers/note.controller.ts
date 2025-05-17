import { NextFunction, Response, Request } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { serverTimestamp } from 'firebase/firestore';
import { admin, adminFirestore } from '../firebase/admin.sdk';

const NOTES_COLLECTION = 'notes'
const NOTE_COLLECTION = 'note'

enum noteStatus {
    ACTIVE = "ACTIVE",
    DEACTIVE = "DEACTIVE",
}


export const postNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    const { createdBy, updatedBy, title, content, status, priority, tags, collaborators, deadline, reminder, image, link, subTasks } = req.body;
    try{
        const id = v4();

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

        //sementara segini dulu
        const data = {
            id,
            createdBy,
            title,
            content,
            status : finalStatus,
            tags: Array.isArray(tags) ? tags : [], //harus auto capital semua
            subTasks: validSubTasks ?? [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        await adminFirestore
            .collection(NOTES_COLLECTION)
            .doc(createdBy)
            .collection(NOTE_COLLECTION)
            .doc(id)
            .set(data)
            
        const storedSnap = await adminFirestore
            .collection(NOTES_COLLECTION)
            .doc(createdBy)
            .collection(NOTE_COLLECTION)
            .doc(id)
            .get()

        if (!storedSnap.exists) {
                console.warn(`User document ${id} not found after setDoc.`);
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
    const { title, content, createdBy, status, subTasks, createdAt, updatedBy } = req.body
    try{
        if (!createdBy) {
            throw new Error("Creator is required");
        }
        const data: Record<string, any> = {};
        
        if (title != null) data.title = title;
        if (content != null) data.content = content;
        if (status != null) data.status = status;
        if (updatedBy != null) data.updatedBy = updatedBy;
        if (subTasks != null) data.subTasks = subTasks;
        if (createdAt != null) data.createdAt = createdAt;
        data.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        const noteRef = adminFirestore
            .collection(NOTES_COLLECTION)
            .doc(createdBy)
            .collection(NOTE_COLLECTION)
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

        const noteSnap = await adminFirestore
        .collection(NOTES_COLLECTION)
        .doc(creatorId)
        .collection(NOTE_COLLECTION)
        .doc(noteId)
        .get()
        if (!noteSnap.exists) {
            errorRes(res, 404, "Note not found");
            return;
        }
    
        const noteData = noteSnap.data();

        successRes(res, 200, { noteData }, "Getting note successful");
    } catch (e: any) {
        console.error("Wrong noteId:", e);
        errorRes(res, 500, "Error noteId", e.message);
    }
}

export const getNotesByCreator = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
    const { creatorId } = req.params;

    const notesRef = adminFirestore
        .collection(NOTES_COLLECTION)
        .doc(creatorId)
        .collection(NOTE_COLLECTION)

    const snapshot = await notesRef.get();

    const data = snapshot.docs.map((doc) => ({
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
    const { creatorId } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error("Tags must be a non-empty array");
    }

    const notesRef = adminFirestore
    .collection(NOTES_COLLECTION)
    .doc(creatorId)
    .collection(NOTE_COLLECTION);

    const notesQuery = notesRef.where('tags', 'array-contains-any', tags);
    const snapshot = await notesQuery.get();

    const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
    }));

    successRes(res, 200, { data }, "Getting notes by tags successful");
} catch (e: any) {
    console.error("Error getting notes by tags:", e);
    errorRes(res, 500, "Error getting notes by tags", e.message);
}
};
