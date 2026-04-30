import { Router } from "express";
import { getAllCategory, postCategory, updateCategoryTitle, updateCategory, getCategoryByTitle, deleteCategory } from "../controllers/category.controller";

const categoryRoute = Router();

categoryRoute.post("/create", postCategory)
categoryRoute.post("/list", getAllCategory)
categoryRoute.post("/update", updateCategory)
categoryRoute.post("/update-title", updateCategoryTitle)
categoryRoute.post("/get-title", getCategoryByTitle)
categoryRoute.post("/delete", deleteCategory)

export default categoryRoute