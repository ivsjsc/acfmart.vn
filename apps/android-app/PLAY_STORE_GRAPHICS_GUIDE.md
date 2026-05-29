# Play Store Graphics Guide

## 📐 Required Graphics Specifications

### 1. App Icon (BẮT BUỘC)
- **Size**: 512 x 512 pixels
- **Format**: PNG (32-bit)
- **Shape**: Full square (Google will round corners)
- **Max file size**: 1 MB
- **No transparency**

**Design Tips:**
- Use ACF Mart brand colors (Red & Gold)
- Simple, recognizable at small sizes
- No text (or minimal text)
- Avoid fine details

**Template:**
```
┌─────────────────────────────────┐
│                                 │
│        [ACF Logo]               │
│      Red Background             │
│      Gold Icon/Text             │
│                                 │
│    512 x 512 pixels             │
│                                 │
└─────────────────────────────────┘
```

---

### 2. Feature Graphic (BẮT BUỘC)
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG (no alpha)
- **Max file size**: 1 MB

**Purpose**: Shown at top of app listing

**Design Ideas:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  ACF Mart Logo    🛒 Buy Safe with QR Verification │
│                     Chống Hàng Giả - Mua Sắm An Toàn│
│                                                    │
│  [Phone Mockup]    [Phone Mockup]  [Phone Mockup]  │
│  Home Screen       Product Detail   Cart/Checkout   │
│                                                    │
│              Download Now - Free!                   │
└────────────────────────────────────────────────────┘
     1024 x 500 pixels
```

**Content Ideas:**
- App name + tagline
- 2-3 phone mockups showing key screens
- Key benefit: "QR Anti-Counterfeit"
- CTA: "Download Free"

---

### 3. Phone Screenshots (BẮT BUỘC - tối thiểu 2)
- **Size**: Minimum 320px, maximum 3840px (any dimension)
- **Format**: PNG or JPEG
- **Max screenshots**: 8
- **Recommended**: 4-6 screenshots

**Recommended Aspect Ratios:**
- 16:9 (landscape) - Most common
- 9:16 (portrait) - Modern phones

**Must-Have Screenshots:**

#### Screenshot 1: Home Screen
```
┌──────────────┐
│ ACF Mart     │
│              │
│ [Search Bar] │
│              │
│ Categories   │
│ 👕📱🏠💄     │
│              │
│ Featured     │
│ Products     │
│ [Product]    │
│ [Product]    │
│              │
│ Flash Sale   │
│ [Banner]     │
└──────────────┘
```
**Caption**: "Trang chủ - Khám phá sản phẩm"

#### Screenshot 2: Product Detail + QR
```
┌──────────────┐
│ Product      │
│ [Image]      │
│              │
│ Tên SP       │
│ ₫199,000     │
│              │
│ ✅ Chính hãng│
│ [QR Icon]    │
│ Quét kiểm tra│
│              │
│ [Add to Cart]│
└──────────────┘
```
**Caption**: "Xác thực QR - Kiểm tra chính hãng"

#### Screenshot 3: Shopping Cart
```
┌──────────────┐
│ Giỏ hàng (3) │
│              │
│ ☑ Product 1  │
│   ₫199,000   │
│   [- 2 +]    │
│              │
│ ☑ Product 2  │
│   ₫99,000    │
│   [- 1 +]    │
│              │
│ Total:       │
│ ₫497,000     │
│ [Checkout]   │
└──────────────┘
```
**Caption**: "Giỏ hàng thông minh"

#### Screenshot 4: Checkout
```
┌──────────────┐
│ Thanh toán   │
│              │
│ Địa chỉ giao │
│ [Form]       │
│              │
│ Payment:     │
│ ● COD        │
│ ○ Bank       │
│              │
│ Total:       │
│ ₫527,000     │
│ [Place Order]│
└──────────────┘
```
**Caption**: "Thanh toán nhanh chóng"

#### Screenshot 5: Order Tracking
```
┌──────────────┐
│ Đơn hàng     │
│              │
│ #ACF240315   │
│ ₫527,000     │
│              │
│ ✓ Đặt hàng   │
│ ✓ Xác nhận   │
│ 🚚 Đang giao │
│ ○ Đã giao    │
│              │
│ [Track Map]  │
└──────────────┘
```
**Caption**: "Theo dõi đơn hàng realtime"

#### Screenshot 6: Profile/Settings
```
┌──────────────┐
│ Tài khoản    │
│              │
│ [Avatar]     │
│ Nguyen Van A │
│              │
│ 📦 Đơn hàng  │
│ ❤️ Wishlist  │
│ ⚙️ Cài đặt   │
│ 🔔 Thông báo │
│              │
│ [Logout]     │
└──────────────┘
```
**Caption**: "Quản lý tài khoản"

---

## 🎨 Design Tools (Free)

### Online Tools
1. **Canva** (https://canva.com)
   - Templates for Play Store graphics
   - Easy drag-and-drop
   - Free version available

2. **Figma** (https://figma.com)
   - Professional design tool
   - Free for individuals
   - Great for mockups

3. **Photopea** (https://photopea.com)
   - Free online Photoshop alternative
   - Advanced editing

### Desktop Tools
1. **GIMP** (https://gimp.org) - Free Photoshop alternative
2. **Inkscape** (https://inkscape.org) - Free vector editor
3. **Android Studio** - Has built-in Asset Studio

---

## 📱 How to Capture Screenshots

### Method 1: Android Studio Emulator
1. Run app in emulator
2. Navigate to screen you want
3. Click camera icon in emulator toolbar
4. Screenshot saved to computer

### Method 2: ADB Command
```powershell
# Capture screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshot_home.png

