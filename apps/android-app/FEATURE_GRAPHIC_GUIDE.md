# ACF Mart - Feature Graphic Creation Guide

##  Feature Graphic Specifications
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG (no transparency)
- **Max file size**: 1 MB
- **Purpose**: Banner at top of Play Store listing

---

## 🎨 Design Template

### Layout Suggestion:
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [ACF Mart Logo]          MUA SẮM AN TOÀN - CHỐNG HÀNG GIẢ   │
│  (Left side)              (Tagline - Right side)             │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────                      │
│  │ Phone 1 │  │ Phone 2 │  │ Phone 3 │                      │
│  │ Home    │  │ Product │  │ Cart/   │                      │
│  │ Screen  │  │ + QR    │  │Checkout │                      │
│  └─────────┘  └─────────┘  └─────────┘                      │
│                                                              │
│              ✓ Chính Hãng  ✓ QR Verify  ✓ COD                │
│                                                              │
│                    [Download Free Badge]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
     1024 x 500 pixels
```

---

## ️ Cách Tạo (3 Options)

### Option 1: Dùng Canva (DỄ NHẤT - FREE) ⭐ RECOMMENDED

**Bước 1: Mở Canva**
1. Go to: https://www.canva.com
2. Sign up (free)
3. Click "Create a design" → "Custom size"
4. Enter: **1024 x 500 pixels**

**Bước 2: Design**
1. **Background**: 
   - Color: Red gradient (#E53935 to #C62828)
   - Or use subtle pattern

2. **Add Logo**:
   - Upload: `acfmart-android.png`
   - Place on left side
   - Size: ~200x200px

3. **Add Tagline** (text):
   - Font: Bold, sans-serif
   - Text: "MUA SẮM AN TOÀN"
   - Subtitle: "Chống hàng giả với QR verification"
   - Color: White
   - Position: Top right

4. **Add Phone Mockups**:
   - Search elements: "phone mockup"
   - Add 3 phones in a row
   - Take screenshots from your app:
     - Phone 1: Home screen
     - Phone 2: Product detail with QR
     - Phone 3: Cart or checkout

5. **Add Feature Badges** (bottom):
   - ✓ Chính Hãng
   - ✓ QR Verification  
   - ✓ Thanh Toán COD
   - Color: White or gold

6. **Add CTA Badge** (optional):
   - Text: "Download Free"
   - Style: Green button or badge
   - Position: Bottom center

**Bước 3: Export**
1. Click "Share" → "Download"
2. Format: PNG
3. Quality: High
4. Download!

---

### Option 2: Dùng Photopea (FREE Online Photoshop)

**URL**: https://www.photopea.com

**Steps**:
1. Open Photopea
2. File → New → 1024 x 500 px
3. Add background (red gradient)
4. File → Open → Load `acfmart-android.png`
5. Position logo
6. Add text with Text tool
7. Add phone screenshots
8. File → Export as → PNG

---

### Option 3: Thuê Designer ($10-30)

**Fiverr**:
1. Go to: https://www.fiverr.com
2. Search: "Google Play Store Feature Graphic"
3. Choose designer ($10-30)
4. Send them:
   - Logo: `acfmart-android.png`
   - Tagline: "Mua Sắm An Toàn - Chống Hàng Giả"
   - 3 app screenshots
   - Colors: Red + Gold
5. Receive in 1-2 days

---

## 📱 Cách Chụp Screenshots Cho Feature Graphic

### Method 1: Android Studio Emulator (Nhanh nhất)

1. **Run app trên emulator**:
   ```powershell
   # Open Android Studio
   # Run app (green play button)
   ```

2. **Navigate to screen bạn muốn**:
   - Home screen
   - Product detail
   - Cart/Checkout

3. **Capture screenshot**:
   - Click camera icon in emulator toolbar
   - OR: `adb exec-out screencap -p > screenshot.png`

4. **Save screenshots**:
   - `screenshot-home.png`
   - `screenshot-product.png`
   - `screenshot-cart.png`

### Method 2: Physical Phone

1. **Install debug APK**:
   ```powershell
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Navigate to screen**

