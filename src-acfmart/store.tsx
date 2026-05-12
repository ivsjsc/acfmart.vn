import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-error';

export type Role = 'admin' | 'moderator' | 'shop' | 'shop_manager' | 'shop_staff' | 'customer' | 'carrier' | 'super_admin' | null;

export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type OrderStatus = 'pending' | 'processing' | 'shipping' | 'delivered' | 'completed' | 'cancelled';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface ProductLabelInfo {
  // Basic label info (required by Decree 43/2017/NĐ-CP)
  brandName: string;
  manufacturerName: string;
  manufacturerAddress: string;
  originCountry: string;
  quantityMeasurement: string; // Định lượng
  productionDate: Date;
  expiryDate?: Date; // Hạn sử dụng (optional for non-perishable goods)
  batchNumber: string; // Số lô sản xuất
  ingredientsOrComponents?: string; // Thành phần/hoạt chất chính
  usageInstructions?: string; // Hướng dẫn sử dụng
  storageInstructions?: string; // Hướng dẫn bảo quản
  warningInformation?: string; // Thông tin cảnh báo
  barcode?: string; // Mã số mã vạch
  officialStore?: boolean; // Cửa hàng chính hãng
}

export interface ProductQualityInfo {
  // Quality certifications (required by Decree 119/2017/NĐ-CP)
  standardsApplied?: string; // Tiêu chuẩn áp dụng (TCVN, ISO, QC...)
  certificateOfQualityUrl?: string; // Giấy chứng nhận chất lượng (CO/CQ)
  testResultUrl?: string; // Kết quả kiểm nghiệm
  conformityCertificateUrl?: string; // Chứng nhận hợp quy (nếu thuộc danh mục)
}

export interface ProductCommercialInfo {
  // Commercial info (required by E-commerce Law 2025)
  basePrice: number;
  promotionalPrice?: number;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  pricingMechanism?: string; // Cơ chế tính giá
  weight: number; // Khối lượng
  dimensions?: { // Kích thước
    length: number;
    width: number;
    height: number;
  };
  deliveryTimeEstimate?: string; // Thời gian giao
  shippingCost?: number; // Phí ship
  freeShipping?: boolean; // Miễn phí vận chuyển
  warrantyInfo?: { // Bảo hành
    duration: string;
    conditions: string;
    servicePoints: string[];
  };
  exchangePolicy?: { // Đổi trả
    policy: string;
    days: number; // Số ngày đổi trả
  };
}

export interface ProductVerification {
  // Verification information
  verifiedByAcf: boolean;
  verificationDate?: Date;
  verificationDocumentUrls?: string[];
  qrCodeUrl?: string; // QR code for product verification
  verificationToken?: string; // Unique token for verification
}

export interface CounterfeitReport {
  id: string;
  productId: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  
  // Report details
  suspicionReason: string;
  description: string;
  evidenceUrls?: string[];
  
  // Product details at time of report
  productInfo: {
    name: string;
    shopId: string;
    purchaseDate?: string;
    purchaseLocation?: string;
  };
  
  // Status
  status: 'pending' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  
  // Investigation
  investigatedBy?: string;
  investigationNotes?: string;
  resolvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type Category = 
  | 'thoi-trang-nam' | 'thoi-trang-nu' | 'giay-dep-nam' | 'giay-dep-nu' 
  | 'dien-thoai-phu-kien' | 'thiet-bi-dien-tu' | 'may-tinh-laptop'
  | 'may-anh-may-quay-phim' | 'dong-ho' | 'me-be' | 'nha-cua-doi-song'
  | 'sac-dep' | 'suc-khoe';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  imageUrls?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card' | 'ewallet' | 'cod' | 'bank_transfer' | 'bank_account';
  provider: string;
  displayName?: string;
  last4?: string;
  bankName?: string;
  bankBranch?: string;
  accountHolder?: string;
  accountNumberMasked?: string;
  isDefault: boolean;
  isActive: boolean;
  verificationStatus?: 'checked' | 'approved' | 'pending' | 'rejected';
  verificationAmount?: number;
  refundAfterDays?: number;
  usageCount?: number;
  lastUsedAt?: any;
  createdAt: Date;
  updatedAt?: any;
}

