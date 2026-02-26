import React from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/landing/useInView';
export function CTASection() {
  const { ref, isInView } = useInView({
    threshold: 0.2
  });
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-peach to-terracotta/20 -z-20"></div>
      <div
        className="absolute inset-0 opacity-[0.05] -z-10"
        style={{
          backgroundImage: 'radial-gradient(#779362 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          ref={ref}
          className={`transition-all duration-1000 transform ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-6 leading-tight">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-charcoal/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of clinicians who have already made the switch to
            modern, compassionate practice management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-terracotta hover:bg-terracotta-dark text-white text-lg font-medium px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">

              Start Your Free Trial Today
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-charcoal/70">
            <span>No credit card required</span>
            <span className="w-1 h-1 bg-charcoal/40 rounded-full"></span>
            <span>Set up in under 5 minutes</span>
          </div>
        </div>
      </div>
    </section>);

}
