# Quick Build Commands - ACFMart Android

## 📱 For Testing (Debug APK)

### Build Debug APK
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat assembleDebug
```

**Output:** `app\build\outputs\apk\debug\app-debug.apk` (~46 MB)

### Install on Phone
```powershell
# Via USB
adb install app\build\outputs\apk\debug\app-debug.apk

# Or copy file to phone and tap to install
```

---

## 🔐 For Google Play Store (Release)

### Step 1: Generate Keystore (ONE TIME ONLY)
```powershell
.\generate-keystore-secure.bat
```
**Follow prompts to set secure password**

### Step 2: Update Password in keystore.properties
```properties
RELEASE_STORE_PASSWORD=[YourPassword]
RELEASE_KEY_PASSWORD=[YourPassword]
```

### Step 3: Build Release APK
```powershell
.\gradlew.bat assembleRelease
```

**Output:** `app\build\outputs\apk\release\app-release.apk` (~15-20 MB)

### Step 4: Build AAB for Play Store
```powershell
.\gradlew.bat bundleRelease
```

**Output:** `app\build\outputs\bundle\release\app-release.aab` (~15-20 MB)

---

## 🧪 Run Tests
```powershell
.\gradlew.bat testDebugUnitTest
```

---

## 📋 Quick Checklist

### For Testing
- [ ] Build debug APK
- [ ] Install on device
- [ ] Test all features
- [ ] Fix any bugs

### For Play Store
- [ ] Generate keystore
- [ ] Update keystore.properties
- [ ] Build release AAB
- [ ] Test release APK on device
- [ ] Prepare store listing (graphics, descriptions)
- [ ] Upload to Play Console
- [ ] Wait for review (1-7 days)
- [ ] Publish!

---

## 📁 File Locations

| File | Location |
|------|----------|
| Debug APK | `app\build\outputs\apk\debug\app-debug.apk` |
| Release APK | `app\build\outputs\apk\release\app-release.apk` |
| Release AAB | `app\build\outputs\bundle\release\app-release.aab` |
| Keystore | `..\keystore\acfmart-release-key.jks` |
| Test Report | `app\build\reports\tests\testDebugUnitTest\index.html` |

---

## ⚡ One-Liner Build Commands

```powershell
# Clean + Test + Build Debug
.\gradlew.bat clean testDebugUnitTest assembleDebug

# Build Release (requires keystore)
.\gradlew.bat clean assembleRelease bundleRelease
```

---

## 🆘 Troubleshooting

**Keystore not found?**
```powershell
.\generate-keystore-secure.bat
```

**Build failed?**
```powershell
.\gradlew.bat clean assembleDebug --stacktrace
```

**Tests failing?**
```powershell
.\gradlew.bat testDebugUnitTest --info
```

---

For full documentation, see: [BUILD_AND_RELEASE_GUIDE.md](BUILD_AND_RELEASE_GUIDE.md)
