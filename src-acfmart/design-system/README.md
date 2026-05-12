# Hệ thống thiết kế ACF Marketplace

Hệ thống thiết kế cho sàn thương mại điện tử ACF - Sàn TMĐT chống hàng giả của Quỹ Chống Hàng Giả Việt Nam.

## Nguyên tắc thiết kế

1. **Trust is the product** - Mỗi pixel phải củng cố niềm tin "hàng này là thật"
2. **Mobile-first absolute** - 85% người dùng Việt mua trên mobile
3. **Speed is a feature** - LCP <2.5s, INP <200ms, CLS <0.1
4. **Accessibility là quyền** - WCAG 2.1 AA tối thiểu
5. **Vietnamese-first** - Giao diện thân thiện với người dùng Việt

## Cấu trúc hệ thống

### 1. Color System (HSL-based)

- `brand/red-500`: #dc2626 - đỏ cờ Việt Nam, giữ identity ACF
- `brand/gold-500`: #f59e0b - huy hiệu chính hãng
- Các gam màu hỗ trợ: success, warning, danger, info
- Neutral 50-950 cho text/border/surface
- Hỗ trợ cả light và dark mode

### 2. Typography Scale

- Dùng Inter cho UI và Be Vietnam Pro cho heading tiếng Việt
- Các cấp độ: display, h1-h4, body (lg/md/sm), caption

### 3. Spacing Scale

- Dựa trên 4px base: 0, 0.5, 1, 1.5, 2, ..., 24 (multiply by 4)
- Đảm bảo tính nhất quán trong khoảng cách

### 4. Radius & Elevation

- Radius: 0, 4, 6, 8, 12, 16, full
- Elevation: 5 levels từ flat đến modal

### 5. Motion Tokens

- Duration: 100ms đến 500ms
- Easing: standard, decelerate, accelerate, spring

## Cách sử dụng

```typescript
import { colors, semanticColors, spacing, typography, radius } from './tokens';

// Ví dụ sử dụng trong component
const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.base,
    padding: spacing[4],
    borderRadius: radius.md,
  },
  title: {
    color: semanticColors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: 600,
  },
});
```

## Responsive Grid

- Mobile: 4-col fluid, gutter 16px, container padding 16px
- Tablet 768+: 8-col, gutter 20px
- Desktop 1280+: 12-col, gutter 24px, max-width 1440px
- Respect safe areas cho iOS notch

## Accessibility

- Minimum touch target: 44px
- Minimum color contrast: 4.5:1 cho text trên nền
- Hỗ trợ screen readers với ARIA roles
- Hỗ trợ phím tắt và điều hướng bàn phím