# Google Play Store Submission Guide - ACFMart

## 📋 Pre-Submission Checklist

### 1. App Requirements
- [x] App icon (512x512 PNG) - **Need to create**
- [x] Feature graphic (1024x500 PNG) - **Need to create**
- [x] Screenshots (minimum 2, up to 8) - **Need to capture**
- [ ] App description (short & full)
- [ ] Privacy policy URL
- [ ] App category: Shopping
- [ ] Contact information (email, website)

### 2. Technical Requirements
- [x] Signed release APK/AAB
- [x] versionCode: 1
- [x] versionName: "1.0.0"
- [x] minSdk: 24 (Android 7.0+)
- [x] targetSdk: 34 (Android 14)
- [ ] App Bundle (AAB) format preferred over APK
- [ ] ProGuard/R8 optimization enabled ✅

### 3. Content Requirements
- [ ] App title (max 30 chars): "ACFMart - Anti-Counterfeit"
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Application icon
- [ ] Phone screenshots (7.89:16 or 9:16)
- [ ] 7-inch tablet screenshots (optional)
- [ ] 10-inch tablet screenshots (optional)

---

## 🚀 Step-by-Step Submission Process

### Step 1: Generate App Bundle (AAB)

Google Play requires Android App Bundle (.aab) format:

```powershell
# Build signed App Bundle
.\gradlew.bat bundleRelease

# Output location:
# app\build\outputs\bundle\release\app-release.aab
```

**AAB vs APK:**
- AAB is 15-20% smaller than universal APK
- Google Play generates optimized APKs for each device
- Required for new apps since August 2021

---

### Step 2: Create Google Play Console Account

1. **Register at:** https://play.google.com/console
2. **Pay registration fee:** $25 USD (one-time)
3. **Complete identity verification**
4. **Set up developer account**

---

### Step 3: Create App Listing

1. **Click "Create app"**
2. **Fill in details:**
   - **App name:** ACFMart - Anti-Counterfeit E-commerce
   - **Default language:** Vietnamese (or English)
   - **App or game:** App
   - **Free or paid:** Free

3. **Complete Store Listing:**
   - **App title:** ACFMart
   - **Short description:** Sàn thương mại điện tử chống hàng giả với xác thực QR
   - **Full description:** (see template below)
   - **Application icon:** Upload 512x512 PNG
   - **Feature graphic:** Upload 1024x500 PNG
   - **Screenshots:** Upload minimum 2 phone screenshots

---

### Step 4: App Content & Policies

#### Privacy Policy
Create a privacy policy page and host it on ACFMart.vn:

**Required sections:**
- Data collection (what data you collect)
- Data usage (how you use it)
- Data sharing (third-party services)
- User rights
- Contact information

**Template available at:** `PRIVACY_POLICY.md`

#### App Access
- If app requires login, provide test credentials
- For ACFMart: Create demo account for Google reviewers

#### Content Rating
- Complete IARC questionnaire
- ACFMart will likely be rated: **Everyone** or **Teen**

#### Target Audience
- Select age groups (if applicable)
- ACFMart: All ages (18+ for purchases)

#### Ads Declaration
- Does your app contain ads? No
- ACFMart is ad-free e-commerce platform

---

### Step 5: Pricing & Distribution

1. **Countries:** Select Vietnam (and others if applicable)
2. **Pricing:** Free
3. **App categories:**
   - **Primary:** Shopping
   - **Secondary:** Business (optional)
4. **Contact details:**
   - Email: support@acfmart.vn
   - Website: https://acfmart.vn
   - Phone: (optional)

---

### Step 6: Upload & Review

1. **Go to:** Production → Releases
2. **Create new release**
3. **Upload AAB file:** `app\build\outputs\bundle\release\app-release.aab`
4. **Add release notes:**
   ```
   Version 1.0.0 - Initial Release
   
   Features:
   - Browse and search products
   - QR-based product verification
   - Secure shopping cart & checkout
   - Order tracking
   - User profile management
   - Anti-counterfeit protection
   ```
5. **Review and publish**

**Review time:** 1-7 days (typically 2-3 days)

---

## 📝 Description Templates

### Short Description (80 chars max)

**Vietnamese:**
```
Sàn TMĐT chống hàng giả với xác thực QR, mua sắm an toàn, minh bạch
```

**English:**
```
Anti-counterfeit e-commerce with QR verification, safe & transparent shopping
```

---

### Full Description (4000 chars max)

