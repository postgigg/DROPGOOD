import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronDown, ChevronUp, MessageCircle, HelpCircle, Clock, Package, DollarSign, Truck, Heart, Shield } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General Information
  {
    category: 'General Information',
    question: 'What is DropGood?',
    answer: 'DropGood is a convenient donation pickup service that connects people who want to donate items with local charities and donation centers. We handle the entire pickup and delivery process, making it easy to declutter your home while supporting causes you care about.'
  },
  {
    category: 'General Information',
    question: 'What areas do you serve?',
    answer: 'We operate nationwide across all 50 states, with featured service in Richmond, Virginia and throughout the state. Our network of drivers ensures we can reach most locations in the United States. Visit our Service Areas page for more details.'
  },
  {
    category: 'General Information',
    question: 'What types of items can I donate?',
    answer: 'We accept a wide variety of items including clothing, furniture, household goods, electronics, books, toys, and more. For larger items, we are partnering with Dolly Group to ensure professional handling. Hazardous materials, perishable food, and certain large appliances may not be accepted by all donation centers.'
  },

  // Booking & Scheduling
  {
    category: 'Booking & Scheduling',
    question: 'How do I schedule a pickup?',
    answer: 'Simply enter your address on our homepage, select your preferred donation center, choose a convenient date and time, describe your items, and complete the booking. You\'ll receive confirmation via email and text message with all the details.'
  },
  {
    category: 'Booking & Scheduling',
    question: 'How far in advance do I need to book?',
    answer: 'You can schedule pickups as soon as the next day, subject to driver availability in your area. We recommend booking at least 2-3 days in advance to ensure your preferred time slot.'
  },
  {
    category: 'Booking & Scheduling',
    question: 'Can I cancel or reschedule my pickup?',
    answer: 'Yes, you can cancel or reschedule your pickup up to 24 hours before the scheduled time. Please contact us as soon as possible through our support chat or call us to make changes to your booking.'
  },
  {
    category: 'Booking & Scheduling',
    question: 'What if I\'m not home during the pickup?',
    answer: 'You can leave items in a designated location (garage, porch, etc.) and provide instructions during booking. Our driver will send you a photo confirmation once the items are picked up.'
  },

  // Pricing & Payments
  {
    category: 'Pricing & Payments',
    question: 'How much does the service cost?',
    answer: 'Our pricing is based on the distance from your pickup location to the donation center, plus the estimated volume of items. You\'ll see the exact price before confirming your booking. There are no hidden fees.'
  },
  {
    category: 'Pricing & Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. Payment is processed securely through Stripe at the time of booking.'
  },
  {
    category: 'Pricing & Payments',
    question: 'When will I be charged?',
    answer: 'Your payment card is charged when you complete your booking. You\'ll receive an email receipt immediately after payment is processed.'
  },
  {
    category: 'Pricing & Payments',
    question: 'Is there a minimum or maximum number of items?',
    answer: 'There is no strict minimum, but we recommend having at least a few boxes or bags worth of items to make the service cost-effective. For very large loads or heavy furniture, we partner with Dolly Group to ensure safe handling.'
  },

  // Pickup Process
  {
    category: 'Pickup Process',
    question: 'Who will pick up my donations?',
    answer: 'Our verified, background-checked drivers will handle your pickup. You\'ll receive driver details including name, photo, phone number, vehicle information, and license plate number before the pickup time.'
  },
  {
    category: 'Pickup Process',
    question: 'Will I receive confirmation of pickup?',
    answer: 'Yes! You\'ll receive text messages at key stages: when the driver is assigned, when they\'re on the way, when they arrive, and when items are picked up. Our driver will also take photos as proof of pickup.'
  },
  {
    category: 'Pickup Process',
    question: 'What if my items don\'t fit in the vehicle?',
    answer: 'Our drivers assess your item description before accepting the job. If there\'s any concern, they\'ll contact you in advance. For larger loads, we can schedule a second pickup or arrange a larger vehicle through our Dolly Group partnership.'
  },
  {
    category: 'Pickup Process',
    question: 'Do I need to help load the items?',
    answer: 'No, our drivers will handle all the loading. However, if you have very heavy or bulky items, having them accessible in a garage or near an entrance is helpful. For specialty items, we recommend our Dolly Group service.'
  },

  // Donations & Tax Receipts
  {
    category: 'Donations & Tax Receipts',
    question: 'Will I get a tax-deductible receipt?',
    answer: 'Yes! For our partner donation centers, you\'ll receive an official tax-deductible receipt. For non-partner centers, you\'ll receive a donation summary that you can use for your records. Check if your selected charity is a 501(c)(3) organization.'
  },
  {
    category: 'Donations & Tax Receipts',
    question: 'How do I receive my donation receipt?',
    answer: 'Tax receipts from partner organizations will be emailed to you within 3-5 business days after delivery. For non-partner centers, you\'ll receive a donation summary immediately via email.'
  },
  {
    category: 'Donations & Tax Receipts',
    question: 'Can I choose which charity receives my donations?',
    answer: 'Absolutely! During booking, you can select from our network of verified donation centers and charities. You can search by name, location, or cause to find an organization that aligns with your values.'
  },
  {
    category: 'Donations & Tax Receipts',
    question: 'What happens to my donated items?',
    answer: 'Your items are delivered directly to the donation center you selected. They will sort, process, and distribute items according to their mission - whether that\'s selling in thrift stores, giving directly to families in need, or recycling responsibly.'
  },

  // Account & Technical
  {
    category: 'Account & Technical',
    question: 'Do I need to create an account?',
    answer: 'No account is required to book a pickup. However, we do collect your contact information (name, email, phone) for booking confirmation and communication about your pickup.'
  },
  {
    category: 'Account & Technical',
    question: 'Is my payment information secure?',
    answer: 'Yes, absolutely. We use Stripe, an industry-leading payment processor, which is PCI-DSS compliant. We never store your full credit card information on our servers.'
  },
  {
    category: 'Account & Technical',
    question: 'How do I contact customer support?',
    answer: 'You can reach us through our live chat support (click the chat icon in the bottom right), email us at support@dropgood.co, or visit our Contact page. We typically respond within a few hours during business hours.'
  },
  {
    category: 'Account & Technical',
    question: 'What if I have a problem with my pickup?',
    answer: 'If you experience any issues before, during, or after your pickup, please contact us immediately through live chat or call our support line. We\'re committed to making things right and ensuring a positive experience.'
  }
];

