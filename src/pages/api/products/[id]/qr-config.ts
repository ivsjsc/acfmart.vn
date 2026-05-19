import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '../../../lib/firebase-admin';

initializeFirebaseAdmin();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id: productId } = req.query;
  const { shopId, language = 'vi' } = req.query;

  try {
    const db = getFirestore();
    const productDoc = await db.collection('products').doc(productId as string).get();

    if (!productDoc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productData = productDoc.data();

    const response = {
      success: true,
      data: {
        productId: productData?.id || productId,
        productName: productData?.name || '',
        shopId: shopId as string || productData?.shopId || '',
        qrConfig: {
          baseUrl: 'https://acfmart.vn/verify',
          urlTemplate: '{baseUrl}?product={productId}&shop={shopId}&serial={serial}',
          errorCorrection: 'H',
          size: 300,
          margin: 2,
        },
        stockQuantity: productData?.stock || 0,
        qrBadge: 'Sản phẩm áp dụng QR 5 chạm',
        verificationRules: [
          'Chỉ quét tối đa 5 lần',
          'Hiển thị cảnh báo khi quét lần 5',
        ],
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching product QR config:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}