**Vietnamese:**
```
ACFMart - Sàn Thương Mại Điện Tử Chống Hàng Giả

🛡️ MUA SẮM AN TOÀN - SẢN PHẨM CHÍNH HÃNG
ACFMart là nền tảng thương mại điện tử tiên phong trong việc chống hàng giả với công nghệ xác thực QR code. Mọi sản phẩm đều được kiểm duyệt và xác minh nguồn gốc.

✨ TÍNH NĂNG NỔI BẬT:

🔍 Xác thực QR Code
- Quét mã QR để kiểm tra nguồn gốc sản phẩm
- Xác minh tính chính hãng ngay lập tức
- Minh bạch thông tin sản phẩm

🛒 Mua sắm thông minh
- Tìm kiếm sản phẩm nhanh chóng
- Danh mục đa dạng, dễ dàng浏览
- Giỏ hàng tiện lợi, thanh toán an toàn

📦 Theo dõi đơn hàng
- Cập nhật trạng thái đơn hàng real-time
- Lịch sử mua hàng đầy đủ
- Đánh giá và nhận xét sản phẩm

👤 Quản lý tài khoản
- Hồ sơ cá nhân
- Danh sách yêu thích
- Địa chỉ giao hàng
- Phương thức thanh toán

🔒 Bảo mật tuyệt đối
- Đăng nhập an toàn (VNeID, Google, Facebook)
- Thanh toán được bảo vệ (Escrow)
- Chính sách bảo mật nghiêm ngặt

📱 GIAO DIỆN HIỆN ĐẠI
- Thiết kế Material Design 3
- Hỗ trợ chế độ sáng/tối
- Tối ưu cho mọi thiết bị

🏪 DÀNH CHO MỌI NGƯỜI
- Người mua sắm: Tìm sản phẩm chính hãng
- Chủ shop: Bán hàng uy tín, được xác thực
- Người kiểm duyệt: Đảm bảo chất lượng sản phẩm

📞 HỖ TRỢ 24/7
- Email: support@acfmart.vn
- Hotline: 1900 xxxx
- Chat trong ứng dụng

🔐 BẢO VỆ NGƯỜI TIÊU DÙNG
ACFMart cam kết:
- 100% sản phẩm chính hãng
- Hoàn tiền nếu phát hiện hàng giả
- Bảo vệ người mua với Escrow Payment
- Minh bạch thông tin seller

Tải ACFMart ngay để trải nghiệm mua sắm an toàn, thông minh và minh bạch!

---
Website: https://acfmart.vn
Email: support@acfmart.vn
Chính sách bảo mật: https://acfmart.vn/privacy
Điều khoản sử dụng: https://acfmart.vn/terms
```

**English:**
```
ACFMart - Anti-Counterfeit E-commerce Platform

🛡️ SAFE SHOPPING - AUTHENTIC PRODUCTS ONLY
ACFMart is a pioneering e-commerce platform with QR code verification technology. Every product is verified and authenticated.

✨ KEY FEATURES:

🔍 QR Code Verification
- Scan QR codes to verify product authenticity
- Instant genuineness confirmation
- Transparent product information

🛒 Smart Shopping
- Fast product search
- Diverse categories
- Secure cart & checkout

📦 Order Tracking
- Real-time order status updates
- Complete purchase history
- Product reviews & ratings

👤 Account Management
- Personal profile
- Wishlist
- Shipping addresses
- Payment methods

🔒 Maximum Security
- Secure login (VNeID, Google, Facebook)
- Protected payments (Escrow)
- Strict privacy policy

📱 MODERN INTERFACE
- Material Design 3
- Light/Dark mode support
- Optimized for all devices

🏪 FOR EVERYONE
- Shoppers: Find authentic products
- Shop owners: Sell with verified credibility
- Moderators: Ensure product quality

📞 24/7 SUPPORT
- Email: support@acfmart.vn
- Hotline: 1900 xxxx
- In-app chat

🔐 CONSUMER PROTECTION
ACFMart commits to:
- 100% authentic products
- Money-back guarantee for counterfeits
- Buyer protection with Escrow Payment
- Transparent seller information

Download ACFMart now for safe, smart, and transparent shopping!

---
Website: https://acfmart.vn
Email: support@acfmart.vn
Privacy Policy: https://acfmart.vn/privacy
Terms of Service: https://acfmart.vn/terms
```

---

## 📸 Screenshot Requirements

### Phone Screenshots (Required: minimum 2)

**Specifications:**
- Aspect ratio: 16:9 or 9:16
- Format: PNG or JPEG
- Max size: 8 MB per image
- Resolution: minimum 320px, maximum 3840px on longest side

**Recommended screenshots to capture:**

1. **Home Screen** - Product listing with search
2. **Product Detail** - Product info with verified badge
3. **QR Scanner** - Verification screen
4. **Shopping Cart** - Cart with items
5. **Profile** - User account screen
6. **Orders** - Order tracking
7. **Dark Mode** - Show dark theme support

**Capture on real device or emulator:**
```powershell
# Using adb to capture screenshot
adb exec-out screencap -p > screenshot1.png

# Or use Android Studio's Screen Capture tool
# Tools → Layout Inspector → Screen Capture
```

