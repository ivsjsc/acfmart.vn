import prisma from '../../lib/prisma';

export const sellersService = {
  async getDashboardStats(sellerId: string) {
    const [productCount, pendingOrders, totalOrders] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.orderItem.count({ where: { sellerId, order: { status: 'PENDING' } } }),
      prisma.orderItem.count({ where: { sellerId } }),
    ]);

    const revenueResult = await prisma.orderItem.aggregate({
      where: { sellerId, order: { status: 'DELIVERED' } },
      _sum: { subtotal: true },
    });

    return {
      productCount,
      pendingOrders,
      totalOrders,
      totalRevenue: revenueResult._sum.subtotal || 0,
    };
  },

  async getProfile(userId: string) {
    return prisma.seller.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, phone: true, avatar: true } } },
    });
  },

  async updateProfile(sellerId: string, data: Record<string, unknown>) {
    return prisma.seller.update({ where: { id: sellerId }, data });
  },

  async register(userId: string, data: { shopName: string; description?: string; businessType?: string }) {
    const slug = `${data.shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    const seller = await prisma.seller.create({
      data: { userId, shopSlug: slug, ...data },
    });
    await prisma.user.update({ where: { id: userId }, data: { role: 'SELLER' } });
    return seller;
  },
};
