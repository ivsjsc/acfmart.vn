# ==========================================
# ACFMART TECHNOLOGY JSC - BUILD & DEPLOY
# ==========================================
# Hướng dẫn triển khai sản xuất cho sàn TMĐT ACFMart
# Tuân thủ: NĐ 13/2023 (Bảo vệ dữ liệu), NĐ 85/2021 (TMĐT)

# ==========================================
# GIAI ĐOẠN 1: CHUẨN BỊ MÔI TRƯỜNG
# ==========================================

# 1.1. Yêu cầu hệ thống tối thiểu
# - CPU: 4 cores trở lên
# - RAM: 8GB trở lên (khuyến nghị 16GB)
# - Storage: 50GB SSD trở lên
# - OS: Ubuntu 22.04 LTS / Debian 12 / Alpine Linux

# 1.2. Cài đặt Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# Cài đặt Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# ==========================================
# GIAI ĐOẠN 2: CẤU HÌNH BIẾN MÔI TRƯỜNG
# ==========================================

# 2.1. Tạo file .env từ mẫu
cp .env.example .env

# 2.2. Chỉnh sửa các biến quan trọng trong .env
# NEXTAUTH_SECRET: Tạo chuỗi ngẫu nhiên 32 ký tự
# DATABASE_URL: Kết nối PostgreSQL nội bộ
# REDIS_URL: Kết nối Redis nội bộ
# Các API keys: VNPay, GHN, Gemini AI, v.v.

# Tạo NEXTAUTH_SECRET an toàn
openssl rand -base64 32

# ==========================================
# GIAI ĐOẠN 3: BUILD & KHỞI CHẠY
# ==========================================

# 3.1. Build toàn bộ stack (lần đầu)
docker-compose build --no-cache

# 3.2. Khởi chạy tất cả services
docker-compose up -d

# 3.3. Kiểm tra trạng thái services
docker-compose ps

# 3.4. Xem logs thời gian thực
docker-compose logs -f web

# ==========================================
# GIAI ĐOẠN 4: KIỂM TRA HEALTH CHECK
# ==========================================

# 4.1. Kiểm tra PostgreSQL
docker exec acfmart-postgres pg_isready -U postgres -d acfmart

# 4.2. Kiểm tra Redis
docker exec acfmart-redis redis-cli ping

# 4.3. Kiểm tra Web Application
curl http://localhost:3000/api/health

# 4.4. Truy cập Adminer (Quản lý DB)
# Mở trình duyệt: http://localhost:8080
# Thông tin đăng nhập:
# - System: PostgreSQL
# - Server: postgres
# - Username: postgres
# - Password: postgres
# - Database: acfmart

# ==========================================
# GIAI ĐOẠN 5: TRIỂN KHAI PRODUCTION
# ==========================================

# 5.1. Cấu hình Reverse Proxy (Nginx/Caddy)
# Ví dụ với Nginx:
sudo apt update && sudo apt install -y nginx

# Tạo file cấu hình Nginx
sudo tee /etc/nginx/sites-available/acfmart.vn > /dev/null <<'EOF'
server {
    listen 80;
    server_name acfmart.vn www.acfmart.vn;
    
    # Redirect HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name acfmart.vn www.acfmart.vn;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/acfmart.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/acfmart.vn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
    
    # Compliance: Log truy cập (NĐ 85/2021)
    access_log /var/log/nginx/acfmart_access.log;
    error_log /var/log/nginx/acfmart_error.log;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/acfmart.vn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 5.2. Cài đặt SSL với Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d acfmart.vn -d www.acfmart.vn

# 5.3. Cấu hình Firewall (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable

# ==========================================
# GIAI ĐOẠN 6: GIÁM SÁT & BẢO TRÌ
# ==========================================

# 6.1. Xem logs
docker-compose logs -f web
docker-compose logs -f postgres
docker-compose logs -f redis

# 6.2. Restart services khi cần
docker-compose restart web
docker-compose restart postgres
docker-compose restart redis

# 6.3. Update application (khi có code mới)
git pull origin main
docker-compose build --no-cache web
docker-compose up -d web

# 6.4. Backup Database hàng ngày
#!/bin/bash
# File: backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec acfmart-postgres pg_dump -U postgres acfmart > /backups/acfmart_${DATE}.sql
# Nên lưu trữ backup offsite (S3, Google Cloud Storage)

# 6.5. Giám sát tài nguyên
docker stats
docker system df

# ==========================================
# GIAI ĐOẠN 7: COMPLIANCE & AUDIT (VN 2026)
# ==========================================

# 7.1. Đảm bảo lưu trữ dữ liệu trong nước (NĐ 13/2023)
# - Tất cả volumes được mount local
# - Không sử dụng cloud DB nước ngoài

# 7.2. Audit Logs (NĐ 85/2021)
# - Logs được lưu tối thiểu 3 năm
# - Immutable logs cho giao dịch tài chính

# 7.3. DPIA (Data Protection Impact Assessment)
# - Thực hiện trước khi xử lý dữ liệu cá nhân
# - Bổ nhiệm DPO (Data Protection Officer)

# ==========================================
# XỬ LÝ SỰ CỐ THƯỜNG GẶP
# ==========================================

# Web không khởi động:
docker-compose logs web
docker-compose restart web

# Database connection failed:
docker-compose restart postgres
docker exec acfmart-postgres pg_isready -U postgres -d acfmart

# Redis timeout:
docker-compose restart redis
docker exec acfmart-redis redis-cli ping

# Disk full:
docker system prune -a
docker volume prune

# ==========================================
# LIÊN HỆ HỖ TRỢ
# ==========================================
# Email: tech@acfmart.vn
# Hotline: 1900-XXXX
# Documentation: https://acfmart.cloud/docs
