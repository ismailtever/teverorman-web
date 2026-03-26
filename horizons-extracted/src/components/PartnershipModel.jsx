import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake as Handshake, Zap, BarChart, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PartnershipModel = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Handshake,
      title: t('partnership.benefits.alignment.title'),
      description: t('partnership.benefits.alignment.desc')
    },
    {
      icon: Zap,
      title: t('partnership.benefits.context.title'),
      description: t('partnership.benefits.context.desc')
    },
    {
      icon: BarChart,
      title: t('partnership.benefits.architecture.title'),
      description: t('partnership.benefits.architecture.desc')
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-[#1F4D3D] font-bold uppercase tracking-wider mb-3">{t('partnership.label')}</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6 leading-tight">
              {t('partnership.title')}<br />
              <span className="text-[#1F4D3D] relative">
                {t('partnership.title_accent')}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#4ADE80] opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {t('partnership.desc')}
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-[#1F4D3D]/10 flex items-center justify-center text-[#1F4D3D]">
                      <benefit.icon size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D3436] text-lg">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Abstract visual representation of partnership */}
            <div className="relative bg-[#2D3436] rounded-2xl p-10 shadow-2xl text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ADE80] rounded-full filter blur-[80px] opacity-10 pointer-events-none rtl:right-auto rtl:left-0"></div>
              
              <h3 className="text-2xl font-bold mb-8">{t('partnership.standard')}</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="text-[#4ADE80]" size={24} />
                  <div>
                    <span className="block font-bold">{t('partnership.features.pods.title')}</span>
                    <span className="text-sm text-gray-400">{t('partnership.features.pods.desc')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="text-[#4ADE80]" size={24} />
                  <div>
                    <span className="block font-bold">{t('partnership.features.roadmap.title')}</span>
                    <span className="text-sm text-gray-400">{t('partnership.features.roadmap.desc')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="text-[#4ADE80]" size={24} />
                  <div>
                    <span className="block font-bold">{t('partnership.features.security.title')}</span>
                    <span className="text-sm text-gray-400">{t('partnership.features.security.desc')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm mb-4">{t('partnership.trusted')}</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#4ADE80] opacity-50"></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-[#4ADE80] text-[#1F4D3D] px-6 py-4 rounded-xl font-bold shadow-xl hidden md:block rtl:-right-auto rtl:-left-6">
              {t('partnership.retention')}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PartnershipModel;