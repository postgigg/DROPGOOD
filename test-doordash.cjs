/**
 * DoorDash API Test Script
 * This script tests your DoorDash credentials by:
 * 1. Generating a JWT token
 * 2. Creating a delivery quote
 * 3. Displaying the results
 */

const crypto = require('crypto');
const https = require('https');

// ==========================================
// CONFIGURATION - Add your credentials here
// ==========================================
const DOORDASH_DEVELOPER_ID = 'f8da6e72-842d-437c-b7a1-b1105a7d3567';
const DOORDASH_KEY_ID = 'de9ef41c-ce95-4150-949d-ee44a12622f7';
const DOORDASH_SIGNING_SECRET = 'ZQbClKDewVeuEgCspPJw8hDj7CwA0ZeUEmtsZUYZshs';

// ==========================================
// JWT Token Generation
// ==========================================
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateJWT() {
  // Header with DoorDash-specific version
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1'
  };

  // Payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'doordash',
    iss: DOORDASH_DEVELOPER_ID,
    kid: DOORDASH_KEY_ID,
    exp: now + 300, // 5 minutes
    iat: now
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  // Sign with HMAC SHA256
  const secret = Buffer.from(DOORDASH_SIGNING_SECRET, 'base64');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${dataToSign}.${signature}`;
}

// ==========================================
// Test Quote Request
// ==========================================
function testDoorDashQuote() {
  console.log('🚀 Testing DoorDash API Credentials...\n');

  // Check if signing secret is set
  if (DOORDASH_SIGNING_SECRET === 'YOUR_SIGNING_SECRET_HERE') {
    console.error('❌ ERROR: Please add your DOORDASH_SIGNING_SECRET to the script');
    console.error('   You can find it in the DoorDash Developer Portal > Credentials');
    process.exit(1);
  }

  // Generate JWT token
  console.log('1️⃣  Generating JWT token...');
  const token = generateJWT();
  console.log('   ✅ Token generated successfully');
  console.log('   Token preview:', token.substring(0, 50) + '...\n');

  // Prepare quote request (using DoorDash's exact format)
  const quoteData = {
    external_delivery_id: `test_${Date.now()}`,
    pickup_address: '901 Market Street 6th Floor San Francisco, CA 94103',
    pickup_phone_number: '+16505555555',
    pickup_business_name: 'Test Pickup Location',
    pickup_instructions: 'Test pickup',
    dropoff_address: '1 Market Street San Francisco, CA 94105',
    dropoff_phone_number: '+16505555555',
    dropoff_business_name: 'Test Dropoff Location',
    dropoff_instructions: 'Test dropoff',
    order_value: 1000 // $10 in cents
  };

  const postData = JSON.stringify(quoteData);

  // Configure HTTPS request
  const options = {
    hostname: 'openapi.doordash.com',
    port: 443,
    path: '/drive/v2/quotes',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('2️⃣  Requesting delivery quote from DoorDash...');
  console.log('   Endpoint: https://openapi.doordash.com/drive/v2/quotes');
  console.log('   Pickup: 901 Market St, San Francisco, CA 94103');
  console.log('   Dropoff: 1 Market St, San Francisco, CA 94105\n');

  // Make request
  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('3️⃣  Response received:');
      console.log('   Status Code:', res.statusCode);
      console.log('   Status Message:', res.statusMessage);
      console.log('\n' + '='.repeat(60));

      if (res.statusCode === 200 || res.statusCode === 201) {
        try {
          const quote = JSON.parse(responseData);
          console.log('✅ SUCCESS! DoorDash API credentials are working!\n');
          console.log('📋 Quote Details:');
          console.log('   Quote ID:', quote.id || quote.external_delivery_id);
          console.log('   Fee:', quote.fee ? `$${(quote.fee / 100).toFixed(2)}` : 'N/A');
          console.log('   Currency:', quote.currency_code || 'USD');
          console.log('   Pickup ETA:', quote.pickup_time_estimated || 'N/A');
          console.log('   Dropoff ETA:', quote.dropoff_time_estimated || 'N/A');
          console.log('   Expires:', quote.expires || 'N/A');
          console.log('\n📦 Full Response:');
          console.log(JSON.stringify(quote, null, 2));
          console.log('\n' + '='.repeat(60));
          console.log('✅ Your DoorDash credentials are valid!');
          console.log('✅ You can now proceed with the full integration deployment.');
        } catch (e) {
          console.log('Response Data:', responseData);
          console.error('Error parsing JSON:', e.message);
        }
      } else {
        console.log('❌ ERROR: Request failed\n');
        console.log('Response Body:');
        console.log(responseData);
        console.log('\n' + '='.repeat(60));

        if (res.statusCode === 401) {
          console.log('❌ AUTHENTICATION FAILED');
          console.log('   Possible issues:');
          console.log('   1. Signing secret is incorrect');
          console.log('   2. Developer ID is incorrect');
          console.log('   3. Key ID is incorrect');
          console.log('   4. Check your credentials in DoorDash Developer Portal');
        } else if (res.statusCode === 403) {
          console.log('❌ FORBIDDEN');
          console.log('   You may not have production access yet.');
          console.log('   Make sure you\'re using sandbox credentials or have been approved for production.');
        } else if (res.statusCode === 400) {
          console.log('❌ BAD REQUEST');
          console.log('   The request format may be incorrect.');
          console.log('   This could mean the API expects different parameters.');
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.write(postData);
  req.end();
}

// ==========================================
// Run Test
// ==========================================
testDoorDashQuote();
