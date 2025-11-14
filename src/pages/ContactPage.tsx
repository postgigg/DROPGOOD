import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual form submission logic
      console.log('Form submitted:', formData);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - DropGood | Get in Touch with Our Support Team</title>
        <meta name="description" content="Contact DropGood for support with donation pickups. Live chat, email, and phone support available. We're here to help with all your questions." />
        <meta name="keywords" content="contact dropgood, donation pickup support, customer service, live chat support, contact charity pickup" />
        <link rel="canonical" href="https://dropgood.co/contact" />

        {/* Open Graph */}
        <meta property="og:title" content="Contact Us - DropGood Donation Pickup Service" />
        <meta property="og:description" content="Get in touch with our support team. Live chat, email, and phone support available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/contact" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us - DropGood" />
        <meta name="twitter:description" content="Get in touch with our support team for help with donation pickups." />
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
                Get in Touch
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Have questions about our donation pickup service? We're here to help.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-6">
              {/* Live Chat Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                <p className="text-emerald-50 mb-4">
                  Get instant answers from our support team
                </p>
                <div className="bg-white/20 rounded-lg p-3 text-sm">
                  <p className="font-semibold mb-1">Look for the chat icon</p>
                  <p className="text-emerald-50">
                    Click the green chat button in the bottom right corner to start a conversation
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <div className="bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                <p className="text-slate-400 mb-3">
                  Send us a detailed message
                </p>
                <a
                  href="mailto:support@dropgood.co"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  support@dropgood.co
                </a>
                <p className="text-slate-500 text-sm mt-2">
                  We typically respond within 24 hours
                </p>
              </div>

              {/* Phone Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <div className="bg-purple-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
                <p className="text-slate-400 mb-3">
                  Speak with our team directly
                </p>
                <a
                  href="tel:+18005551234"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold text-lg transition-colors"
                >
                  (800) 555-1234
                </a>
                <div className="mt-3 flex items-start gap-2 text-slate-500 text-sm">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Mon-Fri: 8am - 8pm EST</p>
                    <p>Sat-Sun: 9am - 6pm EST</p>
                  </div>
                </div>
              </div>

              {/* Office Location Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <div className="bg-orange-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Headquarters</h3>
                <p className="text-slate-400 mb-3">
                  Richmond, Virginia
                </p>
                <p className="text-slate-500 text-sm">
                  We operate nationwide with local drivers in all 50 states
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Send us a message</h3>
                <p className="text-slate-400 mb-6">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-400 font-semibold">Message sent successfully!</p>
                      <p className="text-emerald-300 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold">Failed to send message</p>
                      <p className="text-red-300 text-sm">Please try again or contact us directly via email.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-300 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Booking & Scheduling</option>
                      <option value="pricing">Pricing Question</option>
                      <option value="pickup">Pickup Issue</option>
                      <option value="donation">Donation Center Question</option>
                      <option value="receipt">Tax Receipt</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us more about your question or concern..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Links */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Link
                  to="/help"
                  className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-colors group"
                >
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    Visit Help Center
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Find answers to common questions
                  </p>
                </Link>

                <Link
                  to="/book"
                  className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-colors group"
                >
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    Schedule a Pickup
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Ready to donate? Book now
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
