import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper, Download, Mail, Calendar, TrendingUp, Award, Users, MapPin } from 'lucide-react';

const pressReleases = [
  {
    date: '2025-01-15',
    title: 'DropGood Partners with Dolly Group to Expand Large Item Donation Services',
    excerpt: 'Strategic partnership enables handling of oversized donations including furniture and appliances, making charitable giving even more accessible.',
    category: 'Partnership'
  },
  {
    date: '2024-11-10',
    title: 'DropGood Reaches 10,000 Successful Donation Pickups Nationwide',
    excerpt: 'Milestone reflects growing demand for convenient donation services as platform expands across all 50 states.',
    category: 'Milestone'
  },
  {
    date: '2024-09-01',
    title: 'DropGood Launches Nationwide Service, Now Available in All 50 States',
    excerpt: 'Donation pickup platform completes coast-to-coast expansion, connecting donors with local charities across America.',
    category: 'Expansion'
  },
  {
    date: '2024-06-15',
    title: 'DropGood Secures Partnerships with 500+ Charities Nationwide',
    excerpt: 'Growing network of verified donation centers gives donors unprecedented choice in where their items go.',
    category: 'Partnership'
  },
  {
    date: '2024-03-20',
    title: 'DropGood Expands Beyond Virginia, Launches in 25 New States',
    excerpt: 'Rapid growth driven by demand for convenient, tech-enabled donation services.',
    category: 'Expansion'
  },
  {
    date: '2023-11-01',
    title: 'DropGood Launches in Richmond, Virginia',
    excerpt: 'New platform aims to make charitable donations as easy as ordering a ride, starting in the heart of Virginia.',
    category: 'Launch'
  }
];

const mediaKit = [
  {
    icon: Download,
    title: 'Brand Assets',
    description: 'Logos, color palette, and brand guidelines',
    fileSize: '2.4 MB',
    link: '#'
  },
  {
    icon: Download,
    title: 'Company Fact Sheet',
    description: 'Key facts, figures, and company overview',
    fileSize: '145 KB',
    link: '#'
  },
  {
    icon: Download,
    title: 'Executive Headshots',
    description: 'High-resolution leadership team photos',
    fileSize: '8.2 MB',
    link: '#'
  },
  {
    icon: Download,
    title: 'Product Screenshots',
    description: 'Platform interface and user experience',
    fileSize: '5.1 MB',
    link: '#'
  }
];

const stats = [
  {
    icon: MapPin,
    number: '50',
    label: 'States Served',
    detail: 'Coast-to-coast coverage'
  },
  {
    icon: TrendingUp,
    number: '10K+',
    label: 'Pickups Completed',
    detail: 'Growing every day'
  },
  {
    icon: Users,
    number: '500+',
    label: 'Partner Charities',
    detail: 'Verified organizations'
  },
  {
    icon: Award,
    number: '98%',
    label: 'Customer Satisfaction',
    detail: 'Based on reviews'
  }
];

export default function PressPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Partnership': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'Milestone': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'Expansion': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'Launch': 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    };
    return colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  return (
    <>
      <Helmet>
        <title>Press & Media - DropGood News & Press Releases</title>
        <meta name="description" content="Latest news, press releases, and media resources from DropGood. Download our media kit and stay updated on our mission to make donation easy." />
        <meta name="keywords" content="dropgood press, donation service news, charity pickup press releases, dropgood media kit, company news" />
        <link rel="canonical" href="https://dropgood.co/press" />

        {/* Open Graph */}
        <meta property="og:title" content="Press & Media - DropGood" />
        <meta property="og:description" content="Latest news and press releases from DropGood donation pickup service." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/press" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Press & Media - DropGood" />
        <meta name="twitter:description" content="Latest news and press releases about our nationwide donation pickup service." />
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-3xl font-bold text-white">DropGood</h1>
              </Link>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                <Newspaper className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Press & Media</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Latest News
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Stay up to date with DropGood's journey, milestones, and impact on communities nationwide
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Section */}
          <div className="mb-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-slate-300 font-semibold mb-1">{stat.label}</div>
                    <div className="text-slate-500 text-sm">{stat.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Press Releases */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8">Press Releases</h3>

            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(release.date)}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(release.category)}`}>
                        {release.category}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {release.title}
                  </h4>

                  <p className="text-slate-400 leading-relaxed mb-4">
                    {release.excerpt}
                  </p>

                  <button className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors flex items-center gap-2">
                    Read Full Release
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Media Kit */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-8 sm:p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white mb-4">Media Kit</h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Download our brand assets, fact sheets, and media resources
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mediaKit.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.link}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                      <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                        <Icon className="h-6 w-6 text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                      <div className="text-slate-500 text-xs">{item.fileSize}</div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Full Media Kit
                </button>
              </div>
            </div>
          </div>

          {/* Company Overview */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12">
              <h3 className="text-3xl font-bold text-white mb-6">About DropGood</h3>

              <div className="space-y-6 text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">DropGood</strong> is a nationwide donation pickup service that connects
                  generous donors with local charities through convenient, technology-enabled logistics.
                </p>

                <p>
                  Founded in Richmond, Virginia in 2023, DropGood has rapidly expanded to serve all 50 states,
                  completing over 10,000 successful donation pickups and partnering with more than 500 verified
                  charitable organizations.
                </p>

                <p>
                  The platform makes donating as simple as ordering a ride: users enter their address, select a
                  charity, choose a pickup time, and DropGood handles the rest. All drivers are background-checked,
                  and customers receive real-time updates throughout the pickup process.
                </p>

                <p>
                  Through partnerships with organizations like Dolly Group, DropGood can accommodate donations of
                  all sizes—from small boxes of clothes to full furniture sets—ensuring that no item is too big or
                  too small to make a difference.
                </p>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mt-8">
                  <h4 className="text-xl font-bold text-white mb-4">Quick Facts</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li><strong className="text-white">Founded:</strong> 2023</li>
                    <li><strong className="text-white">Headquarters:</strong> Richmond, Virginia</li>
                    <li><strong className="text-white">Service Area:</strong> All 50 United States</li>
                    <li><strong className="text-white">Mission:</strong> Make charitable donation effortless and accessible for everyone</li>
                    <li><strong className="text-white">Website:</strong> <a href="https://dropgood.co" className="text-emerald-400 hover:text-emerald-300">dropgood.co</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Press Contact */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center shadow-2xl">
              <Mail className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Press Inquiries
              </h3>
              <p className="text-emerald-50 text-lg mb-6 max-w-2xl mx-auto">
                For media inquiries, interview requests, or additional information
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-white font-semibold">
                  Email: <a href="mailto:press@dropgood.com" className="text-emerald-100 hover:text-white transition-colors">press@dropgood.com</a>
                </p>
                <p className="text-emerald-100">
                  We typically respond within 24 hours
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-xl"
                >
                  Contact Us
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-bold text-lg hover:bg-emerald-800 transition-colors border-2 border-white/20"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>

          {/* Social Proof / Recognition (Placeholder) */}
          <div className="text-center">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12">
              <h3 className="text-2xl font-bold text-white mb-6">As Featured In</h3>
              <p className="text-slate-400 mb-8">
                Media coverage and recognition (coming soon)
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                <div className="text-slate-600 font-bold text-xl">TechCrunch</div>
                <div className="text-slate-600 font-bold text-xl">Forbes</div>
                <div className="text-slate-600 font-bold text-xl">Fast Company</div>
                <div className="text-slate-600 font-bold text-xl">Business Insider</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
