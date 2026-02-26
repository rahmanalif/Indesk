import React from 'react';
import { Quote } from 'lucide-react';
export function SocialProofSection() {
  const testimonials = [
  {
    quote:
    'InDesk transformed how we run our practice. The interface is so intuitive that our entire team was onboarded in a single afternoon.',
    author: 'Dr. Sarah Chen',
    role: 'Clinical Psychologist',
    practice: 'Mindful Wellness Center',
    initials: 'SC'
  },
  {
    quote:
    'The AI assessment tools alone saved us 10 hours per week. It is like having an extra team member who never sleeps.',
    author: 'Dr. James Okafor',
    role: 'Psychiatrist',
    practice: 'Harbor Mental Health',
    initials: 'JO'
  },
  {
    quote:
    'Finally, practice management software that does not feel like it was designed in 2005. Our patients actually compliment our booking system.',
    author: 'Dr. Emily Rodriguez',
    role: 'Psychotherapist',
    practice: 'Clarity Counseling',
    initials: 'ER'
  },
  {
    quote:
    'The security features give me complete peace of mind. HIPAA compliance is built-in, not an afterthought.',
    author: 'Dr. Michael Ross',
    role: 'Clinical Director',
    practice: 'Ross Therapy Group',
    initials: 'MR'
  },
  {
    quote:
    "Billing used to be a nightmare. Now it's automated and seamless. We've reduced our administrative time by 40%.",
    author: 'Lisa Thompson',
    role: 'Practice Manager',
    practice: 'Beacon Psychology',
    initials: 'LT'
  },
  {
    quote:
    'The patient portal is beautiful and easy to use. Our no-show rate has dropped significantly since switching.',
    author: 'Dr. David Kim',
    role: 'Psychiatrist',
    practice: 'Kim Mental Health',
    initials: 'DK'
  }];

  // Duplicate testimonials for seamless looping
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.reverse(), ...testimonials];
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">
          Trusted by Leading Practices
        </h2>
        <p className="text-lg text-warm-gray max-w-2xl mx-auto">
          Join over 500 clinics delivering better care with InDesk.
        </p>
      </div>

      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Row 1 - Scrolling Left */}
        <div className="flex mb-8 animate-marquee pause-on-hover w-max">
          {row1.map((testimonial, index) =>
          <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
          )}
        </div>

        {/* Row 2 - Scrolling Right */}
        <div className="flex animate-marquee-reverse pause-on-hover w-max">
          {row2.map((testimonial, index) =>
          <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
          )}
        </div>
      </div>
    </section>);

}
function TestimonialCard({ testimonial }: {testimonial: any;}) {
  return (
    <div className="w-[350px] md:w-[450px] mx-4 p-8 bg-warm-white rounded-xl border border-warm-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col flex-shrink-0">
      <div className="mb-6 text-terracotta">
        <Quote size={32} className="fill-current opacity-20" />
      </div>

      <blockquote className="flex-1 mb-6">
        <p className="text-base md:text-lg font-serif italic text-charcoal leading-relaxed line-clamp-4">
          "{testimonial.quote}"
        </p>
      </blockquote>

      <div className="flex items-center mt-auto">
        <div className="w-10 h-10 rounded-full bg-peach flex items-center justify-center text-terracotta-dark font-bold text-sm mr-3 flex-shrink-0">
          {testimonial.initials}
        </div>
        <div>
          <div className="font-bold text-charcoal text-sm">
            {testimonial.author}
          </div>
          <div className="text-xs text-warm-gray">{testimonial.role}</div>
          <div className="text-xs text-terracotta font-medium mt-0.5">
            {testimonial.practice}
          </div>
        </div>
      </div>
    </div>);

}