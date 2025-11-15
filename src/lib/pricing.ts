export interface PricingBreakdown {
  uber_cost: number;
  delivery_fee: number; // Uber + 15% + optional 3.5% state fee
  service_fee: number; // 10% shown separately (or higher for inactive charities)
  our_markup?: number; // Deprecated - kept for compatibility
  driver_tip: number;
  rush_fee: number;
  subtotal: number;
  stripe_fee: number;
  total_price: number;
  // Charity subsidy fields
  charity_subsidy_amount?: number;
  charity_subsidy_percentage?: number;
  // Company subsidy fields
  company_subsidy_amount?: number;
  company_subsidy_percentage?: number;
  // Combined subsidy
  total_subsidy_amount?: number;
  // Original price before any subsidies
  original_price?: number;
  // Whether subsidies are applied
  subsidized?: boolean;
}

const RUSH_FEE = 5.00;
export const DEFAULT_SERVICE_FEE = 0.25; // 25%
export const INACTIVE_CHARITY_SERVICE_FEE = 0.40; // 40% for unverified charities
export const GUARANTEED_DRIVER_TIP = 10.00; // $10 guaranteed tip for every delivery

// New fee structure
export const STATE_FEE = 0.035; // 3.5% additional for certain states
export const DELIVERY_MARKUP = 0.15; // 15% included in delivery fee
export const SERVICE_FEE_DISPLAY = 0.10; // 10% shown separately

export const STATES_WITH_FEE = [
  'CA', 'CO', 'TX', 'FL', 'GA', 'MS', 'OH', // Standard states
  'KS', 'NC', 'LA', 'AZ', 'UT', 'NV', 'WY', 'MI', 'SC' // Additional states
];

export function shouldApplyStateFee(state: string): boolean {
  return STATES_WITH_FEE.includes(state.toUpperCase());
}

export function calculateFinalPrice(
  uberCost: number,
  isRushDelivery: boolean = false,
  driverTip: number = GUARANTEED_DRIVER_TIP, // Minimum $10 guaranteed tip
  serviceFeePercentage: number = DEFAULT_SERVICE_FEE,
  pickupState?: string
): PricingBreakdown {
  // Enforce minimum tip of $10, maximum $100
  const finalTip = Math.max(GUARANTEED_DRIVER_TIP, Math.min(driverTip, 100));

  // Calculate delivery fee (Uber + 15% delivery markup + optional 3.5% state fee)
  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState))
    ? uberCost * STATE_FEE
    : 0;
  const deliveryFee = uberCost + deliveryMarkup + stateFee;

  // Calculate service fee (10% of Uber cost for display)
  const serviceFee = uberCost * SERVICE_FEE_DISPLAY;

  const rushFee = isRushDelivery ? RUSH_FEE : 0;
  const subtotalBeforeTip = deliveryFee + serviceFee + rushFee;
  const subtotal = subtotalBeforeTip + finalTip;

  const totalPrice = (subtotal + 0.30) / 0.971;
  const stripeFee = totalPrice - subtotal;

  return {
    uber_cost: parseFloat(uberCost.toFixed(2)),
    delivery_fee: parseFloat(deliveryFee.toFixed(2)),
    service_fee: parseFloat(serviceFee.toFixed(2)),
    our_markup: parseFloat((deliveryMarkup + stateFee + serviceFee).toFixed(2)), // For compatibility
    driver_tip: parseFloat(finalTip.toFixed(2)),
    rush_fee: rushFee,
    subtotal: parseFloat(subtotal.toFixed(2)),
    stripe_fee: parseFloat(stripeFee.toFixed(2)),
    total_price: parseFloat(totalPrice.toFixed(2))
  };
}

export function mockUberQuote(distanceMiles: number): number {
  const baseFee = 3.50;
  const perMile = 0.85;
  return baseFee + (distanceMiles * perMile);
}

export function calculateManualModePricing(distanceMiles: number): number {
  const baseFee = 9.25;
  const perMile = 0.75;
  return baseFee + (distanceMiles * perMile);
}

export interface UberQuoteRequest {
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  dropoff_name?: string;
}

export interface UberQuoteResponse {
  id: string;
  fee: number;
  currency_code: string;
  created: string;
  expires: string;
  dropoff_name: string;
}

export async function getUberDirectQuotes(
  pickupLat: number,
  pickupLng: number,
  dropoffLocations: Array<{ latitude: number; longitude: number; name: string; id: string; address?: string }>
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const MANUAL_MODE = import.meta.env.VITE_MANUAL_MODE === 'true';
  const USE_REAL_UBER = false;

  if (MANUAL_MODE) {
    console.log('Manual mode enabled - using manual pricing formula ($9.25 + $0.75/mile)');
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, calculateManualModePricing(distance));
    });
    return results;
  }

  if (!USE_REAL_UBER) {
    console.log('Using mock Uber pricing (set USE_REAL_UBER = true to use real API)');
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, mockUberQuote(distance));
    });
    return results;
  }

  try {
    const batchSize = 5;
    for (let i = 0; i < dropoffLocations.length; i += batchSize) {
      const batch = dropoffLocations.slice(i, i + batchSize);

      const quotes = await Promise.all(
        batch.map(async (location) => {
          try {
            const response = await fetch(
              `${supabaseUrl}/functions/v1/uber-quote`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  pickup_latitude: pickupLat,
                  pickup_longitude: pickupLng,
                  pickup_address: 'Pickup Location',
                  dropoff_latitude: location.latitude,
                  dropoff_longitude: location.longitude,
                  dropoff_address: location.address || location.name,
                }),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to get quote');
            }

            const quoteData = await response.json();
            const priceDollars = quoteData.fee_cents / 100;
            return { id: location.id, price: priceDollars };
          } catch (err) {
            console.error(`Failed to get real quote for ${location.name}, using mock:`, err);
            const distance = calculateDistanceSimple(pickupLat, pickupLng, location.latitude, location.longitude);
            return { id: location.id, price: mockUberQuote(distance) };
          }
        })
      );

      quotes.forEach(q => results.set(q.id, q.price));

      if (i + batchSize < dropoffLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (err) {
    console.error('Batch quote error, falling back to mock pricing:', err);
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, mockUberQuote(distance));
    });
  }

  return results;
}

