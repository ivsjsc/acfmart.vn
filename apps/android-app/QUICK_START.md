# ACFMart Android App - Quick Start Guide

## 🚀 Build & Deploy in 5 Minutes

### Option 1: Quick Debug Build (For Testing)

```powershell
# Navigate to project
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app

# Build debug APK
.\gradlew.bat assembleDebug

# Install to connected device/emulator
adb install app\build\outputs\apk\debug\app-debug.apk

# Or run from Android Studio
# Click: Run → Run 'app' (Shift+F10)
```

**Result:** Debug APK installed on device, ready to test!

---

### Option 2: Release Build (For Distribution)

#### First Time Setup
```powershell
# Step 1: Generate signing key (ONE TIME ONLY)
.\generate-keystore.bat

# Step 2: Build signed release APK/AAB
.\build-release.bat
```

#### Subsequent Builds
```powershell
# Just run:
.\build-release.bat
```

**Result:** Signed release APK & AAB ready for Play Store!

---

## 📱 Test on Emulator

### Quick Emulator Setup
1. Open Android Studio
2. Tools → Device Manager
3. Create Device → Pixel 6
4. Download System Image → Android 14 (API 34)
5. Click ▶️ to launch

**OR see detailed guide:** `EMULATOR_SETUP.md`

---

## 📦 What's Included

### 13 Complete Screens
✅ Splash Screen  
✅ Login Screen  
✅ Signup Screen  
✅ Forgot Password Screen  
✅ Home Screen (Search + Categories + Products)  
✅ Product Detail Screen  
✅ Shopping Cart Screen  
✅ Wishlist Screen  
✅ Profile Screen  
✅ Orders List Screen  
✅ Settings Screen  
✅ Notifications Screen  
✅ QR Verification Screen  

### Features
✅ Material Design 3 UI  
✅ Light & Dark Theme  
✅ Bottom Navigation (4 tabs)  
✅ Product search & filtering  
✅ Shopping cart management  
✅ Order tracking  
✅ QR code scanning (CameraX + ML Kit)  
✅ User profile management  
✅ Settings & preferences  
✅ Notifications system  

---

## 🎯 Next Steps

### 1. Test the App
```powershell
# Build and install
.\gradlew.bat assembleDebug
adb install app\build\outputs\apk\debug\app-debug.apk

# Launch and test all 13 screens
# Verify navigation works
# Test QR scanner on real device
```

### 2. Prepare for Release
```powershell
# Generate keystore (first time)
.\generate-keystore.bat

# Build release version
.\gradlew.bat bundleRelease

# Test release APK
adb install app\build\outputs\apk\release\app-release.apk
```

### 3. Submit to Play Store
- Follow guide: `PLAY_STORE_SUBMISSION.md`
- Prepare screenshots
- Write app descriptions
- Upload AAB to Google Play Console

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `EMULATOR_SETUP.md` | Complete emulator setup guide |
| `PLAY_STORE_SUBMISSION.md` | Play Store submission guide |
| `generate-keystore.bat` | Generate release signing key |
| `build-release.bat` | Build signed release APK/AAB |
| `keystore.properties` | Signing configuration |
| `app/build.gradle` | App build configuration |

---

## 🔧 Troubleshooting

### Build Fails
```powershell
# Clean and rebuild
.\gradlew.bat clean
.\gradlew.bat assembleDebug

# Check Java version (need JDK 17)
java -version
```

### Emulator Won't Start
- Check Intel VT-x/AMD-V enabled in BIOS
- Use x86_64 system images
- See `EMULATOR_SETUP.md` for details

### APK Won't Install
```powershell
# Uninstall previous version first
adb uninstall vn.acfmart.mobile.debug

# Install fresh
adb install app\build\outputs\apk\debug\app-debug.apk
```

### QR Scanner Not Working
- Test on **real device** (emulator camera limitations)
- Enable camera permissions
- Check device camera is working

---

## 📊 Project Stats

- **Screens:** 13
- **Architecture:** MVVM
- **UI Framework:** Jetpack Compose
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)
- **Language:** Kotlin
- **DI:** Hilt
- **Backend Ready:** Firebase

---

## 🎨 Customization

### Change App Colors
Edit: `app/src/main/java/vn/acfmart/mobile/core/ui/theme/Color.kt`

### Change App Name
Edit: `app/src/main/res/values/strings.xml`

### Change Package Name
Edit: `app/build.gradle` → `applicationId`

---

## 📞 Support

- **Documentation:** See .md files in project root
- **Email:** support@acfmart.vn
- **Website:** https://acfmart.vn

---

**Ready to build? Run:** `.\build-release.bat` 🚀
