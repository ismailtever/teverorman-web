import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#2D3436]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1684479350733-b70f1318d953"
          alt="Industrial digital interface background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4D3D]/90 via-[#2D3436]/80 to-[#2D3436]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#4ADE80]/10 to-transparent pointer-events-none rtl:left-0 rtl:right-auto rtl:bg-gradient-to-r"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#2D3436] to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
            <span className="text-sm font-medium text-white tracking-wide">{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight"
          >
            {t('hero.headline')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#2ecc71]">{t('hero.headline_accent')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed font-light"
          >
            {t('hero.subheadline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link
              to="/contact"
              className="px-8 py-4 bg-[#4ADE80] hover:bg-[#5FE893] text-[#1F4D3D] font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2 group"
            >
              {t('hero.cta_work')}
              <ArrowRight className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" size={20} />
            </Link>
            <Link
              to="/products"
              className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 group"
            >
              {t('hero.cta_products')}
              <ChevronRight className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" size={20} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/50 uppercase tracking-widest">{t('hero.scroll')}</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0"></div>
      </motion.div>
    </section>
  );
};

export default HeroSection;