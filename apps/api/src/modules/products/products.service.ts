import prisma from '../../lib/prisma';
import { ProductStatus } from '@prisma/client';

interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

interface CreateProductInput {
  sellerId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  images: string[];
  brand?: string;
  origin?: string;
}

export const productsService = {
  // Lấy danh sách sản phẩm với bộ lọc
  async list(filters: ProductFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.sellerId) where.sellerId = filters.sellerId;
    if (filters.status) where.status = filters.status;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice !== undefined) (where.price as Record<string, number>).lte = filters.maxPrice;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { shopName: true, shopSlug: true, logo: true, isVerified: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Lấy chi tiết sản phẩm theo ID
  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { shopName: true, shopSlug: true, logo: true, isVerified: true, isPro: true, rating: true } },
        category: { select: { name: true, slug: true } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });
  },

  // Tạo sản phẩm mới (trạng thái DRAFT)
  async create(input: CreateProductInput) {
    const slug = `${input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    return prisma.product.create({
      data: { ...input, slug, status: 'DRAFT' },
    });
  },

  // Cập nhật sản phẩm
  async update(id: string, data: Partial<CreateProductInput>) {
    return prisma.product.update({ where: { id }, data });
  },

  // Duyệt sản phẩm (Admin)
  async approve(id: string, adminId: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: adminId },
    });
  },

  // Từ chối sản phẩm (Admin)
  async reject(id: string, reason: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'REJECTED', rejectedReason: reason },
    });
  },

  // Gửi sản phẩm lên duyệt (Seller)
  async submitForReview(id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'PENDING' },
    });
  },

  // Tăng lượt xem
  async incrementView(id: string) {
    return prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  // Xóa sản phẩm
  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
