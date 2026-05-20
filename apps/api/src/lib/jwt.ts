import jwt from 'jsonwebtoken';

function getJwtSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET', fallback: string): string {
  const value = process.env[name] || fallback;
  const isUnsafeProductionSecret =
    process.env.NODE_ENV === 'production' &&
    (!process.env[name] || value === fallback || value.length < 32 || /change|default|dev|secret-key/i.test(value));

  if (isUnsafeProductionSecret) {
    throw new Error(`${name} must be set to a strong secret in production`);
  }

  return value;
}

const JWT_SECRET = getJwtSecret('JWT_SECRET', 'acfmart-secret-key');
const JWT_REFRESH_SECRET = getJwtSecret('JWT_REFRESH_SECRET', 'acfmart-refresh-secret');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

// Tạo access token
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// Tạo refresh token
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

// Xác thực access token
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Xác thực refresh token
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}
