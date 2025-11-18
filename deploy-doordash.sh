#!/bin/bash

# DoorDash Integration Deployment Script
# This script will:
# 1. Run the database migration
# 2. Deploy the Edge Functions
# 3. Set Supabase secrets

echo "🚀 DoorDash Integration Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials
DB_PASSWORD="py3lESQ67tuNsFpr"
DB_HOST="db.uhtkemafphcegmabyfyj.supabase.co"
DB_NAME="postgres"

# DoorDash credentials
DOORDASH_DEVELOPER_ID="f8da6e72-842d-437c-b7a1-b1105a7d3567"
DOORDASH_KEY_ID="de9ef41c-ce95-4150-949d-ee44a12622f7"
DOORDASH_SIGNING_SECRET="ZQbClKDewVeuEgCspPJw8hDj7CwA0ZeUEmtsZUYZshs"
DOORDASH_ENVIRONMENT="sandbox"

echo "Step 1: Running database migration..."
echo "--------------------------------------"
PGPASSWORD="$DB_PASSWORD" psql "postgresql://postgres:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME" \
  -f "supabase/migrations/20251117020000_doordash_integration.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migration completed successfully${NC}"
else
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

echo ""
echo "Step 2: Setting Supabase secrets..."
echo "------------------------------------"

# Set secrets
supabase secrets set DOORDASH_DEVELOPER_ID="$DOORDASH_DEVELOPER_ID"
supabase secrets set DOORDASH_KEY_ID="$DOORDASH_KEY_ID"
supabase secrets set DOORDASH_SIGNING_SECRET="$DOORDASH_SIGNING_SECRET"
supabase secrets set DOORDASH_ENVIRONMENT="$DOORDASH_ENVIRONMENT"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Secrets set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set secrets${NC}"
    echo -e "${YELLOW}Note: Make sure you're logged in with 'supabase login'${NC}"
    exit 1
fi

echo ""
echo "Step 3: Deploying Edge Functions..."
echo "------------------------------------"

# Deploy functions
echo "Deploying doordash-quote..."
supabase functions deploy doordash-quote

echo "Deploying doordash-create-delivery..."
supabase functions deploy doordash-create-delivery

echo "Deploying doordash-webhook..."
supabase functions deploy doordash-webhook

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All functions deployed successfully${NC}"
else
    echo -e "${RED}❌ Function deployment failed${NC}"
    exit 1
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ DoorDash integration deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Enable DoorDash in your frontend:"
echo "   Set VITE_DOORDASH_ENABLED=true in .env (already done ✅)"
echo ""
echo "2. Test the integration:"
echo "   - Visit your app and create a booking"
echo "   - Check that DoorDash quotes appear alongside Roadie/Uber"
echo "   - System will automatically select cheapest provider"
echo ""
echo "3. Monitor with:"
echo "   supabase functions logs doordash-quote"
echo "   supabase functions logs doordash-create-delivery"
echo ""
echo "4. When ready for production:"
echo "   - Apply for production access in DoorDash Developer Portal"
echo "   - Update: supabase secrets set DOORDASH_ENVIRONMENT=production"
echo ""
echo "===================================="
