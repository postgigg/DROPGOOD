import fetch from 'node-fetch';

const testNotification = {
  type: 'booking_confirmation',
  recipient_email: 'exontract@gmail.com',
  recipient_name: 'Test User',
  send_email: true,
  send_sms: false,
  data: {
    donor_name: 'Test User',
    booking_id: 'DG-1762912796704-TEST123',
    donation_center_name: 'Goodwill Bailey Bridge Store',
    pickup_address: '11635 East Briar Patch Drive, Midlothian, VA',
    pickup_date: 'November 13, 2025',
    pickup_time: '2:00 PM - 4:00 PM',
    total_price: 21.80,
    tracking_url: 'http://localhost:5173/track/DG-1762912796704-TEST123'
  }
};

console.log('🚀 Sending test notification to exontract@gmail.com...\n');

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

console.log('📧 Response status:', response.status);
console.log('📊 Result:', JSON.stringify(result, null, 2));

if (result.email_sent) {
  console.log('\n✅ SUCCESS! Email sent to exontract@gmail.com');
  console.log('📬 Check your inbox for the Uber-style dark theme email!');
} else {
  console.log('\n❌ Email failed to send to exontract@gmail.com');
  if (result.errors && result.errors.length > 0) {
    console.log('❌ Errors:', result.errors);
    console.log('\n💡 To enable sending to any email:');
    console.log('   1. Go to https://resend.com/domains');
    console.log('   2. Add and verify your domain (e.g., dropgood.com)');
    console.log('   3. Update sender from onboarding@resend.dev to notifications@yourdomain.com');
  }
}
