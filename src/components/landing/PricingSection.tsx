import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/landing/useInView';
import { useGetAvailablePlansQuery } from '../../redux/api/clientsApi';

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  isPopular: boolean;
  type: string;
  features: string[];
};

const formatFeatureLabel = (key: string) =>
  key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const fallbackPlans: PricingPlan[] = [
  {
    id: 'fallback-free',
    name: 'Free Plan',
    price: 0,
    description: 'Basic features for small practices',
    isPopular: false,
    type: 'free',
    features: ['10 clients', 'Notes', 'Clients', 'Assessments', 'Appointments'],
  },
  {
    id: 'fallback-professional',
    name: 'Professional Plan',
    price: 29.99,
    description: 'Advanced features for growing practices',
    isPopular: true,
    type: 'professional',
    features: ['100 clients', 'Notes', 'Clients', 'Assessments', 'Appointments', 'Integrations', 'Advanced Reporting'],
  },
  {
    id: 'fallback-enterprise',
    name: 'Enterprise Plan',
    price: 99.99,
    description: 'Full features for large practices',
    isPopular: false,
    type: 'enterprise',
    features: ['Unlimited clients', 'Unlimited clinicians', 'Notes', 'Clients', 'Assessments', 'Appointments', 'Integrations', 'Custom Branding', 'Priority Support', 'Advanced Reporting'],
  },
];

export function PricingSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { data, isLoading, isError } = useGetAvailablePlansQuery();

  const apiPlans = (data?.response?.data || []).map((plan) => {
    const featureItems = Object.entries(plan.features || {})
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => formatFeatureLabel(key));

    const limits: string[] = [];
    if (typeof plan.clientLimit === 'number') {
      limits.push(plan.clientLimit === 0 ? 'Unlimited clients' : `${plan.clientLimit} clients`);
    }
    if (typeof plan.clinicianLimit === 'number') {
      limits.push(plan.clinicianLimit === 0 ? 'Unlimited clinicians' : `${plan.clinicianLimit} clinicians`);
    }

    return {
      id: plan.id,
      name: plan.name,
      price: Number(plan.price) || 0,
      description: plan.description || '',
      isPopular: Boolean(plan.isPopular),
      type: plan.type || '',
      features: [...limits, ...featureItems],
    };
  });

  const plans = apiPlans.length > 0 ? apiPlans : fallbackPlans;

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-warm-gray">Start free, upgrade when you are ready. No hidden fees, no surprises.</p>
          {isLoading && <p className="text-sm text-warm-gray mt-3">Loading plans...</p>}
          {isError && <p className="text-sm text-warm-gray mt-3">Unable to load live plans, showing default pricing.</p>}
        </div>

        <div ref={ref} className={`grid grid-cols-1 ${plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 items-start`}>
          {plans.map((plan, index) => {
            const highlight = plan.isPopular;
            const cta = plan.type === 'enterprise' ? 'Contact Sales' : 'Choose Plan';
            const priceLabel = Number.isInteger(plan.price) ? `${plan.price}` : plan.price.toFixed(2);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all duration-500 ${
                  highlight
                    ? 'bg-white border-2 border-terracotta shadow-xl z-10 transform md:-translate-y-4'
                    : 'bg-warm-white border border-warm-gray/10 shadow-sm hover:shadow-md'
                } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {highlight && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terracotta text-white px-4 py-1 rounded-full text-sm font-medium tracking-wide uppercase shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-charcoal">${priceLabel}</span>
                    <span className="text-warm-gray ml-1">/mo</span>
                  </div>
                  <p className="text-sm text-warm-gray">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={`${plan.id}-${idx}`} className="flex items-start">
                      <Check size={18} className="text-terracotta mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-charcoal/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/login?mode=signup&planId=${encodeURIComponent(plan.id)}&focus=plan`}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    highlight
                      ? 'bg-[#7D9663] text-white hover:bg-[#6f8658] shadow-md hover:shadow-lg'
                      : 'bg-[#7D9663] text-white hover:bg-[#6f8658] shadow-sm hover:shadow-md'
                  } block text-center`}
                >
                  {cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
