// Test script to debug pricing discrepancy
// Run with: node test-pricing.js

// Copy the exact pricing logic from pricing.ts

const BAG_FEE = 2.00;
const BOX_FEE = 2.50;
const DELIVERY_MARKUP = 0.15;
const STATE_FEE = 0.035;
const SERVICE_FEE_DISPLAY = 0.10;
const DEFAULT_SERVICE_FEE = 0.35;
const RUSH_FEE = 0.00;

const STATES_WITH_FEE = ['CA', 'CO', 'TX', 'FL', 'GA', 'MS', 'OH', 'KS', 'NC', 'LA', 'AZ', 'UT', 'NV', 'WY', 'MI', 'SC'];

const ADVANCE_BOOKING_DISCOUNTS = {
  0: 0,
  1: 0,
  2: 0.05,
  3: 0.10,
  4: 0.15,
  5: 0.18,
  6: 0.22,
};

function shouldApplyStateFee(state) {
  return STATES_WITH_FEE.includes(state.toUpperCase());
}

function getAdvanceBookingDiscount(daysInAdvance) {
  if (daysInAdvance >= 7) return 0.25;
  return ADVANCE_BOOKING_DISCOUNTS[daysInAdvance] || 0;
}

function mockUberQuote(distanceMiles) {
  const baseFee = 3.50;
  const perMile = 0.85;
  return baseFee + (distanceMiles * perMile);
}

function calculateStackedSubsidies(basePrice, charityPct, companyPct) {
  const charitySubsidy = basePrice * (charityPct / 100);
  const afterCharity = basePrice - charitySubsidy;
  const companySubsidy = afterCharity * (companyPct / 100);
  const totalSubsidy = charitySubsidy + companySubsidy;
  const customerPays = basePrice - totalSubsidy;

  return {
    charity_subsidy_amount: parseFloat(charitySubsidy.toFixed(2)),
    company_subsidy_amount: parseFloat(companySubsidy.toFixed(2)),
    total_subsidy_amount: parseFloat(totalSubsidy.toFixed(2)),
    customer_pays_amount: parseFloat(customerPays.toFixed(2))
  };
}

function calculateFinalPrice(
  uberCost,
  isRushDelivery = false,
  driverTip = 0,
  serviceFeePercentage = DEFAULT_SERVICE_FEE,
  pickupState = '',
  bagsCount = 0,
  boxesCount = 0,
  daysInAdvance = 0
) {
  const finalTip = Math.max(0, Math.min(driverTip, 100));

  const bagFee = bagsCount * BAG_FEE;
  const boxFee = boxesCount * BOX_FEE;
  const bagBoxTotal = bagFee + boxFee;

  const bagBoxDriverTip = bagFee + boxFee;
  const totalDriverTip = finalTip + bagBoxDriverTip;

  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState)) ? uberCost * STATE_FEE : 0;
  let deliveryFee = uberCost + deliveryMarkup + stateFee + bagBoxTotal;

  let serviceFee = uberCost * SERVICE_FEE_DISPLAY;

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
    our_markup: parseFloat((deliveryMarkup + stateFee + serviceFee).toFixed(2)),
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

