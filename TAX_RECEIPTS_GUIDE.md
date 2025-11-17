# Tax-Deductible Donation Receipts - Complete Guide

## Overview

DropGood provides IRS-compliant 501(c)(3) donation receipts for all completed pickups. This system ensures donors have the proper documentation needed to claim tax deductions.

## IRS Compliance

Our receipts meet all IRS requirements per Publication 1771 and Publication 526:

### Required Information Included:
- ✅ **Organization Details**: Name, address, EIN/Tax ID of the 501(c)(3) organization
- ✅ **Donor Information**: Name, address, contact information
- ✅ **Donation Date**: Date items were picked up/donated
- ✅ **Receipt Issued Date**: Contemporaneous acknowledgment
- ✅ **Item Description**: Detailed list of donated items
- ✅ **Fair Market Value**: Good faith estimate of donation value
- ✅ **Goods/Services Statement**: Required IRS disclosure
- ✅ **Tax-Deductible Amount**: Clear calculation
- ✅ **Important Tax Notices**: IRS filing requirements

### Valuation Guidelines

We estimate fair market value using a **simple bags/boxes method** based on Salvation Army and Goodwill industry standards:

- **Bags:** $30 per bag (typical clothing/household items)
- **Boxes:** $40 per box (typical mixed household goods)

**Example Calculation:**
- 3 bags + 2 boxes = (3 × $30) + (2 × $40) = **$170 estimated value**

**Valuation Breakdown on Receipt:**
Your receipt will show:
```
Items Donated:
• 3 bags of household donations    3 × $30 = $90
• 2 boxes of household donations   2 × $40 = $80

Estimated Fair Market Value:       $170.00
```

**Important Legal Notes:**
- Values are **conservative estimates** based on industry standards
- **You (the donor) are responsible** for determining final fair market value
- Estimates assume items in **good condition**
- You can adjust values based on actual condition and types of your items
- For donations over $500, file IRS Form 8283
- For donations over $5,000, obtain a qualified appraisal
- Consult your tax advisor for specific guidance
- See IRS Publication 561 for detailed valuation guidance

## How It Works

### 1. Automatic Generation
When a booking is confirmed, a receipt is automatically generated via the `generate-receipt` edge function.

### 2. Access Points
Donors can access their receipt from:
- **Confirmation Page**: Link shown immediately after booking
- **Tracking Page**: Prominent "Tax Deduction Receipt" section
- **Direct URL**: `/receipt/[receipt-number]` format

### 3. Receipt Features
- Print-friendly format
- Save as PDF capability (via browser print function)
- Professional layout suitable for tax records
- Unique receipt number (DR-YYYY-XXXXXX)

## Tracking Page Features

The tracking page (`/track/[booking-id]`) provides:

### 1. Tax Deduction Receipt
- Download/print IRS-compliant receipt
- View estimated fair market value
- Access receipt number for records

### 2. Delivery Confirmation
- Photo proof of delivery
- Delivery timestamp
- Confirmation details

### 3. Booking Details
- Pickup status tracking
- Scheduled time and location
- Donation center information

## SMS Notifications

Donors receive an SMS with tracking link immediately after booking:
```
DropGood: Your pickup is confirmed! Track your donation and access receipts: [tracking-link]
```

## Database Schema

### `donation_receipts` Table
Stores all receipt information:
- Unique receipt numbers
- Links to bookings and donation centers
- Complete donor information
- Item details and valuations
- Goods/services disclosures
- Timestamps for IRS compliance

## Important Tax Information

### For Donors:
1. Keep receipts with tax records
2. For non-cash donations over $500, file Form 8283
3. For property over $5,000, obtain qualified appraisal
4. Donations only deductible if you itemize deductions
5. Consult tax advisor for specific guidance

### For Donation Centers:
1. Must be registered 501(c)(3) organization
2. Must provide accurate Tax ID/EIN
3. Must verify 501(c)(3) status is active
4. Receipts issued in organization's name

## Receipt Number Format

Format: `DR-YYYY-XXXXXX`
- `DR`: DropGood Receipt prefix
- `YYYY`: Year (e.g., 2025)
- `XXXXXX`: Sequential number (000001, 000002, etc.)

Example: `DR-2025-000042`

## Print/PDF Instructions

To save receipt as PDF:
1. Click "Print / Save PDF" button
2. In print dialog, select "Save as PDF" as destination
3. Save to preferred location
4. Store with tax records

## Support

For receipt questions:
- Email: support@dropgood.com
- Phone: Listed on receipt
- Donation center contact: Shown on receipt

## Future Enhancements

Planned features:
- Email delivery of receipts
- Automatic email reminders at tax time
- Multi-year receipt summaries
- Integration with tax software APIs