export interface SearchFilters {
  category?: Category;
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  ratings?: number[];
  locations?: string[];
  hasPromotion?: boolean;
  freeShipping?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'bestselling' | 'rating';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  addedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  shopId: string;
  status: ProductStatus;
  image: string;
  origin: 'domestic' | 'imported';
  category: string;
  sku?: string;
  stock?: number;
  description?: string;
  labelInfo?: ProductLabelInfo;
  qualityInfo?: ProductQualityInfo;
  commercialInfo?: ProductCommercialInfo & {
    rating?: number;
    averageRating?: number;
    reviewCount?: number;
    soldCount?: number;
  };
  verificationInfo?: ProductVerification;
  createdAt?: any;
  updatedAt?: any;
}

export interface Order {
  id: string;
  productId: string;
  customerId: string;
  shopId: string;
  status: OrderStatus;
  total: number;
  date: string;
  
  // Thông tin giao hàng
  shippingAddress?: string;
  customerName?: string;
  customerPhone?: string;
  
  // Bảo vệ người tiêu dùng theo Nghị định 98/2020/NĐ-CP
  paymentMethod?: 'cod' | 'bank_transfer' | 'e_wallet';
  escrowStatus?: 'held' | 'released' | 'refunded'; // Trạng thái giữ tiền
  
  // Chống hàng giả
  productAuthenticityVerified?: boolean; // Đã xác minh chính hãng
  deliveryProof?: string; // Bằng chứng giao hàng (URL hình ảnh/chữ ký)
  
  // Khiếu nại & Giải quyết tranh chấp
  complaintFiled?: boolean;
  complaintReason?: string;
  complaintStatus?: 'pending' | 'investigating' | 'resolved' | 'rejected';
  resolutionNotes?: string;
  
  createdAt?: any;
  updatedAt?: any;
}

export interface SellerVerification {
  id: string;
  userId: string;
  
  // Personal identification
  idCardNumber?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  faceVerificationUrl?: string;
  
  // Business info
  businessLicenseNumber?: string;
  businessLicenseUrl?: string;
  taxCode?: string;
  businessAddress?: string;
  
  // Business lines
  businessLines?: string[];
  conditionalBusinessLicenseUrl?: string;
  
  // Status
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
}

export interface Violation {
  id: string;
  userId: string;
  productId?: string;
  
  violationType: string;
  description: string;
  evidenceUrls?: string[];
  
  penaltyLevel: 'warning' | 'suspend_7d' | 'suspend_30d' | 'ban_permanent';
  penaltyAmount?: number;
  
  reportedBy: string;
  handledBy?: string;
  handledAt?: Date;
  
  createdAt: Date;
}

export interface ShopProfile {
  shopId: string;
  address?: string;
  warehouseAddress?: string;
  warehouses?: Array<{
    id: string;
    address: string;
    isPrimary: boolean;
  }>;
  contactPhone?: string;
  legalDocuments?: string;
  shippingProviders?: Array<{
    id: string;
    name: string;
    apiEndpoint?: string;
    isActive: boolean;
  }>;
  bankAccounts?: Array<{
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    isDefault: boolean;
  }>;
  recipientAccounts?: Array<{
    id: string;
    name: string;
    bankName: string;
    accountNumber: string;
    purpose: string;
  }>;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  updatedAt?: any;
  
  // Thông tin pháp lý theo Nghị định 98/2020/NĐ-CP
  businessLicense?: string; // Giấy phép đăng ký kinh doanh (URL)
  taxCode?: string; // Mã số thuế
  businessType?: 'individual' | 'company' | 'household'; // Loại hình kinh doanh
  legalRepresentative?: string; // Người đại diện pháp luật
  establishedDate?: string; // Ngày thành lập
  
