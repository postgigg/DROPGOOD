import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Users, Truck, Target, Shield, Sparkles, TrendingUp, Globe } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Community First',
    description: 'We connect donors with local charities, strengthening communities across America.'
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'All drivers are background-checked and verified. Your safety is our priority.'
  },
  {
    icon: Sparkles,
    title: 'Simplicity',
    description: 'Donating should be easy. We handle the logistics so you can focus on giving back.'
  },
  {
    icon: Globe,
    title: 'Nationwide Impact',
    description: 'From coast to coast, we\'re making donation accessible to everyone.'
  }
];

const stats = [
  { number: '50+', label: 'States Served' },
  { number: '10K+', label: 'Pickups Completed' },
  { number: '500+', label: 'Partner Charities' },
  { number: '1M+', label: 'Items Donated' }
];

const timeline = [
  {
    year: '2023',
    title: 'The Beginning',
    description: 'Founded in Richmond, Virginia with a simple mission: make donating as easy as ordering a ride.'
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description: 'Expanded to serve all 50 states, partnering with hundreds of local charities nationwide.'
  },
  {
    year: '2025',
    title: 'Innovation',
    description: 'Partnering with Dolly Group for large item handling and continuing to improve our service.'
  },
  {
    year: 'Future',
    title: 'The Vision',
    description: 'Becoming America\'s most trusted donation pickup service, connecting millions with causes they care about.'
  }
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us - Our Mission to Make Donating Easy | DropGood</title>
        <meta name="description" content="Learn about DropGood's mission to connect donors with local charities through convenient pickup services. Founded in Richmond, VA, now serving nationwide." />
        <meta name="keywords" content="about dropgood, donation pickup mission, charity pickup service, Richmond VA startup, donation company story" />
        <link rel="canonical" href="https://dropgood.co/about" />

        {/* Open Graph */}
        <meta property="og:title" content="About DropGood - Making Donation Easy" />
        <meta property="og:description" content="Founded in Richmond, VA with a mission to make donating as easy as ordering a ride. Now serving all 50 states." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/about" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us - DropGood" />
        <meta name="twitter:description" content="Making donation accessible to everyone, nationwide." />

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DropGood",
            "description": "Nationwide donation pickup service connecting donors with local charities",
            "url": "https://dropgood.co",
            "logo": "https://dropgood.co/logo.png",
            "foundingDate": "2023",
            "foundingLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Richmond",
                "addressRegion": "VA",
                "addressCountry": "US"
              }
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-3xl font-bold text-white">DropGood</h1>
              </Link>
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Making Donation{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                  Effortless
                </span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                We believe everyone deserves an easy way to give back. That's why we created DropGood—the
                simplest way to donate items to the charities you care about, right from your home.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-12 text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 rounded-full p-4">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">Our Mission</h3>
              </div>
              <p className="text-xl text-emerald-50 leading-relaxed mb-6">
                To connect generous donors with meaningful causes through technology and logistics, making the
                donation process as simple as pressing a button.
              </p>
              <p className="text-lg text-emerald-100 leading-relaxed">
                We're building a platform where giving back is convenient, transparent, and impactful—helping
                communities thrive, one pickup at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-800 border-y border-slate-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Our Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-5xl font-bold text-emerald-400 mb-2">{stat.number}</div>
                  <div className="text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Our Story</h3>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 mb-12">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                DropGood was born from a simple frustration: donating items to charity was unnecessarily complicated.
                You had to load everything into your car, drive across town, and hope the donation center was open.
                For many people with busy schedules, mobility challenges, or no vehicle, donating became nearly impossible.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                We asked ourselves: <span className="text-emerald-400 font-semibold">What if donating was as easy as ordering a ride?</span>
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Starting in Richmond, Virginia in 2023, we built a platform that connects donors with verified drivers
                and local charities. Now serving all 50 states, we've helped thousands of people declutter their homes,
                support causes they care about, and make a real difference in their communities—all without leaving home.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
              <h4 className="text-2xl font-bold text-white text-center mb-8">Our Journey</h4>
              {timeline.map((item, index) => (
                <div key={item.year} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {item.year}
                    </div>
                  </div>
                  <div className="flex-1 pb-8 border-l-2 border-slate-700 pl-6 -ml-px">
                    {index < timeline.length - 1 && (
                      <div className="absolute w-0.5 h-full bg-gradient-to-b from-slate-700 to-transparent" />
                    )}
                    <h5 className="text-xl font-bold text-white mb-2">{item.title}</h5>
                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-slate-800 border-y border-slate-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-4">Our Values</h3>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              These principles guide everything we do at DropGood
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <div className="bg-emerald-500/10 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why We're Different */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Why We're Different
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-emerald-400" />
                  <h4 className="text-xl font-bold text-white">Full-Service Pickup</h4>
                </div>
                <p className="text-slate-400">
                  We come to you. No need to load your car or drive anywhere. Our drivers handle everything
                  from pickup to delivery.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-emerald-400" />
                  <h4 className="text-xl font-bold text-white">Your Choice of Charity</h4>
                </div>
                <p className="text-slate-400">
                  You decide where your donations go. Browse our network of verified charities and choose
                  causes that matter to you.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                  <h4 className="text-xl font-bold text-white">Real-Time Updates</h4>
                </div>
                <p className="text-slate-400">
                  Track your pickup from start to finish with SMS updates, photos, and real-time notifications.
                  Always know what's happening.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  <h4 className="text-xl font-bold text-white">Transparent Pricing</h4>
                </div>
                <p className="text-slate-400">
                  Know exactly what you'll pay before booking. No hidden fees, no surprises. Just honest,
                  straightforward pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Section */}
        <div className="bg-slate-800 border-y border-slate-700 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Growing Together</h3>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              We're proud to partner with the <span className="text-emerald-400 font-semibold">Dolly Group</span> for
              handling larger items and specialty donations. This partnership ensures we can accommodate donations of
              all sizes while maintaining our commitment to quality service.
            </p>
            <p className="text-slate-400">
              Whether you're donating a few boxes or clearing out an entire home, we've got you covered.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-12 text-center shadow-2xl">
            <h3 className="text-4xl font-bold text-white mb-4">
              Join Us in Making a Difference
            </h3>
            <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
              Whether you're donating items or looking to partner with us, we'd love to hear from you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/book"
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-xl"
              >
                Schedule a Pickup
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-bold text-lg hover:bg-emerald-800 transition-colors border-2 border-white/20"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
