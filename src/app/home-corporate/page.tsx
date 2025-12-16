/**
 * HOME STYLE 3 - CORPORATE/PREMIUM
 * Page d'accueil avec design luxueux et professionnel
 * IMPORTANT: ZERO any types
 */

import {
  Gift,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Check,
  Users,
  BarChart3,
  Lock,
  Clock,
  Headphones,
} from 'lucide-react';
import Link from 'next/link';

export default function HomeCorporatePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30">
      {/* Premium Header with Badge */}
      <header className="border-b border-gray-200/50 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badge Bar */}
          <div className="flex justify-center py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Trusted by 1000+ businesses worldwide</span>
            </div>
          </div>

          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ReviewLottery</span>
              <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-500/20 text-yellow-700 text-xs font-bold rounded-full">
                ENTERPRISE
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Corporate */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full mb-6 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Rated 4.9/5 by 500+ enterprise customers
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Enterprise-Grade
                <br />
                <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Review Management
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform customer feedback into business growth with our AI-powered platform.
                Trusted by leading enterprises to drive authentic engagement and build lasting
                customer relationships.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all text-center"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-300 transition-all text-center"
                >
                  Schedule Demo
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-purple-100 to-blue-100 rounded-3xl shadow-2xl p-12 backdrop-blur-sm border border-gray-200/50">
                <div className="grid grid-cols-2 gap-6 h-full">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/50 flex flex-col justify-center">
                    <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">+285%</div>
                    <div className="text-sm text-gray-600 font-semibold">Review Growth</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/50 flex flex-col justify-center">
                    <Users className="w-10 h-10 text-blue-600 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">1000+</div>
                    <div className="text-sm text-gray-600 font-semibold">Active Clients</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/50 flex flex-col justify-center">
                    <Star className="w-10 h-10 text-yellow-500 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                    <div className="text-sm text-gray-600 font-semibold">Avg. Rating</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/50 flex flex-col justify-center">
                    <Shield className="w-10 h-10 text-green-600 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
                    <div className="text-sm text-gray-600 font-semibold">Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 mb-8 uppercase tracking-wide">
            Trusted by Leading Brands
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-32 h-16 bg-gray-400/10 rounded-lg flex items-center justify-center border border-gray-200"
              >
                <div className="text-gray-400 font-bold text-sm">BRAND {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Enterprise Features You Can Trust
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for businesses that demand excellence and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Responses</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate contextually relevant, brand-aligned responses with advanced AI technology
                trained on your business values.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Gift className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gamification Engine</h3>
              <p className="text-gray-600 leading-relaxed">
                Drive engagement with customizable lottery campaigns, interactive games, and reward
                systems that convert customers to advocates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time dashboards with actionable insights, sentiment analysis, and performance
                metrics across all locations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Location Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Centralized control for enterprise chains with role-based access, hierarchical
                oversight, and unified reporting.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automation Suite</h3>
              <p className="text-gray-600 leading-relaxed">
                Streamline operations with intelligent workflows, automated review monitoring, and
                scheduled campaign deployment.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade encryption, GDPR compliance, SOC 2 certified, with dedicated support and
                SLA guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI/Impact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Measurable Impact on Your Bottom Line
              </h2>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Our enterprise clients see an average ROI of 450% within the first year. Real
                results, backed by data.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      285% Average Review Growth
                    </h3>
                    <p className="text-purple-100">
                      Increase in authentic Google reviews within 6 months
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      4.2 to 4.7 Star Rating Jump
                    </h3>
                    <p className="text-purple-100">Average improvement in overall rating score</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">15 Hours Saved Per Week</h3>
                    <p className="text-purple-100">
                      Automation reduces manual review management time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 shadow-2xl">
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-purple-100 font-semibold">Review Volume</span>
                    <span className="text-3xl font-bold text-white">+285%</span>
                  </div>
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-yellow-400 to-yellow-300 rounded-full"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-purple-100 font-semibold">Customer Engagement</span>
                    <span className="text-3xl font-bold text-white">+340%</span>
                  </div>
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-green-400 to-green-300 rounded-full"
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-purple-100 font-semibold">Response Rate</span>
                    <span className="text-3xl font-bold text-white">+420%</span>
                  </div>
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-400 to-blue-300 rounded-full"
                      style={{ width: '95%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-purple-100 font-semibold">Time Efficiency</span>
                    <span className="text-3xl font-bold text-white">+380%</span>
                  </div>
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-400 to-purple-300 rounded-full"
                      style={{ width: '88%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Photos */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">Real stories from real businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "ReviewLottery transformed how we engage with customers. Our review count tripled in
                just 4 months, and the AI responses are incredibly natural."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  SF
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Foster</div>
                  <div className="text-sm text-gray-600">CEO, FosterTech Solutions</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The ROI has been exceptional. We've saved over 20 hours per week while seeing a
                300% increase in customer engagement. Best investment we've made."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  MC
                </div>
                <div>
                  <div className="font-bold text-gray-900">Michael Chen</div>
                  <div className="text-sm text-gray-600">VP Marketing, RetailCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Managing reviews across 50+ locations was a nightmare. ReviewLottery made it
                simple. The multi-location dashboard is a game-changer."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  EJ
                </div>
                <div>
                  <div className="font-bold text-gray-900">Emma Johnson</div>
                  <div className="text-sm text-gray-600">Operations Director, ChainGroup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security/Compliance Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-xl text-gray-400">Your data security is our top priority</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SOC 2 Certified</h3>
              <p className="text-gray-400">Audited security standards</p>
            </div>

            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">GDPR Compliant</h3>
              <p className="text-gray-400">Full data protection</p>
            </div>

            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Google Approved</h3>
              <p className="text-gray-400">Fully compliant platform</p>
            </div>

            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-400">Dedicated success team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl p-16 shadow-2xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Scale Your Review Strategy?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join 1000+ enterprises that trust ReviewLottery to manage their reputation and drive
              growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/login"
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="#"
                className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-300 transition-all"
              >
                Talk to Sales
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Custom enterprise pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Dedicated support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Footer */}
      <footer className="border-t border-gray-200 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Column 1 - Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ReviewLottery</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Enterprise-grade review management platform trusted by 1000+ businesses worldwide.
                Transform customer feedback into growth.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-gray-600 font-bold text-sm">Li</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-gray-600 font-bold text-sm">Tw</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-gray-600 font-bold text-sm">Fb</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Press Kit
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Support */}
            <div>
              <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2025 ReviewLottery. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