function calculateFinalPriceWithSubsidies(
  uberCost,
  isRushDelivery = false,
  driverTip = 0,
  charitySubsidyPercentage = 0,
  companySubsidyPercentage = 0,
  serviceFeePercentage = DEFAULT_SERVICE_FEE,
  pickupState = '',
  bagsCount = 0,
  boxesCount = 0,
  daysInAdvance = 0
) {
  const finalTip = Math.max(0, Math.min(driverTip, 100));

  const bagFee = bagsCount * BAG_FEE;
  const boxFee = boxesCount * BOX_FEE;
  const bagBoxTotal = bagFee + boxFee;

  const bagBoxDriverTip = bagFee + boxFee;
  const totalDriverTip = finalTip + bagBoxDriverTip;

  const deliveryMarkup = uberCost * DELIVERY_MARKUP;
  const stateFee = (pickupState && shouldApplyStateFee(pickupState)) ? uberCost * STATE_FEE : 0;
  let deliveryFee = uberCost + deliveryMarkup + stateFee + bagBoxTotal;

  let serviceFee = uberCost * SERVICE_FEE_DISPLAY;

  const discountPercentage = getAdvanceBookingDiscount(daysInAdvance);
  const discountableAmount = deliveryFee + serviceFee;
  const discountAmount = discountableAmount * discountPercentage;

  deliveryFee = deliveryFee - (deliveryFee * discountPercentage);
  serviceFee = serviceFee - (serviceFee * discountPercentage);

  const rushFee = isRushDelivery ? RUSH_FEE : 0;
  const subtotalWithoutTip = deliveryFee + serviceFee + rushFee;

  const basePriceWithoutTip = (subtotalWithoutTip + 0.30) / 0.971;
  const stripeFeeWithoutTip = basePriceWithoutTip - subtotalWithoutTip;

  const subsidies = calculateStackedSubsidies(
    basePriceWithoutTip,
    charitySubsidyPercentage,
    companySubsidyPercentage
  );

  // FIX: Only calculate Stripe fee on tip if there IS a tip
  let tipWithStripeFee = 0;
  let stripeFeeOnTip = 0;

  if (finalTip > 0) {
    tipWithStripeFee = (finalTip + 0.30) / 0.971;
    stripeFeeOnTip = tipWithStripeFee - finalTip;
  }

  const totalStripeFee = stripeFeeWithoutTip + stripeFeeOnTip;
  const subtotalWithTip = subtotalWithoutTip + finalTip;
  const finalPrice = subsidies.customer_pays_amount + tipWithStripeFee;

  const hasSubsidies = charitySubsidyPercentage > 0 || companySubsidyPercentage > 0;

  return {
    uber_cost: parseFloat(uberCost.toFixed(2)),
    delivery_fee: parseFloat(deliveryFee.toFixed(2)),
    service_fee: parseFloat(serviceFee.toFixed(2)),
    our_markup: parseFloat((deliveryMarkup + stateFee + serviceFee).toFixed(2)),
    driver_tip: parseFloat(finalTip.toFixed(2)),
    rush_fee: rushFee,
    subtotal: parseFloat(subtotalWithTip.toFixed(2)),
    stripe_fee: parseFloat(totalStripeFee.toFixed(2)),
    total_price: parseFloat(finalPrice.toFixed(2)),
    bag_count: bagsCount,
    box_count: boxesCount,
    bag_fee: parseFloat(bagFee.toFixed(2)),
    box_fee: parseFloat(boxFee.toFixed(2)),
    bag_box_driver_tip: parseFloat(bagBoxDriverTip.toFixed(2)),
    total_driver_tip: parseFloat(totalDriverTip.toFixed(2)),
    advance_booking_discount_percentage: discountPercentage,
    advance_booking_discount_amount: parseFloat(discountAmount.toFixed(2)),
    days_in_advance: daysInAdvance,
    charity_subsidy_amount: subsidies.charity_subsidy_amount,
    charity_subsidy_percentage: charitySubsidyPercentage,
    company_subsidy_amount: subsidies.company_subsidy_amount,
    company_subsidy_percentage: companySubsidyPercentage,
    total_subsidy_amount: subsidies.total_subsidy_amount,
    original_price: parseFloat(basePriceWithoutTip.toFixed(2)),
    subsidized: hasSubsidies
  };
}

// ========================================
// TEST SCENARIO FROM SCREENSHOTS
// ========================================

console.log('\n===========================================');
console.log('TESTING PRICING DISCREPANCY');
console.log('===========================================\n');

// From screenshot: Goodwill Bailey Bridge Store - 5.4 miles
const distanceMiles = 5.4;
const uberCost = mockUberQuote(distanceMiles);

console.log('📍 Distance: 5.4 miles');
console.log('🚗 Uber Cost:', uberCost.toFixed(2));
console.log('');

// From screenshot Step 2: 4 boxes, 3 bags
const bagsCount = 3;
const boxesCount = 4;
const pickupState = 'VA'; // Virginia

console.log('📦 Items: ' + boxesCount + ' boxes, ' + bagsCount + ' bags');
console.log('📍 State:', pickupState);
console.log('');

console.log('===========================================');
console.log('STEP 3 CALCULATION (StepCharities.tsx)');
console.log('===========================================\n');

// Step 3 uses calculateFinalPriceWithSubsidies with daysInAdvance = 1
const step3Pricing = calculateFinalPriceWithSubsidies(
  uberCost,
  false,      // isRushDelivery
  0,          // driverTip
  0,          // charitySubsidyPercentage
  0,          // companySubsidyPercentage
  DEFAULT_SERVICE_FEE,
  pickupState,
  bagsCount,
  boxesCount,
  1           // daysInAdvance = 1 (my fix)
);

console.log('Function: calculateFinalPriceWithSubsidies()');
console.log('Parameters:');
console.log('  - uberCost:', uberCost.toFixed(2));
console.log('  - isRushDelivery: false');
console.log('  - driverTip: 0');
console.log('  - charitySubsidyPercentage: 0');
console.log('  - companySubsidyPercentage: 0');
console.log('  - serviceFeePercentage:', DEFAULT_SERVICE_FEE);
console.log('  - pickupState:', pickupState);
console.log('  - bagsCount:', bagsCount);
console.log('  - boxesCount:', boxesCount);
console.log('  - daysInAdvance: 1');
console.log('');
console.log('Result:');
console.log('  Uber Cost: $' + step3Pricing.uber_cost);
console.log('  Delivery Fee: $' + step3Pricing.delivery_fee);
console.log('  Service Fee: $' + step3Pricing.service_fee);
console.log('  Bag Fee: $' + step3Pricing.bag_fee);
console.log('  Box Fee: $' + step3Pricing.box_fee);
console.log('  Subtotal: $' + step3Pricing.subtotal);
console.log('  Stripe Fee: $' + step3Pricing.stripe_fee);
console.log('  ✨ TOTAL PRICE: $' + step3Pricing.total_price + ' ✨');
console.log('');

