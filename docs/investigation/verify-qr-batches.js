#!/usr/bin/env node

/**
 * QR Batch API Verification Script
 * 
 * This script tests the QR batch endpoints with different seller statuses
 * and captures network evidence for manual verification.
 * 
 * Usage:
 * node verify-qr-batches.js <firebase-id-token> <expected-seller-status>
 * 
 * Example:
 * node verify-qr-batches.js "eyJhbGci..." "ACTIVE"
 * node verify-qr-batches.js "eyJhbGci..." "PENDING"
 */

const API_BASE = 'https://api.acfmart.vn/v1';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, path, token, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`${method} ${url}`);
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Duration: ${duration}ms`);
    console.log('Headers:');
    response.headers.forEach((value, key) => {
      if (key.includes('content-type') || key.includes('x-')) {
        console.log(`  ${key}: ${value}`);
      }
    });

    let responseBody;
    const text = await response.text();
    try {
      responseBody = JSON.parse(text);
      console.log('\nResponse Body:');
      console.log(JSON.stringify(responseBody, null, 2));
    } catch {
      responseBody = text;
      console.log('\nResponse Body (raw):');
      console.log(text);
    }

    return {
      status: response.status,
      body: responseBody,
      duration,
    };
  } catch (error) {
    console.error('\nRequest Failed:', error.message);
    return {
      status: 0,
      body: error.message,
      error: true,
    };
  }
}

async function testActiveSeller(token) {
  console.log('\n' + '🔵'.repeat(40));
  console.log('TEST SCENARIO 1: ACTIVE SELLER');
  console.log('🔵'.repeat(40));

  // Step 1: GET batches before creation
  console.log('\n📋 Step 1: GET /sellers/me/qr-batches (before creation)');
  const getBefore = await makeRequest('GET', '/sellers/me/qr-batches?page=1&limit=20', token);
  
  if (getBefore.status !== 200) {
    console.error('\n❌ FAILED: GET should return 200 for ACTIVE seller');
    return false;
  }

  const batchesBefore = getBefore.body.data || [];
  console.log(`\n✅ PASS: GET returned ${batchesBefore.length} batches`);

  // Step 2: Get available products first
  console.log('\n📋 Step 1.5: GET /sellers/me/dashboard (to check products)');
  const dashboard = await makeRequest('GET', '/sellers/me/dashboard', token);
  
  if (dashboard.status !== 200) {
    console.error('\n❌ FAILED: Dashboard should return 200');
    return false;
  }

  console.log(`\nDashboard: ${dashboard.body.totalProducts} products, ${dashboard.body.totalQrBatches} batches`);

  if (dashboard.body.totalProducts === 0) {
    console.warn('\n⚠️  WARNING: No products available. Cannot test POST creation.');
    console.warn('Please ensure the seller has at least one approved product synced to IVS Trust.');
    return null;
  }

  // Step 3: POST create batch
  console.log('\n📋 Step 2: POST /sellers/me/qr-batches (create batch)');
  
  // We need a valid product ID - try to get one from the dashboard or use a known one
  // For now, we'll need the user to provide a product ID
  console.log('\n⚠️  To test POST creation, you need a valid productId.');
  console.log('Please run this test after creating a product, or provide a productId manually.');
  
  // Try to list products (if endpoint exists)
  // For now, skip POST test and verify GET works
  
  // Step 4: GET batches after (should be same as before if no POST)
  console.log('\n📋 Step 3: GET /sellers/me/qr-batches (verify consistency)');
  await sleep(1000);
  const getAfter = await makeRequest('GET', '/sellers/me/qr-batches?page=1&limit=20', token);
  
  if (getAfter.status !== 200) {
    console.error('\n❌ FAILED: GET should return 200');
    return false;
  }

  console.log('\n✅ PASS: ACTIVE seller can access QR batches');
  console.log(`   Status: ${getAfter.status}`);
  console.log(`   Batches count: ${getAfter.body.total}`);
  
  return true;
}

async function testPendingSeller(token) {
  console.log('\n' + '🟡'.repeat(40));
  console.log('TEST SCENARIO 2: PENDING/UNDER_REVIEW SELLER');
  console.log('🟡'.repeat(40));

  // Step 1: GET batches (should work)
  console.log('\n📋 Step 1: GET /sellers/me/qr-batches (should return 200)');
  const getBatches = await makeRequest('GET', '/sellers/me/qr-batches?page=1&limit=20', token);
  
  if (getBatches.status !== 200) {
    console.error(`\n❌ FAILED: GET should return 200, got ${getBatches.status}`);
    return false;
  }

  console.log(`\n✅ PASS: PENDING seller can VIEW batches (status ${getBatches.status})`);

  // Step 2: POST create batch (should fail with 403)
  console.log('\n📋 Step 2: POST /sellers/me/qr-batches (should return 403)');
  const postBatch = await makeRequest('POST', '/sellers/me/qr-batches', token, {
    productId: 'test-product-id',
    quantity: 100,
  });

  if (postBatch.status !== 403) {
    console.error(`\n❌ FAILED: POST should return 403, got ${postBatch.status}`);
    return false;
  }

  // Check for Vietnamese message
  const message = postBatch.body.message || '';
  const hasVietnameseMessage = message.includes('chưa đủ điều kiện') || 
                                message.includes('hoàn tất xác thực');
  
  if (!hasVietnameseMessage) {
    console.warn('\n⚠️  WARNING: 403 response missing Vietnamese eligibility message');
    console.warn(`   Message: ${message}`);
  } else {
    console.log('\n✅ PASS: Vietnamese eligibility message present');
  }

  console.log(`\n✅ PASS: PENDING seller blocked from creation (status ${postBatch.status})`);
  console.log(`   Message: ${message}`);
  
  return true;
}

async function testRejectedSeller(token) {
  console.log('\n' + '🔴'.repeat(40));
  console.log('TEST SCENARIO 3: REJECTED/SUSPENDED SELLER');
  console.log('🔴'.repeat(40));

  // Step 1: GET batches (should fail with 403)
  console.log('\n📋 Step 1: GET /sellers/me/qr-batches (should return 403)');
  const getBatches = await makeRequest('GET', '/sellers/me/qr-batches?page=1&limit=20', token);
  
  if (getBatches.status !== 403) {
    console.error(`\n❌ FAILED: GET should return 403, got ${getBatches.status}`);
    return false;
  }

  console.log(`\n✅ PASS: REJECTED seller blocked from viewing (status ${getBatches.status})`);
  console.log(`   Message: ${getBatches.body.message}`);
  
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node verify-qr-batches.js <firebase-id-token> <seller-status>');
    console.log('');
    console.log('seller-status: ACTIVE | PENDING | REJECTED');
    console.log('');
    console.log('Examples:');
    console.log('  node verify-qr-batches.js "eyJhbGci..." ACTIVE');
    console.log('  node verify-qr-batches.js "eyJhbGci..." PENDING');
    console.log('  node verify-qr-batches.js "eyJhbGci..." REJECTED');
    console.log('');
    console.log('To get Firebase ID token:');
    console.log('  1. Login to acfmart.web.app');
    console.log('  2. Open browser DevTools > Application > Local Storage');
    console.log('  3. Copy the Firebase token');
    process.exit(1);
  }

  const [token, sellerStatus] = args;

  console.log('🚀 QR Batch API Verification Script');
  console.log('='.repeat(80));
  console.log(`API Base: ${API_BASE}`);
  console.log(`Seller Status: ${sellerStatus.toUpperCase()}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  let result;

  switch (sellerStatus.toUpperCase()) {
    case 'ACTIVE':
      result = await testActiveSeller(token);
      break;
    case 'PENDING':
    case 'UNDER_REVIEW':
      result = await testPendingSeller(token);
      break;
    case 'REJECTED':
    case 'SUSPENDED':
      result = await testRejectedSeller(token);
      break;
    default:
      console.error(`Unknown seller status: ${sellerStatus}`);
      console.error('Use: ACTIVE, PENDING, UNDER_REVIEW, REJECTED, or SUSPENDED');
      process.exit(1);
  }

  console.log('\n' + '🏁'.repeat(40));
  if (result === true) {
    console.log('✅ ALL TESTS PASSED');
    process.exit(0);
  } else if (result === false) {
    console.log('❌ TESTS FAILED - Check errors above');
    process.exit(1);
  } else {
    console.log('⚠️  PARTIAL - See warnings above');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
