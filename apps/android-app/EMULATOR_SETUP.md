# Android Emulator Setup Guide for ACFMart

## Quick Setup via Android Studio (Recommended)

### Step 1: Open Device Manager
1. Open Android Studio
2. Click **Tools** → **Device Manager** (or click the Device Manager icon in toolbar)
3. Click **+ Create Device**

### Step 2: Select Hardware
**Recommended Device:** Pixel 6 or Pixel 7
- Good screen size (1080x2400)
- Modern aspect ratio
- Matches real-world usage

### Step 3: Select System Image
**Recommended:** Android 14 (API 34) or Android 13 (API 33)
- Click **x86 Images** tab
- Select: **Tiramisu** (API 33) or **UpsideDownCake** (API 34)
- Click **Download** (if not already downloaded)
- Wait for download to complete (~800MB)

### Step 4: Configure Emulator
**Settings:**
- **AVD Name:** `ACFMart_Pixel6_API34`
- **Startup orientation:** Portrait
- **Show Advanced Settings:** ✅
  - **Internal Storage:** 2048 MB
  - **SD card:** 512 MB
  - **Camera Back:** VirtualScene (or Webcam0)
  - **Camera Front:** Emulated
  - **Network:** Auto
  - **RAM:** 2048 MB (minimum)
  - **VM heap:** 256 MB

### Step 5: Launch Emulator
- Click **▶️ Play** button
- Wait for boot (first time takes 2-3 minutes)
- Emulator is ready when you see Android home screen

---

## Command Line Setup (Alternative)

If you prefer command line or automation:

### Prerequisites
```powershell
# Set Android SDK path (adjust if different)
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\emulator"
```

### Step 1: List Available Images
```powershell
sdkmanager --list | Select-String "system-images"
```

### Step 2: Download System Image
```powershell
# Android 14 (API 34) x86_64
sdkmanager "system-images;android-34;google_apis;x86_64"

# OR Android 13 (API 33)
sdkmanager "system-images;android-33;google_apis;x86_64"
```

### Step 3: Create AVD
```powershell
# Create Pixel 6 emulator with Android 14
avdmanager create avd `
  --name "ACFMart_Pixel6_API34" `
  --package "system-images;android-34;google_apis;x86_64" `
  --device "pixel_6" `
  --force
```

### Step 4: Launch Emulator
```powershell
# Start emulator
emulator -avd ACFMart_Pixel6_API34 -netdelay none -netspeed full

# OR with additional options
emulator -avd ACFMart_Pixel6_API34 `
  -camera-back virtualscene `
  -camera-front emulated `
  -memory 2048 `
  -partition-size 2048
```

---

## Emulator Best Practices for ACFMart

### Performance Tips
1. **Use x86_64 images** (faster than ARM)
2. **Enable Hardware Acceleration:**
   - BIOS: Enable Intel VT-x or AMD-V
   - Windows: Enable Hyper-V or Windows Hypervisor Platform
3. **Use Cold Boot** only on first launch
4. **Quick Boot** for subsequent launches

### Testing QR Scanner
- **VirtualScene camera** works for basic testing
- For real QR scanning test, use **physical device**
- Emulator camera can't scan real QR codes effectively

### Testing Network
- Emulator has internet by default
- Use `10.0.2.2` to access localhost from emulator
- Test with ACFMart.vn backend when ready

---

## Multiple Emulator Profiles

Create different profiles for testing:

### 1. Phone (Primary Testing)
```
Name: ACFMart_Pixel6_API34
Device: Pixel 6
API: 34 (Android 14)
Resolution: 1080x2400
```

### 2. Tablet (Layout Testing)
```
Name: ACFMart_PixelTablet_API34
Device: Pixel Tablet
API: 34 (Android 14)
Resolution: 1600x2560
```

### 3. Low-end Device (Performance Testing)
```
Name: ACFMart_Pixel3_API30
Device: Pixel 3
API: 30 (Android 11)
RAM: 1536 MB
```

---

## Quick Commands Reference

```powershell
# List all AVDs
avdmanager list avd

# List connected devices/emulators
adb devices

# Install APK to emulator
adb install app\build\outputs\apk\debug\app-debug.apk

# Screenshot
adb exec-out screencap -p > screenshot.png

# Screen recording
adb screenrecord /sdcard/video.mp4
adb pull /sdcard/video.mp4

# Clear app data
adb shell pm clear vn.acfmart.mobile.debug

# View logs
adb logcat | Select-String "ACFMart"
```

---

## Troubleshooting

### Emulator Won't Start
1. Check Intel VT-x/AMD-V is enabled in BIOS
2. Update Intel HAXM or enable Windows Hypervisor Platform
3. Try different system image (x86 instead of x86_64)

### Emulator is Slow
1. Increase RAM to 2048 MB or 4096 MB
2. Use x86_64 images (not ARM)
3. Enable hardware acceleration
4. Close other applications

### Camera Not Working
1. Check camera settings in AVD configuration
2. Use VirtualScene for back camera
3. Test on physical device for real QR scanning

### Network Issues
1. Emulator has internet by default
2. Use `10.0.2.2` for localhost
3. Check firewall settings

---

## Next Steps

After emulator is running:
1. ✅ Build debug APK: `.\gradlew.bat assembleDebug`
2. ✅ Install APK: `adb install app\build\outputs\apk\debug\app-debug.apk`
3. ✅ Launch app and test all 13 screens
4. ✅ Verify navigation flows
5. ✅ Test different screen sizes
6. ✅ Test light/dark mode switching

---

## Physical Device Testing (Recommended for QR Scanner)

For complete testing, especially QR verification:

1. **Enable Developer Options:**
   - Settings → About phone
   - Tap "Build number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer options
   - Enable "USB debugging"

3. **Connect via USB:**
   - Connect phone to computer
   - Accept USB debugging prompt

4. **Verify Connection:**
   ```powershell
   adb devices
   ```

5. **Install & Run:**
   ```powershell
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

6. **Test QR Scanner:**
   - Open app → Navigate to QR Verify tab
   - Scan real QR code
   - Verify authentication flow works
