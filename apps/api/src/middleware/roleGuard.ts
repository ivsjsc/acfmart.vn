import { Request, Response, NextFunction } from 'express';

// Guard kiểm tra vai trò người dùng
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Cần vai trò: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireSeller = requireRole('SELLER', 'ADMIN');
export const requireAffiliate = requireRole('AFFILIATE', 'ADMIN');
