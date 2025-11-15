import { Helmet } from 'react-helmet-async';
import { SEOConfig } from './seoConfig';

interface SEOProps extends Partial<SEOConfig> {
  children?: React.ReactNode;
}

export default function SEO({
  title = 'DropGood - Nationwide Donation Pickup Service | USA',
  description = 'Hassle-free donation pickup service across the USA. Schedule charity pickup in 500+ cities. Tax-deductible receipts. $10-20 pricing.',
  keywords = 'donation pickup service, charity pickup usa, nationwide donation service',
  canonical,
  ogImage = '/og-images/home.jpg',
  ogType = 'website',
  children,
}: SEOProps) {
  const siteUrl = 'https://dropgood.co';
  const fullCanonical = canonical || siteUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DropGood" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="DropGood" />

      {/* Geographic tags for nationwide service */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />

      {children}
    </Helmet>
  );
}
