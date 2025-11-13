import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

const centers = [
  // MORE RICHMOND
  {
    name: 'Community Thrift Store of Ashland',
    street_address: '102 Duke St',
    city: 'Ashland',
    state: 'VA',
    zip_code: '23005',
    latitude: 37.7588,
    longitude: -77.4798,
    phone: '(804) 798-3354',
    accepted_items: ['clothing', 'furniture', 'household items', 'books'],
    is_active: true
  },
  {
    name: 'Thrift Store Henrico',
    street_address: '8600 Staples Mill Rd',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23228',
    latitude: 37.6234,
    longitude: -77.5089,
    phone: '(804) 672-5100',
    accepted_items: ['clothing', 'household items', 'furniture'],
    is_active: true
  },
  // MORE NOVA
  {
    name: 'Second Chance Thrift - Falls Church',
    street_address: '103 W Broad St',
    city: 'Falls Church',
    state: 'VA',
    zip_code: '22046',
    latitude: 38.8823,
    longitude: -77.1722,
    phone: '(703) 534-2583',
    accepted_items: ['clothing', 'furniture', 'household items', 'books'],
    is_active: true
  },
  {
    name: 'Hope Thrift Store',
    street_address: '7304 Richmond Hwy',
    city: 'Alexandria',
    state: 'VA',
    zip_code: '22306',
    latitude: 38.7689,
    longitude: -77.0723,
    phone: '(703) 360-1976',
    accepted_items: ['clothing', 'household items', 'furniture', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Centreville',
    street_address: '14215 Centreville Square',
    city: 'Centreville',
    state: 'VA',
    zip_code: '20121',
    latitude: 38.8412,
    longitude: -77.4456,
    phone: '(703) 815-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Annandale',
    street_address: '7137 Columbia Pike',
    city: 'Annandale',
    state: 'VA',
    zip_code: '22003',
    latitude: 38.8245,
    longitude: -77.1889,
    phone: '(703) 941-7891',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  // HAMPTON ROADS
  {
    name: 'Salvation Army Family Store - Portsmouth',
    street_address: '4116 Portsmouth Blvd',
    city: 'Portsmouth',
    state: 'VA',
    zip_code: '23701',
    latitude: 36.8389,
    longitude: -76.3612,
    phone: '(757) 465-2626',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Virginia Beach',
    street_address: '2829 S Lynnhaven Rd',
    city: 'Virginia Beach',
    state: 'VA',
    zip_code: '23452',
    latitude: 36.8234,
    longitude: -76.0889,
    phone: '(757) 486-5611',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Virginia Beach',
    street_address: '921 S Military Hwy',
    city: 'Virginia Beach',
    state: 'VA',
    zip_code: '23464',
    latitude: 36.8123,
    longitude: -76.0967,
    phone: '(757) 430-4663',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },
  {
    name: 'Goodwill Yorktown',
    street_address: '5227 George Washington Memorial Hwy',
    city: 'Yorktown',
    state: 'VA',
    zip_code: '23692',
    latitude: 37.1456,
    longitude: -76.5234,
    phone: '(757) 867-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  // SMALLER CITIES
  {
    name: 'Goodwill Staunton',
    street_address: '1302 Richmond Ave',
    city: 'Staunton',
    state: 'VA',
    zip_code: '24401',
    latitude: 38.1534,
    longitude: -79.0612,
    phone: '(540) 886-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Waynesboro Goodwill',
    street_address: '2112 W Main St',
    city: 'Waynesboro',
    state: 'VA',
    zip_code: '22980',
    latitude: 38.0734,
    longitude: -78.9256,
    phone: '(540) 943-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  }
];

console.log('Adding more Virginia centers...');

const { data, error } = await supabase
  .from('donation_centers')
  .insert(centers)
  .select();

if (error) {
  console.error('Error:', error.message);
} else {
  console.log(`✅ Added ${data.length} more centers!`);
  
  const { count } = await supabase
    .from('donation_centers')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'VA');
  
  console.log(`\n📊 TOTAL VIRGINIA CENTERS: ${count}\n`);
}
