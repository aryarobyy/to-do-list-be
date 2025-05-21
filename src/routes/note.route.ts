import { Router } from "express";
import { getNoteById, getNotesByCreator, getNotesByTags, postNote, updateNote } from "../controllers/note.controller";

const noteRouter = Router()

noteRouter.post('/', postNote)
noteRouter.put('/:noteId', updateNote)
noteRouter.get('/:creatorId/:noteId', getNoteById)
noteRouter.get('/:creatorId', getNotesByCreator)    
noteRouter.post('/tags', getNotesByTags);

export default noteRouter