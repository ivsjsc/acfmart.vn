# Hướng dẫn thiết lập Aivy Chat với Groq + Gemini

## 1. Cập nhật Biến Môi Trường (.env)

Thêm các key sau vào file `.env` trong thư mục `/workspace/src`:

```bash
# --- Aivy chatbot (Google Gemini + Groq) ---
# Tạo key tại: https://aistudio.google.com/apikey
VITE_GOOGLE_AI_API_KEY=AIzaSy...
VITE_GEMINI_MODEL=gemini-pro

# Groq API: https://console.groq.com/keys
# Dùng cho chat tốc độ cao, chi phí thấp
VITE_GROQ_API_KEY=gsk_...
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

## 2. Cài đặt Thư viện

Đã thêm vào `package.json`:
- `@google/generative-ai`: ^0.21.0
- `groq-sdk`: ^0.7.0

Chạy lệnh cài đặt:
```bash
cd /workspace/src
npm install
```

## 3. Cấu trúc Aivy Core

### File đã tạo:
- `/workspace/src/features/aivy/aivy-core.ts` - Điều phối AI trung tâm
- `/workspace/src/features/aivy/groq-service.ts` - Service cho Groq API
- `/workspace/src/features/aivy/gemini-service.ts` - Service cho Gemini (đã có)

### Chiến lược phân bổ AI:

**Dùng Groq (llama-3.3-70b) cho:**
- ✅ Chatbot hỗ trợ khách hàng thời gian thực (độ trễ <200ms)
- ✅ Phân loại ý định người dùng (Intent Classification)
- ✅ Tóm tắt nhanh đánh giá sản phẩm
- **Lý do:** Tốc độ cực nhanh, chi phí rất thấp

**Dùng Gemini (gemini-1.5-flash/pro) cho:**
- ✅ Phân tích hình ảnh sản phẩm (phát hiện hàng giả qua ảnh chụp)
- ✅ Soạn thảo email phản hồi khiếu nại phức tạp
- ✅ Tra cứu ngữ cảnh dài (đọc toàn bộ chính sách hoàn trả)
- **Lý do:** Cửa sổ ngữ lý lớn (1M tokens), khả năng đa phương thức (Vision)

## 4. Cách sử dụng

### Tự động (Auto mode - mặc định):
```typescript
import { generateAivyResponse } from "@/features/aivy"

const reply = await generateAivyResponse(history, userMessage)
// Ưu tiên Groq, fallback sang Gemini nếu lỗi
```

### Chỉ định provider:
```typescript
// Chỉ dùng Groq
const reply = await generateAivyResponse(history, userMessage, { provider: "groq" })

// Chỉ dùng Gemini
const reply = await generateAivyResponse(history, userMessage, { provider: "gemini" })
```

### Kiểm tra providers khả dụng:
```typescript
import { checkAvailableProviders } from "@/features/aivy"

const available = checkAvailableProviders()
// { groq: true, gemini: true }
```

### Chọn provider tối ưu theo tác vụ:
```typescript
import { selectOptimalProvider, generateAivyResponse } from "@/features/aivy"

const provider = selectOptimalProvider("vision") // "gemini"
const reply = await generateAivyResponse(history, userMessage, { provider })
```

## 5. Test nhanh

Sau khi có API Key, test bằng cách:

1. Chạy dev server:
```bash
cd /workspace/src
npm run dev
```

2. Mở ứng dụng, click vào nút Aivy (floating button)
3. Gửi tin nhắn test: "Xin chào Aivy"
4. Kiểm tra console log để xem provider nào được dùng

## 6. Lưu ý quan trọng

⚠️ **Không commit file .env thật vào Git**
- Chỉ dùng `.env.example` làm mẫu
- Tạo `.env` riêng với API keys thật

⚠️ **API Keys cần giữ bí mật:**
- Không expose lên client code
- Dùng biến môi trường `VITE_` để Vite tự động inject

⚠️ **Fallback mechanism:**
- Nếu Groq lỗi, tự động chuyển sang Gemini
- Nếu cả 2 đều lỗi, hiển thị thông báo cho user

## 7. Files đã cập nhật

| File | Mô tả |
|------|-------|
| `src/.env.example` | Thêm biến Groq |
| `src/package.json` | Thêm dependencies |
| `src/features/aivy/aivy-core.ts` | Core điều phối AI (mới) |
| `src/features/aivy/groq-service.ts` | Groq service (mới) |
| `src/features/aivy/components/AivyChatPanel.tsx` | Update dùng aivy-core |
| `src/features/aivy/index.ts` | Export thêm functions mới |

