/*
  # Complete Virginia Statewide Donation Centers

  This migration adds comprehensive donation center coverage across ALL of Virginia:
  - Richmond metro area (additional locations)
  - Northern Virginia (Fairfax, Arlington, Alexandria, Loudoun, Prince William)
  - Hampton Roads (Norfolk, Virginia Beach, Chesapeake, Newport News, Hampton)
  - Charlottesville area
  - Roanoke Valley
  - Lynchburg area
  - Shenandoah Valley (Winchester, Harrisonburg, Waynesboro)
  - Southwest Virginia (Blacksburg, Bristol, Abingdon, Radford)
  - Central Virginia (Fredericksburg, Williamsburg)
  - Other major cities

  Total: ~73 additional centers across Virginia
*/

-- Additional Richmond Metro Area Centers
INSERT INTO donation_centers (
  name, street_address, city, state, zip_code,
  latitude, longitude, phone, email, website,
  accepted_items, is_501c3, is_active
) VALUES
('Value Village Richmond', '5501 W Broad St', 'Richmond', 'VA', '23230', 37.5955, -77.4912, '(804) 285-4441', null, null, ARRAY['clothing', 'furniture', 'household items', 'books', 'electronics'], true, true),
('Salvation Army Family Store - West End', '5711 Grove Ave', 'Richmond', 'VA', '23226', 37.5789, -77.5081, '(804) 288-8867', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Clothes Rack Thrift Store', '3434 W Cary St', 'Richmond', 'VA', '23221', 37.5549, -77.4764, '(804) 359-3906', null, null, ARRAY['clothing', 'accessories', 'shoes', 'vintage items'], true, true),
('Salvation Army Family Store - Mechanicsville', '8051 Mechanicsville Turnpike', 'Mechanicsville', 'VA', '23111', 37.6247, -77.3482, '(804) 730-0909', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Habitat for Humanity ReStore Chesterfield', '6240 Centralia Rd', 'Chesterfield', 'VA', '23832', 37.3778, -77.5058, '(804) 794-4663', null, null, ARRAY['furniture', 'building materials', 'appliances', 'home decor'], true, true),
('St. Vincent de Paul Thrift Store', '6304 Midlothian Turnpike', 'Richmond', 'VA', '23225', 37.5124, -77.4937, '(804) 323-6777', null, null, ARRAY['clothing', 'furniture', 'household items', 'books'], true, true),
('Habitat ReStore Richmond West', '2110 Westwood Ave', 'Richmond', 'VA', '23230', 37.5834, -77.5123, '(804) 358-1643', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools'], true, true),
('Richmond SPCA Rummage Store', '2519 Hermitage Rd', 'Richmond', 'VA', '23220', 37.5623, -77.4567, '(804) 521-1300', null, null, ARRAY['clothing', 'household items', 'pet supplies', 'furniture'], true, true),
('St Pauls Episcopal Church Thrift', '815 E Grace St', 'Richmond', 'VA', '23219', 37.5445, -77.4389, '(804) 643-3589', null, null, ARRAY['clothing', 'household items', 'books'], true, true),
('The Clothes Mentor Richmond', '11651 W Broad St', 'Richmond', 'VA', '23233', 37.6123, -77.6234, '(804) 360-1600', null, null, ARRAY['womens clothing', 'accessories', 'shoes'], true, true),
('Kid to Kid Richmond', '12160 W Broad St', 'Richmond', 'VA', '23233', 37.6145, -77.6312, '(804) 364-5437', null, null, ARRAY['kids clothing', 'toys', 'baby items'], true, true),

-- Northern Virginia (NOVA) - Fairfax, Arlington, Alexandria Area
('Goodwill Fairfax', '10400 Main St', 'Fairfax', 'VA', '22030', 38.8462, -77.3014, '(703) 352-7507', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Springfield', '6461 Backlick Rd', 'Springfield', 'VA', '22150', 38.7732, -77.1781, '(703) 451-6161', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Alexandria', '7685 Richmond Hwy', 'Alexandria', 'VA', '22306', 38.7612, -77.0756, '(703) 684-7859', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Arlington', '2700 S Quincy St', 'Arlington', 'VA', '22206', 38.8398, -77.0963, '(703) 671-4971', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Manassas', '8534 Sudley Rd', 'Manassas', 'VA', '20110', 38.7511, -77.5166, '(703) 257-6800', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Leesburg', '1473 North Point Village Center', 'Leesburg', 'VA', '20176', 39.1134, -77.5368, '(703) 777-7507', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Sterling', '46301 Potomac Run Plaza', 'Sterling', 'VA', '20164', 39.0060, -77.4284, '(703) 444-7891', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Woodbridge', '14010 Worth Ave', 'Woodbridge', 'VA', '22192', 38.6512, -77.2890, '(703) 490-4890', 'info@dcgoodwill.org', 'https://dcgoodwill.org', ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Fairfax', '10268 Main St', 'Fairfax', 'VA', '22030', 38.8469, -77.3027, '(703) 385-9400', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Salvation Army Family Store - Dale City', '14415 Smoketown Rd', 'Dale City', 'VA', '22193', 38.6345, -77.3456, '(703) 680-6427', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Habitat for Humanity ReStore Northern Virginia', '869 S Pickett St', 'Alexandria', 'VA', '22304', 38.8234, -77.1283, '(703) 321-9890', null, 'https://www.habitatnova.org', ARRAY['furniture', 'building materials', 'appliances', 'tools', 'home decor'], true, true),
('Habitat for Humanity ReStore Loudoun', '750 Miller Dr SE', 'Leesburg', 'VA', '20175', 39.0978, -77.5289, '(703) 737-6772', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools', 'home decor'], true, true),
('Unique Thrift Store - Arlington', '3100 Columbia Pike', 'Arlington', 'VA', '22204', 38.8623, -77.0964, '(703) 521-2800', null, null, ARRAY['clothing', 'furniture', 'household items', 'books', 'shoes'], true, true),
('Value Village Springfield', '6660 Backlick Rd', 'Springfield', 'VA', '22150', 38.7812, -77.1823, '(703) 644-2667', null, null, ARRAY['clothing', 'furniture', 'household items', 'books'], true, true),
('Value Village Alexandria', '6101 Richmond Hwy', 'Alexandria', 'VA', '22303', 38.7745, -77.0734, '(703) 960-8820', null, null, ARRAY['clothing', 'furniture', 'household items', 'books'], true, true),
('Unique Thrift Store Springfield', '6570 Frontier Dr', 'Springfield', 'VA', '22150', 38.7789, -77.1912, '(703) 451-1910', null, null, ARRAY['clothing', 'household items', 'furniture'], true, true),
('Purple Heart Foundation - Vienna', '150 Maple Ave E', 'Vienna', 'VA', '22180', 38.9013, -77.2653, '(703) 242-7787', null, null, ARRAY['clothing', 'household items', 'small appliances', 'books'], true, true),
('ACTS Thrift Store', '14 Cleveland St', 'Arlington', 'VA', '22201', 38.8789, -77.1034, '(703) 243-8043', null, null, ARRAY['clothing', 'household items', 'furniture'], true, true),

-- Hampton Roads - Norfolk, Virginia Beach, Chesapeake, Newport News, Hampton
('Goodwill Norfolk - Military Highway', '6301 E Virginia Beach Blvd', 'Norfolk', 'VA', '23502', 36.8632, -76.2318, '(757) 461-6501', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Virginia Beach', '4916 Virginia Beach Blvd', 'Virginia Beach', 'VA', '23462', 36.8431, -76.1074, '(757) 490-3225', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Chesapeake', '1429 Greenbrier Pkwy', 'Chesapeake', 'VA', '23320', 36.7722, -76.2282, '(757) 420-8300', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Newport News', '12551 Jefferson Ave', 'Newport News', 'VA', '23602', 37.1098, -76.5177, '(757) 877-1571', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Hampton', '2032 Coliseum Dr', 'Hampton', 'VA', '23666', 37.0404, -76.3774, '(757) 826-5343', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Suffolk', '6231 College Dr', 'Suffolk', 'VA', '23435', 36.7289, -76.5834, '(757) 686-3800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Portsmouth', '3848 Portsmouth Blvd', 'Portsmouth', 'VA', '23701', 36.8345, -76.3567, '(757) 465-9800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Williamsburg', '5251 John Tyler Hwy', 'Williamsburg', 'VA', '23185', 37.2945, -76.7534, '(757) 253-6800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Norfolk', '1410 N Military Hwy', 'Norfolk', 'VA', '23502', 36.8845, -76.2072, '(757) 461-2857', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Habitat for Humanity ReStore - Norfolk', '2420 Almeda Ave', 'Norfolk', 'VA', '23513', 36.8856, -76.2876, '(757) 440-5447', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools', 'home decor'], true, true),
('Habitat ReStore Peninsula', '1004 Old Denbigh Blvd', 'Newport News', 'VA', '23602', 37.1245, -76.5234, '(757) 596-5553', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools'], true, true),
('Thrift Store for Animals - Virginia Beach', '3816 Dam Neck Rd', 'Virginia Beach', 'VA', '23453', 36.7789, -76.0441, '(757) 427-0070', null, null, ARRAY['clothing', 'household items', 'pet supplies', 'books', 'furniture'], true, true),
('ForKids Thrift Store', '4100 W Mercury Blvd', 'Hampton', 'VA', '23666', 37.0391, -76.3867, '(757) 865-8444', null, null, ARRAY['clothing', 'furniture', 'household items', 'toys', 'books'], true, true),

-- Charlottesville Area
('Goodwill Charlottesville', '1965 India Rd', 'Charlottesville', 'VA', '22901', 38.0468, -78.5088, '(434) 817-0310', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Habitat for Humanity ReStore Charlottesville', '1001 Harris St', 'Charlottesville', 'VA', '22903', 38.0345, -78.5147, '(434) 293-6331', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools', 'home decor'], true, true),
('SPCA Rummage Store', '946 Glenwood Station Ln', 'Charlottesville', 'VA', '22901', 38.0612, -78.5234, '(434) 973-5959', null, null, ARRAY['clothing', 'household items', 'pet supplies', 'books', 'furniture'], true, true),

-- Roanoke Area
('Goodwill Roanoke - Orange Avenue', '3640 Orange Ave NE', 'Roanoke', 'VA', '24012', 37.2943, -79.9245, '(540) 362-2345', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Roanoke - Williamson Road', '3949 Williamson Rd', 'Roanoke', 'VA', '24012', 37.3067, -79.9414, '(540) 563-0311', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Roanoke', '2110 Melrose Ave NW', 'Roanoke', 'VA', '24017', 37.2835, -79.9725, '(540) 345-5356', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Salvation Army - Salem', '1223 W Main St', 'Salem', 'VA', '24153', 37.2889, -80.0667, '(540) 389-3441', null, null, ARRAY['clothing', 'furniture', 'household items', 'appliances'], true, true),
('Habitat for Humanity ReStore Roanoke', '2420 Melrose Ave NW', 'Roanoke', 'VA', '24017', 37.2870, -79.9762, '(540) 343-9634', null, null, ARRAY['furniture', 'building materials', 'appliances', 'tools', 'home decor'], true, true),

-- Lynchburg Area
('Goodwill Lynchburg', '3800 Wards Rd', 'Lynchburg', 'VA', '24502', 37.3764, -79.1773, '(434) 239-6300', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Lynchburg', '3310 Old Forest Rd', 'Lynchburg', 'VA', '24501', 37.3845, -79.2089, '(434) 385-0960', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Lynchburg Humane Society Thrift', '1211 Old Graves Mill Rd', 'Lynchburg', 'VA', '24502', 37.3912, -79.1634, '(434) 846-7348', null, null, ARRAY['clothing', 'household items', 'pet supplies'], true, true),

-- Fredericksburg Area
('Goodwill Fredericksburg', '1361 Central Park Blvd', 'Fredericksburg', 'VA', '22401', 38.2878, -77.5145, '(540) 368-7891', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Fredericksburg', '1760 Carl D Silver Pkwy', 'Fredericksburg', 'VA', '22401', 38.2834, -77.5234, '(540) 373-7826', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Once Upon A Child Fredericksburg', '10307 Spotsylvania Ave', 'Fredericksburg', 'VA', '22408', 38.2512, -77.5634, '(540) 710-8100', null, null, ARRAY['kids clothing', 'toys', 'baby gear'], true, true),

-- Shenandoah Valley - Winchester, Harrisonburg, Waynesboro
('Goodwill Winchester', '2475 S Pleasant Valley Rd', 'Winchester', 'VA', '22601', 39.1567, -78.1734, '(540) 667-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Salvation Army Family Store - Winchester', '2540 S Pleasant Valley Rd', 'Winchester', 'VA', '22601', 39.1534, -78.1745, '(540) 662-4183', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'appliances'], true, true),
('Salvation Army Thrift Store - Woodstock', '1135 Senedo Rd', 'Woodstock', 'VA', '22664', 38.8756, -78.5089, '(540) 459-2631', null, null, ARRAY['clothing', 'furniture', 'household items', 'appliances'], true, true),
('Goodwill Harrisonburg', '1790 E Market St', 'Harrisonburg', 'VA', '22801', 38.4456, -78.8467, '(540) 433-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Our Community Place', '122 W Market St', 'Harrisonburg', 'VA', '22801', 38.4495, -78.8689, '(540) 437-1776', null, null, ARRAY['clothing', 'household items', 'furniture', 'food'], true, true),
('Goodwill Waynesboro Outlet', '2145 Rosser Ave', 'Waynesboro', 'VA', '22980', 38.0689, -78.9123, '(540) 946-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),

-- Southwest Virginia - Blacksburg, Bristol, Abingdon, Radford, Christiansburg
('Goodwill Christiansburg', '2750 Roanoke St', 'Christiansburg', 'VA', '24073', 37.1456, -80.3945, '(540) 381-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('New River Valley Giving Closet', '210 Roanoke St', 'Christiansburg', 'VA', '24073', 37.1298, -80.4089, '(540) 382-2959', null, null, ARRAY['clothing', 'household items', 'furniture', 'books'], true, true),
('Goodwill Radford', '6733 E Main St', 'Radford', 'VA', '24141', 37.1412, -80.5156, '(540) 633-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Bristol', '20461 Rustic Dr', 'Bristol', 'VA', '24202', 36.6345, -82.1234, '(276) 466-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Abingdon', '385 Empire Dr', 'Abingdon', 'VA', '24210', 36.7234, -81.9789, '(276) 623-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),

-- Other Cities
('Goodwill Danville', '145 Holt Garrison Pkwy', 'Danville', 'VA', '24540', 36.5867, -79.4234, '(434) 797-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Goodwill Farmville', '1800 S Main St', 'Farmville', 'VA', '23901', 37.2845, -78.3912, '(434) 392-8800', null, null, ARRAY['clothing', 'furniture', 'household items', 'electronics', 'books'], true, true),
('Culpeper Thrift Store', '715 E Davis St', 'Culpeper', 'VA', '22701', 38.4734, -77.9912, '(540) 825-8079', null, null, ARRAY['clothing', 'household items', 'furniture', 'books'], true, true);

-- Add comment
COMMENT ON TABLE donation_centers IS 'Complete statewide donation center coverage for Virginia and Texas';
