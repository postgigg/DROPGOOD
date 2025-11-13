-- Add Greater Richmond Area Donation Centers
-- This script adds donation centers in Richmond, Petersburg, Chesterfield, and surrounding counties

-- Goodwill Locations
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

-- Other Major Donation Centers
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
)
ON CONFLICT (street_address, city, state) DO NOTHING;
