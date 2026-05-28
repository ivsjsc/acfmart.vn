# ACF Mart Android Application

Native Android implementation of the ACF Anti-Counterfeit E-commerce Platform with complete UX/UI.

## ✅ Completed Features

### Phase 1: Authentication (100%)
- ✅ Login Screen with VNeID simulation
- ✅ Signup Screen with validation
- ✅ Forgot Password Screen
- ✅ Auto navigation flow: Splash → Auth → Home

### Phase 2: Home & Storefront (100%)
- ✅ Home Screen with search & filters
- ✅ Product grid with category navigation
- ✅ Product Detail Screen (full UX)
- ✅ Product cards with verified badges, discounts, ratings
- ✅ Shopping Cart Screen
- ✅ Wishlist/Favorites Screen

### Phase 3: Account Management (100%)
- ✅ Profile Screen with user info
- ✅ Orders List with status filters
- ✅ Settings Screen (appearance, notifications, security, privacy)
- ✅ Notifications Screen with real-time updates
- ✅ Bottom Navigation Bar (4 tabs)

### Phase 4: Tools (100%)
- ✅ QR Verification Screen with CameraX + ML Kit
- ✅ Barcode scanning UI
- ✅ Product authentication flow

## 🎨 Design System

- **UI Framework**: Jetpack Compose
- **Design Language**: Material Design 3
- **Theme**: Light & Dark mode support
- **Brand Colors**: Red (#DC2626) & Gold (#F59E0B)
- **Image Loading**: Coil
- **QR Scanning**: CameraX + ML Kit

## 📱 Screen Inventory

### Authentication
1. Splash Screen
2. Login Screen
3. Signup Screen
4. Forgot Password Screen

### Storefront
5. Home Screen (Search + Categories + Products)
6. Product Detail Screen
7. Shopping Cart Screen
8. Wishlist Screen

### Account
9. Profile Screen
10. Orders List Screen
11. Settings Screen
12. Notifications Screen

### Tools
13. QR Verification Screen

## 🚀 How to Build

1. Open this directory (`apps/android-app`) in Android Studio
2. Sync Project with Gradle Files
3. Run the `app` module on an emulator or physical device

## 📐 Architecture

- **Pattern**: MVVM (Model-View-ViewModel)
- **DI**: Hilt
- **Navigation**: Navigation Compose
- **State Management**: StateFlow + Compose State
- **Backend Ready**: Firebase (Auth, Firestore, Storage, Messaging)

## 🎯 Next Steps (Future Phases)

- [ ] Backend API integration
- [ ] Real authentication (Firebase Auth)
- [ ] Payment gateway (VNPay, MoMo)
- [ ] Real-time chat support
- [ ] Seller dashboard
- [ ] Admin panel
- [ ] Push notifications
- [ ] Offline support with Room database
