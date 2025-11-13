import fetch from 'node-fetch';

// Test sending SMS only to +15403930258
const testNotification = {
  type: 'booking_confirmation',
  recipient_email: 'exontract@gmail.com',
  recipient_phone: '+15403930258',
  recipient_name: 'Test User',
  send_email: false,  // Only SMS for this test
  send_sms: true,
  data: {
    donor_name: 'Test User',
    donation_center_name: 'Goodwill Bailey Bridge Store',
    pickup_date: 'November 13, 2025',
    pickup_time: '2:00 PM - 4:00 PM',
    total_price: 21.80,
    tracking_url: 'http://localhost:5173/track/DG-1762912796704-TEST123'
  }
};

console.log('📱 Sending test SMS...\n');
console.log('From: +1 (857) 219-3529 (Twilio)');
console.log('To: +1 (540) 393-0258');
console.log('');

const response = await fetch(
  'https://lyftztgccfslwmdgpslt.supabase.co/functions/v1/send-notification',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjcyOTAsImV4cCI6MjA3Nzg0MzI5MH0.gFsnv1ClJydMzjHZyc9T_TY3kkjwGaf3KQdLjbY7GY4',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testNotification)
  }
);

const result = await response.json();

console.log('Response Status:', response.status);
console.log('Result:', JSON.stringify(result, null, 2));
console.log('');

if (result.sms_sent) {
  console.log('✅ SUCCESS! SMS sent to +1 (540) 393-0258');
  console.log('📱 Check your phone for the message!');
  console.log('');
  console.log('Message preview:');
  console.log('DropGood: Hi Test User! Your donation pickup is confirmed for November 13, 2025 at 2:00 PM - 4:00 PM...');
} else {
  console.log('❌ SMS failed to send');
  if (result.errors && result.errors.length > 0) {
    console.log('❌ Errors:', result.errors);
  }
}
