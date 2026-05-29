# ACFMart - Build & Release Guide

## 📱 Part 1: Build Debug APK for Testing

### Quick Build
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat assembleDebug
```

### Output Location
```
app\build\outputs\apk\debug\app-debug.apk
```

### Install on Device

**Option A: USB Cable**
```powershell
# Enable USB debugging on your phone first
# Settings → About phone → Tap "Build number" 7 times
# Go back → Developer options → Enable "USB debugging"

# Connect phone via USB
# Install APK
adb install app\build\outputs\apk\debug\app-debug.apk

# If already installed, reinstall
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

**Option B: Share File**
1. Copy `app-debug.apk` to your phone (Google Drive, USB, Bluetooth)
2. On phone, tap the APK file
3. Allow "Install from unknown sources" if prompted
4. Install and run

### Debug APK Features
- ✅ Signed with debug key (auto-generated)
- ✅ Debuggable (can use Android Studio debugger)
- ✅ Package name: `vn.acfmart.mobile.debug`
- ✅ NOT for Play Store upload
- ✅ Size: ~46 MB

---

## 🔐 Part 2: Generate Secure Release Keystore

**CRITICAL**: The keystore file is REQUIRED to update your app on Play Store. If you lose it, you CANNOT update the app ever again!

### Step 1: Generate Keystore
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\generate-keystore-secure.bat
```

**You will be prompted to enter:**
- Keystore password (min 8 characters, make it STRONG)
- Confirm password
- Your details (name, organization, location)

**Example:**
```
Enter keystore password: [YourStrongPassword123!]
Re-enter new password: [YourStrongPassword123!]
What is your first and last name? [ACF Mart]
What is the name of your organizational unit? [Mobile Development]
What is the name of your organization? [ACF Mart Co Ltd]
What is the name of your City or Locality? [Ho Chi Minh City]
What is the name of your State or Province? [Ho Chi Minh]
What is the two-letter country code for this unit? [VN]
```

### Step 2: Update keystore.properties
After generating keystore, update `keystore.properties`:

```properties
RELEASE_STORE_FILE=../keystore/acfmart-release-key.jks
RELEASE_STORE_PASSWORD=[YourNewPassword]
RELEASE_KEY_ALIAS=acfmart-key
RELEASE_KEY_PASSWORD=[YourNewPassword]
```

### Step 3: BACK UP Keystore!
Copy `..\keystore\acfmart-release-key.jks` to:
- ✅ External hard drive
- ✅ Cloud storage (Google Drive, Dropbox)
- ✅ Multiple secure locations

**⚠️ NEVER:**
- ❌ Commit to Git (already in `.gitignore`)
- ❌ Share publicly
- ❌ Lose the file
- ❌ Forget the password

---

## 🚀 Part 3: Build Release APK

### Build Signed Release APK
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat assembleRelease
```

### Output Location
```
app\build\outputs\apk\release\app-release.apk
```

### Release APK Features
- ✅ Signed with your release keystore
- ✅ Minified & optimized (ProGuard)
- ✅ Resources shrunk
- ✅ Package name: `vn.acfmart.mobile`
- ✅ Can distribute directly to users
- ✅ NOT for Play Store (use AAB instead)
- ✅ Size: ~15-20 MB (smaller than debug)

---

## 📦 Part 4: Build Android App Bundle (AAB) for Play Store

**Google Play REQUIRES AAB format**, not APK.

### Build AAB
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat bundleRelease
```

### Output Location
```
app\build\outputs\bundle\release\app-release.aab
```

### AAB Features
- ✅ Optimized for each device type
- ✅ Smaller download size for users
- ✅ Required by Google Play
- ✅ Same signing as release APK
- ✅ Size: ~15-20 MB

### Verify AAB
```powershell
# Check file exists
dir app\build\outputs\bundle\release\app-release.aab

# View file size (should be 15-25 MB)
```

---

## 🎯 Part 5: Upload to Google Play Store

### Prerequisites
1. ✅ Google Play Developer Account ($25 one-time fee)
   - Sign up: https://play.google.com/console
2. ✅ Release AAB file built
3. ✅ Keystore backed up securely
4. ✅ App tested on real device

### Step-by-Step Upload

#### 1. Create Play Console Account
- Go to: https://play.google.com/console
- Pay $25 registration fee
- Complete identity verification
- Wait for approval (usually 1-2 days)

#### 2. Create App Listing
1. Click **"Create app"**
2. Enter app details:
   - **App name**: ACF Mart
   - **Default language**: Vietnamese (vi-VN)
   - **App or game**: App
   - **Free or paid**: Free

#### 3. Fill Store Listing
**Required information:**

**Short description** (80 characters):
```
Sàn thương mại điện tử chống hàng giả với xác thực QR code
```

**Full description**:
```
ACF Mart - Sàn TMĐT Chống Hàng Giả

🛒 MUA SẮM THÔNG MINH
- Hàng ngàn sản phẩm chính hãng
- Giá cả cạnh tranh, ưu đãi hấp dẫn
- Giao hàng nhanh chóng toàn quốc

✅ XÁC THỰC CHÍNH HÃNG
- Quét QR code để kiểm tra nguồn gốc
- Chống hàng giả, hàng nhái
- Minh bạch thông tin sản phẩm

🔒 AN TOÀN & BẢO MẬT
- Thanh toán COD an toàn
- Bảo vệ người mua 100%
- Hỗ trợ 24/7

📱 TÍNH NĂNG NỔI BẬT
- Giao diện hiện đại, dễ sử dụng
- Theo dõi đơn hàng realtime
- Lịch sử mua hàng chi tiết
- Wishlist & thông báo khuyến mãi

