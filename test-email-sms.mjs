import fetch from 'node-fetch';

// Test sending both Email and SMS
const testNotification = {
  type: 'booking_confirmation',
  recipient_email: 'exontract@gmail.com',
  recipient_phone: '+15551234567', // Replace with your test phone number
  recipient_name: 'Test User',
  send_email: true,
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

console.log('🚀 Sending test notification (Email + SMS)...\n');
console.log('📧 Email to:', testNotification.recipient_email);
console.log('📱 SMS to:', testNotification.recipient_phone);
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

if (result.email_sent && result.sms_sent) {
  console.log('✅ SUCCESS! Both email and SMS sent!');
  console.log('📬 Check email inbox:', testNotification.recipient_email);
  console.log('📱 Check phone for SMS:', testNotification.recipient_phone);
} else {
  if (result.email_sent) {
    console.log('✅ Email sent successfully');
  } else {
    console.log('❌ Email failed');
  }

  if (result.sms_sent) {
    console.log('✅ SMS sent successfully');
  } else {
    console.log('❌ SMS failed');
  }

  if (result.errors && result.errors.length > 0) {
    console.log('\n❌ Errors:', result.errors);
  }
}