const categories = [
  { name: 'General Information', icon: HelpCircle, color: 'emerald' },
  { name: 'Booking & Scheduling', icon: Clock, color: 'blue' },
  { name: 'Pricing & Payments', icon: DollarSign, color: 'purple' },
  { name: 'Pickup Process', icon: Truck, color: 'orange' },
  { name: 'Donations & Tax Receipts', icon: Heart, color: 'pink' },
  { name: 'Account & Technical', icon: Shield, color: 'slate' }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

  const toggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string; border: string }> = {
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200', border: 'border-emerald-300' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200', border: 'border-blue-300' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200', border: 'border-purple-300' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200', border: 'border-orange-300' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200', border: 'border-pink-300' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-700', hover: 'hover:bg-slate-200', border: 'border-slate-300' }
    };
    return colors[color];
  };

  return (
    <>
      <Helmet>
        <title>Help Center - DropGood | Donation Pickup Service FAQs</title>
        <meta name="description" content="Find answers to common questions about DropGood's donation pickup service. Learn about scheduling, pricing, tax receipts, and more." />
        <meta name="keywords" content="donation pickup help, charity pickup FAQ, donation service questions, tax deductible donations, pickup scheduling help" />
        <link rel="canonical" href="https://dropgood.co/help" />

        {/* Open Graph */}
        <meta property="og:title" content="Help Center - DropGood Donation Pickup Service" />
        <meta property="og:description" content="Get answers to all your questions about our convenient donation pickup service. 24/7 support available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/help" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Help Center - DropGood" />
        <meta name="twitter:description" content="Find answers to common questions about our donation pickup service." />
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-3xl font-bold text-white">DropGood</h1>
              </Link>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                How can we help you?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Find answers to common questions or chat with our support team
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              const isSelected = selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    isSelected
                      ? `${colors.bg} ${colors.text} shadow-lg`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ Results */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-slate-400 mb-6">
                Try different keywords or browse all topics
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => {
                  const isExpanded = expandedFAQs.has(index);
                  const category = categories.find(c => c.category === faq.category);
                  const colors = category ? getColorClasses(category.color) : getColorClasses('slate');

                  return (
                    <div
                      key={index}
                      className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-slate-750 transition-colors"
                      >
                        <div className="flex-1">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${colors.bg} ${colors.text}`}>
                            {faq.category}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {faq.question}
                          </h3>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-5 pt-2">
                          <div className="pl-4 border-l-2 border-emerald-500">
                            <p className="text-slate-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Support CTA */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-center shadow-xl">
              <MessageCircle className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Still have questions?
              </h3>
              <p className="text-emerald-50 text-lg mb-6">
                Our support team is here to help. Chat with us or visit our contact page.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contact"
                  className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  Contact Support
                </Link>
                <Link
                  to="/"
                  className="px-8 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
