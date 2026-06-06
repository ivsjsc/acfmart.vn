/**
 * QR Batches Diagnostic Script
 * 
 * This script captures all network requests and responses for the QR batches feature.
 * 
 * Usage:
 * 1. Login to acfmart.store as the affected seller
 * 2. Navigate to /seller/qr-verified
 * 3. Open browser DevTools Console (F12)
 * 4. Paste and run this script
 * 5. Wait for it to complete (will take ~10 seconds)
 * 6. Copy the entire output and share with development team
 */

(async function diagnoseQrBatches() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     ACFMart QR Batches Diagnostic Tool                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Page URL:', window.location.href);
  console.log('');

  const API_BASE = 'https://api.acfmart.vn/v1';
  
  // Helper to get auth token
  async function getAuthToken() {
    // Try to get Firebase ID token from the page's auth state
    try {
      // This works if Firebase auth is loaded on the page
      const firebaseApp = window.firebase;
      if (firebaseApp) {
        const auth = firebaseApp.auth();
        const user = auth.currentUser;
        if (user) {
          return await user.getIdToken();
        }
      }
    } catch (e) {
      console.warn('Could not get Firebase token automatically');
    }
    return null;
  }

  // Helper to make authenticated request
  async function authenticatedFetch(endpoint, method = 'GET', body = null) {
    const token = await getAuthToken();
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`  ✓ Authorization header: Present (Bearer token)`);
    } else {
      console.log(`  ⚠ Authorization header: MISSING (not logged in?)`);
    }
    
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`  Request: ${method} ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  CORS Headers:`);
    console.log(`    - Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin') || 'NOT SET'}`);
    console.log(`    - Access-Control-Allow-Credentials: ${response.headers.get('Access-Control-Allow-Credentials') || 'NOT SET'}`);
    
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
      responseBody = { error: 'Failed to parse response as JSON' };
    }
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      duration,
    };
  }

  // Sanitize sensitive data
  function sanitize(obj, path = '') {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sensitiveKeys = ['token', 'secret', 'credential', 'authorization', 'accessToken', 'tokenId', 'tokenKey'];
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const isSensitive = sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value, currentPath);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('STEP 1: GET /v1/sellers/me/qr-batches (page load)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const getResponse1 = await authenticatedFetch('/sellers/me/qr-batches?page=1&limit=20');
  
  console.log('');
  console.log('Response Body (sanitized):');
  console.log(JSON.stringify(sanitize(getResponse1.body), null, 2));
  console.log('');
  
  // Analyze GET response
  console.log('Analysis:');
  if (getResponse1.status === 200) {
    console.log(`  ✓ GET succeeded`);
    console.log(`  - Total batches: ${getResponse1.body.total || 0}`);
    console.log(`  - Batches returned: ${getResponse1.body.data?.length || 0}`);
    console.log(`  - Page: ${getResponse1.body.page}`);
    console.log(`  - Limit: ${getResponse1.body.limit}`);
    
    if (getResponse1.body.data && getResponse1.body.data.length > 0) {
      console.log('');
      console.log('  First batch sample:');
      const firstBatch = getResponse1.body.data[0];
      console.log(`    - id: ${firstBatch.id}`);
      console.log(`    - productId: ${firstBatch.productId}`);
      console.log(`    - productName: ${firstBatch.productName || 'NOT SET'}`);
      console.log(`    - skuId: ${firstBatch.skuId || 'null'}`);
      console.log(`    - quantity: ${firstBatch.quantity}`);
      console.log(`    - status: ${firstBatch.status}`);
      console.log(`    - createdAt: ${firstBatch.createdAt}`);
    } else {
      console.log('  ⚠ No batches found (empty data array)');
    }
  } else if (getResponse1.status === 401) {
    console.log('  ❌ Unauthorized (401) - Token expired or invalid');
    console.log('     Action: Relogin and try again');
  } else if (getResponse1.status === 403) {
    console.log('  ❌ Forbidden (403) - Seller profile not linked');
    console.log('     Action: Check if user has sellerId claim in Firebase token');
  } else if (getResponse1.status >= 500) {
    console.log(`  ❌ Server Error (${getResponse1.status})`);
    console.log('     Action: Check backend logs');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('STEP 2: Check Seller Products (for batch creation)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  // Try to get seller products
  try {
    const productsResponse = await authenticatedFetch('/sellers/me/products?limit=10');
    
    console.log('');
    console.log('Response Body (sanitized):');
    console.log(JSON.stringify(sanitize(productsResponse.body), null, 2));
    console.log('');
    
    if (productsResponse.status === 200 && productsResponse.body.products?.length > 0) {
      console.log(`  ✓ Found ${productsResponse.body.products.length} products`);
      console.log('  First product:');
      const firstProduct = productsResponse.body.products[0];
      console.log(`    - id: ${firstProduct.id}`);
      console.log(`    - title: ${firstProduct.title}`);
      console.log(`    - variants: ${firstProduct.variants?.length || 0}`);
      if (firstProduct.variants?.length > 0) {
        console.log(`    - First variant SKU: ${firstProduct.variants[0].sku || 'NOT SET'}`);
        console.log(`    - First variant ID: ${firstProduct.variants[0].id}`);
      }
    } else {
      console.log('  ⚠ No products found or API error');
    }
  } catch (e) {
    console.log('  ⚠ Could not fetch products:', e.message);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('STEP 3: Instructions for POST test');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('To test batch creation, please do the following:');
  console.log('');
  console.log('1. In the QRVerified page, fill out the "Tạo batch QR" form:');
  console.log('   - Select a product from dropdown');
  console.log('   - Select a SKU (if available)');
  console.log('   - Enter quantity (e.g., 100)');
  console.log('');
  console.log('2. Open DevTools Network tab');
  console.log('');
  console.log('3. Click "Tạo batch" button');
  console.log('');
  console.log('4. In Network tab, find the POST request to:');
  console.log('   POST https://api.acfmart.vn/v1/sellers/me/qr-batches');
  console.log('');
  console.log('5. Click on that request and capture:');
  console.log('   - Headers tab: Request Headers (look for Authorization)');
  console.log('   - Payload tab: Request Payload');
  console.log('   - Response tab: Response body');
  console.log('   - Status code');
  console.log('');
  console.log('6. After POST succeeds, wait 2 seconds, then run this script again');
  console.log('   to verify the batch appears in GET response.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Additional Debugging Information');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  // Check if Firebase auth is loaded
  if (window.firebase) {
    console.log('✓ Firebase SDK loaded');
    try {
      const auth = window.firebase.auth();
      const user = auth.currentUser;
      if (user) {
        console.log(`✓ User authenticated: ${user.email || user.uid}`);
        console.log(`  User ID: ${user.uid}`);
        console.log(`  Email: ${user.email || 'NOT SET'}`);
        console.log(`  Email verified: ${user.emailVerified}`);
        
        // Try to get token and decode it (without exposing it)
        try {
          const token = await user.getIdToken();
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('');
            console.log('Firebase Token Claims (sanitized):');
            console.log(`  - user_id: ${payload.user_id || 'NOT SET'}`);
            console.log(`  - email: ${payload.email || 'NOT SET'}`);
            console.log(`  - sellerId: ${payload.sellerId || 'NOT SET ⚠️ THIS IS CRITICAL'}`);
            console.log(`  - shopId: ${payload.shopId || 'NOT SET'}`);
            console.log(`  - vendorId: ${payload.vendorId || 'NOT SET'}`);
            console.log(`  - role: ${payload.role || 'NOT SET'}`);
            
            if (!payload.sellerId && !payload.shopId && !payload.vendorId) {
              console.log('');
              console.log('⚠️  WARNING: No seller/shop/vendor ID found in token!');
              console.log('   This is likely why QR batches are not loading.');
              console.log('   The backend cannot identify which seller\'s batches to return.');
            }
          }
        } catch (e) {
          console.log('⚠ Could not decode token:', e.message);
        }
      } else {
        console.log('⚠ No user logged in');
      }
    } catch (e) {
      console.log('⚠ Could not access Firebase auth:', e.message);
    }
  } else {
    console.log('⚠ Firebase SDK not loaded on this page');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Diagnostic Complete');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Please copy this ENTIRE output and share with the development team.');
  console.log('Also provide screenshots of:');
  console.log('  1. DevTools Network tab showing GET /qr-batches request');
  console.log('  2. DevTools Network tab showing POST /qr-batches request (after creating batch)');
  console.log('  3. The QRVerified page UI showing the batch table');
  console.log('');
  
})();
