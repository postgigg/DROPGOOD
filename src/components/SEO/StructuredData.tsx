import { Helmet } from 'react-helmet-async';

interface LocalBusinessProps {
  cityName?: string;
  stateName?: string;
  latitude?: number;
  longitude?: number;
}

export function LocalBusinessSchema({ cityName, stateName, latitude, longitude }: LocalBusinessProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'DropGood',
    description: 'Donation pickup and delivery service connecting donors with local charities',
    url: 'https://dropgood.com',
    telephone: '+1-888-DROP-GOOD',
    email: 'support@dropgood.com',
    priceRange: '$10-$20',
    areaServed: cityName && stateName ? {
      '@type': 'City',
      name: `${cityName}, ${stateName}`,
    } : {
      '@type': 'Country',
      name: 'United States',
    },
    ...(latitude && longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude,
        longitude,
      },
    }),
    sameAs: [
      'https://facebook.com/dropgood',
      'https://twitter.com/dropgood',
      'https://instagram.com/dropgood',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Donation Pickup and Delivery Service',
    provider: {
      '@type': 'Organization',
      name: 'DropGood',
      url: 'https://dropgood.com',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Donation Pickup Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Donation Pickup',
            description: 'Door-to-door pickup of donated items',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Charity Delivery',
            description: 'Delivery to local donation centers and charities',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tax Receipt Generation',
            description: 'IRS-compliant tax-deductible donation receipts',
          },
        },
      ],
    },
    offers: {
      '@type': 'Offer',
      priceRange: '$10-$20',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does pricing work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pricing is based purely on distance from your location to the charity. The closer the charity, the lower the price. You\'ll see exact prices for all nearby charities before booking. All fees are included—no surprises.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if I\'m not home during pickup?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Just leave your items in a safe, accessible spot (porch, garage, etc.) and include detailed instructions during booking. We\'ll text you when our courier is on the way and when pickup is complete.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I get a tax receipt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! After delivery, you\'ll receive a tax-deductible donation receipt from the charity via email, along with photo proof of delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'What size donations can you handle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We handle bags and boxes that fit in a standard vehicle—think clothing, books, small electronics, household items. No furniture, mattresses, or large appliances. If it needs a truck, we can\'t help.',
        },
      },
      {
        '@type': 'Question',
        name: 'How quickly can you pick up?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most pickups are available within 24 hours. You can schedule up to a week in advance. We\'ll send you a text 30 minutes before arrival.',
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function HowToSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Schedule a Donation Pickup with DropGood',
    description: 'Step-by-step guide to scheduling a donation pickup and delivery to your local charity',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '10-20',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter your address',
        text: 'Enter your pickup address to see nearby charities',
        url: 'https://dropgood.com/book',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'See prices for nearby charities',
        text: 'View exact prices for Goodwill, Salvation Army, and other local charities based on distance',
        url: 'https://dropgood.com/book',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Pick a time slot',
        text: 'Choose a convenient pickup window',
        url: 'https://dropgood.com/book',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'We pick it up and deliver it',
        text: 'Our courier picks up your donation and delivers it to the charity',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Get tax receipt and photo proof',
        text: 'Receive an IRS-compliant tax receipt and photo proof of delivery',
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DropGood',
    legalName: 'DropGood Inc.',
    url: 'https://dropgood.com',
    logo: 'https://dropgood.com/logo.png',
    foundingDate: '2025',
    description: 'Nationwide donation pickup service connecting donors with local charities',
    email: 'support@dropgood.com',
    telephone: '+1-888-DROP-GOOD',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    sameAs: [
      'https://facebook.com/dropgood',
      'https://twitter.com/dropgood',
      'https://instagram.com/dropgood',
      'https://linkedin.com/company/dropgood',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
