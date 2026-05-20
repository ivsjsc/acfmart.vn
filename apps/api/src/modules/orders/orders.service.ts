import prisma from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

interface CreateOrderInput {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingAddress: Prisma.InputJsonObject;
  paymentMethod: string;
  affiliateCode?: string;
  note?: string;
}

export const ordersService = {
  async create(input: CreateOrderInput) {
    const orderCode = `ACF${Date.now().toString().slice(-8)}`;
    let subtotal = 0;

    const itemsWithDetails = await Promise.all(
      input.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, thumbnail: true, price: true, sellerId: true, stock: true },
        });
        if (!product) throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
        if (product.stock < item.quantity) throw new Error(`Sản phẩm ${product.name} không đủ hàng`);

        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        return { ...item, name: product.name, thumbnail: product.thumbnail, sellerId: product.sellerId, subtotal: lineTotal };
      })
    );

    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        orderCode,
        subtotal,
        total: subtotal,
        paymentMethod: input.paymentMethod,
        shippingAddress: input.shippingAddress,
        affiliateCode: input.affiliateCode,
        note: input.note,
        items: {
          create: itemsWithDetails.map((item) => ({
            productId: item.productId,
            sellerId: item.sellerId,
            name: item.name,
            thumbnail: item.thumbnail ?? undefined,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // Giảm tồn kho
    await Promise.all(
      input.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        })
      )
    );

    return order;
  },

  async getByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true, thumbnail: true } } } } },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, limit };
  },

  async getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.order.update({ where: { id }, data: { status: status as never } });
  },

  async cancel(id: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new Error('Đơn hàng không tồn tại');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new Error('Không thể hủy đơn hàng ở trạng thái này');
    }
    return prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
  },

  async adminList(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as never } : {};
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, limit };
  },
};
