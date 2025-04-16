import { NextFunction, Response, Request } from 'express';
import { v4 } from 'uuid';
import { errorRes, successRes } from '../utils/response';
import { collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

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

        const creatorRef = doc(firestore, NOTES_COLLECTION, created_by);
        const noteRef = doc(collection(creatorRef, NOTE_COLLECTION), id);
        await setDoc(noteRef, data)

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
        // const cleanId = id.replace(/:/g, '');
        const data: Record<string, any> = {};
        
        if (title !== undefined) data.title = title;
        if (content !== undefined) data.content = content;
        if (update_at !== undefined) {
            data.updatedAt = update_at;
        } else {
            data.updatedAt = serverTimestamp(); 
        }

        const creatorRef = doc(firestore, NOTES_COLLECTION, created_by);
        const noteRef = doc(collection(creatorRef, NOTE_COLLECTION), id);
        const docSnap = await getDoc(noteRef);
        
        if (!docSnap.exists()) {
            throw new Error(`Note with ID ${id} does not exist`);
        }

        await updateDoc(noteRef, data);
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
        const userData = await getDoc(doc(firestore, NOTE_COLLECTION, id))
        successRes(res, 200, { userData }, "Getting note successful");
    } catch (e: any) {
        console.error("Wrong noteId:", e);
        errorRes(res, 500, "Error noteId", e.message);
    }
}

export const getNotesByCreator = async (
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> =>{
        try {
        const { creatorId } = req.params;
        
        const notesQuery = query(
            collection(firestore, NOTE_COLLECTION),
            where('created_by', '==', creatorId)
        );
        
        const querySnapshot = await getDocs(notesQuery);
        const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
        successRes(res, 200, { notes }, "Getting notes successful");
        }  catch (e: any) {
        console.error("Wrong noteId:", e);
        errorRes(res, 500, "Error noteId", e.message);
    }
}

export const getNotesByTags = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    try{
        const { creatorId } = req.params
        const { tags } = req.body //body atau params
        const noteData = await getDoc(doc(firestore, NOTE_COLLECTION, creatorId))
        const notesQuery = query(
            collection(firestore, NOTE_COLLECTION, noteData.id),
            where('tags', 'array-contains', tags)
        );
        const querySnapshot = await getDocs(notesQuery);
        successRes(res, 200, { querySnapshot }, "Getting notes successful");
    } catch (e: any) {
        console.error("Wrong tags", e);
        errorRes(res, 500, "Error tags", e.message);
    }
}