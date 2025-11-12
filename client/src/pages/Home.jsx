import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, CheckCircle, Clock, Users, ArrowRight, Menu, X, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatbotWidget from '../components/ChatbotWidget';

export default function HostelLeaveHomepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const gotonext = () => {
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header - Golden accent */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50 shadow-lg shadow-amber-500/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                <Home className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Hostel LeavePass</Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-amber-900 hover:text-amber-600 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded px-2 py-1">
                Features
              </a>
              <a href="#how-it-works" className="text-amber-900 hover:text-amber-600 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded px-2 py-1">
                How It Works
              </a>
              <a href="#contact" className="text-amber-900 hover:text-amber-600 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded px-2 py-1">
                Contact
              </a>
              <Link to="/login" className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-2 rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 font-bold">
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-amber-100 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-amber-200">
              <a href="#features" className="block text-amber-900 hover:text-amber-600 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-2">
                Features
              </a>
              <a href="#how-it-works" className="block text-amber-900 hover:text-amber-600 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-2">
                How It Works
              </a>
              <a href="#contact" className="block text-amber-900 hover:text-amber-600 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-2">
                Contact
              </a>
              <Link to="/login" className="w-full inline-block text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500">
                Login
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - Golden ratio layout with golden colors */}
      <main>
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 overflow-hidden">
          {/* Animated background gradient orbs - responsive sizes */}
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-amber-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Content: 61.8% (3 columns) - Golden Ratio */}
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="inline-block">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                  ✨ Premium Leave Management
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-amber-950 leading-tight">
                Elegant Hostel
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
                  Leave Management
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-amber-900/80 leading-relaxed max-w-2xl">
                Experience the perfect harmony of efficiency and elegance. Our golden-standard platform makes leave management feel effortless and refined.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/login" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[44px] sm:min-h-[48px]">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <button className="border-2 border-amber-400 text-amber-800 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-50 hover:border-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 backdrop-blur-sm min-h-[44px] sm:min-h-[48px]">
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-amber-900 text-xs sm:text-sm font-medium">500+ Hostels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-amber-900 text-xs sm:text-sm font-medium">50k+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-amber-900 text-xs sm:text-sm font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* Visual: 38.2% (2 columns) - Golden Ratio */}
            <div className="lg:col-span-2">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30"></div>
                
                <div className="relative bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-amber-500/20">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg"></div>
                      <div>
                        <div className="h-2.5 w-20 sm:h-3 sm:w-24 bg-amber-200 rounded mb-1.5 sm:mb-2"></div>
                        <div className="h-1.5 w-12 sm:h-2 sm:w-16 bg-orange-100 rounded"></div>
                      </div>
                    </div>
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-green-100 border border-green-300 rounded-full text-green-700 text-xs font-bold">
                      APPROVED
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-200">
                      <div className="h-1.5 sm:h-2 bg-amber-300 rounded w-1/4 mb-2 sm:mb-3"></div>
                      <div className="h-2.5 sm:h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded w-3/4"></div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-200">
                      <div className="h-1.5 sm:h-2 bg-orange-300 rounded w-1/3 mb-2 sm:mb-3"></div>
                      <div className="h-2.5 sm:h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded w-2/3"></div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30"></div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 border border-amber-300 rounded-xl"></div>
                  </div>

                  {/* Floating notification */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white border border-amber-300 rounded-xl p-3 sm:p-4 shadow-2xl shadow-amber-500/30 backdrop-blur-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="h-1.5 w-16 sm:h-2 sm:w-20 bg-amber-200 rounded mb-1.5 sm:mb-2"></div>
                        <div className="h-1.5 w-20 sm:h-2 sm:w-24 bg-orange-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Golden color scheme */}
        <section id="features" className="relative py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="px-4 py-2 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-sm font-semibold backdrop-blur-sm inline-block mb-4">
                PREMIUM FEATURES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-950 mb-4">
                The Gold Standard in
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  Leave Management
                </span>
              </h2>
              <p className="text-lg text-amber-900/70 max-w-2xl mx-auto">
                Crafted with precision, designed for excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Calendar className="w-8 h-8" aria-hidden="true" />}
                title="Instant Requests"
                description="Submit leave requests in under 30 seconds. Our intelligent forms remember your preferences and auto-complete details."
                gradient="from-amber-400 to-orange-400"
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8" aria-hidden="true" />}
                title="One-Tap Approvals"
                description="Wardens can review and approve with a single tap. Real-time notifications ensure nothing is ever missed."
                gradient="from-orange-400 to-amber-500"
              />
              <FeatureCard
                icon={<Bell className="w-8 h-8" aria-hidden="true" />}
                title="Smart Notifications"
                description="Stay informed with push notifications, SMS alerts, and email updates. Track every status change instantly."
                gradient="from-amber-500 to-orange-500"
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" aria-hidden="true" />}
                title="Role-Based Access"
                description="Tailored dashboards for students, wardens, and administrators with intelligent permission controls."
                gradient="from-orange-400 to-amber-400"
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" aria-hidden="true" />}
                title="Bank-Grade Security"
                description="Military-grade encryption, secure authentication, and automated backups protect your sensitive data."
                gradient="from-amber-600 to-orange-600"
              />
              <FeatureCard
                icon={<Clock className="w-8 h-8" aria-hidden="true" />}
                title="Analytics Dashboard"
                description="Beautiful visualizations and detailed reports help you understand patterns and optimize processes."
                gradient="from-orange-500 to-amber-600"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section - Golden proportions */}
        <section id="how-it-works" className="relative py-20 lg:py-32 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/30 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="px-4 py-2 bg-orange-100 border border-orange-300 rounded-full text-orange-800 text-sm font-semibold backdrop-blur-sm inline-block mb-4">
                SIMPLE PROCESS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-950 mb-4">
                Three Steps to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Perfect Harmony
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="Submit Instantly"
                description="Quick form with dates, reason, and contacts. AI suggests optimal leave times based on your history and hostel patterns."
                color="amber"
              />
              <StepCard
                number="2"
                title="Swift Review"
                description="Wardens receive instant alerts. One-tap approval or request additional information through integrated chat."
                color="orange"
              />
              <StepCard
                number="3"
                title="Stay Connected"
                description="Real-time tracking with reminders before departure and automatic return confirmations for peace of mind."
                color="rose"
              />
            </div>
          </div>
        </section>

        {/* Stats Section - Golden metrics */}
        <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard number="500+" label="Active Hostels" />
              <StatCard number="50k+" label="Happy Students" />
              <StatCard number="99.9%" label="Uptime SLA" />
              <StatCard number="<30s" label="Avg Response" />
            </div>
          </div>
        </section>

        {/* CTA Section - Golden call to action */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.2),transparent_50%)]"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-950 mb-6">
              Ready to Experience
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
                Golden Standard Excellence?
              </span>
            </h2>
            <p className="text-xl text-amber-900/80 mb-8 max-w-2xl mx-auto">
              Join 500+ premium hostels using LeavePass. Start your 30-day free trial—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button className="border-2 border-amber-400 text-amber-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/50 hover:border-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Golden accents */}
      <footer id="contact" className="bg-amber-950 text-amber-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-white">LeavePass</span>
              </div>
              <p className="text-sm text-amber-300/80">The golden standard in hostel management.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Features</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Pricing</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">About</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Blog</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Help Center</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Contact Us</a></li>
                <li><a href="#" className="text-amber-300/80 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-900 pt-8 text-center">
            <p className="text-sm text-amber-300/70">&copy; 2025 LeavePass. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <ChatbotWidget />
    </div>
  );
}

 

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white border border-amber-200 hover:border-amber-400 p-8 rounded-2xl transition-all hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2">
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-amber-950 mb-3">{title}</h3>
      <p className="text-amber-900/70 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, color }) {
  const colorMap = {
    amber: 'from-amber-400 to-orange-400',
    orange: 'from-orange-400 to-amber-500',
    rose: 'from-amber-500 to-orange-500'
  };

  return (
    <div className="relative group">
      <div className="bg-white border border-amber-200 hover:border-amber-400 p-8 rounded-2xl transition-all hover:shadow-2xl hover:shadow-amber-500/20">
        <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[color]} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform`}>
          {number}
        </div>
        <h3 className="text-xl font-bold text-amber-950 mb-3 text-center">{title}</h3>
        <p className="text-amber-900/70 leading-relaxed text-center">{description}</p>
      </div>
      
      {/* Connection line for desktop */}
      {number !== "3" && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-amber-400/50 to-transparent"></div>
      )}
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-2">
        {number}
      </div>
      <div className="text-amber-100 text-sm font-medium">{label}</div>
    </div>
  );
}