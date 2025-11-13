import fetch from 'node-fetch';

const RESEND_API_KEY = 're_AeBrvbJ4_L2DjGyFxSzZtGg9mxPtHk8En';

console.log('🔍 Testing Resend API directly...\n');
console.log('API Key:', RESEND_API_KEY.substring(0, 10) + '...');
console.log('Recipient: exontract@gmail.com\n');

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'DropGood <onboarding@resend.dev>',
    to: 'exontract@gmail.com',
    subject: 'Test Email from DropGood',
    html: '<h1>Hello from DropGood!</h1><p>This is a test email.</p>',
  }),
});

console.log('Response Status:', response.status);
console.log('Response Headers:', Object.fromEntries(response.headers));

const result = await response.text();
console.log('Response Body:', result);

if (response.ok) {
  console.log('\n✅ SUCCESS! Email sent');
} else {
  console.log('\n❌ FAILED');
  console.log('\nPossible reasons:');
  console.log('- API key is invalid or expired');
  console.log('- Resend account needs verification');
  console.log('- API key doesn\'t have permission to send emails');
}
