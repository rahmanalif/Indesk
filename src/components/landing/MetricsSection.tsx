import React, { useEffect, useState } from 'react';
import { useInView } from '../../hooks/landing/useInView';
export function MetricsSection() {
  const { ref, isInView } = useInView({
    threshold: 0.2
  });
  const metrics = [
  {
    label: 'Patients Managed',
    value: '10k+',
    target: 10000,
    suffix: '+'
  },
  {
    label: 'Clinics Worldwide',
    value: '500+',
    target: 500,
    suffix: '+'
  },
  {
    label: 'Uptime Guarantee',
    value: '99.9%',
    target: 99.9,
    suffix: '%'
  },
  {
    label: 'AI Assessments',
    value: '50+',
    target: 50,
    suffix: '+'
  }];

  return (
    <section className="py-20 bg-beige/30 border-y border-warm-gray/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

          {metrics.map((metric, index) =>
          <div
            key={index}
            className={`text-center transition-all duration-700 transform ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{
              transitionDelay: `${index * 100}ms`
            }}>

              <div className="text-4xl md:text-5xl font-serif font-bold text-terracotta mb-2">
                {metric.value}
              </div>
              <div className="text-sm md:text-base font-medium text-charcoal/70 uppercase tracking-wide">
                {metric.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}