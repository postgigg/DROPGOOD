import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

const centers = [
  // MORE RICHMOND AREA - Salvation Army, Value Village, etc.
  {
    name: 'Value Village Richmond',
    street_address: '5501 W Broad St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23230',
    latitude: 37.5955,
    longitude: -77.4912,
    phone: '(804) 285-4441',
    accepted_items: ['clothing', 'furniture', 'household items', 'books', 'electronics'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - West End',
    street_address: '5711 Grove Ave',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23226',
    latitude: 37.5789,
    longitude: -77.5081,
    phone: '(804) 288-8867',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Clothes Rack Thrift Store',
    street_address: '3434 W Cary St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23221',
    latitude: 37.5549,
    longitude: -77.4764,
    phone: '(804) 359-3906',
    accepted_items: ['clothing', 'accessories', 'shoes', 'vintage items'],
    is_active: true
  },
  {
    name: 'Plan 9 Records & Collectibles',
    street_address: '3012 W Cary St',
    city: 'Richmond',
    state: 'VA',
    zip_code: '23221',
    latitude: 37.5547,
    longitude: -77.4693,
    phone: '(804) 353-9996',
    accepted_items: ['records', 'CDs', 'DVDs', 'collectibles', 'books'],
    is_active: true
  },

  // CHARLOTTESVILLE AREA
  {
    name: 'Goodwill Charlottesville',
    street_address: '1965 India Rd',
    city: 'Charlottesville',
    state: 'VA',
    zip_code: '22901',
    latitude: 38.0468,
    longitude: -78.5088,
    phone: '(434) 817-0310',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Charlottesville',
    street_address: '1001 Harris St',
    city: 'Charlottesville',
    state: 'VA',
    zip_code: '22903',
    latitude: 38.0345,
    longitude: -78.5147,
    phone: '(434) 293-6331',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },
  {
    name: 'SPCA Rummage Store',
    street_address: '946 Glenwood Station Ln',
    city: 'Charlottesville',
    state: 'VA',
    zip_code: '22901',
    latitude: 38.0612,
    longitude: -78.5234,
    phone: '(434) 973-5959',
    accepted_items: ['clothing', 'household items', 'pet supplies', 'books', 'furniture'],
    is_active: true
  },

  // ROANOKE AREA
  {
    name: 'Goodwill Roanoke - Orange Avenue',
    street_address: '3640 Orange Ave NE',
    city: 'Roanoke',
    state: 'VA',
    zip_code: '24012',
    latitude: 37.2943,
    longitude: -79.9245,
    phone: '(540) 362-2345',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Roanoke - Williamson Road',
    street_address: '3949 Williamson Rd',
    city: 'Roanoke',
    state: 'VA',
    zip_code: '24012',
    latitude: 37.3067,
    longitude: -79.9414,
    phone: '(540) 563-0311',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Roanoke',
    street_address: '2110 Melrose Ave NW',
    city: 'Roanoke',
    state: 'VA',
    zip_code: '24017',
    latitude: 37.2835,
    longitude: -79.9725,
    phone: '(540) 345-5356',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Roanoke',
    street_address: '2420 Melrose Ave NW',
    city: 'Roanoke',
    state: 'VA',
    zip_code: '24017',
    latitude: 37.2870,
    longitude: -79.9762,
    phone: '(540) 343-9634',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },

  // LYNCHBURG AREA
  {
    name: 'Goodwill Lynchburg',
    street_address: '3800 Wards Rd',
    city: 'Lynchburg',
    state: 'VA',
    zip_code: '24502',
    latitude: 37.3764,
    longitude: -79.1773,
    phone: '(434) 239-6300',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Lynchburg',
    street_address: '3310 Old Forest Rd',
    city: 'Lynchburg',
    state: 'VA',
    zip_code: '24501',
    latitude: 37.3845,
    longitude: -79.2089,
    phone: '(434) 385-0960',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },

  // MORE NOVA - Loudoun County, Prince William
  {
    name: 'Goodwill Leesburg',
    street_address: '1473 North Point Village Center',
    city: 'Leesburg',
    state: 'VA',
    zip_code: '20176',
    latitude: 39.1134,
    longitude: -77.5368,
    phone: '(703) 777-7507',
    email: 'info@dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Sterling',
    street_address: '46301 Potomac Run Plaza',
    city: 'Sterling',
    state: 'VA',
    zip_code: '20164',
    latitude: 39.0060,
    longitude: -77.4284,
    phone: '(703) 444-7891',
    email: 'info@dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Woodbridge',
    street_address: '14010 Worth Ave',
    city: 'Woodbridge',
    state: 'VA',
    zip_code: '22192',
    latitude: 38.6512,
    longitude: -77.2890,
    phone: '(703) 490-4890',
    email: 'info@dcgoodwill.org',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Dale City',
    street_address: '14415 Smoketown Rd',
    city: 'Dale City',
    state: 'VA',
    zip_code: '22193',
    latitude: 38.6345,
    longitude: -77.3456,
    phone: '(703) 680-6427',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },
  {
    name: 'Habitat for Humanity ReStore Loudoun',
    street_address: '750 Miller Dr SE',
    city: 'Leesburg',
    state: 'VA',
    zip_code: '20175',
    latitude: 39.0978,
    longitude: -77.5289,
    phone: '(703) 737-6772',
    accepted_items: ['furniture', 'building materials', 'appliances', 'tools', 'home decor'],
    is_active: true
  },

  // FREDERICKSBURG AREA
  {
    name: 'Goodwill Fredericksburg',
    street_address: '1361 Central Park Blvd',
    city: 'Fredericksburg',
    state: 'VA',
    zip_code: '22401',
    latitude: 38.2878,
    longitude: -77.5145,
    phone: '(540) 368-7891',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Fredericksburg',
    street_address: '1760 Carl D Silver Pkwy',
    city: 'Fredericksburg',
    state: 'VA',
    zip_code: '22401',
    latitude: 38.2834,
    longitude: -77.5234,
    phone: '(540) 373-7826',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },

  // SUFFOLK / PORTSMOUTH
  {
    name: 'Goodwill Suffolk',
    street_address: '6231 College Dr',
    city: 'Suffolk',
    state: 'VA',
    zip_code: '23435',
    latitude: 36.7289,
    longitude: -76.5834,
    phone: '(757) 686-3800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Goodwill Portsmouth',
    street_address: '3848 Portsmouth Blvd',
    city: 'Portsmouth',
    state: 'VA',
    zip_code: '23701',
    latitude: 36.8345,
    longitude: -76.3567,
    phone: '(757) 465-9800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },

  // WILLIAMSBURG AREA
  {
    name: 'Goodwill Williamsburg',
    street_address: '5251 John Tyler Hwy',
    city: 'Williamsburg',
    state: 'VA',
    zip_code: '23185',
    latitude: 37.2945,
    longitude: -76.7534,
    phone: '(757) 253-6800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },

  // BLACKSBURG / CHRISTIANSBURG
  {
    name: 'Goodwill Christiansburg',
    street_address: '2750 Roanoke St',
    city: 'Christiansburg',
    state: 'VA',
    zip_code: '24073',
    latitude: 37.1456,
    longitude: -80.3945,
    phone: '(540) 381-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'New River Valley Giving Closet',
    street_address: '210 Roanoke St',
    city: 'Christiansburg',
    state: 'VA',
    zip_code: '24073',
    latitude: 37.1298,
    longitude: -80.4089,
    phone: '(540) 382-2959',
    accepted_items: ['clothing', 'household items', 'furniture', 'books'],
    is_active: true
  },

  // WINCHESTER / SHENANDOAH VALLEY
  {
    name: 'Goodwill Winchester',
    street_address: '2475 S Pleasant Valley Rd',
    city: 'Winchester',
    state: 'VA',
    zip_code: '22601',
    latitude: 39.1567,
    longitude: -78.1734,
    phone: '(540) 667-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Salvation Army Family Store - Winchester',
    street_address: '2540 S Pleasant Valley Rd',
    city: 'Winchester',
    state: 'VA',
    zip_code: '22601',
    latitude: 39.1534,
    longitude: -78.1745,
    phone: '(540) 662-4183',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'appliances'],
    is_active: true
  },

  // HARRISONBURG
  {
    name: 'Goodwill Harrisonburg',
    street_address: '1790 E Market St',
    city: 'Harrisonburg',
    state: 'VA',
    zip_code: '22801',
    latitude: 38.4456,
    longitude: -78.8467,
    phone: '(540) 433-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },
  {
    name: 'Our Community Place',
    street_address: '122 W Market St',
    city: 'Harrisonburg',
    state: 'VA',
    zip_code: '22801',
    latitude: 38.4495,
    longitude: -78.8689,
    phone: '(540) 437-1776',
    accepted_items: ['clothing', 'household items', 'furniture', 'food'],
    is_active: true
  },

  // DANVILLE
  {
    name: 'Goodwill Danville',
    street_address: '145 Holt Garrison Pkwy',
    city: 'Danville',
    state: 'VA',
    zip_code: '24540',
    latitude: 36.5867,
    longitude: -79.4234,
    phone: '(434) 797-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  },

  // BRISTOL / TRI-CITIES
  {
    name: 'Goodwill Bristol',
    street_address: '20461 Rustic Dr',
    city: 'Bristol',
    state: 'VA',
    zip_code: '24202',
    latitude: 36.6345,
    longitude: -82.1234,
    phone: '(276) 466-8800',
    accepted_items: ['clothing', 'furniture', 'household items', 'electronics', 'books'],
    is_active: true
  }
];

console.log('🚀 Adding MASSIVE Virginia donation center list...');
console.log(`   Total new centers: ${centers.length}\n`);

async function insertAll() {
  console.log('Inserting in batches...\n');

  // Insert in batches of 10
  const batchSize = 10;
  let totalInserted = 0;

  for (let i = 0; i < centers.length; i += batchSize) {
    const batch = centers.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('donation_centers')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
    } else {
      totalInserted += data.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Added ${data.length} centers`);
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 TOTAL INSERTED: ${totalInserted} centers\n`);

  // Get final count
  const { count } = await supabase
    .from('donation_centers')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'VA');

  console.log(`📊 TOTAL VIRGINIA CENTERS IN DATABASE: ${count}`);
}

insertAll();
