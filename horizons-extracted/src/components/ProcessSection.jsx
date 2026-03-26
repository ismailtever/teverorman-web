import React from 'react';
import { motion } from 'framer-motion';
import { Search, PenTool, Code, Cpu, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProcessSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t('process.steps.understand.title'),
      description: t('process.steps.understand.desc')
    },
    {
      icon: PenTool,
      title: t('process.steps.design.title'),
      description: t('process.steps.design.desc')
    },
    {
      icon: Code,
      title: t('process.steps.build.title'),
      description: t('process.steps.build.desc')
    },
    {
      icon: Cpu,
      title: t('process.steps.integrate.title'),
      description: t('process.steps.integrate.desc')
    },
    {
      icon: Rocket,
      title: t('process.steps.scale.title'),
      description: t('process.steps.scale.desc')
    }
  ];

  return (
    <section className="py-24 bg-[#1F4D3D] text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h4 className="text-[#4ADE80] font-bold uppercase tracking-wider mb-3">{t('process.label')}</h4>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('process.title')}</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('process.desc')}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/20"></div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-[#2D3436] border-4 border-[#1F4D3D] flex items-center justify-center mb-6 shadow-xl group-hover:border-[#4ADE80] transition-colors duration-300 relative">
                  <div className="absolute inset-0 bg-[#4ADE80] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
                  <step.icon size={32} className="text-white group-hover:text-[#4ADE80] transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;