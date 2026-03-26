import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Bot, Layout, Briefcase, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WhatWeDo = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Code2,
      title: t('whatWeDo.services.development.title'),
      description: t('whatWeDo.services.development.desc'),
      link: '/services/development'
    },
    {
      icon: Bot,
      title: t('whatWeDo.services.ai.title'),
      description: t('whatWeDo.services.ai.desc'),
      link: '/services/ai'
    },
    {
      icon: Layout,
      title: t('whatWeDo.services.processes.title'),
      description: t('whatWeDo.services.processes.desc'),
      link: '/services/processes'
    },
    {
      icon: Briefcase,
      title: t('whatWeDo.services.partnership.title'),
      description: t('whatWeDo.services.partnership.desc'),
      link: '/services/partnership'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h4 className="text-[#1F4D3D] font-bold uppercase tracking-wider mb-3">{t('whatWeDo.expertise')}</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D3436] leading-tight">
              {t('whatWeDo.title')} <br />
              <span className="text-[#1F4D3D]">{t('whatWeDo.title_accent')}</span>
            </h2>
          </div>
          <Link 
            to="/services" 
            className="hidden md:flex items-center gap-2 text-[#1F4D3D] font-semibold hover:text-[#4ADE80] transition-colors pb-2 border-b-2 border-[#1F4D3D] hover:border-[#4ADE80]"
          >
            {t('whatWeDo.viewAll')} <ChevronRight size={18} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#4ADE80]/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1F4D3D]/5 rounded-bl-[100px] transition-all group-hover:bg-[#4ADE80]/10 rtl:right-auto rtl:left-0 rtl:rounded-bl-none rtl:rounded-br-[100px]"></div>
              
              <div className="w-14 h-14 bg-[#1F4D3D] rounded-lg flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <service.icon size={28} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-bold text-[#2D3436] mb-4 group-hover:text-[#1F4D3D] transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                {service.description}
              </p>
              
              <Link 
                to={service.link}
                className="inline-flex items-center gap-2 text-[#1F4D3D] font-semibold text-sm group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform"
              >
                {t('whatWeDo.learnMore')} <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 md:hidden text-center">
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 text-[#1F4D3D] font-bold border-b-2 border-[#1F4D3D] pb-1"
          >
            {t('whatWeDo.viewAll')} <ChevronRight size={18} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;