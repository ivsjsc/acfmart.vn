/**
 * Diagnostic script to capture KYC status API response
 * Run this in browser console on the seller verification page
 * 
 * Usage:
 * 1. Login to acfmart.store as the affected seller
 * 2. Navigate to /seller/kyc
 * 3. Open browser DevTools console
 * 4. Paste and run this script
 */

(async function diagnoseKycStatus() {
  console.log('=== ACFMart KYC Status Diagnostic ===\n');
  
  try {
    // Call the KYC status endpoint
    const response = await fetch('https://api.acfmart.vn/v1/sellers/me/kyc/status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Authorization header will be added automatically by browser
        // as the user is already authenticated
      },
      credentials: 'include'
    });

    console.log('Endpoint: GET https://api.acfmart.vn/v1/sellers/me/kyc/status');
    console.log('Status Code:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
    });

    const data = await response.json();
    
    console.log('\n=== API Response Payload (Sanitized) ===');
    
    // Sanitize sensitive fields
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['tokenId', 'tokenKey', 'accessToken', 'sdkConfig'];
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) sanitized[key] = '[REDACTED]';
      if (sanitized.sdkConfig && sanitized.sdkConfig[key]) {
        sanitized.sdkConfig[key] = '[REDACTED]';
      }
    });

    console.log(JSON.stringify(sanitized, null, 2));

    console.log('\n=== Key Status Fields ===');
    console.log('sellerFinalStatus:', data.sellerFinalStatus);
    console.log('sellerKycStatus:', data.sellerKycStatus);
    console.log('sellerStatus:', data.sellerStatus);
    console.log('finalStatus:', data.finalStatus);
    console.log('kycStatus:', data.kycStatus);
    console.log('latestVnptSessionStatus:', data.latestVnptSessionStatus);
    console.log('adminManualReviewState:', data.adminManualReviewState);
    console.log('manualReviewState:', data.manualReviewState);
    
    if (data.latestVnptSession) {
      console.log('\n=== Latest VNPT Session ===');
      console.log('Session ID:', data.latestVnptSession.sessionId || data.latestVnptSession.id);
      console.log('Status:', data.latestVnptSession.status);
      console.log('Provider Status:', data.latestVnptSession.providerStatus);
      console.log('Created At:', data.latestVnptSession.createdAt);
      console.log('Updated At:', data.latestVnptSession.updatedAt);
    }

    console.log('\n=== Diagnostic Complete ===');
    console.log('Please copy this output and share with the development team.');
    
  } catch (error) {
    console.error('Error fetching KYC status:', error.message);
    console.error('Full error:', error);
  }
})();
