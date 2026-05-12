// Types for seller application functionality

export interface SellerApplication {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  shopLogo?: string;
  shopLogoVerified?: boolean;
  businessLicense?: string;
  taxCode: string;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'needs_info' | 'payment_pending';
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  sellerId?: string;
  googleEmail: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  registrationFee?: number;
  applicationVersion: number;
  documents?: {
    acfFormFile?: string;
    vneidScreenshot?: string;
    idCard?: string;
    businessLicense?: string;
    distributionContract?: string;
    qualityCertificate?: string;
    taxCertificate?: string;
    bankStatement?: string;
  };
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    address: boolean;
    business: boolean;
    bank: boolean;
    shopCategory: boolean;
  };
  notes?: string[];
}

export interface SellerProfile {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  logoUrl?: string;
  rating: number;
  totalSales: number;
  joinDate: string;
  status: 'active' | 'suspended' | 'banned';
  userId: string; // Reference to the user who owns this seller profile
}