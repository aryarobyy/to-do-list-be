import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { JWT_EXPIRED, JWT_REFRESH_SECRET, JWT_SECRET } from "../core/constants";

const EXPIRED_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_EXPIRED_MS = 30 * 24 * 60 * 60 * 1000;

export interface AppJwtPayload extends JwtPayload {
    userId: string;
}

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

export const isAppJwtPayload = (decoded: string | JwtPayload): decoded is AppJwtPayload => {
    return typeof decoded !== "string" && typeof decoded.userId === "string";
};

export const parseBearerToken = (authHeader?: string): string | null => {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
        return null;
    }

    return parts[1];
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET as string);
};

export const decodeExpiredJwtToken = (token: string): any => {
    return jwt.decode(token);
};
