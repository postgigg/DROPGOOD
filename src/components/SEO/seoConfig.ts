// SEO configuration for all pages - Nationwide USA focus

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export const defaultSEO: SEOConfig = {
  title: 'DropGood - Nationwide Donation Pickup Service | For Consumers, Companies & Charities',
  description: 'Hassle-free donation pickup service across the USA. Schedule charity pickup in 500+ cities. Employee benefits for companies. Free listing for charities. Tax-deductible receipts.',
  keywords: 'donation pickup service, charity pickup usa, nationwide donation service, schedule donation pickup, tax deductible donation, goodwill pickup, salvation army pickup, employee wellness benefits, corporate donation program',
  ogImage: '/og-images/home.jpg',
  ogType: 'website',
};

export const seoPages: Record<string, SEOConfig> = {
  home: {
    title: 'DropGood - Donate Without the Drive | Donation Pickup Service Nationwide',
    description: 'Donate without the drive. Schedule donation pickup and delivery to local charities nationwide. Employee benefits for companies. Free for charities. Tax-deductible receipts, real-time tracking. Serving 500+ cities.',
    keywords: 'donation pickup service, charity pickup, donate without driving, tax deductible donation, goodwill pickup, salvation army pickup, nationwide donation service, employee wellness, corporate giving',
    canonical: 'https://dropgood.com',
    ogImage: '/og-images/home.jpg',
  },

  booking: {
    title: 'Book a Donation Pickup | DropGood',
    description: 'Schedule your donation pickup in 2 minutes. Choose from nearby charities, see exact prices based on distance, get instant confirmation. Available nationwide.',
    keywords: 'book donation pickup, schedule charity pickup, donate items, donation booking, charity delivery service',
    canonical: 'https://dropgood.com/book',
    ogImage: '/og-images/booking.jpg',
  },

  donationCenters: {
    title: 'For Donation Centers & Charities | Free Listing + Sponsorships | DropGood',
    description: 'Free listing for donation centers nationwide. Sponsor pickups to drive more donations. Geographic targeting, flexible budgets, real-time analytics. Join Goodwill, Salvation Army & 1000+ charities.',
    keywords: 'donation center platform, charity donations, nonprofit fundraising, increase donations, charity sponsorship, donation center software, charity pickup service, attract donors, donation marketing',
    canonical: 'https://dropgood.com/donation-centers',
    ogImage: '/og-images/donation-centers.jpg',
  },

  forCompanies: {
    title: 'Employee Wellness Benefit - Subsidized Donation Pickups | DropGood for Companies',
    description: 'Free employee benefit. Subsidize donation pickups as a unique wellness perk. No subscription fees, pay-as-you-go. 100% tax deductible. Unlimited employees. Great PR & CSR value.',
    keywords: 'employee wellness benefits, corporate benefits program, employee perks, tax deductible benefits, corporate social responsibility, employee donation program, workplace wellness, unique employee benefits, decluttering benefit, corporate giving program',
    canonical: 'https://dropgood.com/for-companies',
    ogImage: '/og-images/for-companies.jpg',
  },

  companySignup: {
    title: 'Sign Up Your Company - Free Employee Benefits | DropGood',
    description: 'Sign up free. Add unlimited employees. Fund a credit balance and pay only for what\'s used. Set subsidy from 25-100%. Dashboard included. Start in 5 minutes.',
    keywords: 'company signup, employee benefits enrollment, corporate wellness program, b2b donation service, company benefits platform',
    canonical: 'https://dropgood.com/company-signup',
    ogImage: '/og-images/company-signup.jpg',
  },

  joinCompany: {
    title: 'Enroll in Your Company Benefits | DropGood',
    description: 'Access your company\'s donation pickup benefit. Enter your access code to get subsidized pickups. Free for employees.',
    keywords: 'employee enrollment, company benefits, employee perks access, corporate benefits',
    canonical: 'https://dropgood.com/join-company',
    ogImage: '/og-images/join-company.jpg',
  },

  tracking: {
    title: 'Track Your Donation Pickup | DropGood',
    description: 'Real-time tracking for your donation pickup. Get updates when driver is assigned, items picked up, and delivered to charity.',
    keywords: 'track donation, pickup tracking, donation status, delivery tracking',
    canonical: 'https://dropgood.com/track',
    ogImage: '/og-images/tracking.jpg',
  },

  receipt: {
    title: 'Tax-Deductible Donation Receipt | DropGood',
    description: 'IRS-compliant 501(c)(3) donation receipt. Download or print your tax-deductible donation receipt for tax filing.',
    keywords: 'tax receipt, donation receipt, 501c3 receipt, charitable contribution receipt, irs donation receipt',
    canonical: 'https://dropgood.com/receipt',
    ogImage: '/og-images/receipt.jpg',
  },

  confirmation: {
    title: 'Pickup Scheduled | DropGood',
    description: 'Your donation pickup has been scheduled. Track your pickup and receive your tax-deductible receipt after delivery.',
    keywords: 'donation confirmation, pickup scheduled, charity pickup confirmation',
    canonical: 'https://dropgood.com/confirmation',
  },
};

