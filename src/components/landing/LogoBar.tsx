import React from 'react';
export function LogoBar() {
  const logos = [
  'MindfulHealth',
  'TherapySpace',
  'ClinicalFlow',
  'PsychConnect',
  'WellnessPath',
  'OpenMind',
  'CalmBridge',
  'NeuralCare'];

  // Duplicate for seamless infinite loop
  const scrollLogos = [...logos, ...logos];
  return (
    <section className="py-10 bg-white border-b border-warm-gray/10 overflow-hidden">
      <p className="text-center text-sm font-medium text-warm-gray mb-8 uppercase tracking-widest">
        Trusted by 500+ Innovative Clinics
      </p>

      <div className="relative w-full">
        {/* Edge fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div
          className="flex animate-marquee pause-on-hover w-max items-center"
          style={{
            animationDuration: '30s'
          }}>

          {scrollLogos.map((logo, index) =>
          <div
            key={index}
            className="flex items-center space-x-2 mx-8 md:mx-12 opacity-50 hover:opacity-80 transition-opacity duration-300 flex-shrink-0">

              <div className="w-2 h-2 rounded-full bg-terracotta"></div>
              <span className="text-xl md:text-2xl font-serif font-bold text-charcoal whitespace-nowrap">
                {logo}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>);

}