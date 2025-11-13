# Fix Payment RLS Error

The payment is failing because of a database security (RLS) policy issue.

## Option 1: Quick Fix (5 minutes)

### Step 1: Get Your Service Role Key
1. Go to: https://app.supabase.com/project/ozylnaxrhaibsoybuzix/settings/api
2. Scroll down to "Project API keys"
3. Find the **"service_role"** key (NOT the anon key)
4. Copy it (it starts with `eyJ...`)

### Step 2: Run This Command

Open Terminal and run:

```bash
cd "/Users/bubblefreelancer/Desktop/project 284"

curl -X POST 'https://ozylnaxrhaibsoybuzix.supabase.co/rest/v1/rpc/sql' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY_HERE" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "DROP POLICY IF EXISTS \"Anyone can create bookings\" ON public.bookings; CREATE POLICY \"Anyone can create bookings\" ON public.bookings FOR INSERT TO public WITH CHECK (true); CREATE POLICY \"Anon users can create bookings\" ON public.bookings FOR INSERT TO anon WITH CHECK (true);"
  }'
```

**IMPORTANT:** Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the actual key you copied.

---

## Option 2: Use SQL Editor (3 minutes)

1. Go to: https://app.supabase.com/project/ozylnaxrhaibsoybuzix/editor/sql
2. Click "New Query"
3. Paste this SQL:

```sql
-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a new policy that allows anyone to INSERT bookings
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow anon users specifically
CREATE POLICY "Anon users can create bookings"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

4. Click "Run"
5. You should see "Success" message

---

## What This Does

This fixes the database security policy that's blocking guest users from creating bookings. After running either option, refresh your payment page and it will work.

---

## After Fixing

1. Refresh the payment page
2. The "new row violates row-level security policy" error will be gone
3. Payment form will work correctly
