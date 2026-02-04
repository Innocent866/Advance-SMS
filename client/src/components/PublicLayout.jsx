import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import logoFromAssets from '../assets/logo.png';
import { useBranding } from '../context/BrandingProvider';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const PublicLayout = () => {
  const { schoolName, logo, primaryColor } = useBranding();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <img 
                   className="h-20 w-auto transition-transform duration-300 group-hover:scale-105 object-contain" 
                   src={logo || logoFromAssets} 
                   alt={schoolName} 
                />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 relative group ${
                    location.pathname === link.path ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
               {user ? (
                 <Link to="/dashboard">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        Dashboard <ChevronRight size={16} />
                    </motion.button>
                 </Link>
               ) : (
                 <>
                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                        Log In
                    </Link>
                    <Link to="/register-school">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Get Started
                        </motion.button>
                    </Link>
                 </>
               )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-primary-600 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
            >
              <div className="px-4 pt-4 pb-8 space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`block py-3 text-base font-medium border-b border-gray-50 ${
                       location.pathname === link.path ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="pt-4 flex flex-col gap-3">
                   {user ? (
                        <Link to="/dashboard" className="w-full">
                            <button className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium shadow-md">
                                Go to Dashboard
                            </button>
                        </Link>
                   ) : (
                       <>
                        <Link to="/login" className="w-full">
                            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">
                                Log In
                            </button>
                        </Link>
                        <Link to="/register-school" className="w-full">
                            <button className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium shadow-md">
                                Get Started Free
                            </button>
                        </Link>
                       </>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                {/* Brand Column */}
                <div>
                     <div className="flex items-center gap-2 mb-6">
                        <img 
                           className="h-24 w-auto object-contain" 
                           src={logo || logoFromAssets} 
                           alt={schoolName} 
                        />
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Empowering schools with cutting-edge technology to streamline administration and enhance learning experiences.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Product</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="/features" className="hover:text-primary-400 transition-colors">Features</Link></li>
                        <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                        <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Resources</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                        <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                        <li><Link to="/community" className="hover:text-primary-400 transition-colors">Community</Link></li>
                        <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Contact Us</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-primary-500" />
                            <span>+2349138095613</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-primary-500" />
                            <span>goldima@gt-schoolhub.com.ng</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Advance SMS. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
