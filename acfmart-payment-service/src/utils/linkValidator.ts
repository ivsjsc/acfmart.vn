export const validateProductLink = async (url: string) => {
  // Example: check if URL contains /p/ and comes from acfmart.vn
  const match = url.match(/https:\/\/acfmart\.vn\/p\/([a-zA-Z0-9]+)/);
  if (!match) return { valid: false, isFromVendor: false };

  const productId = match[1];
  const response = await fetch(`/api/products/${productId}`);
  const product = await response.json();

  // Check if product has vendor flag
  if (product.source_type === 'vendor') {
    return {
      valid: true,
      isFromVendor: true,
      affiliateId: product.affiliate_id,
      productId,
    };
  }

  return { valid: false, isFromVendor: false };
};