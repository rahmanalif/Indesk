import { useInView } from '../../hooks/landing/useInView';
import { Heart } from 'lucide-react';
export function WhySection() {
  const { ref, isInView } = useInView({
    threshold: 0.1,
    rootMargin: ''
  });
  const features = [
  {
    title: 'Built by Therapists, for Therapists',
    description:
    'We understand the unique challenges of running a psychology practice. InDesk was designed from the ground up with input from 20 practicing clinicians.',
    icon: Heart,
    color: 'bg-peach',
    align: 'left',
    image: '/landing/imagesai (2).jpg',
    imageFit: 'cover'
  },
  {
    title: 'Track What Matters',
    description:
    "Visualise patient progress at a glance. InDesk automatically plots outcome measure scores over time - PHQ-9, GAD-7, PCL-5, and more - so you can see what's working, spot trends early, and share meaningful progress updates with patients and referrers alike. No spreadsheets. No manual charting. Just clear, clinical insight built into every session.",
    color: 'bg-beige',
    align: 'right',
    image: '/landing/chobi.jpg',
    imageFit: 'scale-down'
  },
  // {
  //   title: 'Track What Matters',
  //   description:
  //   "Visualise patient progress at a glance. InDesk automatically plots outcome measure scores over time - PHQ-9, GAD-7, PCL-5, and more - so you can see what's working, spot trends early, and share meaningful progress updates with patients and referrers alike. No spreadsheets. No manual charting. Just clear, clinical insight built into every session.",
  //   color: 'bg-terracotta/20',
  //   align: 'left',
  //   image: '/landing/imagesai (4).jpg',
  //   imageFit: 'fit'
  // }
];

  return (
    <section id="why" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4 relative inline-block">
            Why Clinicians Choose InDesk
            <span className="absolute bottom-1 left-0 w-full h-3 bg-terracotta/20 -z-10 transform -rotate-1"></span>
          </h2>
        </div>

        <div ref={ref} className="space-y-24">
          {features.map((feature, index) =>
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
            style={{
              transitionDelay: `${index * 200}ms`
            }}>

              {/* Image Side */}
              <div
              className={`w-full md:w-1/2 ${feature.align === 'right' ? 'md:order-2' : ''}`}>

                <div
                className={`relative rounded-2xl overflow-hidden aspect-[4/3] ${feature.color} flex items-center justify-center group`}>

                  {'image' in feature && feature.image ? (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className={`absolute inset-0 w-full h-full ${feature.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover object-center'}`}
                    />
                  ) : (
                    <>
                      {/* Abstract shapes */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white mix-blend-overlay blur-2xl"></div>
                        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-terracotta mix-blend-overlay blur-3xl"></div>
                      </div>

                      {/* Icon illustration */}
                      <div className="relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-full shadow-lg transform transition-transform duration-500 group-hover:scale-110">
                        <feature.icon
                        size={48}
                        className="text-terracotta"
                        strokeWidth={1.5} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Text Side */}
              <div
              className={`w-full md:w-1/2 ${feature.align === 'right' ? 'md:order-1' : ''}`}>

                <h3 className="text-3xl font-serif font-medium text-charcoal mb-6">
                  {feature.title}
                </h3>
                <p className="text-lg text-warm-gray leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-8">
                  {/* <a
                  href="#"
                  className="text-terracotta font-medium hover:text-terracotta-dark transition-colors inline-flex items-center group">

                    Learn more
                    <span className="ml-2 transform transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
