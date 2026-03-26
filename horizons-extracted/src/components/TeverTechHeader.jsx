import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import WhatsAppButton from './WhatsAppButton';

const TeverTechHeader = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: t('header.home'), path: '/' },
    { name: t('header.services'), path: '/services' },
    { name: t('header.industries'), path: '/industries' },
    { name: t('header.products'), path: '/products' },
    { name: t('header.about'), path: '/about' },
    { name: t('header.contact'), path: '/contact' },
  ];

  const whatsappPhone = "+905397960230";
  const whatsappMessage = t('whatsapp.hello_message');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#2D3436]/95 backdrop-blur-md shadow-lg border-b border-gray-700' 
          : 'bg-[#2D3436] border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[#1F4D3D] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:bg-[#2a6652] transition-colors">
              TT
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Tever<span className="text-[#4ADE80]">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors duration-300 relative group ${
                  location.pathname === link.path ? 'text-[#4ADE80]' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#4ADE80] transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-700 mx-2"></div>

            {/* WhatsApp Icon in Header */}
            <WhatsAppButton 
              phoneNumber={whatsappPhone}
              message={whatsappMessage}
              variant="icon-only"
              className="text-[#4ADE80] hover:bg-[#4ADE80]/10 hover:text-white"
              iconSize={22}
            />
            
            <LanguageSwitcher />

            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#1F4D3D] hover:bg-[#2a6652] text-white text-sm font-semibold rounded-md transition-all duration-300 shadow-md flex items-center gap-2"
            >
              {t('header.getStarted')} <ChevronRight size={16} className="rtl:rotate-180" />
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-[#2D3436] border-t border-gray-700"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col space-y-4 max-h-[80vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-[#1F4D3D] text-white' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-700 my-2 pt-2">
                <WhatsAppButton 
                  phoneNumber={whatsappPhone}
                  message={whatsappMessage}
                  className="w-full text-center py-2 px-4 text-[#4ADE80] hover:bg-white/5 rounded-lg flex items-center justify-center gap-2"
                >
                  {t('whatsapp.chat')}
                </WhatsAppButton>
              </div>

              <LanguageSwitcher isMobile={true} />

              <Link
                to="/contact"
                className="w-full text-center py-3 bg-[#4ADE80] text-[#1F4D3D] font-bold rounded-lg hover:bg-[#5FE893] transition-colors mt-4"
              >
                {t('header.contact')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TeverTechHeader;