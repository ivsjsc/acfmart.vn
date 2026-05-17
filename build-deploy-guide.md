Chạy trong thư mục gốc project:

cd D:\IVS\Apps\DEVELOPER\acfmart
Build frontend:

cd src
yarn build
Build functions:

cd ..\functions
npm run build
Deploy hosting acfmart.vn:

cd ..
npx -y firebase-tools@latest deploy --only hosting:acfmart
cd ..
npx -y firebase-tools@latest deploy --only hosting:acfmart --project ecommerce-acf
Deploy thêm seller/admin/online hosting nếu cần:

npx -y firebase-tools@latest deploy --only hosting:acfmart,hosting:acfmart-store,hosting:acfmart-cloud,hosting:acfmart-online --project ecommerce-acf
Deploy functions, gồm Aivy/Zalo/functions mới:

npx -y firebase-tools@latest deploy --only functions --project ecommerce-acf
Riêng Aivy production cần set secrets trước khi deploy lần đầu:

npx -y firebase-tools@latest functions:secrets:set GROQ_API_KEY --project ecommerce-acf
npx -y firebase-tools@latest functions:secrets:set GOOGLE_AI_API_KEY --project ecommerce-acf