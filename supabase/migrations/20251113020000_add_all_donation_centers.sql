/*
  # Add All Donation Centers - Richmond VA & Austin TX Areas

  This migration adds comprehensive donation center coverage for:
  1. Richmond, VA and surrounding counties (Petersburg, Chesterfield, Henrico)
  2. Austin, TX metro area (Travis, Williamson, and Hays Counties)

  Organizations included:
  - Goodwill locations
  - Salvation Army locations
  - Habitat for Humanity ReStores
  - Local nonprofits and community centers
  - Food banks
  - Animal shelters (SPCA)
*/

-- =====================================================
-- RICHMOND, VA AREA DONATION CENTERS
-- =====================================================

-- Goodwill Locations in Greater Richmond
INSERT INTO donation_centers (
  name, street_address, city, state, zip_code,
  latitude, longitude,
  phone, email, website,
  accepted_items, hours, is_active
) VALUES
-- Richmond Area Goodwill
(
  'Goodwill West Broad Store',
  '6202 W Broad St',
  'Richmond',
  'VA',
  '23230',
  37.5949, -77.5214,
  '(804) 285-0571',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill Fountain Square Store',
  '8018 W Broad St',
  'Richmond',
  'VA',
  '23294',
  37.5968, -77.5786,
  '(804) 565-6780',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill Laburnum Station Store',
  '3979 Gay Ave',
  'Henrico',
  'VA',
  '23231',
  37.5747, -77.3755,
  '(804) 998-1401',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill Richmond Outlet',
  '6301 Midlothian Turnpike',
  'Richmond',
  'VA',
  '23225',
  37.5123, -77.4935,
  '(804) 745-6300',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "9:00 AM - 6:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill St Matthews Store',
  '1650 St Matthews Ln',
  'Richmond',
  'VA',
  '23233',
  37.6133, -77.5858,
  '(804) 755-0571',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill Bailey Bridge Store',
  '11749 Hull Street Rd',
  'Midlothian',
  'VA',
  '23112',
  37.4465, -77.6485,
  '(804) 744-6375',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),
(
  'Goodwill Petersburg Store',
  '65 Crater Circle',
  'Petersburg',
  'VA',
  '23805',
  37.1983, -77.3858,
  '(804) 451-1772',
  'info@goodwillvirginia.org',
  'https://goodwillvirginia.org',
  ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'],
  '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
  true
),

-- Other Major Donation Centers in Richmond
(
  'Diversity Thrift',
  '1407 Sherwood Ave',
  'Richmond',
  'VA',
  '23220',
  37.5506, -77.4623,
  '(804) 353-8890',
  'info@diversityrichmond.org',
  'https://diversityrichmond.org',
  ARRAY['clothing', 'furniture', 'household items', 'books', 'vintage items'],
  '{"monday": "Closed", "tuesday": "Closed", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "9:00 AM - 6:00 PM", "sunday": "9:00 AM - 6:00 PM"}'::jsonb,
  true
),
(
  'CARITAS Furniture Bank',
  '2220 Stockton St',
  'Richmond',
  'VA',
  '23224',
  37.5284, -77.4089,
  '(804) 358-0964',
  'info@caritasva.org',
  'https://www.caritasva.org',
  ARRAY['furniture', 'household items', 'appliances'],
  '{"monday": "8:00 AM - 4:30 PM", "tuesday": "8:00 AM - 4:30 PM", "wednesday": "8:00 AM - 4:30 PM", "thursday": "8:00 AM - 4:30 PM", "friday": "8:00 AM - 4:30 PM", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  true
),
(
  'SPCA of Petersburg & Colonial Heights',
  '104 Pickwick Ave',
  'Colonial Heights',
  'VA',
  '23834',
  37.2441, -77.4104,
  '(804) 526-7722',
  'info@spcapch.org',
  'https://spca-petersburg-colonialheights-va.com',
  ARRAY['pet supplies', 'pet food', 'toys', 'blankets'],
  '{"monday": "12:00 PM - 6:00 PM", "tuesday": "12:00 PM - 6:00 PM", "wednesday": "12:00 PM - 6:00 PM", "thursday": "12:00 PM - 6:00 PM", "friday": "12:00 PM - 6:00 PM", "saturday": "12:00 PM - 5:00 PM", "sunday": "12:00 PM - 5:00 PM"}'::jsonb,
  true
);

-- =====================================================
-- AUSTIN, TX AREA DONATION CENTERS
-- =====================================================

-- Travis County (Austin) - Goodwill Central Texas
INSERT INTO donation_centers (
  name,
  description,
  street_address,
  city,
  state,
  zip_code,
  latitude,
  longitude,
  phone,
  accepted_items,
  is_501c3,
  is_active,
  is_verified
) VALUES

