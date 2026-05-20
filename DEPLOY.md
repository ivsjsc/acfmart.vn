# ACFMart Deployment Documentation

## Overview

ACFMart deployment is handled through multiple methods depending on the target environment and components:

1. **Firebase Hosting** - Frontend applications
2. **Firebase Functions** - Backend logic and APIs
3. **Firebase Firestore** - Database
4. **Firebase Storage** - File storage

## Deployment Methods

### Automated Deployment (Recommended)

The project includes automated deployment scripts that follow the ACFMart deployment pre-check specifications:

#### Using npm scripts:
```bash
# Full deployment (frontend + functions)
npm run deploy

# Frontend only
npm run deploy:frontend

# Functions only
npm run deploy:functions

# Hosting only (no rebuild)
npm run deploy:hosting
```

#### Using direct script execution:
- **PowerShell (Windows)**: `.\build-deploy-function.ps1`
- **Bash (Linux/macOS)**: `./build-deploy-function.sh`
- **Node.js**: `node build-deploy-function.js`

### Manual Deployment

For manual deployments, navigate to the respective directories:

```bash
# Deploy only hosting
cd src && firebase deploy --only hosting

# Deploy only functions
cd functions && npm run build && firebase deploy --only functions
```

## Deployment Pre-checks

All deployment methods enforce the following pre-checks:

1. **Directory Validation**: Ensures deployment from correct project path
2. **Dependency Check**: Verifies package.json exists
3. **Git Sync**: Ensures latest code is pulled and no conflicts exist
4. **Firebase CLI**: Validates Firebase CLI installation
5. **Firestore Indexes**: Checks required indexes exist
6. **Firebase Secrets**: Verifies secret availability for functions

## Target Environments

The application is deployed across multiple domains:

- **Main**: https://acfmart.web.app
- **Store**: https://acfmart-store.web.app
- **Cloud**: https://acfmart-cloud.web.app
- **Online**: https://acfmart-online.web.app

## Build Process

### Frontend (React/Vite)
- Built from `/src` directory
- Output to `/src/dist`
- Includes optimization and minification

### Backend (Firebase Functions)
- Built from `/functions/src` directory
- Compiled TypeScript to JavaScript
- Output to `/functions/lib`

## Configuration Files

- `firebase.json`: Firebase project configuration
- `firestore.rules`: Database security rules
- `firestore.indexes.json`: Database indexes
- `storage.rules`: Storage security rules
- `functions/.env.ecommerce-acf`: Function environment variables

## CI/CD Pipeline

The deployment process includes:

1. Pre-flight checks
2. Code compilation
3. Asset optimization
4. Security validation
5. Deployment execution
6. Health verification

## Rollback Procedure

To rollback to a previous version:

1. Identify the last known good version in Firebase Console
2. Use Firebase CLI to redeploy that version:
   ```bash
   firebase rollback hosting:acfmart --version=VERSION_ID
   ```

## Monitoring and Logs

- View deployment logs in Firebase Console
- Access function logs through Firebase Console or CLI
- Monitor performance through Firebase Performance Monitoring

## Troubleshooting

Common deployment issues and solutions:

- **Permission errors**: Verify Firebase project access
- **Build failures**: Check dependencies and build configuration
- **Index issues**: Ensure all required Firestore indexes exist
- **Secret issues**: Verify all required secrets are configured

For detailed usage instructions, see [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md).