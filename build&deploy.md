cd "D:\IVS\Apps\PRODUCTION\centercare" && npm run build 2>&1 | tail -30

cd "D:\IVS\Apps\PRODUCTION\centercare" && npx firebase deploy --only hosting 2>&1 | tail -15