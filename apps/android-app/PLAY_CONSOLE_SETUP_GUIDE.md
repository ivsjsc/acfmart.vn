# Google Play Console Setup Guide

## 📋 Overview
This guide walks you through creating a Google Play Developer account and publishing ACF Mart.

**Time required**: 2-3 hours (including review wait time: 1-7 days)
**Cost**: $25 USD (one-time registration fee)

---

## Part 1: Create Google Play Developer Account

### Step 1: Sign Up
1. Go to: **https://play.google.com/console**
2. Click **"Get Started"**
3. Sign in with your Google Account
   - Recommend: Create a dedicated Google Account for ACF Mart
   - Email: acfmart.dev@gmail.com (example)

### Step 2: Accept Developer Agreement
- Read the agreement
- Check "I agree"
- Click **"Accept"**

### Step 3: Pay Registration Fee
- **Fee**: $25 USD (one-time, not annual)
- **Payment methods**:
  - Credit/Debit card (Visa, Mastercard)
  - Google Pay
- Enter payment information
- Complete payment

### Step 4: Verify Identity
**Required documents:**
- Government-issued ID (Passport or National ID)
- Business registration (if registering as company)

**Upload documents:**
1. Click **"Verify your identity"**
2. Choose account type:
   - **Individual** (cá nhân) - Faster, simpler
   - **Organization** (tổ chức) - Need business docs
3. Fill personal information:
   - Full name (as on ID)
   - Date of birth
   - Address
4. Upload ID photo (front & back)
5. Submit for verification

**Verification time**: 1-3 business days

### Step 5: Set Up Developer Profile
**Required information:**

**Developer Name** (tên hiển thị trên CH Play):
```
ACF Mart Co., Ltd.
```
or
```
ACF Mart
```

**Contact Email** (public):
```
support@acfmart.vn
```

**Website**:
```
https://acfmart.vn
```

**Physical Address** (required by Google):
```
ACF Mart Co., Ltd.
123 Đường ABC, Phường XYZ
Quận 1, TP. Hồ Chí Minh
Việt Nam
```

**Phone Number** (optional but recommended):
```
+84 xxx xxx xxx
```

---

## Part 2: Create Your App

### Step 1: Click "Create App"
- Go to Play Console dashboard
- Click green **"Create app"** button

### Step 2: Fill App Details

**App name** (tên app, 50 ký tự):
```
ACF Mart - Chống Hàng Giả
```

**Default language** (ngôn ngữ mặc định):
```
Vietnamese (Vietnam) - vi-VN
```

**App or game**:
```
✓ App
○ Game
```

**Free or paid**:
```
✓ Free
○ Paid
```

### Step 3: Accept Declarations
- Check required boxes
- Confirm app complies with policies
- Click **"Create app"**

---

## Part 3: Set Up Store Listing

### Step 1: Go to Store Listing
- Left menu: **Grow** → **Store presence** → **Main store listing**

### Step 2: Fill App Details

**App name** (50 characters):
```
ACF Mart - Chống Hàng Giả
```

**Short description** (80 characters):
```
Sàn TMĐT chống hàng giả với xác thực QR code, mua sắm an toàn
```

**Full description**:
Copy from: [PLAY_STORE_DESCRIPTIONS.md](PLAY_STORE_DESCRIPTIONS.md)

**Developer contact**:
- **Email**: support@acfmart.vn
- **Website**: https://acfmart.vn
- **Phone**: +84 xxx xxx xxx

### Step 3: Upload Graphics

**App icon**:
- Upload 512x512 PNG
- See: [PLAY_STORE_GRAPHICS_GUIDE.md](PLAY_STORE_GRAPHICS_GUIDE.md)

**Feature graphic**:
- Upload 1024x500 PNG/JPEG

**Phone screenshots**:
- Upload 2-8 screenshots
- Minimum: 2 required
- Recommended: 6 screenshots

### Step 4: Category & Tags

**Category**:
```
Primary: Shopping
Secondary: Lifestyle (optional)
```

**Tags** (optional):
```
mua sắm, shopping, thương mại điện tử, QR code, chống hàng giả
```

**Content rating**:
```
Target audience: Everyone
Content rating questionnaire: Complete all questions
```

---

## Part 4: Privacy Policy

### Required Information
Google REQUIRES a privacy policy URL.

### Options:

**Option 1: Host on your website** (Recommended)
```
https://acfmart.vn/privacy-policy
```

**Option 2: Use free privacy policy generator**
- https://www.privacypolicygenerator.info
- Fill app details
- Generate and host on Google Docs or GitHub

**Option 3: Google Play's built-in**
- Not recommended for production apps

### What Privacy Policy Must Include:
1. What data you collect
2. How you use the data
3. Who you share it with
4. User rights
5. Contact information

**For ACF Mart, you collect:**
- User account info (email, name, phone)
- Purchase history
- Device information
- Location (for delivery)
- Usage analytics (Firebase)

---

## Part 5: Upload Your App

### Step 1: Build AAB File
```powershell
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat bundleRelease
```

**Output**: `app\build\outputs\bundle\release\app-release.aab`

### Step 2: Go to Production
- Left menu: **Release** → **Production**
- Click **"Create new release"**

### Step 3: Upload AAB
1. Drag & drop `app-release.aab` or click to browse
2. Wait for upload to complete
3. Review app bundle details

### Step 4: Fill Release Notes