('Goodwill Central Texas - North Lamar',
 'Goodwill thrift store and donation center accepting clothing, furniture, and household items. All proceeds support job training and employment services.',
 '5555 N Lamar Blvd, Ste B100', 'Austin', 'TX', '78751', 30.3244, -97.7408, '(512) 637-7100',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - Anderson Lane',
 'Full-service Goodwill store accepting donations of clothing, furniture, electronics, and household goods.',
 '2900 W Anderson Ln, Ste 3', 'Austin', 'TX', '78757', 30.3587, -97.7416, '(512) 454-3394',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - Airport Boulevard',
 'Goodwill donation center and retail store serving East Austin with clothing, furniture, and household item donations.',
 '836 Airport Blvd', 'Austin', 'TX', '78702', 30.2895, -97.7161, '(512) 476-6267',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - Lamar Oaks',
 'South Austin Goodwill location accepting all standard donations including clothing, furniture, and household goods.',
 '4001 S Lamar Blvd', 'Austin', 'TX', '78704', 30.2408, -97.7947, '(512) 442-8289',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - South Congress',
 'Popular South Congress Goodwill accepting donations and offering vintage and unique finds.',
 '2415 S Congress Ave', 'Austin', 'TX', '78704', 30.2397, -97.7491, '(512) 447-6744',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - North Outlet',
 'Goodwill outlet store with deep discounts. Accepts all standard donation items.',
 '2300 Scarbrough Dr, Ste 150', 'Austin', 'TX', '78728', 30.4467, -97.6897, '(512) 990-8341',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - South Outlet',
 'Goodwill outlet location offering discounted items. Full donation acceptance.',
 '6505 Burleson Rd', 'Austin', 'TX', '78744', 30.2061, -97.7116, '(512) 326-6853',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

-- Salvation Army Austin Locations
('The Salvation Army Family Store - South Congress',
 'Salvation Army thrift store and donation center. 100% of proceeds support addiction rehabilitation programs in Austin.',
 '4216 S Congress Ave', 'Austin', 'TX', '78745', 30.2272, -97.7563, '(512) 447-2272',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Appliances'], true, true, true),

('The Salvation Army Family Store - Research Blvd',
 'North Austin Salvation Army thrift store accepting furniture, clothing, and household items. Free donation pickup available.',
 '8801 Research Blvd', 'Austin', 'TX', '78758', 30.3708, -97.7235, '(512) 339-4644',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Appliances'], true, true, true),

('The Salvation Army - Manor Road Center',
 'Salvation Army service center and donation facility serving East Austin.',
 '4700 Manor Rd', 'Austin', 'TX', '78723', 30.2911, -97.6928, '(512) 604-1410',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics'], true, true, true),

-- Other Travis County Centers
('ARC of the Capital Area',
 'The ARC provides services to people with disabilities. Accepts furniture, clothing, and household goods.',
 '4902 E Cesar Chavez St', 'Austin', 'TX', '78702', 30.2580, -97.7070, '(512) 476-7044',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Books'], true, true, true),

('Austin Habitat for Humanity ReStore',
 'Discount home improvement store accepting new and gently used building materials, appliances, and furniture. Free pickup available.',
 '310 Comal St', 'Austin', 'TX', '78702', 30.2652, -97.7234, '(512) 472-8788',
 ARRAY['Furniture', 'Building Materials', 'Appliances', 'Tools', 'Home Decor'], true, true, true),

-- Williamson County Donation Centers
('Round Rock Area Serving Center',
 'Community center serving Round Rock and southern Williamson County. Accepts food, clothing, furniture, and household goods. Free donation drop-off.',
 '1099 E Main St', 'Round Rock', 'TX', '78664', 30.5090, -97.6620, '(512) 244-2431',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Food', 'Books'], true, true, true),

('Williamson County Habitat ReStore',
 'Georgetown ReStore offering building materials, furniture, appliances, and home decor. Free pickup of large items in Williamson County.',
 '1010 N Austin Ave', 'Georgetown', 'TX', '78626', 30.6372, -97.6735, '(512) 863-4344',
 ARRAY['Furniture', 'Building Materials', 'Appliances', 'Tools', 'Home Decor'], true, true, true),

('Goodwill Central Texas - Round Rock',
 'Round Rock Goodwill location accepting all standard donations. Convenient I-35 access.',
 '2000 N I-35', 'Round Rock', 'TX', '78664', 30.5280, -97.6798, '(512) 310-0054',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - Cedar Park',
 'Cedar Park Goodwill serving northwest Williamson County. Full donation acceptance.',
 '1335 E Whitestone Blvd', 'Cedar Park', 'TX', '78613', 30.5123, -97.8087, '(512) 259-3861',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

-- Hays County Donation Centers
('Goodwill Donation Center - Buda',
 'Buda first-ever Goodwill location. Attended donation center and bookstore.',
 '407 Main St', 'Buda', 'TX', '78610', 30.0851, -97.8409, '(512) 523-5400',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Books', 'Electronics'], true, true, true),

('Hays County Food Bank',
 'Primary food bank serving Hays County. Accepts non-perishable food donations and monetary contributions.',
 '220 Herndon St', 'San Marcos', 'TX', '78666', 29.8822, -97.9397, '(512) 392-8300',
 ARRAY['Food', 'Non-Perishable Items'], true, true, true),

('Southside Community Center',
 'Nonprofit community center affiliated with United Methodist Church. Accepts clothing, hygiene products, packaged food, and household items.',
 '402 Task St', 'San Marcos', 'TX', '78666', 29.8791, -97.9410, '(512) 353-2385',
 ARRAY['Clothing', 'Food', 'Household Items', 'Hygiene Products'], true, true, true),

('Goodwill Central Texas - San Marcos',
 'San Marcos Goodwill serving Texas State University area and Hays County.',
 '1635 Aquarena Springs Dr', 'San Marcos', 'TX', '78666', 29.8908, -97.9311, '(512) 396-4008',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true),

('Goodwill Central Texas - Kyle',
 'Kyle Goodwill location serving fast-growing area between Austin and San Marcos.',
 '5151 FM 1626', 'Kyle', 'TX', '78640', 30.0032, -97.8892, '(512) 268-7300',
 ARRAY['Clothing', 'Furniture', 'Household Items', 'Electronics', 'Books'], true, true, true);

-- Add comment
COMMENT ON TABLE donation_centers IS 'Complete list of donation centers in Richmond VA and Austin TX metro areas';
