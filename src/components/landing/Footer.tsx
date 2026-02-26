import React from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  Mail } from
'lucide-react';
export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#2A3D25] to-[#1E2D1A] text-cream pt-24 pb-12 overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
          'linear-gradient(#F7FAF5 1px, transparent 1px), linear-gradient(90deg, #F7FAF5 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-20 pb-12 border-b border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                Stay updated with InDesk
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Get the latest updates on practice management, mental health
                tech, and product features delivered to your inbox.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                    size={18} />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-transparent transition-all" />

                </div>
                <button
                  type="button"
                  className="bg-terracotta hover:bg-terracotta-dark text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-terracotta/20">

                  Subscribe
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="text-2xl font-serif font-bold text-white tracking-tight mb-6 block">

              InDesk<span className="text-terracotta">.</span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-8">
              Beautiful, intuitive practice management software designed for
              modern psychology clinics. Built with care for those who care.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) =>
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/60 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-300">

                  <Icon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Partners
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Webinars
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Status
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors">
                  BAA
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © 2026 InDesk Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-white/60 text-xs font-medium">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>);

}