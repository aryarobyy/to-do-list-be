import { Router } from "express";
import { getNoteById, getNotesByCreator, getNotesByTags, postNote, updateNote } from "../controllers/note.controller";

const noteRouter = Router()

noteRouter.post('/', postNote)
noteRouter.put('/update/:id', updateNote)
noteRouter.get('/:id', getNoteById)
noteRouter.get('/creator/:creatorId', getNotesByCreator)
noteRouter.get('/tags', getNotesByTags)

export default noteRouter