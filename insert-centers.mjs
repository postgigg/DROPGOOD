import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

const centers = [
  {
    name: 'Goodwill West Broad Store',
    street_address: '6202 W Broad St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23230',
    latitude: 37.5949,
    longitude: -77.5214,
    phone: '(804) 285-0571',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Fountain Square Store',
    street_address: '8018 W Broad St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23294',
    latitude: 37.5968,
    longitude: -77.5786,
    phone: '(804) 565-6780',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Laburnum Station Store',
    street_address: '3979 Gay Ave',
    city: 'Henrico',
    state: 'VA',
    zip_code: '23231',
    latitude: 37.5747,
    longitude: -77.3755,
    phone: '(804) 998-1401',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Richmond Outlet',
    street_address: '6301 Midlothian Turnpike',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23225',
    latitude: 37.5123,
    longitude: -77.4935,
    phone: '(804) 745-6300',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill St Matthews Store',
    street_address: '1650 St Matthews Ln',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23233',
    latitude: 37.6133,
    longitude: -77.5858,
    phone: '(804) 755-0571',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Bailey Bridge Store',
    street_address: '11749 Hull Street Rd',
    city: 'Midlothian',
    state: 'VA',
    zip_code: '23112',
    latitude: 37.4465,
    longitude: -77.6485,
    phone: '(804) 744-6375',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Petersburg Store',
    street_address: '65 Crater Circle',
    city: 'Petersburg',
    state: 'VA',
    zip_code: '23805',
    latitude: 37.1983,
    longitude: -77.3858,
    phone: '(804) 451-1772',
    email: 'info@goodwillvirginia.org',
    website: 'https://goodwillvirginia.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Diversity Thrift',
    street_address: '1407 Sherwood Ave',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23220',
    latitude: 37.5506,
    longitude: -77.4623,
    phone: '(804) 353-8890',
    email: 'info@diversityrichmond.org',
    website: 'https://diversityrichmond.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'books', 'vintage items'],
    is_active: true
  },
  {
    name: 'CARITAS Furniture Bank',
    street_address: '2220 Stockton St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23224',
    latitude: 37.5284,
    longitude: -77.4089,
    phone: '(804) 358-0964',
    email: 'info@caritasva.org',
    website: 'https://www.caritasva.org',
    accepted_items: ['furniture', 'household items', 'appliances'],
    is_active: true
  },
  {
    name: 'SPCA of Petersburg & Colonial Heights',
    street_address: '104 Pickwick Ave',
    city: 'Colonial Heights',
    state: 'VA',
    zip_code: '23834',
    latitude: 37.2441,
    longitude: -77.4104,
    phone: '(804) 526-7722',
    email: 'info@spcapch.org',
    website: 'https://spca-petersburg-colonialheights-va.com',
    accepted_items: ['pet supplies', 'pet food', 'toys', 'blankets'],
    is_active: true
  }
];

console.log('🚀 Inserting Richmond donation centers...\n');

async function insertCenters() {
  const { data, error } = await supabase
    .from('donation_centers')
    .insert(centers)
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    return false;
  }

  console.log(`✅ Successfully inserted ${data.length} donation centers!`);
  data.forEach(center => {
    console.log(`   - ${center.name} (${center.city}, ${center.state})`);
  });
  return true;
}

insertCenters();
