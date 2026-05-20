import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acfmart.vn';

export const qrService = {
  // Tạo QR code cho sản phẩm
  async generate(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Sản phẩm không tồn tại');

    const code = uuidv4();
    const verifyUrl = `${APP_URL}/qr-verify/${code}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#E31937', light: '#FFFFFF' },
    });

    await prisma.qRVerification.create({ data: { productId, qrCode: code } });
    await prisma.product.update({ where: { id: productId }, data: { qrCode: code } });

    return { code, verifyUrl, qrDataUrl };
  },

  // Xác thực QR code
  async verify(code: string) {
    const qr = await prisma.qRVerification.findUnique({
      where: { qrCode: code },
      include: {
        product: {
          include: {
            seller: { select: { shopName: true, shopSlug: true, logo: true, isVerified: true } },
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!qr || !qr.isActive) {
      return { isAuthentic: false, message: 'Mã QR không hợp lệ hoặc đã bị vô hiệu hóa' };
    }

    // Cập nhật lượt quét
    await prisma.qRVerification.update({
      where: { qrCode: code },
      data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
    });

    return {
      isAuthentic: true,
      message: 'Sản phẩm chính hãng ACFMart đã xác thực',
      product: qr.product,
      scanCount: qr.scanCount + 1,
    };
  },

  // Thống kê QR
  async getStats(productId: string) {
    return prisma.qRVerification.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
