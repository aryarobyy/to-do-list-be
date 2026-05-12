import type { AppJwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AppJwtPayload;
    }
  }
}

export {};
