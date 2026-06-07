# QRVerified Seller Flow Adjustment - Implementation Summary

## Overview
Successfully adjusted the QRVerified seller flow to separate QR batch management from PDF export, implementing a proper print layout/template system before PDF generation.

## Changes Made

### 1. Database Schema (Prisma)
**File**: `packages/database/prisma/schema.prisma`

Added two new models:

#### PrintLayout Model
- Stores print configuration templates
- Supports presets: A4, A5, A3, CUSTOM
- Configurable: orientation, paper size, QR size, grid layout (rows/columns), margins, spacing
- Content toggles: show/hide QR code, product name, SKU, serial, seller name, batch code, branding, scan text
- One-to-many relationship with PrintJob

#### PrintJob Model
- Represents a generated printable artifact/PDF
- Links to QRBatch and optionally PrintLayout
- Tracks: status (PENDING, GENERATING, READY, FAILED), generation timestamp, download count
- Stores PDF URL and storage key for future retrieval

### 2. Backend Service Layer
**File**: `apps/api/src/modules/ivs-trust/ivs-trust.service.ts`

Added methods:
- `getBatchQrCodes()`: Fetch QR codes for a specific batch with pagination
- `createPrintJob()`: Create a print job and generate HTML content for PDF
- `getPrintJob()`: Get print job details
- `listPrintJobs()`: List print jobs with optional batch filter
- `createPrintLayout()`: Create a new print layout template
- `listPrintLayouts()`: List seller's print layouts
- `generatePrintHtml()`: Generate HTML content for print based on layout configuration

### 3. Backend Controller
**File**: `apps/api/src/modules/ivs-trust/ivs-trust.controller.ts`

Added endpoints:
- `getBatchQrCodes`: GET `/v1/sellers/me/qr-batches/:batchId/codes`
- `createPrintJob`: POST `/v1/sellers/me/qr-batches/:batchId/print-jobs`
- `getPrintJob`: GET `/v1/sellers/me/qr-print-jobs/:jobId`
- `listPrintJobs`: GET `/v1/sellers/me/qr-print-jobs`
- `createPrintLayout`: POST `/v1/sellers/me/qr-print-layouts`
- `listPrintLayouts`: GET `/v1/sellers/me/qr-print-layouts`

### 4. Backend Routes
**File**: `apps/api/src/modules/ivs-trust/ivs-trust.routes.ts`

Registered all new endpoints with proper authentication and seller role guards.

### 5. API Client
**File**: `src/lib/ivs-trust-api.ts`

Added:
- TypeScript types: `IvsQrCode`, `IvsPrintJob`, `IvsPrintLayout`
- API functions: `getBatchQrCodes()`, `listPrintJobs()`, `getPrintJob()`, `createPrintLayout()`, `listPrintLayouts()`
- Interface: `CreatePrintLayoutPayload`

### 6. React Hooks
**File**: `src/hooks/use-ivs-seller-qr.ts`

Added hooks:
- `useBatchQrCodes(batchId)`: Fetch QR codes for a batch
- `usePrintJobs(params)`: List print jobs
- `usePrintJob(jobId)`: Get single print job
- `useCreatePrintJob()`: Create print job mutation
- `usePrintLayouts(params)`: List print layouts
- `useCreatePrintLayout()`: Create print layout mutation

### 7. Frontend UI Changes
**File**: `src/features/seller/components/SellerQrVerifiedScreen.tsx`

#### Batch Table Actions - REPLACED:
**Before**: "Xuất PDF" (direct download) + "Kích hoạt"

**After**:
1. **"Xem mã"** (View Codes) - Blue button
   - Opens QR code preview modal
   - Shows grid of QR codes with serial numbers and status
   
2. **"Tạo mẫu in"** (Create Print Template) - Red button
   - Opens print layout modal
   - Multi-step flow: Select/Create/Preview
   
3. **"Kích hoạt"** (Activate) - Green button
   - Remains unchanged

#### New Modals:

**QR Codes Preview Modal**:
- Grid display of QR codes (2-4 columns responsive)
- Shows: QR code snippet, index, serial number, active/inactive status
- Total count display

**Print Layout Modal** (3-step flow):
1. **Select Step**: 
   - Choose existing print layout OR create new
   - Lists saved layouts with name and preset
   
