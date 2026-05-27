import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acfmart.vn';

export const ivsTrustService = {
  async getSellerDashboard(sellerId: string) {
    const [totalProducts, totalQrBatches, totalQrCodes] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.qRBatch.count({ where: { sellerId } }),
      prisma.qRVerification.count({
        where: {
          product: {
            sellerId,
          },
        },
      }),
    ]);

    return {
      sellerId,
      totalProducts,
      totalQrBatches,
      totalQrCodes,
    };
  },

  async listQrBatches(sellerId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.qRBatch.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.qRBatch.count({ where: { sellerId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  },

  async createQrBatch(
    sellerId: string,
    input: { productId: string; skuId?: string; quantity: number }
  ) {
    // Verify product belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('Bạn không có quyền tạo QR cho sản phẩm này');
    }

    // Create batch
    const batch = await prisma.qRBatch.create({
      data: {
        sellerId,
        productId: input.productId,
        skuId: input.skuId || null,
        quantity: input.quantity,
        status: 'PENDING',
      },
    });

    // Generate QR codes for this batch
    const qrCodes = [];
    for (let i = 0; i < input.quantity; i++) {
      const code = uuidv4();
      const verifyUrl = `${APP_URL}/qr-verify/${code}`;

      const qrVerification = await prisma.qRVerification.create({
        data: {
          productId: input.productId,
          qrCode: code,
          batchId: batch.id,
          serialNumber: `${batch.id}-${String(i + 1).padStart(6, '0')}`,
        },
      });

      qrCodes.push({
        id: qrVerification.id,
        qrCode: code,
        verifyUrl,
      });
    }

    // Update batch status
    await prisma.qRBatch.update({
      where: { id: batch.id },
      data: { status: 'ACTIVATED' },
    });

    return {
      ...batch,
      qrCodes: qrCodes.slice(0, 10), // Return first 10 for reference
      totalGenerated: qrCodes.length,
    };
  },

  async getQrBatch(sellerId: string, batchId: string) {
    const batch = await prisma.qRBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch || batch.sellerId !== sellerId) {
      throw new Error('Batch QR không tồn tại');
    }

    return batch;
  },

  async getPrintFile(
    sellerId: string,
    batchId: string,
    format: 'json' | 'html' | 'zpl' = 'html'
  ) {
    const batch = await prisma.qRBatch.findUnique({
      where: { id: batchId },
      include: {
        qrCodes: true,
      },
    });

    if (!batch || batch.sellerId !== sellerId) {
      throw new Error('Batch QR không tồn tại');
    }

    // Fetch product details separately
    const product = await prisma.product.findUnique({
      where: { id: batch.productId },
      select: { name: true, sku: true },
    });

    const qrCodes = batch.qrCodes as any[];

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acfmart.vn';

    if (format === 'json') {
      return {
        batchId,
        format: 'json',
        contentType: 'application/json',
        fileName: `qr-batch-${batchId}.json`,
        artifact: {
          format: 'json',
          contentType: 'application/json',
          fileName: `qr-batch-${batchId}.json`,
          encoding: 'utf-8',
          content: JSON.stringify(
            {
              batch,
              qrCodes: qrCodes.map((qr) => ({
                publicCode: qr.qrCode,
                verifyUrl: `${APP_URL}/qr-verify/${qr.qrCode}`,
                serialNo: qr.serialNumber,
                status: qr.isActive ? 'ACTIVE' : 'VOIDED',
              })),
            },
            null,
            2
          ),
        },
        qrCodes: qrCodes.map((qr) => ({
          publicCode: qr.qrCode,
          status: qr.isActive ? 'ACTIVE' : 'VOIDED',
          serialNo: qr.serialNumber,
        })),
      };
    }

    if (format === 'html') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR Batch ${batchId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .qr-item { 
      display: inline-block; 
      margin: 10px; 
      padding: 15px; 
      border: 2px solid #E31937;
      border-radius: 8px;
      text-align: center;
      width: 200px;
    }
    .qr-code { 
      width: 150px; 
      height: 150px; 
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px auto;
      font-size: 10px;
      word-break: break-all;
    }
    .serial { font-size: 12px; color: #666; margin-top: 5px; }
    h2 { color: #E31937; }
  </style>
</head>
<body>
  <h2>QR Verified by IVS - Batch ${batchId}</h2>
  <p>Sản phẩm: ${product?.name || 'N/A'}</p>
  <p>Số lượng: ${qrCodes.length} tem</p>
  <div>
    ${qrCodes
      .map(
        (qr) => `
      <div class="qr-item">
        <div class="qr-code">${qr.qrCode}</div>
        <div class="serial">Serial: ${qr.serialNumber || 'N/A'}</div>
        <div style="font-size:10px;margin-top:5px;">
          <a href="${APP_URL}/qr-verify/${qr.qrCode}">Verify</a>
        </div>
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>
      `.trim();

      return {
        batchId,
        format: 'html',
        contentType: 'text/html',
        fileName: `qr-batch-${batchId}.html`,
        artifact: {
          format: 'html',
          contentType: 'text/html',
          fileName: `qr-batch-${batchId}.html`,
          encoding: 'utf-8',
          content: htmlContent,
        },
        qrCodes: qrCodes.map((qr) => ({
          publicCode: qr.qrCode,
          status: qr.isActive ? 'ACTIVE' : 'VOIDED',
          serialNo: qr.serialNumber,
        })),
      };
    }

    // ZPL format (Zebra printer)
    const zplContent = qrCodes
      .map((qr) => {
        return `
^XA
^FO50,50^ADN,36,20^FDQR Verified by IVS^FS
^FO50,100^ADN,18,10^FDSerial: ${qr.serialNumber || 'N/A'}^FS
^FO50,150^BY2,3,150^BCN,150,Y,N,N^FD${APP_URL}/qr-verify/${qr.qrCode}^FS
^XZ
        `.trim();
      })
      .join('\n');

    return {
      batchId,
      format: 'zpl',
      contentType: 'text/plain',
      fileName: `qr-batch-${batchId}.zpl`,
      artifact: {
        format: 'zpl',
        contentType: 'text/plain',
        fileName: `qr-batch-${batchId}.zpl`,
        encoding: 'utf-8',
        content: zplContent,
      },
      qrCodes: qrCodes.map((qr) => ({
        publicCode: qr.qrCode,
        status: qr.isActive ? 'ACTIVE' : 'VOIDED',
        serialNo: qr.serialNumber,
      })),
    };
  },

  async listVerificationLogs(sellerId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // Get all QR codes for this seller's products
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId },
      select: { id: true },
    });

    const productIds = sellerProducts.map((p) => p.id);

    const [data, total] = await Promise.all([
      prisma.qRVerification.findMany({
        where: {
          productId: { in: productIds },
          lastScannedAt: { not: null },
        },
        orderBy: { lastScannedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.qRVerification.count({
        where: {
          productId: { in: productIds },
          lastScannedAt: { not: null },
        },
      }),
    ]);

    return {
      data: data.map((log) => ({
        id: log.id,
        publicCode: log.qrCode,
        result: log.scanCount > 5 ? 'SUSPECT' : 'GENUINE',
        ipHash: null,
        userAgent: null,
        createdAt: log.lastScannedAt?.toISOString() || log.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  },

  async listSuspiciousAlerts(sellerId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // Get suspicious QR codes (scanned more than 5 times)
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId },
      select: { id: true },
    });

    const productIds = sellerProducts.map((p) => p.id);

    const suspiciousQrs = await prisma.qRVerification.findMany({
      where: {
        productId: { in: productIds },
        scanCount: { gt: 5 },
      },
      orderBy: { scanCount: 'desc' },
    });

    const alerts = suspiciousQrs.map((qr) => ({
      id: `alert-${qr.id}`,
      ruleCode: 'EXCESSIVE_SCAN',
      severity: 'HIGH',
      message: `Mã QR ${qr.qrCode.substring(0, 8)}... đã bị quét ${qr.scanCount} lần (vượt ngưỡng 5 lần)`,
      status: 'OPEN',
      resolvedAt: null,
      resolutionNote: null,
      createdAt: qr.createdAt.toISOString(),
    }));

    return {
      data: alerts.slice(skip, skip + limit),
      total: alerts.length,
      page,
      limit,
    };
  },

  async getPrinterProfile(sellerId: string) {
    const profile = await prisma.sellerPrinterProfile.findUnique({
      where: { sellerId },
    });

    if (!profile) {
      return {
        sellerId,
        displayName: null,
        printerConfig: null,
      };
    }

    return {
      sellerId: profile.sellerId,
      displayName: profile.displayName,
      printerConfig: profile.printerConfig || null,
    };
  },

  async updatePrinterProfile(
    sellerId: string,
    printerConfig: Record<string, unknown>
  ) {
    const profile = await prisma.sellerPrinterProfile.upsert({
      where: { sellerId },
      create: {
        sellerId,
        displayName: `Seller ${sellerId.substring(0, 8)}`,
        printerConfig: printerConfig as any,
      },
      update: {
        printerConfig: printerConfig as any,
      },
    });

    return {
      sellerId: profile.sellerId,
      displayName: profile.displayName,
      printerConfig: profile.printerConfig || null,
    };
  },
};
