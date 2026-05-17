# ACFMart Payment Service - Deployment Guide

Tài liệu này dành cho lần deploy đầu tiên hoặc deploy lại từ đầu trên một cluster mới. Cho ops thường ngày (incident, troubleshooting) xem [RUNBOOK.md](RUNBOOK.md).

## 1. Prerequisites

- Kubernetes cluster (v1.24+) có truy cập `kubectl`
- Container registry có quyền push (ví dụ Google Artifact Registry, Docker Hub, ECR)
- DNS quản lý được `payment.acfmart.vn` để trỏ về ingress
- `cert-manager` đã cài trong cluster (vì manifest dùng `cluster-issuer: letsencrypt-prod`)
- `nginx-ingress-controller` đã cài (manifest dùng annotation `nginx.ingress.kubernetes.io/*`)
- Một PostgreSQL 14+ và Redis 6+ instance — có thể là cloud managed (Cloud SQL, ElastiCache) hoặc cài trong cluster

## 2. Tạo các Secret cần thiết

Manifest [`k8s-deployment.yaml`](k8s-deployment.yaml) tham chiếu **4 secret**. Phải tạo trước khi `kubectl apply`, nếu không pod sẽ kẹt ở `CreateContainerConfigError`.

### `payment-db-secret` — PostgreSQL credentials
```bash
kubectl create secret generic payment-db-secret \
  --from-literal=db-host="<host>" \
  --from-literal=db-port="5432" \
  --from-literal=db-name="acfmart_payments" \
  --from-literal=db-user="<user>" \
  --from-literal=db-password="<strong-password>"
```

### `payment-redis-secret` — Redis URL
```bash
kubectl create secret generic payment-redis-secret \
  --from-literal=redis-url="redis://:<password>@<host>:6379/0"
```

### `psp-secrets` — VNPay + MoMo credentials (production)
```bash
kubectl create secret generic psp-secrets \
  --from-literal=vnpay-api-url="https://pay.vnpay.vn/vpcpay.html" \
  --from-literal=vnpay-tmncode="<TMNCODE>" \
  --from-literal=vnpay-hashsecret="<HASH_SECRET>" \
  --from-literal=momo-api-url="https://payment.momo.vn/v2/gateway/api/create" \
  --from-literal=momo-partner-code="<PARTNER_CODE>" \
  --from-literal=momo-access-key="<ACCESS_KEY>" \
  --from-literal=momo-secret-key="<SECRET_KEY>"
```

### `app-secrets` — JWT + webhook
```bash
# JWT_SECRET: 32+ ký tự ngẫu nhiên
# WEBHOOK_SECRET: dùng để verify HMAC webhook PSP gửi vào
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="$(openssl rand -hex 32)" \
  --from-literal=webhook-secret="$(openssl rand -hex 32)"
```

Lưu các giá trị JWT/WEBHOOK vào secret manager nội bộ (1Password, Vault) — không có cách recover nếu mất.

### Verify
```bash
kubectl get secrets | grep -E 'payment-db|payment-redis|psp-secrets|app-secrets'
```

## 3. Build & Push Docker Image

```bash
# Trong thư mục acfmart-payment-service/
docker build -t <registry>/acfmart/payment-service:$(git rev-parse --short HEAD) .
docker tag <registry>/acfmart/payment-service:$(git rev-parse --short HEAD) <registry>/acfmart/payment-service:latest
docker push <registry>/acfmart/payment-service:$(git rev-parse --short HEAD)
docker push <registry>/acfmart/payment-service:latest
```

Sau đó sửa `image:` trong [k8s-deployment.yaml](k8s-deployment.yaml) cho đúng registry (mặc định `acfmart/payment-service:latest` chỉ là placeholder).

## 4. Apply Manifest

```bash
kubectl apply -f k8s-deployment.yaml
kubectl apply -f prometheus-alerts.yaml   # nếu cluster có Prometheus Operator
```

## 5. Verify Health

```bash
# Pods Running, READY 2/2
kubectl get pods -l app=acfmart-payment-service

# Logs không có error startup
kubectl logs -l app=acfmart-payment-service --tail=50

# Health endpoint trong cluster
kubectl port-forward svc/acfmart-payment-service 3001:80
curl http://localhost:3001/healthz   # → 200 OK

# Health endpoint qua ingress (sau khi DNS đã trỏ)
curl https://payment.acfmart.vn/healthz
```

## 6. DNS + TLS

Trỏ A/CNAME `payment.acfmart.vn` → IP của ingress controller. cert-manager sẽ tự cấp chứng chỉ Let's Encrypt qua HTTP-01 challenge khi pod ready.

Kiểm tra:
```bash
kubectl describe certificate acfmart-payment-tls
kubectl get certificaterequest
```

## 7. Database Migration

Lần đầu deploy hoặc khi schema thay đổi, chạy migration:
```bash
# Connect tạm vào DB qua port-forward hoặc bastion
psql "$DATABASE_URL" -f src/database/migrations/<file>.sql
```
(Service dùng raw SQL migration, không có ORM CLI built-in — xem `src/database/migrations/`.)

## 8. Rollback

```bash
# Rollback về revision trước
kubectl rollout undo deployment/acfmart-payment-service

# Hoặc pin về tag cụ thể
kubectl set image deployment/acfmart-payment-service \
  payment-service=<registry>/acfmart/payment-service:<old-tag>
kubectl rollout status deployment/acfmart-payment-service
```

## 9. Tích hợp với app chính (acfmart Firebase project)

Frontend `acfmart.vn` gọi payment service qua `postBackend()` trong [src/lib/api-base.ts](../src/lib/api-base.ts). Cấu hình env trong Vite app (`src/.env`):
```
VITE_BACKEND_URL=https://payment.acfmart.vn
VITE_BACKEND_API_KEY=<INTERNAL_API_KEY khớp với app-secrets>
```

Nếu không cấu hình, app fallback offline (xem `BackendUnavailableError`) — phù hợp cho dev nhưng production phải set.

## 10. Checklist trước khi đi prod

- [ ] Tất cả 4 secret đã tạo và verify bằng `kubectl get secret`
- [ ] PostgreSQL đã chạy migration, có thể connect từ pod
- [ ] Redis ping OK
- [ ] DNS `payment.acfmart.vn` đã trỏ, TLS đã cấp
- [ ] `/healthz` trả 200 qua ingress
- [ ] PSP credentials là **production** (không phải sandbox)
- [ ] Webhook URL ở dashboard VNPay/MoMo đã cập nhật về `https://payment.acfmart.vn/api/v1/webhooks/{vnpay,momo}`
- [ ] Frontend Vite app có `VITE_BACKEND_URL` đúng
- [ ] Acceptance checklist trong [acceptance-checklist.md](acceptance-checklist.md) đã hoàn thành
