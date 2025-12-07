export interface PricingBreakdown {
  uber_cost: number;
  delivery_fee: number; // Uber + 15% + optional 3.5% state fee + bag/box fees
  service_fee: number; // 10% shown separately (or higher for inactive charities)
  our_markup?: number; // Deprecated - kept for compatibility
  driver_tip: number;
  rush_fee: number;
  subtotal: number;
  stripe_fee: number;
  total_price: number;
  // Bag/Box fees
  bag_count?: number;
  box_count?: number;
  bag_fee?: number;
  box_fee?: number;
  bag_box_driver_tip?: number; // What driver gets from bags/boxes
  total_driver_tip?: number; // $10 base + bag/box tips + customer extra
  // Advance booking discount
  advance_booking_discount_percentage?: number;
  advance_booking_discount_amount?: number;
  days_in_advance?: number;
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

const RUSH_FEE = 0.00; // No rush fee
export const DEFAULT_SERVICE_FEE = 0.75; // 75% (was 50%, +50%)
export const INACTIVE_CHARITY_SERVICE_FEE = 0.975; // 97.5% for unverified charities (was 65%, +50%)
export const GUARANTEED_DRIVER_TIP = 0.00; // No base tip - driver gets bag/box fees

// Bag/Box fees - 100% to driver as tip
export const BAG_FEE = 0.57; // Per bag (was $0.38, +50%)
export const BOX_FEE = 1.13; // Per box (was $0.75, +50%)

// Advance booking discounts - incentivize booking ahead
// Color scheme: Yellow (good) -> Orange (better) -> Green (best)
// Max 25% to maintain profitability while incentivizing advance planning
export const ADVANCE_BOOKING_DISCOUNTS: { [key: number]: number } = {
  0: 0,    // Today - no discount
  1: 0,    // Tomorrow - no discount
  2: 0.05, // 2 days - 5% off (yellow - good)
  3: 0.10, // 3 days - 10% off (yellow - good)
  4: 0.15, // 4 days - 15% off (orange - better)
  5: 0.18, // 5 days - 18% off (orange - better)
  6: 0.22, // 6 days - 22% off (green - best)
};

export function getAdvanceBookingDiscount(daysInAdvance: number): number {
  if (daysInAdvance >= 7) return 0.25; // 7+ days - 25% off (max - green - best)
  return ADVANCE_BOOKING_DISCOUNTS[daysInAdvance] || 0;
}

// New fee structure - 75% markup across the board (+50% increase)
export const STATE_FEE = 0.075; // 7.5% additional for certain states (was 5%)
export const DELIVERY_MARKUP = 0.75; // 75% included in delivery fee (was 50%)
export const SERVICE_FEE_DISPLAY = 0.225; // 22.5% shown separately (was 15%)

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
  driverTip: number = 0, // Optional tip (no minimum)
  serviceFeePercentage: number = DEFAULT_SERVICE_FEE,
  pickupState?: string,
  bagsCount: number = 0,
  boxesCount: number = 0,
  daysInAdvance: number = 0
): PricingBreakdown {
  // Optional tip, maximum $100
  const finalTip = Math.max(0, Math.min(driverTip, 100));

  // Calculate bag/box fees
  const bagFee = bagsCount * BAG_FEE;
  const boxFee = boxesCount * BOX_FEE;
  const bagBoxTotal = bagFee + boxFee;

  // Calculate driver tip from bags/boxes (100% of bag/box fees go to driver)
  const bagBoxDriverTip = bagFee + boxFee;
  const totalDriverTip = finalTip + bagBoxDriverTip;

  // Calculate delivery fee (Uber + 15% delivery markup + optional 3.5% state fee + bag/box fees)
  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState))
    ? uberCost * STATE_FEE
    : 0;
  let deliveryFee = uberCost + deliveryMarkup + stateFee + bagBoxTotal;

  // Calculate service fee (10% of Uber cost for display)
  let serviceFee = uberCost * SERVICE_FEE_DISPLAY;

  // Apply advance booking discount (to delivery + service, NOT to tip)
  const discountPercentage = getAdvanceBookingDiscount(daysInAdvance);
  const discountableAmount = deliveryFee + serviceFee;
  const discountAmount = discountableAmount * discountPercentage;

  deliveryFee = deliveryFee - (deliveryFee * discountPercentage);
  serviceFee = serviceFee - (serviceFee * discountPercentage);

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
    total_price: parseFloat(totalPrice.toFixed(2)),
    bag_count: bagsCount,
    box_count: boxesCount,
    bag_fee: parseFloat(bagFee.toFixed(2)),
    box_fee: parseFloat(boxFee.toFixed(2)),
    bag_box_driver_tip: parseFloat(bagBoxDriverTip.toFixed(2)),
    total_driver_tip: parseFloat(totalDriverTip.toFixed(2)),
    advance_booking_discount_percentage: discountPercentage,
    advance_booking_discount_amount: parseFloat(discountAmount.toFixed(2)),
    days_in_advance: daysInAdvance
  };
}

