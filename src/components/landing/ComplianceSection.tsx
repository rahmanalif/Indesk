import React from 'react';
import { Shield, Lock, CheckCircle, Key, Activity } from 'lucide-react';
export function ComplianceSection() {
  const badges = [
  {
    icon: Shield,
    label: 'HIPAA Compliant'
  },
  {
    icon: Lock,
    label: 'GDPR Ready'
  },
  {
    icon: CheckCircle,
    label: 'SOC 2 Type II'
  },
  {
    icon: Key,
    label: '256-bit Encryption'
  },
  {
    icon: Activity,
    label: '99.9% Uptime'
  }];

  return (
    <section className="py-20 bg-beige/50 border-y border-warm-gray/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-serif text-charcoal mb-4">
          Built for Compliance, Designed for Trust
        </h2>
        <p className="text-lg text-warm-gray max-w-2xl mx-auto mb-12">
          InDesk meets the highest standards of healthcare data security and
          regulatory compliance.
        </p>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {badges.map((badge, index) =>
          <div
            key={index}
            className="flex flex-col items-center space-y-3 group">

              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-terracotta border border-warm-gray/5 group-hover:scale-105 transition-transform duration-300">
                <badge.icon size={32} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-charcoal/80">
                {badge.label}
              </span>
            </div>
          )}
        </div>

        <p className="mt-12 text-sm text-warm-gray/80 max-w-3xl mx-auto">
          We undergo regular third-party security audits and penetration testing
          to ensure your practice and patient data remains secure.
        </p>
      </div>
    </section>);

}