3. **Take screenshot**:
   - Most phones: Power + Volume Down
   - Samsung: Palm swipe
   - iPhone: Power + Home/Volume Up

4. **Transfer to computer**:
   - Google Drive
   - USB cable
   - Email

### Method 3: ADB Command

```powershell
# Capture current screen
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshot-home.png

# Or use scrcpy (mirror phone to PC)
scrcpy  # Then use screenshot button
```

---

## 🎨 Design Tips

### Do ✅
- Use your logo prominently
- Keep it clean, not cluttered
- Show actual app screens
- Use brand colors (red + gold)
- Add 2-3 key features
- Make text readable
- Test on different screens

### Don't ❌
- Don't use low-res images
- Don't add too much text
- Don't use competitor logos
- Don't add pricing
- Don't use time-sensitive info
- Don't include personal data

---

##  Template Elements Checklist

- [ ] **Logo**: ACF Mart logo (left side)
- [ ] **Tagline**: "Mua Sắm An Toàn - Chống Hàng Giả"
- [ ] **3 Phone mockups**: Showing key screens
- [ ] **Feature badges**: 3-4 key benefits
- [ ] **Background**: Red gradient or pattern
- [ ] **CTA**: "Download Free" badge (optional)
- [ ] **Export**: 1024x500 PNG, <1MB

---

## 💡 Content Suggestions

### Taglines (Pick one):
1. "Mua Sắm An Toàn - Chống Hàng Giả"
2. "Xác Thực Chính Hãng Bằng QR Code"
3. "Sàn TMĐT Chống Hàng Giả #1"
4. "Shopping Safe with QR Verification"

### Feature Badges (Pick 3-4):
- ✓ Chính Hãng 100%
- ✓ QR Verification
- ✓ Thanh Toán COD
- ✓ Giao Hàng Nhanh
- ✓ Miễn Phí Vận Chuyển
- ✓ Hỗ Trợ 24/7
- ✓ Hoàn Tiền 100%

---

##  Quick Start with Canva (5 minutes)

1. **Open**: https://canva.com/design/DAF123456789/edit
2. **Custom size**: 1024 x 500
3. **Background**: Red (#E53935)
4. **Upload logo**: `acfmart-android.png`
5. **Add text**: "MUA SẮM AN TOÀN"
6. **Add 3 phone frames** with screenshots
7. **Add badges**: "✓ Chính Hãng  ✓ QR  ✓ COD"
8. **Download**: PNG

Done! 🎉

---

## 📋 After Creating

### Upload to Play Console:
1. Go to: https://play.google.com/console
2. Select your app
3. **Store presence** → **Main store listing**
4. **Feature graphic** section
5. Upload your 1024x500 PNG
6. Save draft

### File naming:
```
acfmart-feature-graphic-1024x500.png
```

---

## 🆘 Need Help?

**Can't design it yourself?**
- **Fiverr**: Search "Play Store Feature Graphic" ($10-30)
- **Upwork**: Post job ($20-50)
- **Local designer**: Ask for quote

**Tools comparison:**
| Tool | Difficulty | Cost | Time |
|------|-----------|------|------|
| Canva | ⭐ Easy | Free | 15 min |
| Photopea | ⭐⭐ Medium | Free | 30 min |
| Fiverr |  Easy | $10-30 | 1-2 days |
| Photoshop | ⭐⭐⭐ Hard | $20/mo | 30 min |

---

## ✅ Checklist

Before uploading:
- [ ] Size: Exactly 1024x500 pixels
- [ ] Format: PNG or JPEG
- [ ] File size: Under 1 MB
- [ ] No transparency
- [ ] Logo visible and clear
- [ ] Text readable
- [ ] Shows app features
- [ ] Brand colors used
- [ ] Professional quality

---

**Ready to create? Start with Canva - it's the easiest!** 🎨
