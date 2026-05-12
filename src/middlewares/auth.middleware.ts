import { Request, Response, NextFunction } from 'express';
import { isAppJwtPayload, parseBearerToken, verifyJwtToken } from '../utils/jwt';
import { errorRes } from '../utils/response';

const PUBLIC_ROUTES = new Set([
  'POST /auth/register',
  'POST /auth/login',
  'POST /auth/token',
  'POST /auth/sign-in',
]);

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  if (req.path.startsWith('/public') || req.path.match(/\.(png|jpg|jpeg|gif|ico|css|js|map)$/)) {
    return next();
  }

  if (PUBLIC_ROUTES.has(`${req.method} ${req.path}`)) {
    return next();
  }

  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    errorRes(res, 401, 'Authorization header is missing');
    return;
  }

  try {
    const decoded = verifyJwtToken(token);

    if (!isAppJwtPayload(decoded)) {
      errorRes(res, 401, 'Invalid access token payload');
      return;
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err.message);
    errorRes(res, 401, 'Invalid or expired access token', err.message);
    return;
  }
};
