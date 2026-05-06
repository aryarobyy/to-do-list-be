import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { JWT_EXPIRED, JWT_REFRESH_SECRET, JWT_SECRET } from "../core/constants";

const EXPIRED_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_EXPIRED_MS = 30 * 24 * 60 * 60 * 1000;

export const generateJwt = (userId: string) => {
    const token = jwt.sign({ userId }, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRED as StringValue,
    });
    const expiresAt = new Date(Date.now() + EXPIRED_MS);
    return { token, expiresAt };
};

export const generateRefreshToken = (userId: string) => {
    const token = jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET as string, {
        expiresIn: '30d' as StringValue,
    });
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRED_MS);
    return { token, expiresAt };
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as string);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET as string);
};

export const decodeExpiredJwtToken = (token: string): any => {
    return jwt.decode(token);
};