// City-specific SEO configurations (scalable for any US city)
export interface CitySEOConfig extends SEOConfig {
  cityName: string;
  stateName: string;
  stateCode: string;
  localCharities?: string[];
  population?: string;
}

export const citySEO: Record<string, CitySEOConfig> = {
  'richmond-va': {
    cityName: 'Richmond',
    stateName: 'Virginia',
    stateCode: 'VA',
    title: 'Donation Pickup Service in Richmond, VA | DropGood',
    description: 'Schedule donation pickup in Richmond, Virginia. We deliver to Goodwill of Central Virginia, Salvation Army, FeedMore & local charities. Tax receipts included. Book in 2 minutes.',
    keywords: 'donation pickup richmond va, goodwill pickup richmond, charity pickup richmond virginia, donate furniture richmond va, richmond donation centers',
    canonical: 'https://dropgood.com/donate/richmond-va',
    ogImage: '/og-images/cities/richmond-va.jpg',
    localCharities: ['Goodwill of Central Virginia', 'Salvation Army Richmond', 'FeedMore', 'SPCA of Virginia'],
  },

  'austin-tx': {
    cityName: 'Austin',
    stateName: 'Texas',
    stateCode: 'TX',
    title: 'Donation Pickup Service in Austin, TX | DropGood',
    description: 'Schedule donation pickup in Austin, Texas. We deliver to Goodwill, Salvation Army, Austin Pets Alive & local charities. Tax receipts included. Book in 2 minutes.',
    keywords: 'donation pickup austin tx, goodwill pickup austin, charity pickup austin texas, donate furniture austin tx, austin donation centers',
    canonical: 'https://dropgood.com/donate/austin-tx',
    ogImage: '/og-images/cities/austin-tx.jpg',
    localCharities: ['Goodwill of Central Texas', 'Salvation Army Austin', 'Austin Pets Alive', 'Capital Area Food Bank'],
  },

  // Add more cities as needed - this is scalable nationwide
};

// Helper function to get city SEO or generate it dynamically
export function getCitySEO(citySlug: string): CitySEOConfig | null {
  return citySEO[citySlug] || null;
}

// Helper to generate SEO for any city dynamically
export function generateCitySEO(cityName: string, stateCode: string, stateName: string): CitySEOConfig {
  return {
    cityName,
    stateName,
    stateCode,
    title: `Donation Pickup Service in ${cityName}, ${stateCode} | DropGood`,
    description: `Schedule donation pickup in ${cityName}, ${stateName}. We deliver to local charities including Goodwill, Salvation Army & more. Tax receipts included. Book in 2 minutes.`,
    keywords: `donation pickup ${cityName.toLowerCase()} ${stateCode.toLowerCase()}, goodwill pickup ${cityName.toLowerCase()}, charity pickup ${cityName.toLowerCase()}, donate ${cityName.toLowerCase()}`,
    canonical: `https://dropgood.com/donate/${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateCode.toLowerCase()}`,
  };
}
