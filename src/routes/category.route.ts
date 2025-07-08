import { Router } from "express";
import { getAllCategory, postCategory, updateCategoryTitle, updateCategory, getCategoryByTitle } from "../controllers/category.controller";

const categoryRoute = Router();

categoryRoute.post("/", postCategory)
categoryRoute.get("/:creatorId", getAllCategory)
categoryRoute.put("/", updateCategory)
categoryRoute.put("/title", updateCategoryTitle)
categoryRoute.post("/title", getCategoryByTitle)

export default categoryRoute