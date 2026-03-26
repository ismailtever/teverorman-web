import React from 'react';
import { motion } from 'framer-motion';
import { Factory, Truck, Globe, Settings, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const IndustriesSection = () => {
  const { t } = useTranslation();

  const industries = [
    {
      title: t('industries.items.manufacturing.title'),
      icon: Factory,
      image: 'https://images.unsplash.com/photo-1679454690793-83340db232db',
      description: t('industries.items.manufacturing.desc')
    },
    {
      title: t('industries.items.logistics.title'),
      icon: Truck,
      image: 'https://images.unsplash.com/photo-1678132085824-80d99fd48a8e',
      description: t('industries.items.logistics.desc')
    },
    {
      title: t('industries.items.trade.title'),
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1695076450444-3f358bb90bae', 
      description: t('industries.items.trade.desc')
    },
    {
      title: t('industries.items.operations.title'),
      icon: Settings,
      image: 'https://images.unsplash.com/photo-1684479350733-b70f1318d953', 
      description: t('industries.items.operations.desc')
    }
  ];

  return (
    <section className="py-24 bg-[#2D3436] text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <h4 className="text-[#4ADE80] font-bold uppercase tracking-wider mb-3">{t('industries.label')}</h4>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('industries.title')}</h2>
          <p className="text-gray-400 text-lg">
            {t('industries.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={industry.image} 
                  alt={industry.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#1F4D3D]/80 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#4ADE80] rounded-lg text-[#1F4D3D] shadow-lg">
                      <industry.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{industry.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {industry.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[#4ADE80] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                    {t('industries.viewCaseStudies')} <ArrowRight size={16} className="rtl:rotate-180" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;