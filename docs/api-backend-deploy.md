# ACFMart API Backend Deploy

## Service

- App: `apps/api`
- Runtime: Node.js 20, Express, Prisma, PostgreSQL, Redis
- Local port: `3001`
- Health check: `GET /health` or `GET /api/health`
- Public target: `https://api.acfmart.vn`

## Required environment

```env
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/acfmart?schema=api
REDIS_URL=redis://HOST:6379
BULL_REDIS_URL=redis://HOST:6379
JWT_SECRET=<strong-random-secret-at-least-32-chars>
JWT_REFRESH_SECRET=<strong-random-secret-at-least-32-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=https://acfmart.vn,https://www.acfmart.vn
```

## Local Docker run

```powershell
docker compose up -d postgres redis api
```

Apply database migrations before real traffic:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/acfmart?schema=api"
npm run db:migrate:deploy
```

## Production checklist

1. Point DNS `api.acfmart.vn` to the API server or load balancer.
2. Terminate TLS for `api.acfmart.vn`.
3. Proxy traffic to the API container on `127.0.0.1:3001`.
4. Set production secrets; do not use the docker-compose dev defaults.
5. Run `npm run db:migrate:deploy` before starting the first production instance.
6. Verify `https://api.acfmart.vn/health` returns status `ok`.

## Nginx example

```nginx
server {
    listen 443 ssl http2;
    server_name api.acfmart.vn;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
