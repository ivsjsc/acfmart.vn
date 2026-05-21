import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EscrowService {
  /**
   * Tạo escrow record khi đơn hàng được đặt thành công.
   * Tiền sẽ ở trạng thái HOLDING cho đến khi buyer confirm hoặc auto-release.
   */
  async createEscrow(
    orderId: string,
    buyerAmount: number,
    commissionRate: number = 0.05,
  ) {
    const platformFee = Math.round(buyerAmount * commissionRate);
    const sellerAmount = buyerAmount - platformFee;
    const autoReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return prisma.escrowTransaction.create({
      data: {
        orderId,
        buyerAmount,
        sellerAmount,
        platformFee,
        status: 'HOLDING',
        autoReleaseAt,
      },
    });
  }

  /**
   * Giải phóng tiền escrow về tài khoản seller.
   * Được gọi khi buyer xác nhận nhận hàng hoặc auto-release timeout.
   */
  async releaseEscrow(orderId: string, releasedBy: string) {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
    });

    if (!escrow) {
      throw new Error(`Escrow not found for order ${orderId}`);
    }

    if (escrow.status !== 'HOLDING') {
      throw new Error(
        `Cannot release escrow in status ${escrow.status}. Must be HOLDING.`,
      );
    }

    return prisma.escrowTransaction.update({
      where: { orderId },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
        releasedBy,
      },
    });
  }

  /**
   * Hoàn tiền escrow về tài khoản buyer.
   * Được gọi sau khi dispute được resolve hoặc seller chấp nhận hoàn.
   */
  async refundEscrow(orderId: string, amount?: number) {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
    });

    if (!escrow) {
      throw new Error(`Escrow not found for order ${orderId}`);
    }

    if (!['HOLDING', 'DISPUTED'].includes(escrow.status)) {
      throw new Error(`Cannot refund escrow in status ${escrow.status}`);
    }

    return prisma.escrowTransaction.update({
      where: { orderId },
      data: {
        status: 'REFUNDED',
        releasedAt: new Date(),
        releasedBy: 'ADMIN',
        // Nếu partial refund thì cập nhật buyerAmount
        ...(amount !== undefined ? { buyerAmount: amount } : {}),
      },
    });
  }

  /**
   * Buyer mở dispute để khiếu nại đơn hàng.
   * Escrow chuyển sang DISPUTED, tiền vẫn được giữ cho đến khi admin resolve.
   */
  async raiseDispute(
    orderId: string,
    userId: string,
    reason: string,
    description: string,
    evidence: string[],
  ) {
    // Chuyển escrow sang DISPUTED
    await prisma.escrowTransaction.update({
      where: { orderId },
      data: { status: 'DISPUTED' },
    });

    // Tạo dispute record
    return prisma.escrowDispute.create({
      data: {
        orderId,
        raisedBy: userId,
        reason: reason as never,
        description,
        evidence,
        status: 'OPEN',
      },
    });
  }

  /**
   * Admin resolve dispute: có thể release cho seller hoặc refund cho buyer.
   */
  async resolveDispute(
    disputeId: string,
    resolution: 'RELEASE_TO_SELLER' | 'REFUND_TO_BUYER',
    adminId: string,
    note: string,
  ) {
    const dispute = await prisma.escrowDispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) throw new Error('Dispute not found');

    // Cập nhật dispute
    await prisma.escrowDispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: adminId,
        resolution,
        note,
      },
    });

    // Thực hiện action tương ứng
    if (resolution === 'RELEASE_TO_SELLER') {
      return this.releaseEscrow(dispute.orderId, adminId);
    } else {
      return this.refundEscrow(dispute.orderId);
    }
  }

  /**
   * Lấy trạng thái escrow của một đơn hàng.
   */
  async getEscrowByOrder(orderId: string) {
    return prisma.escrowTransaction.findUnique({
      where: { orderId },
      include: {
        dispute: true,
      },
    });
  }

  /**
   * Lấy tổng hợp escrow của một seller.
   */
  async getSellerEscrowSummary(sellerId: string) {
    // Join qua orders để lấy tất cả escrow của seller
    const orders = await prisma.order.findMany({
      where: { sellerId },
      select: { id: true },
    });

    const orderIds = orders.map(o => o.id);

    const escrows = await prisma.escrowTransaction.findMany({
      where: {
        orderId: { in: orderIds },
        status: 'HOLDING',
      },
      include: {
        order: {
          select: {
            createdAt: true,
            buyer: { select: { name: true } },
          },
        },
      },
    });

    const totalHolding = escrows.reduce(
      (sum, e) => sum + Number(e.sellerAmount),
      0,
    );

    return {
      totalHolding,
      count: escrows.length,
      entries: escrows,
    };
  }

  /**
   * Cron job: tự động release escrow quá hạn.
   * Chạy mỗi giờ để check các escrow đã quá autoReleaseAt.
   */
  async autoRelease(): Promise<number> {
    const overdue = await prisma.escrowTransaction.findMany({
      where: {
        status: 'HOLDING',
        autoReleaseAt: { lte: new Date() },
      },
    });

    let releasedCount = 0;

    for (const e of overdue) {
      try {
        await this.releaseEscrow(e.orderId, 'SYSTEM_AUTO_RELEASE');
        releasedCount++;
      } catch (err) {
        console.error(`Failed to auto-release escrow for order ${e.orderId}:`, err);
      }
    }

    console.log(`Auto-released ${releasedCount}/${overdue.length} escrow transactions`);
    return releasedCount;
  }

  /**
   * Admin: lấy tất cả escrow đang HOLDING hoặc DISPUTED.
   */
  async getPendingEscrows() {
    return prisma.escrowTransaction.findMany({
      where: {
        status: { in: ['HOLDING', 'DISPUTED'] },
      },
      include: {
        dispute: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tổng hợp báo cáo escrow cho admin.
   */
  async getAdminSummary() {
    const [holding, disputed, released, refunded] = await Promise.all([
      prisma.escrowTransaction.aggregate({
        where: { status: 'HOLDING' },
        _sum: { buyerAmount: true },
        _count: true,
      }),
      prisma.escrowTransaction.count({ where: { status: 'DISPUTED' } }),
      prisma.escrowTransaction.aggregate({
        where: {
          status: 'RELEASED',
          releasedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        _sum: { sellerAmount: true },
        _count: true,
      }),
      prisma.escrowTransaction.aggregate({
        where: { status: 'REFUNDED' },
        _sum: { buyerAmount: true },
        _count: true,
      }),
    ]);

    return {
      totalHolding: Number(holding._sum.buyerAmount ?? 0),
      holdingCount: holding._count,
      disputedCount: disputed,
      releasedToday: Number(released._sum.sellerAmount ?? 0),
      releasedTodayCount: released._count,
      totalRefunded: Number(refunded._sum.buyerAmount ?? 0),
    };
  }
}
