import { Request, Response, NextFunction } from 'express';
import { errorRes } from '../utils/response';
import { Role } from '../models/user.model';

export const roleChecker = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      errorRes(res, 401, 'Authentication required');
      return;
    }

    if (!user.role) {
      errorRes(res, 403, 'User role not found');
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      errorRes(res, 403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      return;
    }

    next();
  };
};