# Or use scrcpy (recommended)
scrcpy  # Mirror phone to computer, then use screenshot button
```

### Method 3: Phone Built-in
- Most phones: Power + Volume Down
- Samsung: Palm swipe
- Edit/crop to correct aspect ratio

---

## 🖼️ Screenshot Enhancement

### Add Device Frame
Make screenshots look professional with device frames:

**Tools:**
- **MockUPhone** (http://mockuphone.com) - Free
- **Shots** (https://shots.so) - Free online
- **Canva** - Has phone frame templates

### Add Text Overlays
Include short captions:
```
┌──────────────┐
│ [Screenshot] │
│              │
│ "QR Scan to  │
│  Verify"     │
└──────────────┘
```

### Brand Colors
Use ACF Mart brand colors:
- **Primary Red**: #E53935 or #D32F2F
- **Accent Gold**: #FFD700 or #FFC107
- **Background**: White or light gray

---

## ✅ Checklist Before Upload

### App Icon
- [ ] 512x512 pixels
- [ ] PNG format
- [ ] No transparency
- [ ] Under 1 MB
- [ ] Represents ACF Mart brand

### Feature Graphic
- [ ] 1024x500 pixels
- [ ] PNG or JPEG
- [ ] Under 1 MB
- [ ] No alpha channel
- [ ] Eye-catching design

### Screenshots
- [ ] Minimum 2 screenshots
- [ ] Maximum 8 screenshots
- [ ] At least 320px dimension
- [ ] Maximum 3840px dimension
- [ ] PNG or JPEG format
- [ ] Show key features
- [ ] Clear, not blurry
- [ ] No personal data visible

---

## 🎯 Pro Tips

### Do ✅
- Use high-quality images
- Show actual app screens
- Highlight unique features (QR verification)
- Use consistent branding
- Add short captions
- Test on multiple screen sizes

### Don't ❌
- Use blurry screenshots
- Include personal/sensitive data
- Misleading claims
- Competitor mentions
- Pricing in screenshots
- Time-sensitive info

---

## 📊 Example Layout (All 6 Screenshots)

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Home   │ │ Product│ │ Cart   │ │Checkout│ │ Orders │ │Profile │
│ Screen │ │ Detail │ │ Items  │ │ Screen │ │ Track  │ │ Screen │
│        │ │ + QR   │ │        │ │        │ │        │ │        │
│        │ │        │ │        │ │        │ │        │ │        │
│        │ │        │ │        │ │        │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
   1          2          3          4          5          6
```

**Captions (Vietnamese):**
1. "Khám phá sản phẩm"
2. "Xác thực QR chính hãng"
3. "Giỏ hàng thông minh"
4. "Thanh toán nhanh"
5. "Theo dõi realtime"
6. "Quản lý tài khoản"

---

## 🆘 Need Help Creating Graphics?

### Option 1: Use Canva Template
1. Go to https://canva.com
2. Search "Google Play Store Listing"
3. Choose template
4. Customize with ACF Mart branding
5. Download as PNG

### Option 2: Hire Designer
- **Fiverr**: $20-50 for Play Store graphics
- **Upwork**: $30-100
- **Local designer**: Contact for quote

### Option 3: DIY with Templates
- Download free templates from links below
- Edit in GIMP/Photopea
- Export with correct specs

---

## 📦 File Organization

Create folder structure:
```
play-store-graphics/
├── icon/
│   └── app-icon-512x512.png
├── feature/
│   └── feature-graphic-1024x500.png
├── screenshots/
│   ├── phone/
│   │   ├── 01-home-screen.png
│   │   ├── 02-product-detail.png
│   │   ├── 03-cart.png
│   │   ├── 04-checkout.png
│   │   ├── 05-order-tracking.png
│   │   └── 06-profile.png
│   └── tablet/ (optional)
│       └── ...
└── source/ (keep editable files)
    ├── icon.psd
    ├── feature.psd
    └── screenshots.psd
```

---

Ready to create? Let's go! 🎨
