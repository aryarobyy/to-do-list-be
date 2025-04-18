import { NextFunction, Response, Request } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { admin, adminFirestore } from '../firebase/admin.sdk';

const NOTES_COLLECTION = 'notes'
const NOTE_COLLECTION = 'note'
const firestore = getFirestore();

export const postNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    const { created_by, title, content, status, priority, tags, collaborators, deadline, reminder, image, link, created_at, update_at } = req.body;
    try{
        const id = v4();
        //sementara segini dulu
        const data = {
            id,
            createdBy: created_by,
            title,
            content,
            // status,
            createdAt: created_at || serverTimestamp(),
            updatedAt: update_at || serverTimestamp()
        }

        // const creatorRef = doc(firestore, NOTES_COLLECTION, created_by);
        // const noteRef = doc(collection(creatorRef, NOTE_COLLECTION), id);
        // await setDoc(noteRef, data)

        await adminFirestore
            .collection(NOTES_COLLECTION)
            .doc(created_by)
            .collection(NOTE_COLLECTION)
            .doc(id)
            .set(data)

        
        const storedSnap = await adminFirestore
            .collection(NOTES_COLLECTION)
            .doc(created_by)
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
    const { id } = req.params;
    const { title, content, created_by, update_at } = req.body
    try{
        if (!created_by) {
            throw new Error("Creator is required");
        }
        const data: Record<string, any> = {};
        
        if (title !== undefined) data.title = title;
        if (content !== undefined) data.content = content;
        if (update_at !== undefined) {
            data.updatedAt = update_at;
        } else {
            data.updatedAt = serverTimestamp(); 
        }

        const noteRef = adminFirestore
        .collection(NOTES_COLLECTION)
        .doc(created_by)
        .collection(NOTE_COLLECTION)
        .doc(id);

        await noteRef.set(data);
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
        const { id } = req.params

        const noteSnap = await adminFirestore
        .collection(NOTE_COLLECTION)
        .doc(id)
        .get()
        if (!noteSnap.exists) {
            errorRes(res, 404, "User not found");
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

    const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

    successRes(res, 200, { notes }, "Getting notes successful");
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

    const notes = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
    }));

    successRes(res, 200, { notes }, "Getting notes by tags successful");
} catch (e: any) {
    console.error("Error getting notes by tags:", e);
    errorRes(res, 500, "Error getting notes by tags", e.message);
}
};