---

## 🎨 Graphics Requirements

### App Icon (Required)
- **Size:** 512x512 pixels
- **Format:** 32-bit PNG
- **Shape:** Full square (Google will apply mask)
- **No transparency**
- **Design:** Use ACFMart logo with Red & Gold colors

### Feature Graphic (Required)
- **Size:** 1024x500 pixels
- **Format:** JPEG or 24-bit PNG (no alpha)
- **Purpose:** Banner in Play Store
- **Design:** Include app name, key features, branding

### Promo Graphic (Optional)
- **Size:** 180x120 pixels
- **Format:** JPEG or 24-bit PNG

---

## 🔐 Build Release Version

### Automated Build (Recommended)

```powershell
# Step 1: Generate keystore (first time only)
.\generate-keystore.bat

# Step 2: Build signed release APK/AAB
.\build-release.bat

# Or manually:
.\gradlew.bat bundleRelease
```

### Manual Build

```powershell
# Clean previous builds
.\gradlew.bat clean

# Build release App Bundle
.\gradlew.bat bundleRelease

# Build release APK (for testing)
.\gradlew.bat assembleRelease
```

**Output locations:**
- AAB: `app\build\outputs\bundle\release\app-release.aab`
- APK: `app\build\outputs\apk\release\app-release.apk`

---

## ✅ Final Checklist Before Submission

### Technical
- [ ] App builds without errors
- [ ] All screens tested and working
- [ ] No crashes or ANRs
- [ ] Performance optimized (ProGuard enabled)
- [ ] App size reasonable (<100 MB)
- [ ] Internet permission declared
- [ ] Camera permission declared (for QR scanner)
- [ ] Privacy policy hosted and accessible

### Content
- [ ] App name finalized
- [ ] Short description written
- [ ] Full description written
- [ ] App icon designed (512x512)
- [ ] Feature graphic designed (1024x500)
- [ ] Screenshots captured (minimum 2)
- [ ] Privacy policy URL ready
- [ ] Contact email ready
- [ ] Website URL ready

### Legal
- [ ] Privacy policy compliant with GDPR/CCPA
- [ ] Terms of service ready
- [ ] Third-party SDKs declared
- [ ] Content rating completed
- [ ] Age restrictions set (if any)

### Testing
- [ ] Tested on Android 7.0 (API 24)
- [ ] Tested on Android 14 (API 34)
- [ ] Tested on phone & tablet
- [ ] QR scanner tested on real device
- [ ] Network connectivity tested
- [ ] Permissions work correctly
- [ ] Deep links work (if any)

---

## 📊 After Submission

### Review Process
1. **Upload:** AAB uploaded to Play Console
2. **Review:** 1-7 days (average 2-3 days)
3. **Approval:** App goes live automatically
4. **Rollout:** 100% production release

### Monitor Performance
- **Play Console Dashboard:** Crashes, ANRs, ratings
- **User Reviews:** Respond to feedback
- **Analytics:** Firebase Analytics integration
- **Crashlytics:** Monitor crashes in real-time

### Updates
- Increment `versionCode` for each release
- Write clear release notes
- Test thoroughly before publishing
- Use staged rollouts (10% → 50% → 100%)

---

## 🎯 Post-Launch Optimization

### ASO (App Store Optimization)
- Use relevant keywords in title/description
- Encourage positive reviews
- Update screenshots regularly
- A/B test graphics with Store Listing Experiments

### Marketing
- Share on social media
- ACFMart.vn website promotion
- Email campaign to existing users
- Press releases

### User Retention
- Push notifications (Firebase Cloud Messaging)
- Regular feature updates
- Respond to reviews
- Fix bugs quickly

---

## 📞 Support Resources

### Google Play Console Help
- https://developer.android.com/distribute
- https://support.google.com/googleplay/android-developer

### Required Policies
- https://play.google.com/about/developer-content-policy/
- https://play.google.com/about/privacy-security-deception/

### ACFMart Resources
- Website: https://acfmart.vn
- Support: support@acfmart.vn
- Privacy: https://acfmart.vn/privacy
- Terms: https://acfmart.vn/terms

---

## 🚀 Quick Start Commands

```powershell
# Complete build & prepare for Play Store

# 1. Generate keystore (first time only)
.\generate-keystore.bat

# 2. Build release AAB
.\gradlew.bat bundleRelease

# 3. Build release APK (for testing)
.\gradlew.bat assembleRelease

# 4. Verify APK
# Check: app\build\outputs\apk\release\app-release.apk

# 5. Test on device
adb install app\build\outputs\apk\release\app-release.apk

# 6. Upload AAB to Play Console
# Location: app\build\outputs\bundle\release\app-release.aab
```

---

**Good luck with your ACFMart Play Store submission! 🎉**
