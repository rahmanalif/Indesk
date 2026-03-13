import { useInView } from '../../hooks/landing/useInView';
import { Check } from 'lucide-react';
export function FeaturesSection() {
  const { ref, isInView } = useInView({
    threshold: 0.1,
    rootMargin: ''
  });
  const features = [
  // {
  //   title: 'Smart Clinic Subscriptions',
  //   description:
  //   'Flexible subscription management for your patients. Set up recurring sessions, manage packages, and automate billing with grace.',
  //   image: '/landing/loginai5.jpg',
  //   imageFit: 'cover',
  //   bullets: [
  //   'Automated recurring billing',
  //   'Flexible session packages',
  //   'Patient self-service portal',
  //   'Smart payment reminders']

  // },
  {
    title: 'Meet Sigmund - your AI-powered assistant',
    description:
    'Sigmund helps with the admin that slows practices down. Draft correspondence, organise non-clinical information, and support documentation workflows so you can spend more time on care.',
    image: '/images/Sigmund.jpg',
    imageFit: 'cover',
    bullets: [
    'Drafts letters and routine communications',
    'Supports non-clinical documentation workflows',
    'Helps organise admin tasks faster',
    'Keeps the focus on practitioner time and efficiency']

  },
  // {
  //   title: 'Effortless Booking System',
  //   description:
  //   'A booking experience your patients will love. Online scheduling, automated reminders, and seamless calendar management.',
  //   icon: Calendar,
  //   bullets: [
  //   'Online self-booking portal',
  //   'SMS and email reminders',
  //   'Multi-location support',
  //   'Waitlist management']

  // },
  {
    title: 'Integrations, Updates, and Resources',
    description:
    'See what is already available in InDesk, what is coming next, and the resources that help your practice get more from the platform.',
    image: '/landing/chobi.jpg',
    imageFit: 'cover',
    bullets: [
    'Available integrations at a glance',
    'Incoming product updates and roadmap visibility',
    'Resources to support setup and day-to-day use',
    'Clear guidance on what is live now and what is coming soon']

  }];

  return (
    <section id="features" className="py-24 bg-beige/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest text-xs uppercase block mb-4">
            FEATURES
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal">
            Everything Your Practice Needs
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-8">
          {features.map((feature, index) =>
          <div
            key={index}
            className={`bg-warm-white rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-700 border border-warm-gray/5 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{
              transitionDelay: `${index * 150}ms`
            }}>

              <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* Illustration Area */}
                <div
                className={`w-full lg:w-5/12 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>

                  <div className="aspect-[4/3] bg-cream rounded-xl flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 ">
                      <img className='h-full w-full' src={feature.image} alt="" />
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-terracotta/10 rounded-full blur-2xl"></div>

                    {/* <div className="relative z-10 p-6 bg-white rounded-2xl shadow-sm transform transition-transform duration-500 group-hover:-translate-y-2 border border-warm-gray/5">
                      <feature.icon
                      size={64}
                      className="text-terracotta opacity-80"
                      strokeWidth={1} />

                    </div> */}
                  </div>
                </div>

                {/* Content Area */}
                <div
                className={`w-full lg:w-7/12 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>

                  <h3 className="text-2xl md:text-3xl font-serif font-medium text-charcoal mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-warm-gray mb-8 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feature.bullets.map((bullet, idx) =>
                  <div key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <Check size={18} className="text-terracotta" />
                        </div>
                        <span className="ml-3 text-charcoal/80">{bullet}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