**Release name** (internal):
```
Version 1.0.0 - Initial Release
```

**Release notes** (user-facing):
```
Chào mừng đến với ACF Mart!

Tính năng:
• Mua sắm sản phẩm chính hãng
• Xác thực QR code chống hàng giả
• Giỏ hàng & thanh toán thông minh
• Theo dõi đơn hàng realtime
• Quản lý tài khoản cá nhân
• Thông báo khuyến mãi

Cảm ơn bạn đã sử dụng ACF Mart!
```

### Step 5: Review Release
- Click **"Next"**
- Review all details
- Check for errors/warnings

### Step 6: Start Rollout
- Click **"Review release"**
- Fix any issues if found
- Click **"Start rollout to Production"**

---

## Part 6: App Review Process

### What Happens Next:
1. **Automated checks** (immediate)
   - Virus scan
   - Policy compliance
   - Technical validation

2. **Manual review** (1-7 days)
   - Google team reviews app
   - Checks content, functionality
   - Verifies policy compliance

3. **Approval or rejection**
   - Email notification
   - If rejected: fix issues and resubmit
   - If approved: app goes live!

### Common Rejection Reasons:
- ❌ Privacy policy missing or inadequate
- ❌ App crashes on testing
- ❌ Misleading metadata
- ❌ Inappropriate content
- ❌ Violating intellectual property
- ❌ Incomplete store listing

### How to Avoid Rejection:
- ✅ Test thoroughly on real device
- ✅ Complete privacy policy
- ✅ Accurate descriptions
- ✅ High-quality screenshots
- ✅ No placeholder content
- ✅ Working contact information

---

## Part 7: After Approval

### Your App is Live! 🎉
- Users can find it on Play Store
- Search: "ACF Mart"
- Direct link: `https://play.google.com/store/apps/details?id=vn.acfmart.mobile`

### Monitor Your App:
**Play Console Dashboard:**
- **Installs**: Track downloads
- **Ratings & reviews**: Respond to users
- **Crashes**: Monitor stability
- **ANRs**: App Not Responding reports
- **Revenue**: If paid app

### Respond to Reviews:
- Reply to user feedback
- Fix reported issues
- Build trust with users

---

## Part 8: Update Your App

### When to Update:
- Bug fixes
- New features
- Performance improvements
- Security patches

### How to Update:

1. **Increment version code** in `app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2  // Was 1, now 2
    versionName "1.0.1"
}
```

2. **Build new AAB**:
```powershell
.\gradlew.bat bundleRelease
```

3. **Upload to Play Console**:
- Production → Create new release
- Upload new AAB
- Write release notes
- Submit for review

4. **Review time**: Usually 1-3 days for updates

---

## 📊 Play Console Features

### Analytics
- **Install sources**: Where users come from
- **User acquisition**: Marketing effectiveness
- **Engagement**: Daily/monthly active users
- **Retention**: How many users return

### Quality
- **Crash reports**: Detailed stack traces
- **ANR reports**: Freezing issues
- **Vitals**: Performance metrics
- **Reviews**: User feedback

### Monetization (if applicable)
- **Revenue dashboard**
- **Subscription management**
- **In-app purchases**

### Testing Tracks
- **Internal testing** (100 testers)
- **Closed testing** (specific users)
- **Open testing** (anyone can join)
- **Production** (live app)

---

## 🆘 Troubleshooting

### Issue: Identity verification failed
**Solution:**
- Ensure ID photo is clear, not blurry
- Name matches exactly
- Use passport if possible (universally accepted)

### Issue: Payment declined
**Solution:**
- Use international credit card
- Enable online transactions
- Try different card
- Contact bank

### Issue: App rejected
**Solution:**
- Read rejection email carefully
- Fix all listed issues
- Resubmit
- Contact Google support if unclear

### Issue: Can't find app on Play Store
**Solution:**
- Check if rollout is 100%
- Search exact package name: `vn.acfmart.mobile`
- Wait 24-48 hours after approval
- Check country availability settings

---

## 📞 Support Resources

### Google Play Help
- **Help Center**: https://support.google.com/googleplay/android-developer
- **Developer Forum**: https://android-developers.googleblog.com/
- **Policy Help**: https://play.google.com/about/developer-content-policy/

### Contact Google Support
- Play Console → Help → Contact us
- Email support available
- Phone support for urgent issues

---

## ✅ Pre-Launch Checklist

### Before Submitting:
- [ ] Google Play Developer account created
- [ ] $25 fee paid
- [ ] Identity verified
- [ ] Developer profile complete
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Screenshots uploaded (min 2)
- [ ] Short description written (80 chars)
- [ ] Full description written
- [ ] Privacy policy URL ready
- [ ] Contact email set
- [ ] Website URL set
- [ ] Category selected
- [ ] Content rating completed
- [ ] AAB file built successfully
- [ ] App tested on real device
- [ ] No crashes or major bugs
- [ ] Release notes written
- [ ] Country targeting configured

### After Launch:
- [ ] Monitor reviews daily
- [ ] Respond to user feedback
- [ ] Track crash reports
- [ ] Plan next update
- [ ] Promote on social media
- [ ] Share with friends/family for reviews

---

## 🎉 Success!

Once approved, your app will be available at:
```
https://play.google.com/store/apps/details?id=vn.acfmart.mobile
```

**Share this link** to help users find your app!

Good luck with your launch! 🚀
