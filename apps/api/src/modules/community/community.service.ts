import prisma from '../../lib/prisma';

export const communityService = {
  async listPosts(page = 1, limit = 20, categoryId?: string, tab = 'latest') {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    const orderBy =
      tab === 'popular'
        ? { likeCount: 'desc' as const }
        : tab === 'featured'
        ? [{ isPinned: 'desc' as const }, { likeCount: 'desc' as const }]
        : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: { select: { id: true, name: true, avatar: true, role: true } },
          category: { select: { name: true, slug: true, icon: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async createPost(data: { authorId: string; categoryId: string; title?: string; content: string; images?: string[]; tags?: string[] }) {
    return prisma.communityPost.create({
      data,
      include: { author: { select: { name: true, avatar: true } } },
    });
  },

  async likePost(postId: string, userId: string) {
    const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing) {
      await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
      await prisma.communityPost.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
      return { liked: false };
    }
    await prisma.postLike.create({ data: { postId, userId } });
    await prisma.communityPost.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
    return { liked: true };
  },

  async addComment(postId: string, userId: string, content: string, parentId?: string) {
    const comment = await prisma.postComment.create({
      data: { postId, userId, content, parentId },
      include: { user: { select: { name: true, avatar: true } } },
    });
    await prisma.communityPost.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return comment;
  },

  async getLeaderboard(period: 'week' | 'month' | 'year' = 'week') {
    // Tính điểm dựa trên tổng lượt like + bình luận
    const users = await prisma.user.findMany({
      take: 10,
      include: {
        posts: {
          select: { likeCount: true, commentCount: true },
          where: { isActive: true },
        },
      },
    });

    return users
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        points: u.posts.reduce((sum, p) => sum + p.likeCount * 2 + p.commentCount, 0),
        postCount: u.posts.length,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  },

  async listCategories() {
    return prisma.communityCategory.findMany({
      where: { isActive: true },
      orderBy: { memberCount: 'desc' },
    });
  },
};
