import { Play, CheckCircle2, Calendar, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/landing/useInView';
export function HeroSection() {
  const { ref, isInView } = useInView();
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-cream">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-peach/60 to-transparent rounded-bl-[100px] -z-10" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cream to-transparent z-10" />

      {/* Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#2D2A26 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div
            ref={ref}
            className={`flex flex-col space-y-8 transition-all duration-1000 transform ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            <div className="inline-flex items-center space-x-2">
              <span className="h-px w-8 bg-terracotta"></span>
              <span className="text-terracotta font-bold tracking-widest text-xs uppercase">
                Practice Management, Reimagined
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-charcoal leading-[1.1] text-balance">
              Where Patient Care Meets Modern{' '}
              <span className="italic text-terracotta">
                Practice Management
              </span>
            </h1>

            <p className="text-lg text-warm-gray max-w-xl leading-relaxed">
              InDesk brings together clinical notes, scheduling, billing,
              and patient engagement in one beautifully designed platform — so
              you can focus on what matters most.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                to="/login"
                className="bg-terracotta hover:bg-terracotta-dark text-white text-base font-medium px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">

                Start Your Free Trial
              </Link>
              {/* <button className="group flex items-center space-x-3 px-6 py-4 rounded-full border border-warm-gray/30 hover:border-terracotta/50 hover:bg-white transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition-colors">
                  <Play size={14} fill="currentColor" />
                </div>
                <span className="font-medium text-charcoal group-hover:text-terracotta transition-colors">
                  Watch Demo
                </span>
              </button> */}
            </div>

            {/* <div className="flex flex-wrap gap-4 pt-4 text-sm text-warm-gray">
              <div className="flex items-center">
                <CheckCircle2 size={16} className="text-terracotta mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={16} className="text-terracotta mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={16} className="text-terracotta mr-2" />
                <span>HIPAA compliant</span>
              </div>
            </div> */}
          </div>

          {/* Right Content - Dashboard Image */}
          <div
            className={`relative transition-all duration-1000 delay-300 transform ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

            {/* Browser Frame */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-warm-gray/10 overflow-hidden">
              {/* Browser Header */}
              <div className="bg-warm-white border-b border-warm-gray/10 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                <div className="ml-4 flex-1 bg-gray-100 rounded-md h-6 w-full max-w-sm mx-auto opacity-50"></div>
              </div>

              {/* Dashboard Image */}
              <div className="bg-warm-white overflow-hidden">
                <img
                  src="/landing/dashboard.jpg"
                  alt="InDesk dashboard"
                  className="w-full h-auto object-cover object-top block"
                />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -right-8 top-20 bg-white p-4 rounded-xl shadow-xl border border-warm-gray/10 flex items-center space-x-3 animate-bounce animation-delay-200">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-xs text-warm-gray font-medium">
                  Next Appointment
                </div>
                <div className="text-sm font-bold text-charcoal">10:00 AM</div>
              </div>
            </div>

            <div className="absolute -left-8 bottom-32 bg-white p-4 rounded-xl shadow-xl border border-warm-gray/10 flex items-center space-x-3 animate-bounce animation-delay-600">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <div className="text-xs text-warm-gray font-medium">
                  New Patients
                </div>
                <div className="text-sm font-bold text-charcoal">
                  +12 this week
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 right-12 bg-white p-4 rounded-xl shadow-xl border border-warm-gray/10 flex items-center space-x-3 animate-bounce animation-delay-400">
              <div className="p-2 bg-terracotta/20 text-terracotta rounded-lg">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs text-warm-gray font-medium">
                  Revenue
                </div>
                <div className="text-sm font-bold text-charcoal">Up 24%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
