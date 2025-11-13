#!/bin/bash

SUPABASE_URL="https://ozylnaxrhaibsoybuzix.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eWxuYXhyaGFpYnNveWJ1eml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzQ4MzksImV4cCI6MjA3ODM1MDgzOX0.2KxmJzl8DSP_bdozLh5fC0qGbtGXQakAloDJLVXYwMQ"

SQL='DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings; CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);'

echo "Attempting to fix RLS policy..."

# Try method 1
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL}\"}" 2>&1 | head -5

echo -e "\n\n❌ FAILED - The anon key doesn't have permission to modify RLS policies."
echo -e "\n📋 YOU MUST manually run this SQL:"
echo -e "\n1. Go to: https://app.supabase.com/project/ozylnaxrhaibsoybuzix/editor/sql"
echo -e "2. Click 'New Query'"
echo -e "3. Paste and run:\n"
echo "DROP POLICY IF EXISTS \"Anyone can create bookings\" ON public.bookings;"
echo "DROP POLICY IF EXISTS \"Anon users can create bookings\" ON public.bookings;"
echo "CREATE POLICY \"Anyone can create bookings\" ON public.bookings FOR INSERT TO public WITH CHECK (true);"
echo "CREATE POLICY \"Anon users can create bookings\" ON public.bookings FOR INSERT TO anon WITH CHECK (true);"
echo -e "\n4. Click RUN"
echo -e "\n✅ Then refresh your payment page\n"

