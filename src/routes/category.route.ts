import { Router } from "express";
import { getAllCategory, postCategory, updateCategoryCategory, updateCategory, getCategoryByTitle } from "../controllers/category.controller";

const categoryRoute = Router();

categoryRoute.post("/", postCategory)
categoryRoute.get("/:creatorId", getAllCategory)
categoryRoute.put("/", updateCategory)
categoryRoute.put("/title", updateCategoryCategory)
categoryRoute.post("/title", getCategoryByTitle)

export default categoryRoute