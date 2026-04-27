import React from 'react';
import { Link } from 'react-router-dom';

const productLinks = [
  { label: 'Why InDesk', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const accountLinks = [
  { label: 'Sign In', to: '/login' },
  { label: 'Choose Plan', to: '/login?mode=signup&focus=plan' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/legal/privacy-policy' },
  { label: 'Terms of Service', to: '/legal/terms-of-service' },
  { label: 'Website Terms', to: '/legal/terms-of-website-use' },
  { label: 'Cookie Policy', to: '/legal/cookie-policy' },
  { label: 'DPA', to: '/legal/data-processing-agreement' },
  { label: 'Acceptable Use', to: '/legal/acceptable-use-policy' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#2A3D25] to-[#1E2D1A] pb-12 pt-20 text-cream">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#F7FAF5 1px, transparent 1px), linear-gradient(90deg, #F7FAF5 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 items-start gap-12 border-b border-white/10 pb-12 md:grid-cols-4">
          <div className="md:pr-8">
            <Link
              to="/"
              className="mb-6 block text-2xl font-serif font-bold tracking-tight text-white"
            >
              <img className="h-20 w-auto" src="/landing/logo.png" alt="InDesk" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Practice management software for psychologists and therapists.
              Everything public users can actually access from this site is linked here.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Product
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-terracotta">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Account
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-terracotta">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Contact & Legal
            </h4>
            <div className="mb-6 space-y-2 text-sm text-white/60">
              <p>info@myindesk.com</p>
              <p>www.myindesk.com</p>
            </div>
            <ul className="space-y-4 text-sm text-white/60">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-terracotta">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-2 md:flex-row">
          <p className="text-xs text-white/40">© 2026 InDesk Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-white/60">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
