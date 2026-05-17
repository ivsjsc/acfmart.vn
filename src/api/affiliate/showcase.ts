import { Request, Response } from 'express';
import { validateProductLink } from '@/utils/linkValidator';

export const addAffiliateLink = async (req: Request, res: Response) => {
  const { url } = req.body;
  const userId = req.user.id;

  try {
    const isValid = await validateProductLink(url);
    if (!isValid || !isValid.isFromVendor) {
      return res.status(400).json({ error: 'Link không hợp lệ hoặc không phải từ shop chính hãng.' });
    }

    const affiliateId = isValid.affiliateId;
    const productId = isValid.productId;

    // Save to DB: affiliate_showcase table
    await db.insert('affiliate_showcase', {
      user_id: userId,
      product_id: productId,
      affiliate_id: affiliateId,
      created_at: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};