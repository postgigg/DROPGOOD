// DropGood SMS Templates - Concise & Consistent

export function bookingConfirmationSMS(data: {
  donor_name: string;
  donation_center_name: string;
  pickup_date: string;
  pickup_time: string;
  total_price: number;
  tracking_url?: string;
}): string {
  return `DropGood: Hi ${data.donor_name}! Your donation pickup is confirmed for ${data.pickup_date} at ${data.pickup_time}. Going to ${data.donation_center_name}. Total: $${data.total_price.toFixed(2)}${data.tracking_url ? `. Track: ${data.tracking_url}` : ''}`;
}

export function pickupReminderSMS(data: {
  donor_name: string;
  pickup_time: string;
}): string {
  return `DropGood: Hi ${data.donor_name}! Reminder: Your donation pickup is tomorrow at ${data.pickup_time}. We'll text when the driver is 15 mins away. Have items ready!`;
}

export function driverEnRouteSMS(data: {
  donor_name: string;
  driver_name?: string;
  eta_minutes: number;
  driver_phone?: string;
  tracking_url?: string;
}): string {
  const driverInfo = data.driver_name ? ` (${data.driver_name})` : '';
  const contactInfo = data.driver_phone ? ` Driver: ${data.driver_phone}.` : '';
  const trackInfo = data.tracking_url ? ` Track: ${data.tracking_url}` : '';

  return `DropGood: Hi ${data.donor_name}! Your driver${driverInfo} is ${data.eta_minutes} mins away!${contactInfo}${trackInfo}`;
}

export function driverArrivedSMS(data: {
  donor_name: string;
  driver_name?: string;
}): string {
  const driverInfo = data.driver_name ? ` (${data.driver_name})` : '';
  return `DropGood: Your driver${driverInfo} has arrived! They're ready to pick up your donation.`;
}

export function pickupCompletedSMS(data: {
  donor_name: string;
  donation_center_name: string;
  tracking_url?: string;
}): string {
  const trackInfo = data.tracking_url ? ` Track delivery: ${data.tracking_url}` : '';
  return `DropGood: Items picked up! On the way to ${data.donation_center_name}.${trackInfo}`;
}

export function deliveryCompletedSMS(data: {
  donor_name: string;
  donation_center_name: string;
}): string {
  return `DropGood: Your donation was delivered to ${data.donation_center_name}! Tax receipt will be emailed from them. Thanks for making a difference! 🎉`;
}

export function deliveryCanceledSMS(data: {
  donor_name: string;
  reason?: string;
  refund_amount?: number;
}): string {
  const reasonText = data.reason ? ` Reason: ${data.reason}.` : '';
  const refundText = data.refund_amount ? ` Refund of $${data.refund_amount.toFixed(2)} will be processed.` : '';
  return `DropGood: Hi ${data.donor_name}, your pickup was canceled.${reasonText}${refundText} Book again anytime!`;
}

export function deliveryIssueSMS(data: {
  donor_name: string;
  issue: string;
}): string {
  return `DropGood: Hi ${data.donor_name}, there's an issue with your delivery: ${data.issue}. Our team will contact you shortly. Call us: +1-555-555-1234`;
}

// Helper to ensure SMS is under 160 characters (or splits properly)
export function validateSMSLength(message: string): { valid: boolean; segments: number } {
  const length = message.length;
  const segments = Math.ceil(length / 160);
  return {
    valid: length <= 160,
    segments,
  };
}

// Format phone number for SMS (E.164 format)
export function formatPhoneForSMS(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Add +1 for US numbers if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // Already formatted or international
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  return `+${cleaned}`;
}
