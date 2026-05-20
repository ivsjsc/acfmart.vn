import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import redis from '../../lib/redis';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

// Dịch vụ xác thực người dùng
export const authService = {
  // Đăng ký tài khoản mới
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
      },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Lưu refresh token vào Redis (TTL 7 ngày)
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

    return { user, accessToken, refreshToken };
  },

  // Đăng nhập
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, passwordHash: true, isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  // Làm mới access token
  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const stored = await redis.get(`refresh:${payload.userId}`);

    if (!stored || stored !== token) {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new Error('Tài khoản không tồn tại hoặc đã bị khóa');

    const newPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);
    return { accessToken, refreshToken };
  },

  // Đăng xuất
  async logout(userId: string) {
    await redis.del(`refresh:${userId}`);
  },

  // Lấy thông tin người dùng hiện tại
  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, avatar: true, isVerified: true, createdAt: true,
        seller: { select: { id: true, shopName: true, isVerified: true, isPro: true } },
      },
    });
  },
};