console.log('===========================================');
console.log('STEP 4 CALCULATION (StepSchedule.tsx)');
console.log('===========================================\n');

// Step 4 uses calculateFinalPrice with daysInAdvance calculated from selected date
// User selected Tuesday (tomorrow) = 1 day in advance
const step4Pricing = calculateFinalPrice(
  uberCost,
  false,      // isToday (assuming they selected tomorrow, so false)
  0,          // driverTip
  DEFAULT_SERVICE_FEE,
  pickupState,
  bagsCount,
  boxesCount,
  1           // daysInAdvance = 1 (tomorrow)
);

console.log('Function: calculateFinalPrice()');
console.log('Parameters:');
console.log('  - uberCost:', uberCost.toFixed(2));
console.log('  - isRushDelivery: false');
console.log('  - driverTip: 0');
console.log('  - serviceFeePercentage:', DEFAULT_SERVICE_FEE);
console.log('  - pickupState:', pickupState);
console.log('  - bagsCount:', bagsCount);
console.log('  - boxesCount:', boxesCount);
console.log('  - daysInAdvance: 1');
console.log('');
console.log('Result:');
console.log('  Uber Cost: $' + step4Pricing.uber_cost);
console.log('  Delivery Fee: $' + step4Pricing.delivery_fee);
console.log('  Service Fee: $' + step4Pricing.service_fee);
console.log('  Bag Fee: $' + step4Pricing.bag_fee);
console.log('  Box Fee: $' + step4Pricing.box_fee);
console.log('  Subtotal: $' + step4Pricing.subtotal);
console.log('  Stripe Fee: $' + step4Pricing.stripe_fee);
console.log('  ✨ TOTAL PRICE: $' + step4Pricing.total_price + ' ✨');
console.log('');

console.log('===========================================');
console.log('COMPARISON');
console.log('===========================================\n');

const difference = Math.abs(step3Pricing.total_price - step4Pricing.total_price);

console.log('Step 3 Price: $' + step3Pricing.total_price);
console.log('Step 4 Price: $' + step4Pricing.total_price);
console.log('Difference:   $' + difference.toFixed(2));
console.log('');

if (difference < 0.01) {
  console.log('✅ PRICES MATCH! Bug is fixed!');
} else {
  console.log('❌ PRICES DO NOT MATCH! Bug still exists!');
  console.log('');
  console.log('DETAILED BREAKDOWN:');
  console.log('');
  console.log('                    Step 3      Step 4      Diff');
  console.log('Uber Cost:          $' + step3Pricing.uber_cost.toFixed(2) + '      $' + step4Pricing.uber_cost.toFixed(2) + '      $' + (step3Pricing.uber_cost - step4Pricing.uber_cost).toFixed(2));
  console.log('Delivery Fee:       $' + step3Pricing.delivery_fee.toFixed(2) + '     $' + step4Pricing.delivery_fee.toFixed(2) + '     $' + (step3Pricing.delivery_fee - step4Pricing.delivery_fee).toFixed(2));
  console.log('Service Fee:        $' + step3Pricing.service_fee.toFixed(2) + '      $' + step4Pricing.service_fee.toFixed(2) + '      $' + (step3Pricing.service_fee - step4Pricing.service_fee).toFixed(2));
  console.log('Bag Fee:            $' + step3Pricing.bag_fee.toFixed(2) + '      $' + step4Pricing.bag_fee.toFixed(2) + '      $' + (step3Pricing.bag_fee - step4Pricing.bag_fee).toFixed(2));
  console.log('Box Fee:            $' + step3Pricing.box_fee.toFixed(2) + '      $' + step4Pricing.box_fee.toFixed(2) + '     $' + (step3Pricing.box_fee - step4Pricing.box_fee).toFixed(2));
  console.log('Subtotal:           $' + step3Pricing.subtotal.toFixed(2) + '     $' + step4Pricing.subtotal.toFixed(2) + '     $' + (step3Pricing.subtotal - step4Pricing.subtotal).toFixed(2));
  console.log('Stripe Fee:         $' + step3Pricing.stripe_fee.toFixed(2) + '      $' + step4Pricing.stripe_fee.toFixed(2) + '      $' + (step3Pricing.stripe_fee - step4Pricing.stripe_fee).toFixed(2));
  console.log('TOTAL:              $' + step3Pricing.total_price.toFixed(2) + '     $' + step4Pricing.total_price.toFixed(2) + '     $' + (step3Pricing.total_price - step4Pricing.total_price).toFixed(2));
}

console.log('\n===========================================\n');
