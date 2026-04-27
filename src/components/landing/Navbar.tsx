import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type NavbarProps = {
  mode?: 'fixed' | 'sticky';
  forceSolid?: boolean;
};

export function Navbar({ mode = 'fixed', forceSolid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
  {
    name: 'Why InDesk',
    href: '#why'
  },
  {
    name: 'Features',
    href: '#features'
  },
  {
    name: 'Pricing',
    href: '#pricing'
  },
  {
    name: 'FAQ',
    href: '#faq'
  }];

  const getNavHref = (href: string) => (isLandingPage ? href : `/${href}`);

  return (
    <nav
      className={`${mode === 'sticky' ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || forceSolid ? 'bg-cream/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={scrollToTop}
              className="text-2xl font-serif font-bold text-charcoal tracking-tight">

              <img className='h-12 w-auto' src="/landing/logo.png" alt="" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
            <a
              key={link.name}
              href={getNavHref(link.href)}
              className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors">

                {link.name}
              </a>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/login?mode=signup&focus=plan"
              className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md">

              Start A Free Trial
            </Link>
            <Link
              to="/login"
              className="text-sm font-mi text-charcoal hover:text-terracotta transition-colors">

              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-terracotta transition-colors"
              aria-label="Toggle menu">

              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen &&
      <div className="md:hidden bg-cream border-t border-warm-gray/10 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) =>
          <a
            key={link.name}
            href={getNavHref(link.href)}
            className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-peach/30 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}>

                {link.name}
              </a>
          )}
            <div className="pt-4 border-t border-warm-gray/10 mt-4 flex flex-col space-y-3">
              <Link
              to="/login"
              className="block px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta">

                Sign In
              </Link>
              <Link
              to="/login?mode=signup&focus=plan"
              className="block text-center bg-terracotta hover:bg-terracotta-dark text-white text-base font-medium px-5 py-3 rounded-full transition-colors">

                Choose Plan
              </Link>
            </div>
          </div>
        </div>
      }
    </nav>);

}
