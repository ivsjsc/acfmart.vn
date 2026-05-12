// =============================================================================
// QR Code Service — Product Traceability
// =============================================================================

import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

const QR_BASE_URL = process.env.PUBLIC_URL ?? 'https://acf.vn';

function generateShortCode(): string {
  return `ACF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function generateQrCode(
  prisma: PrismaClient,
  productId: string,
): Promise<void> {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: {
      name: true,
      brandName: true,
      manufacturerName: true,
      originCountry: true,
      batchNumber: true,
    },
  });

  // Ensure unique short code
  let code: string;
  let attempts = 0;
  do {
    code = generateShortCode();
    const existing = await prisma.qrCode.findUnique({ where: { code } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  const verifyUrl = `${QR_BASE_URL}/verify/${code}`;

  // In production: generate actual QR image using 'qrcode' package + upload to S3
  // const qrImageBuffer = await QRCode.toBuffer(verifyUrl, { width: 400 });
  // const qrImageUrl = await uploadToS3(qrImageBuffer, `qr/${productId}.png`);
  const qrImageUrl = `${QR_BASE_URL}/api/qr/${code}.png`;

  await prisma.qrCode.upsert({
    where: { productId },
    create: {
      productId,
      code,
      qrImageUrl,
      verifyUrl,
      manufacturerName: product.manufacturerName,
      batchNumber: product.batchNumber,
      originCountry: product.originCountry,
    },
    update: {
      qrImageUrl,
      verifyUrl,
    },
  });
}

export async function verifyQrCode(
  prisma: PrismaClient,
  code: string,
): Promise<{ valid: boolean; product?: object; revokedReason?: string }> {
  const qr = await prisma.qrCode.findUnique({
    where: { code },
    include: { product: { select: { name: true, status: true, shop: { select: { shopName: true } } } } },
  });

  if (!qr) return { valid: false };
  if (qr.isRevoked) return { valid: false, revokedReason: qr.revokedReason ?? undefined };

  // Increment scan count
  await prisma.qrCode.update({ where: { id: qr.id }, data: { scanCount: { increment: 1 }, lastScannedAt: new Date() } });

  return { valid: true, product: qr.product };
}