  // Cam kết chống hàng giả
  antiCounterfeitCommitment?: boolean; // Cam kết không bán hàng giả
  productSourceDeclaration?: string; // Tuyên bố nguồn gốc sản phẩm
  consumerProtectionPolicy?: string; // Chính sách bảo vệ người tiêu dùng
  
  // Trạng thái xác minh
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string; // Moderator ID
  verifiedAt?: any;
  rejectionReason?: string;
}

export interface DeliveryAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

interface ECommerceState {
  user: FirebaseUser | null;
  role: Role;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setRoleSelection: (selectedRole: Role) => Promise<void>;
  switchRole: (newRole: Role) => Promise<void>;
  
  // User profile related
  userProfile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    location: {
      lat: number;
      lng: number;
    };
    deliveryAddresses: DeliveryAddress[];
  } | null;
  updateUserProfile: (profile: Partial<ECommerceState['userProfile']>) => Promise<void>;
  addDeliveryAddress: (address: DeliveryAddress) => Promise<void>;
  updateDeliveryAddress: (id: string, address: Partial<DeliveryAddress>) => Promise<void>;
  removeDeliveryAddress: (id: string) => Promise<void>;
  setDefaultDeliveryAddress: (id: string) => Promise<void>;
  
  products: Product[];
  categories: Category[];
  orders: Order[];
  shopProfile: ShopProfile | null;
  counterfeitReports: CounterfeitReport[];
  productReviews: ProductReview[];
  paymentMethods: PaymentMethod[];
  
  searchQuery: string;
  searchResults: Product[];
  searchFilters: SearchFilters;
  cart: CartItem[];
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<string | undefined>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateShopProfile: (profile: Partial<ShopProfile>) => Promise<void>;
  
  addCounterfeitReport: (report: Omit<CounterfeitReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCounterfeitReport: (id: string, updates: Partial<CounterfeitReport>) => Promise<void>;
  addProductReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getCartCount: () => number;
  
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  
  syncCartWithFirestore: () => Promise<void>;
  loadCartFromFirestore: () => Promise<void>;
  
  currentView: 'ecommerce' | 'about' | 'activities' | 'legal' | 'media' | 'contact' | 'development-plan';
  setCurrentView: (view: 'ecommerce' | 'about' | 'activities' | 'legal' | 'media' | 'contact' | 'development-plan') => void;
  isHeaderScrolled: boolean;
  setIsHeaderScrolled: (scrolled: boolean) => void;
  
  // Mock operations for development
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const StoreContext = createContext<ECommerceState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Add setError state

  // Add missing state variables
  const [userProfile, setUserProfile] = useState<ECommerceState['userProfile']>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [counterfeitReports, setCounterfeitReports] = useState<CounterfeitReport[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentView, setCurrentView] = useState<'ecommerce' | 'about' | 'activities' | 'legal' | 'media' | 'contact' | 'development-plan'>('ecommerce');
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const ensureUserProfile = async (user: any) => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(profileRef);
      
      if (!docSnap.exists()) {
        // Create a default user profile
        const defaultProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Người dùng mới',
          photoURL: user.photoURL || '',
          role: 'customer', // Default role
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified || false
        };
        
        await setDoc(profileRef, defaultProfile);
        console.log(`Created default profile for user: ${user.uid}`);
      }
    } catch (error) {
      console.error("Error ensuring user profile exists:", error);
    }
  };

  // Authentication & Role Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          let userRole: Role = 'customer'; // Default role
          
          if (userDoc.exists()) {
            userRole = userDoc.data().role as Role;
          } else {
            // Create user document if it doesn't exist
            const newUserDoc = {
              email: currentUser.email,
              role: 'customer',
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', currentUser.uid), newUserDoc);
            userRole = 'customer';
          }
          
          setRole(userRole);
          
          // Load user profile
          const profileRef = doc(db, 'userProfiles', currentUser.uid);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            setUserProfile({
              ...profileDoc.data(),
              id: currentUser.uid,
            } as ECommerceState['userProfile']);
          } else {
            // Create default profile if doesn't exist
            const defaultProfile: ECommerceState['userProfile'] = {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
              email: currentUser.email || '',
              phone: currentUser.phoneNumber || '',
              address: '',
              city: '',
              district: '',
              ward: '',
              location: { lat: 21.028511, lng: 105.804817 }, // Default to Hanoi coordinates
              deliveryAddresses: [],
            };
            
            await setDoc(profileRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
          
          // Load cart from Firestore when user logs in
          await loadCartFromFirestore();
        } catch (error) {
          // Check if it's a permission error and handle accordingly
          if (error instanceof Error && error.message.includes("Missing or insufficient permissions")) {
            // Set default values for a new user without user document
            setRole('customer');
            
            // Load user profile
            const profileRef = doc(db, 'userProfiles', currentUser.uid);
            try {
              const profileDoc = await getDoc(profileRef);
              
              if (profileDoc.exists()) {
                setUserProfile({
                  ...profileDoc.data(),
                  id: currentUser.uid,
                } as ECommerceState['userProfile']);
              } else {
                // Create default profile if doesn't exist
                const defaultProfile: ECommerceState['userProfile'] = {
                  id: currentUser.uid,
                  name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
                  email: currentUser.email || '',
                  phone: currentUser.phoneNumber || '',
                  address: '',
                  city: '',
                  district: '',
                  ward: '',
                  location: { lat: 21.028511, lng: 105.804817 }, // Default to Hanoi coordinates
                  deliveryAddresses: [],
                };
                
                await setDoc(profileRef, defaultProfile);
                setUserProfile(defaultProfile);
              }
            } catch (profileError) {
              console.error("Error loading profile:", profileError);
              // Still set a basic profile even if there's an error
              setUserProfile({
                id: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
                email: currentUser.email || '',
                phone: currentUser.phoneNumber || '',
                address: '',
                city: '',
                district: '',
                ward: '',
                location: { lat: 21.028511, lng: 105.804817 },
                deliveryAddresses: [],
              });
            }
            
            // Load cart from Firestore when user logs in
            await loadCartFromFirestore();
          } else {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
        }
      } else {
        setRole(null);
        setProducts([]);
        setOrders([]);
        setCounterfeitReports([]);
        setCart([]); // Clear cart when user logs out
        setUserProfile(null); // Clear profile when user logs out
      }
      setLoadingInitial(false);
    });
    return unsubscribe;
  }, []);

  // Set Role for new user
  const setRoleSelection = async (selectedRole: Role) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: selectedRole,
        createdAt: serverTimestamp()
      });
      setRole(selectedRole);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  // Switch role for existing user (for demo purposes)
  const switchRole = async (newRole: Role) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
      setRole(newRole);
    } catch (error) {
      // If user doc doesn't exist, try setDoc instead
      await setRoleSelection(newRole);
    }
  };

  // Login/Logout
  const login = async () => {
    try {
      // Mock login - in real app would use Firebase Auth
      const mockUser = {
        uid: 'user_123',
        email: 'user@example.com',
        displayName: 'Test User',
        emailVerified: true
      } as FirebaseUser;
      
      setUser(mockUser);
      setRole('customer');
      setLoadingInitial(false);
      
      // Ensure user profile exists
      await ensureUserProfile(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      setError(error as Error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error as Error);
    }
  };

  // Fetch Products & Orders
  useEffect(() => {
    if (!user || !role) return;

    // Fetch Products
    const productsRef = collection(db, 'products');
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        prods.push({ id: doc.id, ...data } as Product);
      });
      setProducts(prods);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'products'));

    // Fetch Orders depending on role
    let ordersQuery = query(collection(db, 'orders'));
    if (role === 'customer') {
      ordersQuery = query(collection(db, 'orders'), where('customerId', '==', user.uid));
    } else if (role === 'shop') {
      ordersQuery = query(collection(db, 'orders'), where('shopId', '==', user.uid));
    } else if (role === 'carrier') {
      ordersQuery = query(collection(db, 'orders'), where('status', 'in', ['shipping', 'delivered']));
    }

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        ords.push({ id: doc.id, ...data, date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() } as Order);
      });
      setOrders(ords);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'orders'));

    // Fetch Shop Profile
    let unsubShopProfile = () => {};
    if (role === 'shop') {
      const shopProfileRef = doc(db, 'shopProfiles', user.uid);
      unsubShopProfile = onSnapshot(shopProfileRef, (docSnap) => {
        if (docSnap.exists()) {
          setShopProfile(docSnap.data() as ShopProfile);
        } else {
          setShopProfile(null);
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `shopProfiles/${user.uid}`));
    } else {
      setShopProfile(null);
    }

    // Fetch Counterfeit Reports (for admin and moderator)
    let unsubCounterfeitReports = () => {};
    if (role === 'admin' || role === 'moderator') {
      const reportsRef = collection(db, 'counterfeitReports');
      unsubCounterfeitReports = onSnapshot(reportsRef, (snapshot) => {
        const reports: CounterfeitReport[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          reports.push({ id: doc.id, ...data } as CounterfeitReport);
        });
        setCounterfeitReports(reports);
      }, (error) => {
        // Chỉ ghi lỗi vào console thay vì ném lỗi, tránh crash ứng dụng
        console.error("Error fetching counterfeit reports:", error);
        // Có thể tùy chọn đặt mảng rỗng nếu không có quyền truy cập
        setCounterfeitReports([]);
      });
    } else {
      setCounterfeitReports([]);
    }

    const paymentMethodsQuery = query(collection(db, 'paymentMethods'), where('userId', '==', user.uid));
    const unsubPaymentMethods = onSnapshot(paymentMethodsQuery, (snapshot) => {
      const methods: PaymentMethod[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        methods.push({ id: doc.id, ...data } as PaymentMethod);
      });
      setPaymentMethods(methods);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'paymentMethods'));

    const reviewsRef = collection(db, 'productReviews');
    const unsubProductReviews = onSnapshot(reviewsRef, (snapshot) => {
      const reviews: ProductReview[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({ id: doc.id, ...data } as ProductReview);
      });
      setProductReviews(reviews);
    }, (error) => {
      console.error("Error fetching product reviews:", error);
      setProductReviews([]);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubShopProfile();
      unsubCounterfeitReports();
      unsubPaymentMethods();
      unsubProductReviews();
    };
  }, [user, role]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateProductStatus = async (id: string, status: ProductStatus) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'date'>): Promise<string | undefined> => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      return undefined;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const updateShopProfile = async (profile: Partial<ShopProfile>) => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'shopProfiles', user.uid);
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        await updateDoc(profileRef, {
          ...profile,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(profileRef, {
          ...profile,
          shopId: user.uid,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shopProfiles/${user.uid}`);
    }
  };

  const addCounterfeitReport = async (report: Omit<CounterfeitReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'counterfeitReports'), {
        ...report,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'counterfeitReports');
    }
  };

  const updateCounterfeitReport = async (id: string, updates: Partial<CounterfeitReport>) => {
    try {
      await updateDoc(doc(db, 'counterfeitReports', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `counterfeitReports/${id}`);
    }
  };

  const addProductReview = async (review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'productReviews'), {
        ...review,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'productReviews');
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'paymentMethods'), {
        ...method,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'paymentMethods');
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      await updateDoc(doc(db, 'paymentMethods', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `paymentMethods/${id}`);
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      paymentMethods.forEach(method => {
        batch.update(doc(db, 'paymentMethods', method.id), {
          isDefault: method.id === id,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `paymentMethods/${id}`);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...current, { product, quantity, addedAt: new Date() }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(current => current.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(current => current.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  // Save cart to Firestore
  const syncCartWithFirestore = async () => {
    if (!user) return;
    
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartData = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        addedAt: item.addedAt
      }));
      
      await setDoc(cartRef, {
        items: cartData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error syncing cart with Firestore:", error);
    }
  };

  // Load cart from Firestore
  const getTotalPrice = () => cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getCartCount = () => cart.length;

  const loadCartFromFirestore = async () => {
    if (!user) return;
    
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        const cartItems: CartItem[] = [];
        
        for (const item of data.items || []) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            cartItems.push({
              product,
              quantity: item.quantity || 1,
              addedAt: item.addedAt?.toDate ? item.addedAt.toDate() : new Date()
            });
          }
        }
        setCart(cartItems);
      }
    } catch (error) {
      console.error("Error loading cart from Firestore:", error);
    }
  };

  const updateUserProfile = async (profile: Partial<ECommerceState['userProfile']>) => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const updatedProfile = { ...userProfile, ...profile };
      
      await updateDoc(profileRef, updatedProfile);
      setUserProfile(updatedProfile as ECommerceState['userProfile']);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const addDeliveryAddress = async (address: DeliveryAddress) => {
    if (!user || !userProfile) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const newAddresses = [...userProfile.deliveryAddresses, address];
      const updatedProfile = {
        ...userProfile,
        deliveryAddresses: newAddresses
      };
      
      await updateDoc(profileRef, { deliveryAddresses: newAddresses });
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error("Error adding delivery address:", error);
    }
  };

  const updateDeliveryAddress = async (id: string, address: Partial<DeliveryAddress>) => {
    if (!user || !userProfile) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const updatedAddresses = userProfile.deliveryAddresses.map(addr => 
        addr.id === id ? { ...addr, ...address } : addr
      );
      const updatedProfile = {
        ...userProfile,
        deliveryAddresses: updatedAddresses
      };
      
      await updateDoc(profileRef, { deliveryAddresses: updatedAddresses });
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating delivery address:", error);
    }
  };

  const removeDeliveryAddress = async (id: string) => {
    if (!user || !userProfile) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const updatedAddresses = userProfile.deliveryAddresses.filter(addr => addr.id !== id);
      const updatedProfile = {
        ...userProfile,
        deliveryAddresses: updatedAddresses
      };
      
      await updateDoc(profileRef, { deliveryAddresses: updatedAddresses });
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error("Error removing delivery address:", error);
    }
  };

  const setDefaultDeliveryAddress = async (id: string) => {
    if (!user || !userProfile) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const updatedAddresses = userProfile.deliveryAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      const updatedProfile = {
        ...userProfile,
        deliveryAddresses: updatedAddresses
      };
      
      await updateDoc(profileRef, { deliveryAddresses: updatedAddresses });
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error("Error setting default delivery address:", error);
    }
  };

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters(current => ({ ...current, ...filters }));
  };

  const clearFilters = () => setSearchFilters({});

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (loadingInitial) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <StoreContext.Provider value={{ 
      user, role, login, logout, setRoleSelection, switchRole,
      userProfile, updateUserProfile, addDeliveryAddress, updateDeliveryAddress, removeDeliveryAddress, setDefaultDeliveryAddress,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getTotalPrice, getTotalItems, getCartCount,
      products, categories, orders, shopProfile, counterfeitReports, productReviews, paymentMethods,
      searchQuery, setSearchQuery, searchResults, searchFilters, setSearchFilters, clearFilters,
      addProduct, updateProduct, deleteProduct, updateProductStatus,
      addOrder, updateOrderStatus, updateShopProfile,
      addCounterfeitReport, updateCounterfeitReport, addProductReview,
      addPaymentMethod, updatePaymentMethod, setDefaultPaymentMethod,
      syncCartWithFirestore, loadCartFromFirestore,
      currentView, setCurrentView, isHeaderScrolled, setIsHeaderScrolled,
      notifications, markNotificationAsRead, clearNotifications
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
