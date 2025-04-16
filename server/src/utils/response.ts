import { Response } from 'express';

export const successRes = (
    res: Response,
    statusCode: number = 200,
    data: any = {},
    message: string = "Success"
    ) => {
    return res.status(statusCode).json({ message, data });
};

export const errorRes = (
    res: Response,
    statusCode: number = 500,
    error: string = "Error",
    details?: any
) => {
    return res.status(statusCode).json({ error, details });
};
