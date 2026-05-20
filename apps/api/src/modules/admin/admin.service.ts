import prisma from '../../lib/prisma';

export const adminService = {
  // Thống kê tổng quan dashboard
  async getDashboardStats() {
    const [totalUsers, totalSellers, pendingProducts, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.product.count({ where: { status: 'PENDING' } }),
      prisma.order.count(),
    ]);

    const revenueResult = await prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { total: true },
    });

    return {
      totalUsers,
      totalSellers,
      pendingProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.total || 0,
    };
  },

  // Danh sách users
  async listUsers(page = 1, limit = 20, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, avatar: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  // Khóa/mở khóa user
  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Người dùng không tồn tại');
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  },

  // Danh sách sellers chờ duyệt
  async listSellers(page = 1, limit = 20, verified?: boolean) {
    const skip = (page - 1) * limit;
    const where = verified !== undefined ? { isVerified: verified } : {};
    const [items, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.seller.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  // Xác thực seller
  async verifySeller(sellerId: string) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: { isVerified: true },
    });
  },

  // Thống kê doanh thu theo ngày (7 ngày gần nhất)
  async getRevenueChart() {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const data = await Promise.all(
      days.map(async (day) => {
        const start = new Date(day.setHours(0, 0, 0, 0));
        const end = new Date(day.setHours(23, 59, 59, 999));
        const result = await prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
          _count: true,
        });
        return {
          date: start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: result._sum.total || 0,
          orders: result._count,
        };
      })
    );
    return data;
  },
};
