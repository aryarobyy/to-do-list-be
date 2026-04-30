import { Router } from "express";
import { getNoteById, getNotesByCreator, getNotesByTags, postNote, updateNote, deleteNote } from "../controllers/note.controller";

const noteRouter = Router()

noteRouter.post('/create', postNote)
noteRouter.post('/update', updateNote)
noteRouter.post('/get', getNoteById)
noteRouter.post('/list', getNotesByCreator)    
noteRouter.post('/tags', getNotesByTags);
noteRouter.post('/delete', deleteNote);

export default noteRouter