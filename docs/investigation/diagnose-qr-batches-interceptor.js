/**
 * QR Batches Network Interceptor & Diagnostic Tool
 * 
 * This script captures ALL real network requests to the QR batches API.
 * It provides hard evidence of what's actually happening in production.
 * 
 * Usage:
 * 1. Login to acfmart.store as the affected seller
 * 2. Open browser DevTools Console (F12) BEFORE navigating to QRVerified page
 * 3. Paste and run this script
 * 4. Navigate to /seller/qr-verified
 * 5. Try to create a batch
 * 6. Wait for the script to output results
 * 7. Copy the ENTIRE output and share with development team
 */

(function() {
  'use strict';

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   QR Batches Network Interceptor - Evidence Collector   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('⏳ Interceptor active. Waiting for network requests...');
  console.log('📍 Navigate to /seller/qr-verified and try to create a batch.');
  console.log('📋 This script will capture all API requests automatically.');
  console.log('');

  const API_PATTERN = /\/v1\/sellers\/me\/(qr-batches|products|dashboard|kyc)/;
  const capturedRequests = [];

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};

    if (typeof url === 'string' && API_PATTERN.test(url)) {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();

      // Log request
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`📤 REQUEST [${requestId}]`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Method: ${options.method || 'GET'}`);
      console.log(`URL: ${url}`);
      
      // Check Authorization header (without exposing token)
      const headers = options.headers || {};
      let hasAuth = false;
      if (headers instanceof Headers) {
        hasAuth = headers.has('Authorization');
      } else if (typeof headers === 'object') {
        hasAuth = !!headers['Authorization'];
      }
      console.log(`Authorization: ${hasAuth ? '✓ Present (Bearer token)' : '✗ MISSING'}`);

      // Log request payload (excluding sensitive data)
      if (options.body) {
        try {
          const payload = JSON.parse(options.body);
          console.log(`Request Payload:`);
          console.log(JSON.stringify(payload, null, 2));
        } catch (e) {
          console.log(`Request Payload: ${options.body}`);
        }
      }

      // Intercept response
      return originalFetch.apply(this, args).then(async (response) => {
        const duration = Date.now() - startTime;
        
        // Clone response to read body
        const clone = response.clone();
        let responseBody;
        try {
          responseBody = await clone.json();
        } catch (e) {
          responseBody = { error: 'Failed to parse response' };
        }

        // Log response
        console.log('');
        console.log(`📥 RESPONSE [${requestId}]`);
        console.log('───────────────────────────────────────────────────────');
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`CORS Origin: ${response.headers.get('Access-Control-Allow-Origin') || 'NOT SET'}`);
        console.log('');
        console.log(`Response Body:`);
        console.log(JSON.stringify(responseBody, null, 2));

        // Analyze response
        console.log('');
        console.log(`📊 Analysis:`);
        
        if (url.includes('qr-batches')) {
          if (response.status === 200) {
            console.log(`  ✓ GET/POST succeeded`);
            if (responseBody.data) {
              console.log(`  - Batches returned: ${responseBody.data.length}`);
              console.log(`  - Total batches: ${responseBody.total || 0}`);
              if (responseBody.data.length > 0) {
                console.log(`  - First batch ID: ${responseBody.data[0].id}`);
                console.log(`  - First batch sellerId: ${responseBody.data[0].sellerId || 'NOT IN RESPONSE'}`);
                console.log(`  - First batch productId: ${responseBody.data[0].productId}`);
                console.log(`  - First batch skuId: ${responseBody.data[0].skuId || 'null'}`);
                console.log(`  - First batch quantity: ${responseBody.data[0].quantity}`);
                console.log(`  - First batch status: ${responseBody.data[0].status}`);
                console.log(`  - First batch createdAt: ${responseBody.data[0].createdAt}`);
              }
            }
            if (responseBody.id) {
              console.log(`  - Created batch ID: ${responseBody.id}`);
              console.log(`  - Batch productId: ${responseBody.productId}`);
              console.log(`  - Batch skuId: ${responseBody.skuId || 'null'}`);
              console.log(`  - Batch quantity: ${responseBody.quantity}`);
              console.log(`  - Batch status: ${responseBody.status}`);
            }
          } else if (response.status === 401) {
            console.log(`  ✗ Unauthorized (401)`);
            console.log(`    → Token expired or invalid`);
            console.log(`    → Action: Relogin and try again`);
          } else if (response.status === 403) {
            console.log(`  ✗ Forbidden (403)`);
            console.log(`    → Message: ${responseBody.message || 'Unknown'}`);
            console.log(`    → Possible causes:`);
            console.log(`       1. sellerId not resolved by backend`);
            console.log(`       2. seller.status is not 'ACTIVE'`);
            console.log(`       3. seller.ownerUserId does not match user.id`);
            console.log(`       4. User record does not exist in DB`);
            console.log(`    → Action: Check production database (see diagnostic report)`);
          } else if (response.status === 400) {
            console.log(`  ✗ Bad Request (400)`);
            console.log(`    → Message: ${responseBody.message || 'Unknown'}`);
            console.log(`    → Code: ${responseBody.code || 'N/A'}`);
            if (responseBody.code === 'PRODUCT_NOT_SYNCED') {
              console.log(`    → Product not synced to trust-platform`);
              console.log(`    → Frontend should auto-sync and retry`);
            }
          } else if (response.status >= 500) {
            console.log(`  ✗ Server Error (${response.status})`);
            console.log(`    → Backend error, check Cloud Run logs`);
          }
        }

        // Store for final report
        capturedRequests.push({
          id: requestId,
          method: options.method || 'GET',
          url,
          hasAuth,
          requestPayload: options.body ? JSON.parse(options.body) : null,
          status: response.status,
          responseBody,
          duration,
          timestamp: new Date().toISOString(),
        });

        return response;
      }).catch((error) => {
        const duration = Date.now() - startTime;
        console.log('');
        console.log(`❌ REQUEST FAILED [${requestId}]`);
        console.log('───────────────────────────────────────────────────────');
        console.log(`Error: ${error.message}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Possible causes:`);
        console.log(`  - Network error`);
        console.log(`  - CORS blocked`);
        console.log(`  - Server not reachable`);

        capturedRequests.push({
          id: requestId,
          method: options.method || 'GET',
          url,
          hasAuth: false,
          requestPayload: options.body ? JSON.parse(options.body) : null,
          status: 0,
          error: error.message,
          duration,
          timestamp: new Date().toISOString(),
        });

        throw error;
      });
    }

    // Pass through non-matching requests
    return originalFetch.apply(this, args);
  };

  // Auto-generate report after 30 seconds
  setTimeout(() => {
    generateReport();
  }, 30000);

  // Also generate report on demand
  window.generateQrDiagnosticReport = generateReport;

  function generateReport() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              DIAGNOSTIC REPORT                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Page URL: ${window.location.href}`);
    console.log(`Total API requests captured: ${capturedRequests.length}`);
    console.log('');

    if (capturedRequests.length === 0) {
      console.log('⚠ No API requests captured.');
      console.log('  Possible reasons:');
      console.log('  1. Script was run after page already loaded');
      console.log('  2. No API calls were made');
      console.log('  3. API pattern did not match');
      console.log('');
      console.log('  Solution:');
      console.log('  1. Refresh the page');
      console.log('  2. Run this script IMMEDIATELY in console');
      console.log('  3. THEN navigate to /seller/qr-verified');
      return;
    }

    // Group requests by type
    const getBatches = capturedRequests.filter(r => r.url.includes('qr-batches') && r.method === 'GET');
    const postBatches = capturedRequests.filter(r => r.url.includes('qr-batches') && r.method === 'POST');
    const otherRequests = capturedRequests.filter(r => !r.url.includes('qr-batches'));

    console.log('═══════════════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`GET /qr-batches requests: ${getBatches.length}`);
    console.log(`POST /qr-batches requests: ${postBatches.length}`);
    console.log(`Other API requests: ${otherRequests.length}`);
    console.log('');

    // Analyze GET requests
    if (getBatches.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('GET /v1/sellers/me/qr-batches ANALYSIS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');

      getBatches.forEach((req, idx) => {
        console.log(`Request #${idx + 1}:`);
        console.log(`  Status: ${req.status}`);
        console.log(`  Authorization: ${req.hasAuth ? '✓' : '✗'}`);
        console.log(`  Timestamp: ${req.timestamp}`);
        
        if (req.status === 200 && req.responseBody) {
          console.log(`  ✓ Success`);
          console.log(`  - Total batches in DB: ${req.responseBody.total || 0}`);
          console.log(`  - Batches returned: ${req.responseBody.data?.length || 0}`);
          
          if (req.responseBody.data && req.responseBody.data.length > 0) {
            console.log('');
            console.log(`  Sample batch (first one):`);
            const batch = req.responseBody.data[0];
            console.log(`    - id: ${batch.id}`);
            console.log(`    - productId: ${batch.productId}`);
            console.log(`    - productName: ${batch.productName || 'NOT SET'}`);
            console.log(`    - skuId: ${batch.skuId || 'null'}`);
            console.log(`    - quantity: ${batch.quantity}`);
            console.log(`    - status: ${batch.status}`);
            console.log(`    - createdAt: ${batch.createdAt}`);
          } else {
            console.log(`  ⚠ Empty data array (no batches found for this seller)`);
          }
        } else if (req.status === 403) {
          console.log(`  ✗ Forbidden`);
          console.log(`  - Error: ${req.responseBody?.message || 'Unknown'}`);
          console.log(`  - This means backend could NOT resolve sellerId`);
          console.log(`  - Check: seller.ownerUserId matches user.id?`);
          console.log(`  - Check: seller.status is 'ACTIVE'?`);
        } else if (req.status === 401) {
          console.log(`  ✗ Unauthorized - Token expired`);
        }
        console.log('');
      });
    }

    // Analyze POST requests
    if (postBatches.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('POST /v1/sellers/me/qr-batches ANALYSIS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');

      postBatches.forEach((req, idx) => {
        console.log(`Request #${idx + 1}:`);
        console.log(`  Status: ${req.status}`);
        console.log(`  Authorization: ${req.hasAuth ? '✓' : '✗'}`);
        console.log(`  Request Payload: ${JSON.stringify(req.requestPayload)}`);
        console.log(`  Timestamp: ${req.timestamp}`);
        
        if (req.status === 201 || req.status === 200) {
          console.log(`  ✓ Batch created successfully`);
          console.log(`  - Batch ID: ${req.responseBody?.id}`);
          console.log(`  - Product ID: ${req.responseBody?.productId}`);
          console.log(`  - SKU ID: ${req.responseBody?.skuId || 'null'}`);
          console.log(`  - Quantity: ${req.responseBody?.quantity}`);
          console.log(`  - Status: ${req.responseBody?.status}`);
          console.log(`  - Created At: ${req.responseBody?.createdAt}`);
        } else if (req.status === 403) {
          console.log(`  ✗ Forbidden - Cannot create batch`);
          console.log(`  - Error: ${req.responseBody?.message || 'Unknown'}`);
        } else if (req.status === 400) {
          console.log(`  ✗ Bad Request`);
          console.log(`  - Error: ${req.responseBody?.message || 'Unknown'}`);
          console.log(`  - Code: ${req.responseBody?.code || 'N/A'}`);
        }
        console.log('');
      });
    }

    // Final recommendations
    console.log('═══════════════════════════════════════════════════════════');
    console.log('RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    const has403 = capturedRequests.some(r => r.status === 403);
    const hasSuccess = capturedRequests.some(r => r.status === 200 || r.status === 201);
    const hasEmptyData = capturedRequests.some(r => r.status === 200 && r.responseBody?.data?.length === 0);

    if (has403) {
      console.log('⚠ CRITICAL: 403 Forbidden detected');
      console.log('');
      console.log('This means the backend could NOT resolve sellerId from the Firebase token.');
      console.log('');
      console.log('Next steps to diagnose:');
      console.log('1. Run this query in production database (Prisma):');
      console.log('');
      console.log('   // Find the user from Firebase UID');
      console.log('   const user = await prisma.user.findFirst({');
      console.log('     where: {');
      console.log('       OR: [');
      console.log('         { firebaseUid: "<FIREBASE_UID_FROM_TOKEN>" },');
      console.log('         { id: "<FIREBASE_UID_FROM_TOKEN>" }');
      console.log('       ]');
      console.log('     }');
      console.log('   });');
      console.log('');
      console.log('   // Check seller record');
      console.log('   const seller = await prisma.seller.findFirst({');
      console.log('     where: { ownerUserId: user.id }');
      console.log('   });');
      console.log('');
      console.log('   console.log("User ID:", user.id);');
      console.log('   console.log("User email:", user.email);');
      console.log('   console.log("Seller ID:", seller?.id);');
      console.log('   console.log("Seller ownerUserId:", seller?.ownerUserId);');
      console.log('   console.log("Seller status:", seller?.status);');
      console.log('');
      console.log('2. Check if seller.status === "ACTIVE"');
      console.log('3. Check if seller.ownerUserId === user.id');
      console.log('4. Report findings to development team');
      console.log('');
    } else if (hasEmptyData) {
      console.log('ℹ GET returned empty data (no batches)');
      console.log('');
      console.log('This is normal if no batches have been created yet.');
      console.log('Try creating a batch and check if POST succeeds.');
      console.log('');
    } else if (hasSuccess) {
      console.log('✓ API requests succeeded');
      console.log('');
      console.log('If batches are still not showing in UI, check:');
      console.log('1. Browser console for JavaScript errors');
      console.log('2. React component rendering logic');
      console.log('3. Data mapping between API response and UI');
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('END OF REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Please copy this ENTIRE output and share with the development team.');
    console.log('📸 Also provide screenshots of DevTools Network tab showing the requests.');
    console.log('');
    console.log('To regenerate this report later, run:');
    console.log('  generateQrDiagnosticReport()');
    console.log('');
  }

  console.log('✅ Interceptor installed successfully.');
  console.log('💡 To manually generate report anytime, run: generateQrDiagnosticReport()');
  console.log('');

})();
