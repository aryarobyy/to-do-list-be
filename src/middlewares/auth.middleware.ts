import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/jwt';
import { errorRes } from '../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  if (req.path.startsWith('/public') || req.path.match(/\.(png|jpg|jpeg|gif|ico|css|js|map)$/)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    errorRes(res, 401, 'Authorization header is missing');
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    errorRes(res, 401, 'Invalid authorization header format. Expected "Bearer <token>"');
    return;
  }

  const token = parts[1];

  try {
    const decoded = verifyJwtToken(token);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err.message);
    errorRes(res, 401, 'Invalid or expired access token', err.message);
    return;
  }
};
