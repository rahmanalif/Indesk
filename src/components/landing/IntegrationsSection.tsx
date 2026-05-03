import { Check, Video, CreditCard, Calendar, Mail, MessageSquare, Shield, Zap, FileText, BarChart3, Users } from 'lucide-react';

export function IntegrationsSection() {
  const integrations = [
    { name: 'Zoom', icon: Video, description: 'Direct integration for telehealth sessions' },
    { name: 'Google Meet', icon: Video, description: 'Seamless video conferencing' },
    { name: 'Stripe', icon: CreditCard, description: 'Secure payment processing and billing' },
    { name: 'Mailchimp', icon: Mail, description: 'Automated email reminders and notifications' },
    { name: 'Twilio', icon: MessageSquare, description: 'SMS reminders for reduced no-shows' },
    { name: 'Google Calendar', icon: Calendar, description: 'Sync appointments with your personal calendar' },
    { name: 'Xero', icon: BarChart3, description: 'Financial reporting (Coming Soon)', comingSoon: true },
    { name: 'Healthcode', icon: Shield, description: 'Insurance billing (Coming Soon)', comingSoon: true },
  ];

  const features = [
    { title: 'AI Assistance', icon: Zap, description: 'Sigmund: Your clinical administrative assistant' },
    { title: 'Outcome Measures', icon: BarChart3, description: 'Track patient progress with clinical accuracy' },
    { title: 'Client Portal', icon: Users, description: 'Empower patients with self-service tools' },
    { title: 'Custom Forms', icon: FileText, description: 'Build intake and assessment forms your way' },
    { title: 'Clinical Data Import', icon: FileText, description: 'Bring existing records into InDesk during setup' },
    { title: 'GDPR-ready Export', icon: Shield, description: 'Export full clinical records when you need them' },
    { title: 'Role-based Access', icon: Users, description: 'Control who can view, edit, and manage clinic data' },
    { title: 'Automated Workflows', icon: Zap, description: 'Reduce repetitive admin across billing and sessions' },
  ];

  return (
    <section id="integrations" className="py-24 bg-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest text-xs uppercase block mb-4">
            FULL LIST
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
            Supported Tools, Exports, and Access Controls
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto">
            A clearer look at the connected tools, data management controls, and native
            workflow features available for modern clinical practices.
          </p>
        </div>

        <h3 className="mb-6 text-xl font-serif text-charcoal">Supported integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {integrations.map((item, idx) => (
            <div key={idx} className="bg-warm-white p-6 rounded-xl border border-warm-gray/10 hover:shadow-md transition-shadow relative overflow-hidden">
              {item.comingSoon && (
                <div className="absolute top-0 right-0 bg-terracotta/10 text-terracotta text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                  Coming Soon
                </div>
              )}
              <div className="w-10 h-10 bg-beige rounded-lg flex items-center justify-center mb-4">
                <item.icon className="text-terracotta w-5 h-5" />
              </div>
              <h4 className="font-semibold text-charcoal mb-1">{item.name}</h4>
              <p className="text-sm text-warm-gray leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-charcoal text-warm-white rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif mb-6">Built-in platform features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-terracotta/20 rounded flex items-center justify-center">
                      <feature.icon className="text-terracotta w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-xs text-warm-white/60">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:border-l lg:border-warm-white/10 lg:pl-12">
              <h4 className="text-xl font-serif mb-4 text-terracotta">And much more...</h4>
              <ul className="space-y-3">
                {[
                  'Automated Invoicing & Tax',
                  'Secure Internal Messaging',
                  'Multi-location Management',
                  'Advanced Data Export (GDPR Ready)',
                  'Role-based Access Control',
                  'Clinical Audit Logs'
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-warm-white/80">
                    <Check className="w-4 h-4 text-terracotta" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
