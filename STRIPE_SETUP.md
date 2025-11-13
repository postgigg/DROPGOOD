# Stripe Setup Guide

## Current Status
The platform is currently running in **Manual Mode** which simulates payments without requiring Stripe.

## When You Need Stripe
You'll need to configure Stripe when:
- You're ready to accept real credit card payments
- You want to go live with actual transactions
- Testing the full payment flow end-to-end

## Setup Steps

### 1. Create a Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create your account
3. Complete business verification (required for live payments)

### 2. Get Your API Keys
1. Log into your Stripe Dashboard
2. Navigate to: **Developers** → **API keys**
3. You'll see two types of keys:
   - **Test keys** - For development (start with `pk_test_` and `sk_test_`)
   - **Live keys** - For production (start with `pk_live_` and `sk_live_`)

### 3. Add Keys to Your Project

#### For Development (Test Mode):
```bash
# In your .env file:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_MANUAL_MODE=false
```

#### For Production (Live Mode):
```bash
# In your .env file or hosting environment:
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
VITE_MANUAL_MODE=false
```

### 4. Important Security Notes
- ✅ **DO** use test keys for development
- ✅ **DO** use environment variables (never hardcode keys)
- ✅ **DO** add `.env` to your `.gitignore`
- ❌ **NEVER** commit secret keys to git
- ❌ **NEVER** share your secret key (starts with `sk_`)
- ❌ **NEVER** use live keys in development

### 5. Testing Payments

#### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC

### 6. Going Live Checklist
- [ ] Complete Stripe account verification
- [ ] Test all payment flows with test keys
- [ ] Update environment variables with live keys
- [ ] Set `VITE_MANUAL_MODE=false`
- [ ] Test with real bank account (small amount)
- [ ] Monitor first few transactions closely
- [ ] Set up Stripe webhooks for payment notifications

## Current Manual Mode
While in manual mode (`VITE_MANUAL_MODE=true`):
- Payments are simulated
- No credit cards are charged
- Bookings are created immediately
- Perfect for testing the booking flow

## Need Help?
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Contact: support@dropgood.com
