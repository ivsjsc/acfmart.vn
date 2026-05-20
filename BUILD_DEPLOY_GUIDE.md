# ACFMart Build & Deploy Guide

This guide explains how to build and deploy the ACFMart application using the provided build and deploy functions.

## Overview

The ACFMart build and deploy system includes three implementations:
- PowerShell script ([`build-deploy-function.ps1`](file:///d:/IVS/Apps/DEVELOPER/acfmart/build-deploy-function.ps1)) for Windows
- Bash script ([`build-deploy-function.sh`](file:///d:/IVS/Apps/DEVELOPER/acfmart/build-deploy-function.sh)) for Linux/macOS
- JavaScript function ([`build-deploy-function.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/build-deploy-function.js)) for Node.js environments

All implementations follow the ACFMart deployment pre-check specifications.

## Pre-requisites

Before running any build or deploy command, ensure you have:

1. **Node.js** (v18 or higher)
2. **Firebase CLI** installed globally (`npm install -g firebase-tools`)
3. **Proper authentication** with Firebase (`firebase login`)
4. **Git** installed and configured
5. **Access rights** to the Firebase project

## Deployment Pre-checks

The build and deploy functions perform the following mandatory pre-checks:

1. **Directory Validation**: Ensures you're in the correct project directory (`d:\IVS\Apps\DEVELOPER\acfmart`)
2. **Dependency Check**: Verifies that `package.json` exists in the project root
3. **Git Sync**: Pulls latest changes and checks for conflicts
4. **Firebase CLI**: Validates that Firebase CLI is installed and accessible
5. **Firestore Indexes**: Confirms all required indexes are created
6. **Firebase Secrets**: Checks that required secrets are available (when deploying functions)

## Available Commands

### Using npm scripts (recommended):

```bash
# Build and deploy both frontend and functions
npm run deploy

# Build and deploy only frontend
npm run deploy:frontend

# Build and deploy only functions
npm run deploy:functions

# Deploy only hosting (without rebuilding)
npm run deploy:hosting

# Build only frontend
npm run build
```

### Using the JavaScript implementation directly:

```bash
# Full deployment (frontend + functions)
node build-deploy-function.js both production

# Frontend only
node build-deploy-function.js frontend production

# Functions only
node build-deploy-function.js functions production

# Hosting only
node build-deploy-function.js hosting production
```

### Using the PowerShell script (Windows):

```powershell
# Full deployment
.\build-deploy-function.ps1 -DeployType both -Environment production

# Frontend only
.\build-deploy-function.ps1 -DeployType frontend -Environment production

# Functions only
.\build-deploy-function.ps1 -DeployType functions -Environment production

# With specific function name
.\build-deploy-function.ps1 -DeployType functions -Environment production
```

### Using the Bash script (Linux/macOS):

```bash
# Make script executable
chmod +x build-deploy-function.sh

# Full deployment
./build-deploy-function.sh both production

# Frontend only
./build-deploy-function.sh frontend production

# Functions only
./build-deploy-function.sh functions production

# Hosting only
./build-deploy-function.sh hosting production
```

## Deployment Targets

The system deploys to multiple domains:
- Main site: https://acfmart.web.app
- Store site: https://acfmart-store.web.app
- Cloud site: https://acfmart-cloud.web.app
- Online site: https://acfmart-online.web.app

## Build Process

### Frontend Build
- Builds the React application using Vite
- Output is placed in `src/dist/`
- Optimized for production with minification

### Functions Build
- Compiles TypeScript files in `functions/src/`
- Output is placed in `functions/lib/`
- Ready for Firebase Functions deployment

## Troubleshooting

### Common Issues

1. **Directory Validation Failed**
   - Ensure you're running the command from the correct directory: `d:\IVS\Apps\DEVELOPER\acfmart`

2. **Firebase CLI Not Found**
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Verify installation: `firebase --version`

3. **Authentication Issues**
   - Login to Firebase: `firebase login`
   - Verify authentication: `firebase login:ci`

4. **Missing Dependencies**
   - Run `npm install` in both the root and `functions/` directories

5. **Firestore Index Issues**
   - Create required indexes via Firebase Console or CLI
   - Use: `firebase deploy --only firestore`

### Recovery Steps

If deployment fails:

1. Check the error logs carefully
2. Verify all pre-requisites are met
3. Ensure you have the latest code: `git pull origin main`
4. Try deploying just one component first (frontend or functions)
5. Check Firebase project permissions

## Security Considerations

- Never commit Firebase configuration files or secrets to version control
- Keep service account keys secure
- Review all code changes before deployment
- Use environment-specific configurations appropriately

## Support

For issues with the build and deploy process:

1. Check the error messages and logs
2. Verify all pre-requisites are properly configured
3. Consult the Firebase documentation
4. Contact the development team if issues persist

## Notes

- The build and deploy functions follow the ACFMart deployment pre-check specifications
- All scripts include comprehensive logging with timestamps
- Deployment results in optimized, production-ready applications
- Automatic validation of all required infrastructure components