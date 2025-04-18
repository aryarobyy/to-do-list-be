import { NextFunction, Request, Response } from "express";
import { errorRes, successRes } from "../utils/response";

export const exampleReq = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> =>{
    try{

        successRes(res, 200, {  }, "  successful");
    } catch (e: any) {
        console.error("Error in :", e);
        errorRes(res, 500, "Error ", e.message);
    }
}