export function mockUberQuote(distanceMiles: number): number {
  const baseFee = 7.88; // +50% (was $5.25)
  const perMile = 1.92; // +50% (was $1.28)
  return baseFee + (distanceMiles * perMile);
}

export function calculateManualModePricing(distanceMiles: number): number {
  const baseFee = 20.82; // +50% (was $13.88)
  const perMile = 1.70; // +50% (was $1.13)
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

/**
 * Get DoorDash Drive delivery quotes
 * DoorDash pricing: $9.75 base (up to 5 miles) + $0.75/mile after (max 15 miles)
 */
export async function getDoorDashQuotes(
  pickupLat: number,
  pickupLng: number,
  dropoffLocations: Array<{
    latitude: number;
    longitude: number;
    name: string;
    id: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }>,
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  },
  bagsCount: number,
  boxesCount: number
): Promise<Map<string, { price: number; provider: string; quote_id?: string }>> {
  const results = new Map<string, { price: number; provider: string; quote_id?: string }>();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Get saved phone number from localStorage (collected in payment step)
  const savedPhone = localStorage.getItem('dropgood_last_phone') || '+16505555555';

  console.log(`🚗 Getting DoorDash quotes for ${bagsCount} bags, ${boxesCount} boxes`);

  // Determine vehicle type based on bags/boxes
  // Small loads (1-3 items) = bicycle/walker, Medium (4-6) = car, Large (7+) = car only
  const totalItems = bagsCount + boxesCount;
  const dasherAllowedVehicles = totalItems <= 3
    ? ['bicycle', 'walker', 'car']
    : totalItems <= 6
      ? ['car']
      : ['car'];

  try {
    const batchSize = 5;
    for (let i = 0; i < dropoffLocations.length; i += batchSize) {
      const batch = dropoffLocations.slice(i, i + batchSize);

      const quotes = await Promise.all(
        batch.map(async (location) => {
          try {
            const requestBody = {
              external_delivery_id: `quote_${location.id}_${Date.now()}`,
              pickup_address: {
                street: pickupAddress.street,
                city: pickupAddress.city,
                state: pickupAddress.state,
                zip_code: pickupAddress.zip
              },
              pickup_phone_number: savedPhone, // Customer phone from localStorage
              dropoff_address: {
                street: location.address || location.name,
                city: location.city || pickupAddress.city,
                state: location.state || pickupAddress.state,
                zip_code: location.zip_code || pickupAddress.zip
              },
              dropoff_phone_number: savedPhone, // Using customer phone for quotes (charity phone used during actual delivery)
              order_value: 1000, // $10 in cents (estimated value)
              items: [
                {
                  name: 'Donation Items',
                  description: `${bagsCount} bags, ${boxesCount} boxes of donated items`,
                  quantity: totalItems
                }
              ],
              dasher_allowed_vehicles: dasherAllowedVehicles,
              contactless_dropoff: true
            };

            const response = await fetch(
              `${supabaseUrl}/functions/v1/doordash-quote`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to get DoorDash quote');
            }

            const quoteData = await response.json();
            return {
              id: location.id,
              price: quoteData.fee_dollars,
              quote_id: quoteData.quote_id,
              provider: 'doordash'
            };
          } catch (err) {
            console.error(`Failed to get DoorDash quote for ${location.name}:`, err);
            return null;
          }
        })
      );

      quotes.forEach(q => {
        if (q) {
          results.set(q.id, { price: q.price, provider: q.provider, quote_id: q.quote_id });
        }
      });

      if (i + batchSize < dropoffLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (err) {
    console.error('Batch DoorDash quote error:', err);
  }

  return results;
}

/**
 * Get Roadie delivery quotes with automatic vehicle size determination
 */
export async function getRoadieEstimates(
  pickupLat: number,
  pickupLng: number,
  dropoffLocations: Array<{
    latitude: number;
    longitude: number;
    name: string;
    id: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }>,
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  },
  bagsCount: number,
  boxesCount: number
): Promise<Map<string, { price: number; provider: string }>> {
  const results = new Map<string, { price: number; provider: string }>();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log(`🚗 Getting Roadie estimates for ${bagsCount} bags, ${boxesCount} boxes`);

  try {
    const batchSize = 5;
    for (let i = 0; i < dropoffLocations.length; i += batchSize) {
      const batch = dropoffLocations.slice(i, i + batchSize);

      const quotes = await Promise.all(
        batch.map(async (location) => {
          try {
            const requestBody = {
              pickup_location: {
                address: {
                  street: pickupAddress.street,
                  city: pickupAddress.city,
                  state: pickupAddress.state,
                  zip_code: pickupAddress.zip
                },
                latitude: pickupLat,
                longitude: pickupLng
              },
              delivery_location: {
                address: {
                  street: location.address || location.name,
                  city: location.city || pickupAddress.city,
                  state: location.state || pickupAddress.state,
                  zip_code: location.zip_code || pickupAddress.zip
                },
                latitude: location.latitude,
                longitude: location.longitude
              },
              bags_count: bagsCount,
              boxes_count: boxesCount
            };

            const response = await fetch(
              `${supabaseUrl}/functions/v1/roadie-estimate`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to get Roadie quote');
            }

            const quoteData = await response.json();
            return {
              id: location.id,
              price: quoteData.roadie_base_price,
              provider: 'roadie'
            };
          } catch (err) {
            console.error(`Failed to get Roadie quote for ${location.name}:`, err);
            return null;
          }
        })
      );

      quotes.forEach(q => {
        if (q) {
          results.set(q.id, { price: q.price, provider: q.provider });
        }
      });

      if (i + batchSize < dropoffLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (err) {
    console.error('Batch Roadie quote error:', err);
  }

  return results;
}

export async function getUberDirectQuotes(
  pickupLat: number,
  pickupLng: number,
  dropoffLocations: Array<{
    latitude: number;
    longitude: number;
    name: string;
    id: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }>,
  pickupAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  },
  manifest?: {
    items?: Array<{
      name: string;
      quantity: number;
      size?: 'small' | 'medium' | 'large' | 'xlarge';
    }>;
    total_value?: number;
  }
): Promise<Map<string, { price: number; quote_id?: string }>> {
  const results = new Map<string, { price: number; quote_id?: string }>();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const MANUAL_MODE = import.meta.env.VITE_MANUAL_MODE === 'true';
  const USE_REAL_UBER = false;

  if (MANUAL_MODE) {
    console.log('Manual mode enabled - using manual pricing formula ($9.25 + $0.75/mile)');
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, { price: calculateManualModePricing(distance) });
    });
    return results;
  }

  if (!USE_REAL_UBER) {
    console.log('Using mock Uber pricing (set USE_REAL_UBER = true to use real API)');
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, { price: mockUberQuote(distance) });
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
            // Build request body with proper address formatting
            const requestBody: any = {
              pickup_latitude: pickupLat,
              pickup_longitude: pickupLng,
              pickup_address: pickupAddress?.street || 'Pickup Location',
              dropoff_latitude: location.latitude,
              dropoff_longitude: location.longitude,
              dropoff_address: location.address || location.name,
            };

            // Add pickup address components if available
            if (pickupAddress) {
              requestBody.pickup_city = pickupAddress.city;
              requestBody.pickup_state = pickupAddress.state;
              requestBody.pickup_zip_code = pickupAddress.zip;
              requestBody.pickup_country = 'US';
            }

            // Add dropoff address components if available
            if (location.city) requestBody.dropoff_city = location.city;
            if (location.state) requestBody.dropoff_state = location.state;
            if (location.zip_code) requestBody.dropoff_zip_code = location.zip_code;
            requestBody.dropoff_country = 'US';

            // Add manifest items if provided
            if (manifest?.items && manifest.items.length > 0) {
              requestBody.manifest_items = manifest.items;
            }

            // Add manifest total value if provided
            if (manifest?.total_value) {
              requestBody.manifest_total_value = manifest.total_value;
            }

            // Add external store ID for tracking
            requestBody.external_store_id = `quote_${location.id}`;

            const response = await fetch(
              `${supabaseUrl}/functions/v1/uber-quote`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to get quote');
            }

            const quoteData = await response.json();
            const priceDollars = quoteData.fee_cents / 100;
            return {
              id: location.id,
              price: priceDollars,
              quote_id: quoteData.quote_id // Store quote_id for delivery creation
            };
          } catch (err) {
            console.error(`Failed to get real quote for ${location.name}, using mock:`, err);
            const distance = calculateDistanceSimple(pickupLat, pickupLng, location.latitude, location.longitude);
            return { id: location.id, price: mockUberQuote(distance) };
          }
        })
      );

      quotes.forEach(q => results.set(q.id, { price: q.price, quote_id: q.quote_id }));

      if (i + batchSize < dropoffLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (err) {
    console.error('Batch quote error, falling back to mock pricing:', err);
    dropoffLocations.forEach(loc => {
      const distance = calculateDistanceSimple(pickupLat, pickupLng, loc.latitude, loc.longitude);
      results.set(loc.id, { price: mockUberQuote(distance) });
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
  driverTip: number = 0, // Optional tip (no minimum)
  charitySubsidyPercentage: number = 0,
  companySubsidyPercentage: number = 0,
  serviceFeePercentage: number = DEFAULT_SERVICE_FEE,
  pickupState?: string,
  bagsCount: number = 0,
  boxesCount: number = 0,
  daysInAdvance: number = 0
): PricingBreakdown {
  // Optional tip, maximum $100
  const finalTip = Math.max(0, Math.min(driverTip, 100));

  // Calculate bag/box fees
  const bagFee = bagsCount * BAG_FEE;
  const boxFee = boxesCount * BOX_FEE;
  const bagBoxTotal = bagFee + boxFee;

  // Calculate driver tip from bags/boxes (100% of bag/box fees go to driver)
  const bagBoxDriverTip = bagFee + boxFee;
  const totalDriverTip = finalTip + bagBoxDriverTip;

  // Calculate delivery fee (Uber + 15% delivery markup + optional 3.5% state fee + bag/box fees)
  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState))
    ? uberCost * STATE_FEE
    : 0;
  let deliveryFee = uberCost + deliveryMarkup + stateFee + bagBoxTotal;

  // Calculate service fee (10% of Uber cost for display)
  let serviceFee = uberCost * SERVICE_FEE_DISPLAY;

  // Apply advance booking discount (to delivery + service, NOT to tip or subsidies)
  const discountPercentage = getAdvanceBookingDiscount(daysInAdvance);
  const discountableAmount = deliveryFee + serviceFee;
  const discountAmount = discountableAmount * discountPercentage;

  deliveryFee = deliveryFee - (deliveryFee * discountPercentage);
  serviceFee = serviceFee - (serviceFee * discountPercentage);

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

  // Calculate tip with its own Stripe fee (only if there is a tip)
  let tipWithStripeFee = 0;
  let stripeFeeOnTip = 0;

  if (finalTip > 0) {
    tipWithStripeFee = (finalTip + 0.30) / 0.971;
    stripeFeeOnTip = tipWithStripeFee - finalTip;
  }

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
    // Bag/Box fees
    bag_count: bagsCount,
    box_count: boxesCount,
    bag_fee: parseFloat(bagFee.toFixed(2)),
    box_fee: parseFloat(boxFee.toFixed(2)),
    bag_box_driver_tip: parseFloat(bagBoxDriverTip.toFixed(2)),
    total_driver_tip: parseFloat(totalDriverTip.toFixed(2)),
    // Advance booking discount
    advance_booking_discount_percentage: discountPercentage,
    advance_booking_discount_amount: parseFloat(discountAmount.toFixed(2)),
    days_in_advance: daysInAdvance,
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
