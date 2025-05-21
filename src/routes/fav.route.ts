import { Router } from "express";
import { getAllFav, postFav, updateFavCategory, updateFav, getFavByTitle } from "../controllers/favNote.controller";

const favRoute = Router();

favRoute.post("/", postFav)
favRoute.get("/:creatorId", getAllFav)
favRoute.put("/", updateFav)
favRoute.put("/category", updateFavCategory)
favRoute.post("/title", getFavByTitle)

export default favRoute