2. **Create Step**:
   - Layout name input
   - Paper size selector (A4, A5, A3)
   - Orientation selector (Portrait/Landscape)
   - Content toggles (checkboxes):
     - Mã QR (QR Code)
     - Tên sản phẩm (Product Name)
     - Serial
     - Branding
     - Scan text
   
3. **Preview Step**:
   - Confirmation screen
   - Shows batch ID, preset, orientation
   - "Tải PDF" button to generate and download

## Architecture Separation

The implementation maintains clear separation:

```
QRBatch (QR Code Data)
    ↓
PrintLayout (Print Configuration Template)
    ↓
PrintJob (Generated Printable Artifact/PDF)
```

- **QRBatch**: Contains QR codes, product info, status
- **PrintLayout**: Reusable print configuration (margins, size, content toggles)
- **PrintJob**: One-time generated PDF linked to specific batch + layout

## API Endpoints Summary

### Existing (Unchanged)
- `GET /v1/sellers/me/qr-batches` - List batches
- `POST /v1/sellers/me/qr-batches` - Create batch
- `GET /v1/sellers/me/qr-batches/:batchId` - Get batch
- `POST /v1/sellers/me/qr-batches/:batchId/activate` - Activate batch

### New Endpoints
- `GET /v1/sellers/me/qr-batches/:batchId/codes` - Get QR codes in batch
- `POST /v1/sellers/me/qr-batches/:batchId/print-jobs` - Create print job & download PDF
- `GET /v1/sellers/me/qr-print-jobs` - List print jobs
- `GET /v1/sellers/me/qr-print-jobs/:jobId` - Get print job details
- `POST /v1/sellers/me/qr-print-layouts` - Create print layout
- `GET /v1/sellers/me/qr-print-layouts` - List print layouts

## Security
- All endpoints require authentication (`authenticate` middleware)
- All endpoints require seller role (`requireSeller` middleware)
- Seller can only access their own batches, print jobs, and layouts
- Ownership verified at service layer for all operations

## Next Steps (Before Deployment)

1. **Run Database Migration**:
   ```bash
   npx prisma migrate dev --schema=./packages/database/prisma/schema.prisma
   ```

2. **Test Locally**:
   - Start backend: `cd apps/api && npm run start:dev`
   - Start frontend: `npm run dev`
   - Navigate to Seller Center → QRVerified page
   - Create a batch
   - Test "Xem mã" button
   - Test "Tạo mẫu in" flow
   - Verify PDF download works

3. **Verify Flow**:
   - ✅ Batch creation works
   - ✅ No direct download button on batch row
   - ✅ "Xem mã" shows QR codes
   - ✅ "Tạo mẫu in" opens layout modal
   - ✅ Can create new layout
   - ✅ Can select existing layout
   - ✅ "Tải PDF" button only appears after layout selection
   - ✅ PDF generates and downloads correctly

4. **Deploy Backend**:
   - Build and deploy to Cloud Run
   - Run migrations on production database

5. **Deploy Frontend**:
   - Build and deploy to Firebase Hosting

## Important Notes

- The old "Xuất PDF" button has been completely replaced
- PDF generation now requires a print layout/template step
- Print layouts are reusable across batches
- Print jobs are tracked for audit purposes
- The flow enforces the architectural boundary: QRBatch ≠ PDF Export

## Files Modified

1. `packages/database/prisma/schema.prisma`
2. `apps/api/src/modules/ivs-trust/ivs-trust.service.ts`
3. `apps/api/src/modules/ivs-trust/ivs-trust.controller.ts`
4. `apps/api/src/modules/ivs-trust/ivs-trust.routes.ts`
5. `src/lib/ivs-trust-api.ts`
6. `src/hooks/use-ivs-seller-qr.ts`
7. `src/features/seller/components/SellerQrVerifiedScreen.tsx`

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Backend starts without errors
- [ ] Frontend compiles without TypeScript errors
- [ ] Can create QR batch
- [ ] Batch table shows: "Xem mã", "Tạo mẫu in", "Kích hoạt"
- [ ] "Xem mã" opens modal with QR codes
- [ ] "Tạo mẫu in" opens 3-step modal
- [ ] Can create new print layout
- [ ] Can select existing print layout
- [ ] Preview step shows correct info
- [ ] "Tải PDF" generates and downloads file
- [ ] Seller cannot access other seller's batches/jobs/layouts
- [ ] All new endpoints return 401 without auth
- [ ] All new endpoints return 403 for non-seller users
