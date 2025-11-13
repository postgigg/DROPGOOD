# Stripe Integration for Company Credit Purchases

## ✅ Completed

### Payment Processing
- **Stripe.js loaded** in `index.html` globally
- **Payment Intent creation** via `create-payment-intent` edge function
- **5% processing fee** automatically calculated and added to total
- **$500 minimum** credit purchase enforced

### Database
- **`company_transactions` table created** with:
  - Transaction tracking (credit_added, booking_charge, refund)
  - Processing fee tracking
  - Stripe payment intent ID storage
  - Company-specific RLS policies

### Billing Page Features
- Real-time cost calculation showing:
  - Credit amount
  - Processing fee (5%)
  - Total charge
- Quick select buttons: $500, $1000, $2500, $5000, $10000, $25000
- Transaction history display
- Current balance display

## Payment Flow

1. User selects credit amount (minimum $500)
2. System calculates 5% processing fee
3. Total = Credit Amount + (Credit Amount × 0.05)
4. Stripe Payment Intent created via edge function
5. Payment processed through Stripe
6. Credits added to company balance
7. Transaction recorded in `company_transactions` table

## Example Pricing

| Credit Amount | Processing Fee (5%) | Total Charged |
|---------------|---------------------|---------------|
| $500          | $25                 | $525          |
| $1,000        | $50                 | $1,050        |
| $2,500        | $125                | $2,625        |
| $5,000        | $250                | $5,250        |
| $10,000       | $500                | $10,500       |
| $25,000       | $1,250              | $26,250       |

## Files Modified

1. **`src/pages/CompanyBilling.tsx`** - Stripe payment integration
2. **`index.html`** - Stripe.js script tag
3. **`supabase/migrations/20251113010000_company_transactions.sql`** - Transaction table

## Environment Variables Required

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Already configured in your `.env` file ✅

## Next Steps (Optional Enhancements)

1. Add Stripe Elements for card input UI
2. Add payment method storage for recurring purchases
3. Add invoice generation for transactions
4. Add email receipts via Stripe
5. Add webhook handling for payment events

## Testing

To test credit purchases:
1. Go to `/company/billing`
2. Select credit amount
3. Click "Add $X to Balance"
4. Payment will process through Stripe
5. Credits added to balance
6. Transaction recorded in history
