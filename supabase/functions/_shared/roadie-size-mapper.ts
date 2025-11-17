/**
 * Roadie Size Mapper
 * Maps bags/boxes to Roadie's 5 predefined size categories
 *
 * Roadie Sizes:
 * - SMALL: Fits in a shoebox
 * - MEDIUM: Fits in a front seat
 * - LARGE: Fits in a back seat
 * - X-LARGE: Fits in a hatchback
 * - HUGE: Fits in a pickup truck
 */

export type RoadieSize = 'small' | 'medium' | 'large' | 'xlarge' | 'huge';

export interface RoadieSizeMapping {
  roadie_size: RoadieSize;
  length: number;  // inches
  width: number;   // inches
  height: number;  // inches
  weight: number;  // pounds
  description: string;
}

/**
 * Map bags/boxes count to appropriate Roadie size
 * Logic:
 * - 1-2 bags, 0 boxes → SMALL
 * - 3-5 bags or 1-2 boxes → MEDIUM
 * - 6-10 bags or 3-5 boxes → LARGE
 * - 11-20 bags or 6-10 boxes → X-LARGE
 * - 21+ bags or 11+ boxes → HUGE
 */
export function mapBagsBoxesToRoadieSize(bagsCount: number, boxesCount: number): RoadieSizeMapping {
  const totalItems = bagsCount + boxesCount;

  // Prioritize boxes (they're bigger)
  if (boxesCount >= 11) {
    return {
      roadie_size: 'huge',
      length: 72,
      width: 48,
      height: 48,
      weight: 200,
      description: 'Pickup truck bed - 11+ boxes'
    };
  }

  if (boxesCount >= 6 || bagsCount >= 11) {
    return {
      roadie_size: 'xlarge',
      length: 48,
      width: 36,
      height: 24,
      weight: 150,
      description: 'Hatchback cargo - 6-10 boxes or 11-20 bags'
    };
  }

  if (boxesCount >= 3 || bagsCount >= 6) {
    return {
      roadie_size: 'large',
      length: 36,
      width: 24,
      height: 18,
      weight: 100,
      description: 'Back seat - 3-5 boxes or 6-10 bags'
    };
  }

  if (boxesCount >= 1 || bagsCount >= 3) {
    return {
      roadie_size: 'medium',
      length: 24,
      width: 18,
      height: 12,
      weight: 50,
      description: 'Front seat - 1-2 boxes or 3-5 bags'
    };
  }

  // Default: small (1-2 bags, 0 boxes)
  return {
    roadie_size: 'small',
    length: 12,
    width: 8,
    height: 6,
    weight: 25,
    description: 'Shoebox size - 1-2 bags'
  };
}

/**
 * Build Roadie items array from bags/boxes count
 * Returns array in Roadie API format
 */
export function buildRoadieItems(bagsCount: number, boxesCount: number): Array<{
  description: string;
  reference_id?: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  value: number;
}> {
  const items = [];
  const sizeMapping = mapBagsBoxesToRoadieSize(bagsCount, boxesCount);

  // Create a single consolidated item with the appropriate size
  const totalQuantity = bagsCount + boxesCount;
  const estimatedValue = (bagsCount * 30) + (boxesCount * 40); // $30/bag, $40/box for insurance

  items.push({
    description: `Donation items: ${bagsCount} bags, ${boxesCount} boxes`,
    reference_id: `donation-${Date.now()}`,
    length: sizeMapping.length,
    width: sizeMapping.width,
    height: sizeMapping.height,
    weight: sizeMapping.weight,
    quantity: 1, // Single consolidated shipment
    value: Math.max(100, estimatedValue) // Minimum $100 for insurance
  });

  return items;
}

/**
 * Get human-readable size description
 */
export function getSizeDescription(bagsCount: number, boxesCount: number): string {
  const mapping = mapBagsBoxesToRoadieSize(bagsCount, boxesCount);
  return mapping.description;
}

/**
 * Validate if bags/boxes count is acceptable for Roadie
 */
export function validateRoadieLoad(bagsCount: number, boxesCount: number): {
  valid: boolean;
  reason?: string;
} {
  const totalItems = bagsCount + boxesCount;

  if (totalItems === 0) {
    return { valid: false, reason: 'No items to ship' };
  }

  if (totalItems > 30) {
    return { valid: false, reason: 'Too many items - maximum 30 bags/boxes combined' };
  }

  const mapping = mapBagsBoxesToRoadieSize(bagsCount, boxesCount);
  if (mapping.weight > 250) {
    return { valid: false, reason: 'Estimated weight exceeds Roadie maximum (250 lbs)' };
  }

  return { valid: true };
}
