import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

const moreCenters = [
  // THRIFT STORES  
  {name: 'Value Village Springfield', street_address: '6660 Backlick Rd', city: 'Springfield', state: 'VA', zip_code: '22150', latitude: 38.7812, longitude: -77.1823, phone: '(703) 644-2667', accepted_items: ['clothing', 'furniture', 'household items', 'books'], is_active: true},
  {name: 'Value Village Alexandria', street_address: '6101 Richmond Hwy', city: 'Alexandria', state: 'VA', zip_code: '22303', latitude: 38.7745, longitude: -77.0734, phone: '(703) 960-8820', accepted_items: ['clothing', 'furniture', 'household items', 'books'], is_active: true},
  {name: 'Unique Thrift Store Springfield', street_address: '6570 Frontier Dr', city: 'Springfield', state: 'VA', zip_code: '22150', latitude: 38.7789, longitude: -77.1912, phone: '(703) 451-1910', accepted_items: ['clothing', 'household items', 'furniture'], is_active: true},
  
  // MORE SALVATION ARMY
  {name: 'Salvation Army Thrift Store - Woodstock', street_address: '1135 Senedo Rd', city: 'Woodstock', state: 'VA', zip_code: '22664', latitude: 38.8756, longitude: -78.5089, phone: '(540) 459-2631', accepted_items: ['clothing', 'furniture', 'household items', 'appliances'], is_active: true},
  {name: 'Salvation Army - Salem', street_address: '1223 W Main St', city: 'Salem', state: 'VA', zip_code: '24153', latitude: 37.2889, longitude: -80.0667, phone: '(540) 389-3441', accepted_items: ['clothing', 'furniture', 'household items', 'appliances'], is_active: true},
  
  // RESTORES
  {name: 'Habitat ReStore Peninsula', street_address: '1004 Old Denbigh Blvd', city: 'Newport News', state: 'VA', zip_code: '23602', latitude: 37.1245, longitude: -76.5234, phone: '(757) 596-5553', accepted_items: ['furniture', 'building materials', 'appliances', 'tools'], is_active: true},
  {name: 'Habitat ReStore Richmond West', street_address: '2110 Westwood Ave', city: 'Richmond', state: 'VA', zip_code: '23230', latitude: 37.5834, longitude: -77.5123, phone: '(804) 358-1643', accepted_items: ['furniture', 'building materials', 'appliances', 'tools'], is_active: true},
  
  // ANIMAL SHELTERS
  {name: 'Richmond SPCA Rummage Store', street_address: '2519 Hermitage Rd', city: 'Richmond', state: 'VA', zip_code: '23220', latitude: 37.5623, longitude: -77.4567, phone: '(804) 521-1300', accepted_items: ['clothing', 'household items', 'pet supplies', 'furniture'], is_active: true},
  {name: 'Lynchburg Humane Society Thrift', street_address: '1211 Old Graves Mill Rd', city: 'Lynchburg', state: 'VA', zip_code: '24502', latitude: 37.3912, longitude: -79.1634, phone: '(434) 846-7348', accepted_items: ['clothing', 'household items', 'pet supplies'], is_active: true},
  
  // CHURCH THRIFT STORES
  {name: 'St Pauls Episcopal Church Thrift', street_address: '815 E Grace St', city: 'Richmond', state: 'VA', zip_code: '23219', latitude: 37.5445, longitude: -77.4389, phone: '(804) 643-3589', accepted_items: ['clothing', 'household items', 'books'], is_active: true},
  {name: 'Trinity Thrift Store', street_address: '2601 Parker Ave', city: 'Silver Spring', state: 'VA', zip_code: '20910', latitude: 38.9956, longitude: -77.0378, phone: '(301) 587-1277', accepted_items: ['clothing', 'household items', 'furniture'], is_active: true},
  
  // MORE AREAS
  {name: 'Goodwill Abingdon', street_address: '385 Empire Dr', city: 'Abingdon', state: 'VA', zip_code: '24210', latitude: 36.7234, longitude: -81.9789, phone: '(276) 623-8800', accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'], is_active: true},
  {name: 'Goodwill Radford', street_address: '6733 E Main St', city: 'Radford', state: 'VA', zip_code: '24141', latitude: 37.1412, longitude: -80.5156, phone: '(540) 633-8800', accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'], is_active: true},
  {name: 'Goodwill Farmville', street_address: '1800 S Main St', city: 'Farmville', state: 'VA', zip_code: '23901', latitude: 37.2845, longitude: -78.3912, phone: '(434) 392-8800', accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'], is_active: true},
  {name: 'Goodwill Waynes boro Outlet', street_address: '2145 Rosser Ave', city: 'Waynesboro', state: 'VA', zip_code: '22980', latitude: 38.0689, longitude: -78.9123, phone: '(540) 946-8800', accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'], is_active: true},
  
  // COMMUNITY CENTERS
  {name: 'ACTS Thrift Store', street_address: '14 Cleveland St', city: 'Arlington', state: 'VA', zip_code: '22201', latitude: 38.8789, longitude: -77.1034, phone: '(703) 243-8043', accepted_items: ['clothing', 'household items', 'furniture'], is_active: true},
  {name: 'Culpeper Thrift Store', street_address: '715 E Davis St', city: 'Culpeper', state: 'VA', zip_code: '22701', latitude: 38.4734, longitude: -77.9912, phone: '(540) 825-8079', accepted_items: ['clothing', 'household items', 'furniture', 'books'], is_active: true},
  
  // SPECIALTY
  {name: 'The Clothes Mentor Richmond', street_address: '11651 W Broad St', city: 'Richmond', state: 'VA', zip_code: '23233', latitude: 37.6123, longitude: -77.6234, phone: '(804) 360-1600', accepted_items: ['womens clothing', 'accessories', 'shoes'], is_active: true},
  {name: 'Kid to Kid Richmond', street_address: '12160 W Broad St', city: 'Richmond', state: 'VA', zip_code: '23233', latitude: 37.6145, longitude: -77.6312, phone: '(804) 364-5437', accepted_items: ['kids clothing', 'toys', 'baby items'], is_active: true},
  {name: 'Once Upon A Child Fredericksburg', street_address: '10307 Spotsylvania Ave', city: 'Fredericksburg', state: 'VA', zip_code: '22408', latitude: 38.2512, longitude: -77.5634, phone: '(540) 710-8100', accepted_items: ['kids clothing', 'toys', 'baby gear'], is_active: true}
];

console.log(`🚀 Final push - adding ${moreCenters.length} more Virginia centers...`);

const { data, error } = await supabase
  .from('donation_centers')
  .insert(moreCenters)
  .select();

if (error) {
  console.error('Error:', error.message);
} else {
  console.log(`✅ Added ${data.length} centers!`);
}

const { count } = await supabase
  .from('donation_centers')
  .select('*', { count: 'exact', head: true })
  .eq('state', 'VA');

console.log(`\n🎉 FINAL COUNT: ${count} VIRGINIA DONATION CENTERS\n`);