function calculateDistanceSimple(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate stacked subsidies (charity + company)
 * Charity subsidy is applied first to the full price,
 * then company subsidy is applied to the remaining amount.
 *
 * Example:
 * - Base price: $20
 * - Charity: 50% = $10 off
 * - Remaining: $10
 * - Company: 100% of remaining = $10 off
 * - Result: FREE (total subsidy $20 = base price)
 */
export interface StackedSubsidyResult {
  charity_subsidy_amount: number;
  company_subsidy_amount: number;
  total_subsidy_amount: number;
  customer_pays_amount: number;
}

export function calculateStackedSubsidies(
  basePrice: number,
  charitySubsidyPercentage: number = 0,
  companySubsidyPercentage: number = 0
): StackedSubsidyResult {
  // Step 1: Apply charity subsidy to full price
  const charitySubsidy = basePrice * (charitySubsidyPercentage / 100);

  // Step 2: Calculate remaining price after charity subsidy
  const remainingPrice = basePrice - charitySubsidy;

  // Step 3: Apply company subsidy to remaining price
  const companySubsidy = remainingPrice * (companySubsidyPercentage / 100);

  // Step 4: Calculate totals
  const totalSubsidy = charitySubsidy + companySubsidy;
  const customerPays = Math.max(0, basePrice - totalSubsidy);

  return {
    charity_subsidy_amount: parseFloat(charitySubsidy.toFixed(2)),
    company_subsidy_amount: parseFloat(companySubsidy.toFixed(2)),
    total_subsidy_amount: parseFloat(totalSubsidy.toFixed(2)),
    customer_pays_amount: parseFloat(customerPays.toFixed(2))
  };
}

/**
 * Calculate final price with optional stacked subsidies
 * This extends the base calculateFinalPrice function to support
 * both charity and company subsidies that can stack together.
 */
export function calculateFinalPriceWithSubsidies(
  uberCost: number,
  isRushDelivery: boolean = false,
  driverTip: number = GUARANTEED_DRIVER_TIP, // Minimum $10 guaranteed tip
  charitySubsidyPercentage: number = 0,
  companySubsidyPercentage: number = 0,
  serviceFeePercentage: number = DEFAULT_SERVICE_FEE,
  pickupState?: string
): PricingBreakdown {
  // Enforce minimum tip of $10, maximum $100
  const finalTip = Math.max(GUARANTEED_DRIVER_TIP, Math.min(driverTip, 100));

  // Calculate delivery fee (Uber + 15% delivery markup + optional 3.5% state fee)
  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState))
    ? uberCost * STATE_FEE
    : 0;
  const deliveryFee = uberCost + deliveryMarkup + stateFee;

  // Calculate service fee (10% of Uber cost for display)
  const serviceFee = uberCost * SERVICE_FEE_DISPLAY;

  const rushFee = isRushDelivery ? RUSH_FEE : 0;
  const subtotalWithoutTip = deliveryFee + serviceFee + rushFee;

  // Calculate total price WITHOUT tip and WITHOUT subsidies
  // (subsidies don't apply to tips)
  const basePriceWithoutTip = (subtotalWithoutTip + 0.30) / 0.971;
  const stripeFeeWithoutTip = basePriceWithoutTip - subtotalWithoutTip;

  // Apply stacked subsidies to the base price (excluding tip)
  const subsidies = calculateStackedSubsidies(
    basePriceWithoutTip,
    charitySubsidyPercentage,
    companySubsidyPercentage
  );

  // Calculate tip with its own Stripe fee
  const tipWithStripeFee = (finalTip + 0.30) / 0.971;
  const stripeFeeOnTip = tipWithStripeFee - finalTip;

  // Final calculations
  const totalStripeFee = stripeFeeWithoutTip + stripeFeeOnTip;
  const subtotalWithTip = subtotalWithoutTip + finalTip;
  const finalPrice = subsidies.customer_pays_amount + tipWithStripeFee;

  const hasSubsidies = charitySubsidyPercentage > 0 || companySubsidyPercentage > 0;

  return {
    uber_cost: parseFloat(uberCost.toFixed(2)),
    delivery_fee: parseFloat(deliveryFee.toFixed(2)),
    service_fee: parseFloat(serviceFee.toFixed(2)),
    our_markup: parseFloat((deliveryMarkup + stateFee + serviceFee).toFixed(2)), // For compatibility
    driver_tip: parseFloat(finalTip.toFixed(2)),
    rush_fee: rushFee,
    subtotal: parseFloat(subtotalWithTip.toFixed(2)),
    stripe_fee: parseFloat(totalStripeFee.toFixed(2)),
    total_price: parseFloat(finalPrice.toFixed(2)),
    // Subsidy details
    charity_subsidy_amount: subsidies.charity_subsidy_amount,
    charity_subsidy_percentage: charitySubsidyPercentage,
    company_subsidy_amount: subsidies.company_subsidy_amount,
    company_subsidy_percentage: companySubsidyPercentage,
    total_subsidy_amount: subsidies.total_subsidy_amount,
    original_price: parseFloat(basePriceWithoutTip.toFixed(2)),
    subsidized: hasSubsidies
  };
}
