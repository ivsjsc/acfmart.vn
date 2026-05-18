# Cloudflare Stream Live — Setup checklist

Tài liệu này cấu hình Cloudflare Stream Live cho luồng livestream của ACFMart. Code đã sẵn sàng (`functions/src/livestream.ts`); chỉ cần điền secrets là chạy được.

Toàn bộ secrets gọi qua `firebase functions:secrets:set <NAME>` trong `functions/` directory. Sau khi set xong, deploy lại functions (`npm run deploy`).

## 1. Tạo Cloudflare account và bật Stream

1. Đăng ký tại https://dash.cloudflare.com/sign-up bằng email anh dùng cho ACFMart.
2. Verify email.
3. Cloudflare bắt buộc add payment method khi enable Stream. Vào **My Profile → Billing → Payment Methods**, thêm thẻ Visa/Master. Stream **không có free tier**, nhưng billing chỉ phát sinh khi có viewer phát thật (1$ / 1000 phút delivery, 5$ / 1000 phút storage).
4. Vào **Stream** (sidebar trái). Bấm **Enable Stream**, chọn plan **Pay-as-you-go** (rẻ nhất cho V1).

## 2. Lấy `CLOUDFLARE_ACCOUNT_ID`

Trên dashboard, sidebar phải hiển thị **Account ID** (chuỗi hex 32 ký tự). Copy.

```bash
cd functions
firebase functions:secrets:set CLOUDFLARE_ACCOUNT_ID
# Paste Account ID khi prompt
```

## 3. Tạo API token (`CLOUDFLARE_API_TOKEN`)

1. **My Profile → API Tokens → Create Token**.
2. Chọn template **Custom token**.
3. Token name: `acfmart-stream-live`.
4. Permissions:
   - `Account` → `Stream` → `Edit`
5. Account Resources: chọn account của anh.
6. TTL: để mặc định (không hết hạn). Nếu muốn an toàn hơn, đặt 1 năm.
7. Bấm **Continue to summary → Create Token**, copy token.

```bash
firebase functions:secrets:set CLOUDFLARE_API_TOKEN
# Paste token
```

## 4. Đăng ký webhook + lấy `CLOUDFLARE_STREAM_WEBHOOK_SECRET`

Cloudflare gửi event `live_input.connected` / `disconnected` / `errored` về URL của ta. URL chính là Cloud Function `streamWebhook` đã deploy.

URL endpoint (sau khi deploy lần đầu):

```
https://asia-southeast1-ecommerce-acf.cloudfunctions.net/streamWebhook
```

Subscribe qua API (Cloudflare Stream chưa có UI cho webhook):

```bash
curl -X PUT \
  -H "Authorization: Bearer <CLOUDFLARE_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"notification_url":"https://asia-southeast1-ecommerce-acf.cloudfunctions.net/streamWebhook"}' \
  "https://api.cloudflare.com/client/v4/accounts/<CLOUDFLARE_ACCOUNT_ID>/stream/webhook"
```

Response trả về field `result.secret` — đây là signing secret để verify HMAC.

```bash
firebase functions:secrets:set CLOUDFLARE_STREAM_WEBHOOK_SECRET
# Paste result.secret
```

## 5. Tạo signing keypair cho HLS playback token

ACFMart sign manifest URL bằng RS256 JWT để chống xem chùa. Một keypair dùng cho cả prod.

```bash
curl -X POST \
  -H "Authorization: Bearer <CLOUDFLARE_API_TOKEN>" \
  "https://api.cloudflare.com/client/v4/accounts/<CLOUDFLARE_ACCOUNT_ID>/stream/keys"
```

Response trả `result.id` (key ID, thường gọi `kid`) và `result.pem` (PEM-encoded RSA private key, multi-line). Copy cả hai:

```bash
firebase functions:secrets:set CLOUDFLARE_STREAM_SIGNING_KEY_ID
# Paste result.id

firebase functions:secrets:set CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY
# Paste TOÀN BỘ chuỗi result.pem, GIỮ NGUYÊN dấu xuống dòng:
#   -----BEGIN RSA PRIVATE KEY-----
#   MIIE...
#   -----END RSA PRIVATE KEY-----
```

**Lưu ý:** `firebase functions:secrets:set` chấp nhận multi-line khi paste qua stdin. Nếu copy/paste qua terminal bị mất `\n`, đặt vào file tạm rồi pipe:

```bash
echo "-----BEGIN RSA PRIVATE KEY-----
MIIE...
-----END RSA PRIVATE KEY-----" | firebase functions:secrets:set CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY --data-file=-
```

## 6. Lấy `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`

Vào **Stream → Videos**, copy bất kỳ video nào để xem URL HLS. Nó có dạng:

```
https://customer-abc123def.cloudflarestream.com/<uid>/manifest/video.m3u8
                ▲ phần "customer-abc123def.cloudflarestream.com" là subdomain
```

```bash
firebase functions:secrets:set CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
# Paste: customer-abc123def.cloudflarestream.com  (KHÔNG kèm https://)
```

## 7. Deploy & test

```bash
cd functions
npm run build
firebase deploy --only functions
```

Test end-to-end:

1. Login seller account trên frontend.
2. Vào **/seller/live → Tạo phiên mới**, điền tiêu đề + lịch phát, submit.
3. Sau redirect tới **/seller/live/{id}**, anh sẽ thấy **Server URL** + **Stream Key**.
4. Mở OBS → Settings → Stream → Custom service → dán Server URL + Stream Key.
5. Bấm **Start Streaming**. Khoảng ~10s sau, Cloudflare gửi webhook `live_input.connected` → trạng thái phiên chuyển thành **Đang phát**.
6. Buyer mở **/live/{id}** → `signPlaybackToken` callable trả manifest URL có chữ ký → `<video>` play.

## 8. Rollback / chi phí

- Để **tạm dừng** delivery (tránh phát sinh phí khi không dùng): xoá webhook secret trên Cloudflare, các stream sẽ vẫn play được nhưng webhook không update status.
- Để **xoá** live input đã dùng: gọi `DELETE /stream/live_inputs/{uid}` với API token.
- Để **monitor** chi phí: **Dashboard → Stream → Analytics**, xem delivered minutes + storage minutes.

## 9. Tóm tắt secrets cần đặt

| Secret | Nguồn |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard sidebar phải |
| `CLOUDFLARE_API_TOKEN` | My Profile → API Tokens → Custom (Stream:Edit) |
| `CLOUDFLARE_STREAM_WEBHOOK_SECRET` | Response từ PUT `/stream/webhook` |
| `CLOUDFLARE_STREAM_SIGNING_KEY_ID` | Response từ POST `/stream/keys`, field `id` |
| `CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY` | Response từ POST `/stream/keys`, field `pem` |
| `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` | URL của bất kỳ video Stream nào |

Sau bước 7, V1 livestream chạy được. V2/V3 (HLS.js, TikTok Content Posting OAuth, replay/VOD tab, pinned products UI) là backlog.