🏪 DÀNH CHO CẢ NGƯỜI MUA & NGƯỜI BÁN
- Đăng ký bán hàng dễ dàng
- Quản lý kho hàng thông minh
- Thống kê doanh thu chi tiết

Tải ACF Mart ngay để trải nghiệm mua sắm online an toàn và tiện lợi!
```

#### 4. Upload Graphics
**Required:**
- ✅ App icon (512x512 PNG)
- ✅ Feature graphic (1024x500 PNG)
- ✅ Screenshots (min 2, max 8):
  - Phone: 16:9 or 9:16 ratio
  - Tablet: 16:9 or 9:16 ratio (optional)

**Recommended screenshots:**
1. Home screen - product browsing
2. Product detail - with QR verification
3. Shopping cart
4. Checkout flow
5. Order tracking
6. Profile/account

#### 5. Upload AAB
1. Go to **Production** or **Internal testing**
2. Click **"Create new release"**
3. Upload `app-release.aab`
4. Fill release notes:
   ```
   Version 1.0.0 - Initial Release
   
   Features:
   - Browse products by category
   - Shopping cart & checkout
   - Order tracking
   - QR code verification
   - User profile & settings
   - Push notifications
   ```

#### 6. Fill Content Rating
- Complete content rating questionnaire
- Usually rated "Everyone" for e-commerce

#### 7. Set Pricing & Distribution
- **Countries**: Select Vietnam (and others if applicable)
- **Price**: Free

#### 8. Review & Publish
1. Review all information
2. Accept developer agreements
3. Click **"Review release"**
4. Click **"Start rollout to Production"**

### Review Process
- ⏳ Initial review: 1-7 days
- ⏳ Subsequent updates: 1-3 days
- ✅ You'll receive email when approved

---

## 📋 Part 6: Pre-Release Checklist

### Before Building Release
- [ ] All tests passing (`.\gradlew.bat testDebugUnitTest`)
- [ ] App tested on real device
- [ ] No debug logs in production code
- [ ] Version code & name updated
- [ ] Keystore generated and backed up
- [ ] `keystore.properties` updated with secure password

### Before Uploading to Play Store
- [ ] AAB file built successfully
- [ ] App icon ready (512x512)
- [ ] Feature graphic ready (1024x500)
- [ ] Screenshots captured (min 2)
- [ ] Store listing text prepared (Vietnamese + English)
- [ ] Privacy policy URL ready
- [ ] Support email/website ready
- [ ] Play Developer account created

### After Upload
- [ ] Monitor review status
- [ ] Test internal testing track first
- [ ] Prepare marketing materials
- [ ] Plan launch announcement
- [ ] Set up crash reporting (Firebase Crashlytics ✅ already integrated)

---

## 🔧 Build Commands Quick Reference

```powershell
# Clean build artifacts
.\gradlew.bat clean

# Build debug APK (for testing)
.\gradlew.bat assembleDebug

# Build release APK (for distribution)
.\gradlew.bat assembleRelease

# Build AAB (for Play Store)
.\gradlew.bat bundleRelease

# Run all tests
.\gradlew.bat testDebugUnitTest

# Build + Test
.\gradlew.bat clean testDebugUnitTest assembleDebug

# View APK size
dir app\build\outputs\apk\debug\app-debug.apk
dir app\build\outputs\apk\release\app-release.apk

# View AAB size
dir app\build\outputs\bundle\release\app-release.aab

# Install on connected device
adb install app\build\outputs\apk\debug\app-debug.apk
```

---

## 📊 Version Management

### Current Version
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Package Name**: `vn.acfmart.mobile` (release)

### Update Version for Next Release
Edit `app\build.gradle`:
```gradle
defaultConfig {
    versionCode 2  // Increment by 1 each release
    versionName "1.0.1"  // Semantic versioning
}
```

---

## 🐛 Troubleshooting

### Issue: "Keystore not found"
**Solution:**
```powershell
# Check if keystore exists
dir ..\keystore\acfmart-release-key.jks

# If missing, regenerate
.\generate-keystore-secure.bat
```

### Issue: "Wrong password"
**Solution:**
- Check `keystore.properties` matches your keystore password
- If forgotten, must regenerate keystore (can't recover)

### Issue: "AAB too large"
**Solution:**
- Enable R8 shrinking (already enabled)
- Check for large assets in `res/` or `assets/`
- Use WebP for images

### Issue: "Build failed"
**Solution:**
```powershell
# Clean and rebuild
.\gradlew.bat clean assembleRelease

# Check error logs
.\gradlew.bat assembleRelease --stacktrace
```

### Issue: "Play Store rejects AAB"
**Common reasons:**
- ❌ Not signed with release keystore
- ❌ Debuggable flag still enabled
- ❌ Version code already used
- ❌ Missing required store listing fields

---

## 📞 Support

### Play Console Help
- Developer support: https://support.google.com/googleplay/android-developer
- Community forum: https://android-developers.googleblog.com/

### Firebase Setup (Already Done)
- ✅ google-services.json configured
- ✅ Firebase Auth, Firestore, Storage integrated
- ✅ Crashlytics enabled
- ✅ Analytics enabled

---

## 🎉 Success Criteria

Your app is ready for Play Store when:
- ✅ Release AAB builds successfully
- ✅ App runs without crashes on real device
- ✅ All core features working (auth, cart, checkout, orders)
- ✅ Store listing complete with graphics
- ✅ Privacy policy published
- ✅ Play Developer account approved

**Good luck with your launch! 🚀**
