import { NextFunction, Request, Response } from "express";
import { errorRes, successRes } from "../utils/response";
import { CategoryService } from "../services/category.service";

export const postCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, noteId } = req.body;
        const creatorId = req.user!.userId;

        if (!title) {
          errorRes(res, 400, "title is empty or invalid");
          return;
        }

        const data = await CategoryService.postCategory(creatorId, title, noteId || []);
        successRes(res, 200, { data }, "Category saved successfully");
    } catch (e: any) {
        console.error("Error in postCategory:", e);
        errorRes(res, 500, "Failed to save category", e.message);
    }
};

export const getAllCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    try{
        const { limit, offset } = req.body;
        const creatorId = req.user!.userId;

        const data = await CategoryService.getAllCategory(creatorId, limit, offset);
        successRes(res, 200, { data }, "Category list successful");
    } catch (e: any) {
        console.error("Error in getAllCategory:", e);
        errorRes(res, 500, "Error getting category", e.message);
    }
}

export const updateCategoryTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oldTitle, newTitle } = req.body;
    const creatorId = req.user!.userId;

    if (!oldTitle || !newTitle) {
      errorRes(res, 400, "oldTitle or newTitle missing");
      return;
    }

    const data = await CategoryService.updateCategoryTitle(creatorId, oldTitle, newTitle);
    successRes(res, 200, data, "Category renamed successfully");
  } catch (e: any) {
    console.error("Error in updateCategoryTitle:", e)
    errorRes(res, 500, "Failed to rename category", e.message)
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, addNoteId = [], removeNoteId = [] } = req.body;
  const creatorId = req.user!.userId;

  try {
    if (!title) {
      errorRes(res, 400, "title is required");
      return;
    }

    const data = await CategoryService.updateCategory(creatorId, title, addNoteId, removeNoteId);
    successRes(res, 200, { data }, "Category updated successfully");
  } catch (e: any) {
    console.error("Error in updateCategory:", e);
    errorRes(res, 500, "Failed to update category", e.message);
  }
};

export const getCategoryByTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;
    const creatorId = req.user!.userId;

    if (!title) {
      errorRes(res, 400, "Missing required field: 'title'");
      return;
    }

    const data = await CategoryService.getCategoryByTitle(creatorId, title);
    successRes(res, 200, { data }, "Category retrieved successfully.");
  } catch (error: any) {
    console.error("Error in getCategoryByTitle:", error);
    errorRes(res, 500, "Internal server error", error.message);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;
    const creatorId = req.user!.userId;

    if (!title) {
      errorRes(res, 400, "title is required");
      return;
    }

    const data = await CategoryService.deleteCategory(creatorId, title);
    successRes(res, 200, { data }, "Category deleted successfully");
  } catch (e: any) {
    console.error("Error in deleteCategory:", e);
    errorRes(res, 500, "Failed to delete category", e.message);
  }
};
