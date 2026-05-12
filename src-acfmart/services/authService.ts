// Authentication & Authorization Service
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  shopProfile?: ShopProfile;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface ShopProfile {
  id: string;
  userId: string;
  shopName: string;
  shopDescription?: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  businessLicense?: string;
  taxCode?: string;
  bankAccount?: BankAccount;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rating: number;
  totalOrders: number;
  joinDate: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
}

export type UserRole = 'super_admin' | 'admin' | 'shop_manager' | 'shop_staff' | 'customer';

export type UserStatus = 'active' | 'suspended' | 'pending' | 'banned';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
  level: number;
  isSystem: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role?: UserRole;
  shopProfile?: Partial<ShopProfile>;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: string[];
  shopProfile?: Partial<ShopProfile>;
}

import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase.config';

export interface VNeIDProfile {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  idCardNumber: string;
  idCardIssueDate: string;
  idCardPlaceOfIssue: string;
  address: string;
  phoneNumber: string;
  email: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  message?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Đăng nhập bằng email và mật khẩu
   */
  static async loginWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        success: true,
        user: user
      };
    } catch (error: any) {
      let errorMessage = 'Đăng nhập thất bại';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email không tồn tại';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Tài khoản bị khóa tạm thời do nhập sai quá nhiều lần';
          break;
        default:
          errorMessage = error.message || 'Lỗi không xác định';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Đăng nhập bằng Google
   */
  static async loginWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Cập nhật hoặc tạo hồ sơ người dùng nếu chưa tồn tại
      await this.ensureUserProfile(user);
      
      return {
        success: true,
        user: user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Đăng nhập bằng Google thất bại'
      };
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  static async registerWithEmailAndPassword(registrationData: RegistrationData): Promise<AuthResult> {
    const { email, password, name, phone, role = 'customer' } = registrationData;
    
    try {
      // Tạo tài khoản
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Cập nhật tên hiển thị
      await updateProfile(user, { displayName: name });
      
      // Gửi xác thực email
      await sendEmailVerification(user);
      
      // Tạo hồ sơ người dùng
      await setDoc(doc(db, 'userProfiles', user.uid), {
        name: name,
        email: email,
        phone: phone || '',
        role: role,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Cập nhật tài liệu người dùng
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        role: role,
        displayName: name,
        photoURL: user.photoURL,
        createdAt: serverTimestamp()
      }, { merge: true });
      
      return {
        success: true,
        user: user,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
      };
    } catch (error: any) {
      let errorMessage = 'Đăng ký thất bại';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email đã được sử dụng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu (ít hơn 6 ký tự)';
          break;
        default:
          errorMessage = error.message || 'Lỗi không xác định';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Đăng xuất
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Đảm bảo hồ sơ người dùng tồn tại trong Firestore
   */
  static async ensureUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      const userProfileRef = doc(db, 'userProfiles', firebaseUser.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (!userProfileSnap.exists()) {
        // Tạo hồ sơ người dùng mặc định nếu chưa tồn tại
        await setDoc(userProfileRef, {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Người dùng',
          email: firebaseUser.email,
          role: 'customer',
          emailVerified: firebaseUser.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          phone: firebaseUser.phoneNumber || '',
          address: '',
          city: '',
          district: '',
          ward: '',
          deliveryAddresses: [],
        });
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
    }
  }

  /**
   * Khởi tạo quy trình xác thực VNeID
   */
  static async initiateVNeIDAuth(): Promise<string> {
    // Trong ứng dụng thực tế, sẽ redirect người dùng đến cổng VNeID
    // để xác thực và nhận lại JWT token
    console.log('Redirecting to VNeID authentication portal...');
    
    // Mock implementation - trong thực tế sẽ redirect đến cổng VNeID
    return new Promise((resolve) => {
      resolve('mock_vneid_token_' + Date.now());
    });
  }

  /**
   * Xác thực với VNeID và nhận profile
   */
  static async authenticateWithVNeID(authCode: string): Promise<VNeIDProfile> {
    // Trong ứng dụng thực tế, sẽ gửi authCode tới backend để xác thực
    // và nhận lại thông tin người dùng từ VNeID
    console.log(`Authenticating with VNeID using code: ${authCode}`);
    
    // Mock response - trong thực tế sẽ nhận từ API VNeID
    const mockProfile: VNeIDProfile = {
      userId: `vneid_${Date.now()}`,
      fullName: 'NGUYỄN VĂN A',
      dateOfBirth: '1990-01-01',
      gender: 'Nam',
      nationality: 'Việt Nam',
      idCardNumber: '012345678',
      idCardIssueDate: '2020-05-15',
      idCardPlaceOfIssue: 'Công an TP Hà Nội',
      address: 'Số 1, Đường ABC, Quận XYZ, Hà Nội',
      phoneNumber: '+84912345678',
      email: 'nguyenvana@example.com',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Hết hạn sau 24h
    };
    
    return mockProfile;
  }

  /**
   * Cập nhật thông tin xác thực VNeID cho người dùng Firebase
   */
  static async linkVNeIDToFirebaseAccount(firebaseUser: FirebaseUser, vneidProfile: VNeIDProfile): Promise<void> {
    // Trong ứng dụng thực tế, sẽ lưu thông tin xác thực VNeID
    // vào tài khoản người dùng trong Firebase
    console.log(`Linking VNeID profile to Firebase account: ${firebaseUser.uid}`);
    
    // Đây là nơi bạn sẽ cập nhật tài khoản Firebase với thông tin xác thực VNeID
    // Có thể lưu vào custom claims hoặc vào document riêng trong Firestore
  }

  /**
   * Kiểm tra xem người dùng đã xác thực VNeID chưa
   */
  static async isVNeIDVerified(firebaseUser: FirebaseUser): Promise<boolean> {
    // Trong ứng dụng thực tế, sẽ kiểm tra trong Firestore hoặc Firebase Auth
    // xem người dùng có thông tin xác thực VNeID chưa
    console.log(`Checking VNeID verification status for user: ${firebaseUser.uid}`);
    
    // Mock implementation
    return Math.random() > 0.5; // Ngẫu nhiên trả về true/false để mô phỏng
  }

  /**
   * Lấy thông tin xác thực VNeID của người dùng
   */
  static async getVNeIDProfile(firebaseUser: FirebaseUser): Promise<VNeIDProfile | null> {
    // Trong ứng dụng thực tế, sẽ lấy từ Firestore hoặc custom claims
    console.log(`Retrieving VNeID profile for user: ${firebaseUser.uid}`);
    
    // Mock implementation - nếu người dùng đã xác thực VNeID
    if (await this.isVNeIDVerified(firebaseUser)) {
      return {
        userId: `vneid_${firebaseUser.uid}`,
        fullName: 'NGUYỄN VĂN A',
        dateOfBirth: '1990-01-01',
        gender: 'Nam',
        nationality: 'Việt Nam',
        idCardNumber: '012345678',
        idCardIssueDate: '2020-05-15',
        idCardPlaceOfIssue: 'Công an TP Hà Nội',
        address: 'Số 1, Đường ABC, Quận XYZ, Hà Nội',
        phoneNumber: '+84912345678',
        email: firebaseUser.email || 'user@example.com',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
    
    return null;
  }

  /**
   * Lấy thông tin người dùng hiện tại
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      // In a real implementation, we would fetch user details from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        // If user doesn't exist in Firestore, create a basic entry
        await setDoc(doc(db, 'users', currentUser.uid), {
          email: currentUser.email,
          role: 'customer',
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp(),
          permissions: [],
        });
      }
      
      const userData = userDoc.data();
      
      const user: User = {
        id: currentUser.uid,
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
        avatar: currentUser.photoURL || '',
        role: (userData?.role as UserRole) || 'customer',
        status: 'active',
        permissions: userData?.permissions || [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: currentUser.emailVerified,
        phoneVerified: false // Would be set based on phone auth in real app
      };
      
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }
  
  // Helper function to ensure user exists in Firestore
  private static async ensureUserExistsInFirestore(user: User) {
    if (!user || !user.id) {
      console.error('User object or user id is missing');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document with basic info
        await setDoc(userDocRef, {
          ...user,
          createdAt: new Date().toISOString(),
          role: user.role || 'customer',
          permissions: user.permissions || []
        });
        console.log(`User document created for: ${user.id}`);
      } else {
        console.log(`User document already exists for: ${user.id}`);
      }
    } catch (error) {
      console.error('Error ensuring user exists in Firestore:', error);
    }
  }
}

export const authService = new AuthService();
