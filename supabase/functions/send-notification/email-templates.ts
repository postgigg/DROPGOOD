// DropGood Email Templates - Uber-style Dark Theme

const BRAND_COLORS = {
  primary: '#FFFFFF',
  accent: '#22C55E',       // green-500
  background: '#000000',   // black
  surface: '#111827',      // gray-900
  card: '#1F2937',         // gray-800
  border: '#374151',       // gray-700
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB', // gray-300
  textMuted: '#9CA3AF',    // gray-400
};

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DropGood</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${BRAND_COLORS.background};
      line-height: 1.6;
      color: ${BRAND_COLORS.textPrimary};
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.background};
    }
    .header {
      background-color: ${BRAND_COLORS.surface};
      padding: 24px;
      border-bottom: 1px solid ${BRAND_COLORS.border};
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: ${BRAND_COLORS.textPrimary};
      margin: 0;
    }
    .content {
      padding: 32px 24px;
      color: ${BRAND_COLORS.textPrimary};
    }
    .button {
      display: inline-block;
      background-color: ${BRAND_COLORS.primary};
      color: ${BRAND_COLORS.background} !important;
      padding: 12px 28px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #E5E7EB;
    }
    .card {
      background-color: ${BRAND_COLORS.card};
      border: 1px solid ${BRAND_COLORS.border};
      padding: 24px;
      margin: 24px 0;
      border-radius: 16px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid ${BRAND_COLORS.border};
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 500;
      color: ${BRAND_COLORS.textMuted};
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-weight: 700;
      color: ${BRAND_COLORS.textPrimary};
      text-align: right;
      font-size: 15px;
    }
    .footer {
      background-color: ${BRAND_COLORS.surface};
      padding: 24px;
      text-align: center;
      color: ${BRAND_COLORS.textMuted};
      font-size: 14px;
      border-top: 1px solid ${BRAND_COLORS.border};
    }
    .footer-links {
      margin: 16px 0;
    }
    .footer-link {
      color: ${BRAND_COLORS.textSecondary};
      text-decoration: none;
      margin: 0 12px;
    }
    h1 {
      color: ${BRAND_COLORS.textPrimary};
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 16px 0;
      line-height: 1.2;
    }
    h2 {
      color: ${BRAND_COLORS.textPrimary};
      font-size: 18px;
      font-weight: 700;
      margin: 32px 0 16px 0;
    }
    p {
      margin: 16px 0;
      color: ${BRAND_COLORS.textSecondary};
      font-size: 15px;
    }
    .highlight {
      color: ${BRAND_COLORS.textPrimary};
      font-weight: 700;
    }
    .price {
      font-size: 24px;
      font-weight: 700;
      color: ${BRAND_COLORS.textPrimary};
    }
    .success-badge {
      background: linear-gradient(135deg, ${BRAND_COLORS.accent}, #16A34A);
      padding: 20px;
      border-radius: 16px;
      text-align: center;
      margin: 24px 0;
    }
    .timeline-item {
      display: flex;
      gap: 16px;
      margin: 16px 0;
    }
    .timeline-dot {
      width: 10px;
      height: 10px;
      background-color: ${BRAND_COLORS.accent};
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
          <rect x="10" y="14" width="12" height="10" rx="1.5" fill="white" opacity="0.9"/>
          <path d="M16 20.5C16 20.5 13 18.5 13 17C13 15.8 13.8 15 14.5 15C15.2 15 16 15.5 16 15.5C16 15.5 16.8 15 17.5 15C18.2 15 19 15.8 19 17C19 18.5 16 20.5 16 20.5Z" fill="#3B82F6"/>
          <circle cx="12" cy="11" r="1.2" fill="white"/>
          <circle cx="16" cy="8" r="1.2" fill="white"/>
          <circle cx="20" cy="11" r="1.2" fill="white"/>
          <path d="M11 24 Q 16 4, 21 24" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.3"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#3B82F6"/>
              <stop offset="100%" stop-color="#2563EB"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="brand-name">DropGood</span>
      </div>
    </div>
    ${content}
    <div class="footer">
      <p style="color: ${BRAND_COLORS.textSecondary};"><strong>Questions?</strong> We're here to help</p>
      <div class="footer-links">
        <a href="mailto:support@dropgood.co" class="footer-link">Email Support</a>
        <span style="color: ${BRAND_COLORS.border};">•</span>
        <a href="tel:+15555551234" class="footer-link">Call Us</a>
      </div>
      <p style="margin-top: 24px; color: ${BRAND_COLORS.textMuted}; font-size: 12px;">
        © ${new Date().getFullYear()} DropGood. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function bookingConfirmationEmail(data: {
  donor_name: string;
  booking_id: string;
  donation_center_name: string;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  total_price: number;
  tracking_url?: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div class="success-badge">
        <div style="font-size: 40px; margin-bottom: 8px;">✓</div>
        <h1 style="margin: 0; color: white; font-size: 24px;">Pickup Scheduled</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your donation is on its way to making a difference</p>
      </div>

      <p>Hi <strong>${data.donor_name}</strong>,</p>

      <p>Your pickup has been confirmed. We'll send you updates via SMS.</p>

      <div class="card">
        <div class="info-row">
          <span class="info-label">Confirmation</span>
          <span class="info-value">#${data.booking_id.substring(3, 13)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${data.pickup_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time Window</span>
          <span class="info-value">${data.pickup_time}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pickup</span>
          <span class="info-value">${data.pickup_address}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dropoff</span>
          <span class="info-value">${data.donation_center_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total</span>
          <span class="price">$${data.total_price.toFixed(2)}</span>
        </div>
      </div>

      ${data.tracking_url ? `
      <div style="text-align: center;">
        <a href="${data.tracking_url}" class="button">Track Pickup</a>
      </div>
      ` : ''}

      <h2>What to Expect</h2>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">Courier en route</strong>
          <p style="margin: 4px 0 0 0;">We'll text you 30 minutes before pickup</p>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">Pickup</strong>
          <p style="margin: 4px 0 0 0;">Items collected during your window</p>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">Delivered</strong>
          <p style="margin: 4px 0 0 0;">You'll receive photo proof and tax receipt</p>
        </div>
      </div>

      <p style="margin-top: 32px;">Thanks,<br><strong>DropGood</strong></p>
    </div>
  `;

  return {
    subject: `Pickup Scheduled - ${data.pickup_date}`,
    html: emailWrapper(content),
  };
}

export function pickupReminderEmail(data: {
  donor_name: string;
  donation_center_name: string;
  pickup_time: string;
  pickup_address: string;
  items: string[];
  tracking_url?: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>🚗 Your Pickup is Tomorrow!</h1>

      <p>Hey ${data.donor_name},</p>

      <p>Quick reminder: your donation pickup is scheduled for <strong class="highlight">tomorrow at ${data.pickup_time}</strong>.</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Pickup Details</h3>
        <p><strong>When:</strong> Tomorrow, ${data.pickup_time}</p>
        <p><strong>Where:</strong> ${data.pickup_address}</p>
        <p><strong>Going to:</strong> ${data.donation_center_name}</p>
      </div>

      <h2>📦 Items to be picked up:</h2>
      <ul style="margin: 16px 0; padding-left: 24px;">
        ${data.items.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
      </ul>

      ${data.tracking_url ? `
      <div style="text-align: center;">
        <a href="${data.tracking_url}" class="button">Track Your Pickup</a>
      </div>
      ` : ''}

      <div style="background-color: #DBEAFE; border-left: 4px solid ${BRAND_COLORS.primary}; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #1E40AF;">
          <strong>🔔 Tomorrow:</strong> We'll text you when the driver is 15 minutes away!
        </p>
      </div>

      <h2>Quick checklist:</h2>
      <p>
        ✅ Items are ready at pickup location<br>
        ✅ Phone is on for driver texts<br>
        ✅ Someone will be available during pickup window
      </p>

      <p style="margin-top: 32px;">See you tomorrow!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `🚗 Reminder: Pickup Tomorrow at ${data.pickup_time}`,
    html: emailWrapper(content),
  };
}

export function pickupEnRouteEmail(data: {
  donor_name: string;
  driver_name?: string;
  driver_phone?: string;
  eta_minutes: number;
  tracking_url: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>🚗 Driver on the way!</h1>

      <p>Hey ${data.donor_name},</p>

      <p><strong class="highlight">Your driver ${data.driver_name ? `(${data.driver_name})` : ''} will arrive in about ${data.eta_minutes} minutes!</strong></p>

      ${data.driver_phone ? `
      <div class="info-box">
        <p style="margin: 0;"><strong>Driver contact:</strong> <a href="tel:${data.driver_phone}" style="color: ${BRAND_COLORS.primary};">${data.driver_phone}</a></p>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${data.tracking_url}" class="button">Track Driver Live</a>
      </div>

      <div style="background-color: #DBEAFE; border-left: 4px solid ${BRAND_COLORS.primary}; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #1E40AF;">
          <strong>💡 Tip:</strong> Have your items ready at the door or garage for quick loading!
        </p>
      </div>

      <p>Thanks for your donation!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `🚗 Driver arriving in ${data.eta_minutes} minutes!`,
    html: emailWrapper(content),
  };
}

export function deliveryCompletedEmail(data: {
  donor_name: string;
  donation_center_name: string;
  donation_center_email?: string;
  items: string[];
  delivered_at: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>✅ Donation Delivered!</h1>

      <p>Hey ${data.donor_name},</p>

      <p>Great news! Your donation was successfully delivered to <strong class="highlight">${data.donation_center_name}</strong>.</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Donation Summary</h3>
        <p><strong>Delivered to:</strong> ${data.donation_center_name}</p>
        <p><strong>Delivered at:</strong> ${data.delivered_at}</p>
        <p><strong>Items donated:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <h2>📝 Tax Receipt</h2>
      <p>${data.donation_center_name} will email you a tax receipt for your donation. ${data.donation_center_email ? `If you don't receive it within 24 hours, contact them at <a href="mailto:${data.donation_center_email}" style="color: ${BRAND_COLORS.primary};">${data.donation_center_email}</a>` : 'Contact them directly if you have questions about your receipt.'}</p>

      <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 32px 0; text-align: center;">
        <p style="font-size: 24px; margin: 0 0 8px 0;">🎉</p>
        <p style="margin: 0; color: #065F46; font-size: 18px; font-weight: 700;">Thank you for making a difference!</p>
        <p style="margin: 8px 0 0 0; color: #047857;">Your donation helps support our community.</p>
      </div>

      <h2>How was your experience?</h2>
      <p>We'd love to hear your feedback to help us improve.</p>

      <div style="text-align: center;">
        <a href="mailto:feedback@dropgood.co?subject=Feedback" class="button">Share Feedback</a>
      </div>

      <p style="margin-top: 32px;">Thanks for using DropGood!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `✅ Your donation has been delivered!`,
    html: emailWrapper(content),
  };
}

export function deliveryCanceledEmail(data: {
  donor_name: string;
  booking_id: string;
  reason?: string;
  refund_amount?: number;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>❌ Pickup Canceled</h1>

      <p>Hey ${data.donor_name},</p>

      <p>Your donation pickup (ID: ${data.booking_id.substring(0, 8).toUpperCase()}) has been canceled.</p>

      ${data.reason ? `
      <div class="info-box">
        <p><strong>Reason:</strong> ${data.reason}</p>
      </div>
      ` : ''}

      ${data.refund_amount ? `
      <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #065F46;">
          <strong>💰 Refund:</strong> $${data.refund_amount.toFixed(2)} will be credited to your account within 5-7 business days.
        </p>
      </div>
      ` : ''}

      <h2>Want to reschedule?</h2>
      <p>You can book a new pickup anytime that works for you.</p>

      <div style="text-align: center;">
        <a href="https://dropgood.co/book" class="button">Book New Pickup</a>
      </div>

      <p style="margin-top: 32px;">Questions? We're here to help!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `Pickup Canceled - ${data.booking_id.substring(0, 8).toUpperCase()}`,
    html: emailWrapper(content),
  };
}

export function newCharitySubmissionEmail(data: {
  charity_name: string;
  address: string;
  city: string;
  state: string;
  submitted_by_user: boolean;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>🏢 New Charity Submission</h1>

      <p>A user has submitted a new charity to the platform that needs review and activation.</p>

      <div class="info-box">
        <p><strong>Charity Name:</strong> ${data.charity_name}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>City:</strong> ${data.city}, ${data.state}</p>
        <p><strong>Source:</strong> ${data.submitted_by_user ? 'User-submitted' : 'System'}</p>
      </div>

      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0; color: #92400E;">
        <p style="margin: 0;">
          <strong>⚠️ Action Required:</strong> This charity is currently set to <strong>inactive</strong> and needs admin approval before it appears in live searches.
        </p>
      </div>

      <h2>Next Steps:</h2>
      <ol>
        <li>Verify the charity exists at this location</li>
        <li>Confirm they accept donations</li>
        <li>Activate the charity in the admin dashboard</li>
      </ol>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://dropgood.co/admin/operations" class="button">Go to Admin Dashboard</a>
      </div>

      <p style="margin-top: 32px;">
        <strong>The DropGood System</strong>
      </p>
    </div>
  `;

  return {
    subject: `🏢 New Charity: ${data.charity_name}`,
    html: emailWrapper(content),
  };
}

export function newChatMessageEmail(data: {
  session_id: string;
  visitor_name: string;
  message_text: string;
  has_image: boolean;
  timestamp: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1>💬 New Chat Message</h1>

      <p>You have a new support chat message from a visitor.</p>

      <div class="info-box">
        <p><strong>Visitor:</strong> ${data.visitor_name}</p>
        <p><strong>Session ID:</strong> ${data.session_id.substring(0, 8).toUpperCase()}</p>
        <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      </div>

      <div style="background-color: #1F2937; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #E5E7EB; font-style: italic;">
          "${data.message_text}"
        </p>
        ${data.has_image ? '<p style="margin-top: 8px; color: #9CA3AF; font-size: 14px;">📎 Image attached</p>' : ''}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://dropgood.co/admin/operations" class="button">View in Admin Dashboard</a>
      </div>

      <p style="margin-top: 32px;">
        <strong>The DropGood System</strong>
      </p>
    </div>
  `;

  return {
    subject: `💬 New Chat Message from ${data.visitor_name}`,
    html: emailWrapper(content),
  };
}

export function driverJobAvailableEmail(data: {
  driver_name: string;
  job_id: string;
  pickup_city: string;
  pickup_state: string;
  distance_miles: number;
  items_count: number;
  scheduled_date?: string;
  scheduled_time?: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div class="success-badge">
        <div style="font-size: 40px; margin-bottom: 8px;">🚚</div>
        <h1 style="margin: 0; color: white; font-size: 24px;">New Delivery Job Available!</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">A pickup job near you is ready</p>
      </div>

      <p>Hi <strong>${data.driver_name}</strong>,</p>

      <p>Great news! There's a new delivery opportunity available in your area.</p>

      <div class="card">
        <div class="info-row">
          <span class="info-label">Job ID</span>
          <span class="info-value">#${data.job_id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value">${data.pickup_city}, ${data.pickup_state}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Distance</span>
          <span class="info-value">${data.distance_miles.toFixed(1)} miles</span>
        </div>
        <div class="info-row">
          <span class="info-label">Items to Deliver</span>
          <span class="info-value">${data.items_count} ${data.items_count === 1 ? 'bag/box' : 'bags/boxes'}</span>
        </div>
        ${data.scheduled_date && data.scheduled_time ? `
        <div class="info-row">
          <span class="info-label">Pickup Time</span>
          <span class="info-value">${data.scheduled_date} at ${data.scheduled_time}</span>
        </div>
        ` : ''}
      </div>

      <div style="background-color: rgba(34, 197, 94, 0.15); border: 2px solid rgba(34, 197, 94, 0.4); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
        <h3 style="margin: 0 0 8px 0; color: #22c55e; font-size: 20px; font-weight: bold;">$10.00 Guaranteed Tip</h3>
        <p style="margin: 0; color: ${BRAND_COLORS.textSecondary}; font-size: 14px;">
          This delivery includes a pre-paid $10 tip. 100% goes to you!
        </p>
      </div>

      <h2>How to Accept This Job</h2>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">1. Open Your Uber Driver App</strong>
          <p style="margin: 4px 0 0 0;">Make sure you have the latest version installed</p>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">2. Enable Uber Direct</strong>
          <p style="margin: 4px 0 0 0;">Go to Settings → Preferences → Turn on "Uber Direct" or "Package Delivery"</p>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong style="color: ${BRAND_COLORS.textPrimary};">3. Accept the Request</strong>
          <p style="margin: 4px 0 0 0;">The job will appear in your app. Accept it to start earning!</p>
        </div>
      </div>

      <div style="background-color: ${BRAND_COLORS.card}; border-left: 4px solid ${BRAND_COLORS.accent}; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: ${BRAND_COLORS.textSecondary};">
          <strong>💡 Important:</strong> You must have Uber Direct delivery mode enabled in your Uber Driver app
          to see and accept these delivery requests. These jobs help people donate to local charities!
        </p>
      </div>

      <p style="margin-top: 32px;">Happy delivering!</p>
      <p><strong>The DropGood Team</strong></p>

      <p style="margin-top: 32px; font-size: 12px; color: ${BRAND_COLORS.textMuted};">
        You're receiving this email because you signed up for job notifications at DropGood.
        <a href="https://dropgood.co/driver-board/unsubscribe" style="color: ${BRAND_COLORS.textSecondary};">Unsubscribe</a>
      </p>
    </div>
  `;

  return {
    subject: `🚚 New Job Available in ${data.pickup_city} - ${data.items_count} ${data.items_count === 1 ? 'item' : 'items'}`,
    html: emailWrapper(content),
  };
}

export function taxReceiptEmail(data: {
  customer_name: string;
  receipt_number: string;
  donation_date: string;
  charity_name: string;
  charity_ein: string;
  charity_address: string;
  items_description: string;
  estimated_value: number;
  receipt_url: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div class="success-badge">
        <div style="font-size: 40px; margin-bottom: 8px;">📄</div>
        <h1 style="margin: 0; color: white; font-size: 24px;">Your Tax Receipt is Ready</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Official donation receipt for tax purposes</p>
      </div>

      <p>Hi <strong>${data.customer_name}</strong>,</p>

      <p>Thank you for your generous donation! Your official tax receipt is now available.</p>

      <div class="card">
        <div class="info-row">
          <span class="info-label">Receipt Number</span>
          <span class="info-value">${data.receipt_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Donation Date</span>
          <span class="info-value">${data.donation_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Charity</span>
          <span class="info-value">${data.charity_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">EIN</span>
          <span class="info-value">${data.charity_ein}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Items Donated</span>
          <span class="info-value">${data.items_description}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Value</span>
          <span class="price" style="color: ${BRAND_COLORS.accent};">$${data.estimated_value.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.receipt_url}" class="button">Download Receipt</a>
      </div>

      <div style="background-color: ${BRAND_COLORS.card}; border-left: 4px solid ${BRAND_COLORS.accent}; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: ${BRAND_COLORS.textSecondary};">
          <strong>💡 For Your Records:</strong> This receipt is provided by ${data.charity_name} (EIN: ${data.charity_ein}),
          a 501(c)(3) tax-exempt organization. Save this receipt for your tax filings.
        </p>
      </div>

      <p style="margin-top: 32px;">Thank you for making a difference in your community!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `📄 Your Tax Receipt - ${data.charity_name}`,
    html: emailWrapper(content),
  };
}

export function donationSummaryEmail(data: {
  customer_name: string;
  receipt_number: string;
  donation_date: string;
  charity_name: string;
  charity_address: string;
  items_description: string;
  estimated_value: number;
  receipt_url: string;
}): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div class="success-badge">
        <div style="font-size: 40px; margin-bottom: 8px;">📋</div>
        <h1 style="margin: 0; color: white; font-size: 24px;">Donation Summary</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Record of your generous donation</p>
      </div>

      <p>Hi <strong>${data.customer_name}</strong>,</p>

      <p>Thank you for your donation! Here's a summary of your contribution to ${data.charity_name}.</p>

      <div class="card">
        <div class="info-row">
          <span class="info-label">Reference Number</span>
          <span class="info-value">${data.receipt_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Donation Date</span>
          <span class="info-value">${data.donation_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Charity</span>
          <span class="info-value">${data.charity_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value">${data.charity_address}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Items Donated</span>
          <span class="info-value">${data.items_description}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Value</span>
          <span class="info-value">$${data.estimated_value.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.receipt_url}" class="button">View Summary</a>
      </div>

      <div style="background-color: ${BRAND_COLORS.card}; border-left: 4px solid ${BRAND_COLORS.accent}; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: ${BRAND_COLORS.textSecondary};">
          <strong>📝 Note:</strong> This is a donation summary for your records. For an official tax receipt,
          please contact ${data.charity_name} directly. They may be able to provide a receipt for your donation.
        </p>
      </div>

      <p style="margin-top: 32px;">Thank you for making a difference!</p>
      <p><strong>The DropGood Team</strong></p>
    </div>
  `;

  return {
    subject: `📋 Donation Summary - ${data.charity_name}`,
    html: emailWrapper(content),
  };
}
