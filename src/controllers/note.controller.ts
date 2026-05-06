import { NextFunction, Response, Request } from 'express';
import { errorRes, successRes } from '../utils/response';
import { NoteService } from '../services/note.service';

export const postNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    const { creatorId, title } = req.body;

    if (!creatorId || !title) {
        errorRes(res, 400, "creatorId and title are required");
        return;
    }

    try{
        const data = await NoteService.postNote(req.body);
        successRes(res, 200, { data }, "Notes created successful");
    } catch (e: any) {
        console.error("Error in postNote:", e);
        errorRes(res, 500, "Error creating note", e.message);
    }
}

export const updateNote = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    try{
        const data = await NoteService.updateNote(req.body);
        successRes(res, 200, { data }, "Note updated successful");
    } catch (e: any) {
        console.error("Error in updateNote:", e);
        errorRes(res, 500, "Error updating note", e.message);
    }
}

export const getNoteById = async (
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> =>{
    try{
        const { creatorId, noteId } = req.body;
        const data = await NoteService.getNoteById(creatorId, noteId);
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
        const { creatorId } = req.body;
        const data = await NoteService.getNotesByCreator(creatorId);
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
        const data = await NoteService.getNotesByTags(creatorId, tags);
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
        const { creatorId, noteId } = req.body;
        await NoteService.deleteNote(creatorId, noteId);
        successRes(res, 200, {}, "Note deleted successfully");
    } catch (e: any) {
        console.error("Error deleting note:", e);
        errorRes(res, 500, "Error deleting note", e.message);
    }
};
