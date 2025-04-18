import { Router } from "express";
import { getNoteById, getNotesByCreator, getNotesByTags, postNote, updateNote } from "../controllers/note.controller";

const noteRouter = Router()

noteRouter.post('/', postNote)
noteRouter.put('/update/:noteId', updateNote)
noteRouter.get('/:creatorId/:noteId', getNoteById)
noteRouter.get('/creator/:creatorId', getNotesByCreator)
noteRouter.get('/tags/:creatorId', getNotesByTags)

export default noteRouter