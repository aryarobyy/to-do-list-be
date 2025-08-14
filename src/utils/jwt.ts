import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { JWT_EXPIRED, JWT_SECRET } from "../core/constants";

export const generateJwt = (userId: String) => {; 
    return jwt.sign({ userId }, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRED as StringValue,
    });
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as string);
};