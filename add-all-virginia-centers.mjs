import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

const centers = [
  // MORE RICHMOND AREA
  {
    name: 'Salvation Army Family Store - Mechanicsville',
    street_address: '8051 Mechanicsville Turnpike',
    city: 'Mechanicsville',
    state: 'VA',
    zip_code: '23111',
    latitude: 37.6247,
    longitude: -77.3482,
    phone: '(804) 730-0909',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Chesterfield',
    street_address: '6240 Centralia Rd',
    city: 'Chesterfield',
    state: 'VA',
    zip_code: '23832',
    latitude: 37.3778,
    longitude: -77.5058,
    phone: '(804) 794-4663',
    accepted_items: ['furniture', 'building materials', 'appliances', 'home decor'],
    is_active: true
  },
  {
    name: 'St. Vincent de Paul Thrift Store',
    street_address: '6304 Midlothian Turnpike',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23225',
    latitude: 37.5124,
    longitude: -77.4937,
    phone: '(804) 323-6777',
    accepted_items: ['clothing', 'furniture', 'household items', 'books'],
    is_active: true
  },

  // FAIRFAX / NOVA AREA
  {
    name: 'Goodwill Fairfax',
    street_address: '10400 Main St',
    city: 'Fairfax',
    state: 'VA',
    zip_code: '22030',
    latitude: 38.8462,
    longitude: -77.3014,
    phone: '(703) 352-7507',
    email: 'info@dcgoodwill.org',
    website: 'https://dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Springfield',
    street_address: '6461 Backlick Rd',
    city: 'Springfield',
    state: 'VA',
    zip_code: '22150',
    latitude: 38.7732,
    longitude: -77.1781,
    phone: '(703) 451-6161',
    email: 'info@dcgoodwill.org',
    website: 'https://dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Alexandria',
    street_address: '7685 Richmond Hwy',
    city: 'Alexandria',
    state: 'VA',
    zip_code: '22306',
    latitude: 38.7612,
    longitude: -77.0756,
    phone: '(703) 684-7859',
    email: 'info@dcgoodwill.org',
    website: 'https://dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Arlington',
    street_address: '2700 S Quincy St',
    city: 'Arlington',
    state: 'VA',
    zip_code: '22206',
    latitude: 38.8398,
    longitude: -77.0963,
    phone: '(703) 671-4971',
    email: 'info@dcgoodwill.org',
    website: 'https://dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Manassas',
    street_address: '8534 Sudley Rd',
    city: 'Manassas',
    state: 'VA',
    zip_code: '20110',
    latitude: 38.7511,
    longitude: -77.5166,
    phone: '(703) 257-6800',
    email: 'info@dcgoodwill.org',
    website: 'https://dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Fairfax',
    street_address: '10268 Main St',
    city: 'Fairfax',
    state: 'VA',
    zip_code: '22030',
    latitude: 38.8469,
    longitude: -77.3027,
    phone: '(703) 385-9400',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Northern Virginia',
    street_address: '869 S Pickett St',
    city: 'Alexandria',
    state: 'VA',
    zip_code: '22304',
    latitude: 38.8234,
    longitude: -77.1283,
    phone: '(703) 321-9890',
    website: 'https://www.habitatnova.org',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },
  {
    name: 'Unique Thrift Store - Arlington',
    street_address: '3100 Columbia Pike',
    city: 'Arlington',
    state: 'VA',
    zip_code: '22204',
    latitude: 38.8623,
    longitude: -77.0964,
    phone: '(703) 521-2800',
    accepted_items: ['clothing', 'furniture', 'household items', 'books', 'shoes'],
    is_active: true
  },
  {
    name: 'Purple Heart Foundation - Vienna',
    street_address: '150 Maple Ave E',
    city: 'Vienna',
    state: 'VA',
    zip_code: '22180',
    latitude: 38.9013,
    longitude: -77.2653,
    phone: '(703) 242-7787',
    accepted_items: ['clothing', 'household items', 'small appliances', 'books'],
    is_active: true
  },

  // NORFOLK / HAMPTON ROADS AREA
  {
    name: 'Goodwill Norfolk - Military Highway',
    street_address: '6301 E Virginia Beach Blvd',
    city: 'Norfolk',
    state: 'VA',
    zip_code: '23502',
    latitude: 36.8632,
    longitude: -76.2318,
    phone: '(757) 461-6501',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Virginia Beach',
    street_address: '4916 Virginia Beach Blvd',
    city: 'Virginia Beach',
    state: 'VA',
    zip_code: '23462',
    latitude: 36.8431,
    longitude: -76.1074,
    phone: '(757) 490-3225',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Chesapeake',
    street_address: '1429 Greenbrier Pkwy',
    city: 'Chesapeake',
    state: 'VA',
    zip_code: '23320',
    latitude: 36.7722,
    longitude: -76.2282,
    phone: '(757) 420-8300',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Newport News',
    street_address: '12551 Jefferson Ave',
    city: 'Newport News',
    state: 'VA',
    zip_code: '23602',
    latitude: 37.1098,
    longitude: -76.5177,
    phone: '(757) 877-1571',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Hampton',
    street_address: '2032 Coliseum Dr',
    city: 'Hampton',
    state: 'VA',
    zip_code: '23666',
    latitude: 37.0404,
    longitude: -76.3774,
    phone: '(757) 826-5343',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Norfolk',
    street_address: '1410 N Military Hwy',
    city: 'Norfolk',
    state: 'VA',
    zip_code: '23502',
    latitude: 36.8845,
    longitude: -76.2072,
    phone: '(757) 461-2857',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore - Norfolk',
    street_address: '2420 Almeda Ave',
    city: 'Norfolk',
    state: 'VA',
    zip_code: '23513',
    latitude: 36.8856,
    longitude: -76.2876,
    phone: '(757) 440-5447',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },
  {
    name: 'Thrift Store for Animals - Virginia Beach',
    street_address: '3816 Dam Neck Rd',
    city: 'Virginia Beach',
    state: 'VA',
    zip_code: '23453',
    latitude: 36.7789,
    longitude: -76.0441,
    phone: '(757) 427-0070',
    accepted_items: ['clothing', 'household items', 'pet supplies', 'books', 'furniture'],
    is_active: true
  },
  {
    name: 'ForKids Thrift Store',
    street_address: '4100 W Mercury Blvd',
    city: 'Hampton',
    state: 'VA',
    zip_code: '23666',
    latitude: 37.0391,
    longitude: -76.3867,
    phone: '(757) 865-8444',
    accepted_items: ['clothing', 'furniture', 'household items', 'toys', 'books'],
    is_active: true
  }
];

console.log('🚀 Adding Virginia donation centers...');
console.log(`   📍 Richmond area: 3 centers`);
console.log(`   📍 Fairfax/NOVA: 9 centers`);
console.log(`   📍 Norfolk/Hampton Roads: 9 centers`);
console.log(`   TOTAL: ${centers.length} centers\n`);

async function insertAll() {
  const { data, error } = await supabase
    .from('donation_centers')
    .insert(centers)
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`\n✅ SUCCESS! Inserted ${data.length} donation centers!\n`);

  const byCity = {};
  data.forEach(c => {
    if (!byCity[c.city]) byCity[c.city] = [];
    byCity[c.city].push(c.name);
  });

  Object.keys(byCity).sort().forEach(city => {
    console.log(`${city}, VA (${byCity[city].length}):`);
    byCity[city].forEach(name => console.log(`   - ${name}`));
  });
}

insertAll();
