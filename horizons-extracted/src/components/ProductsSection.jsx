import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Server, Database, Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProductsSection = () => {
  const { t } = useTranslation();

  const products = [
    {
      name: t('products.items.opscore.title'),
      category: t('products.items.opscore.category'),
      description: t('products.items.opscore.desc'),
      features: ['Real-time Tracking', 'Automated Dispatch', 'Performance Analytics'], // Assuming these might not need translation for this demo, or add to locales
      icon: Activity,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: t('products.items.inventory.title'),
      category: t('products.items.inventory.category'),
      description: t('products.items.inventory.desc'),
      features: ['Demand Prediction', 'Auto-Replenishment', 'Vendor Portal'],
      icon: Database,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      name: t('products.items.factory.title'),
      category: t('products.items.factory.category'),
      description: t('products.items.factory.desc'),
      features: ['Machine Learning', 'Sensor Integration', 'Downtime Alerts'],
      icon: Server,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none rtl:right-auto rtl:left-0 rtl:-translate-x-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h4 className="text-[#1F4D3D] font-bold uppercase tracking-wider mb-3">{t('products.label')}</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D3436] leading-tight">
              {t('products.title')} <br />
              <span className="text-blue-600">{t('products.title_accent')}</span>
            </h2>
          </div>
          <Link 
            to="/products" 
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#2D3436] text-white rounded-lg hover:bg-black transition-colors shadow-lg"
          >
            {t('products.viewAll')} <ArrowRight size={18} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full group"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${product.gradient}`}></div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl bg-gray-50 text-gray-700 shadow-sm group-hover:bg-gradient-to-r ${product.gradient} group-hover:text-white transition-all duration-300`}>
                    <product.icon size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 border border-gray-200 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#2D3436] mb-3 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="space-y-3 mb-8 flex-1">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="w-full py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-[#2D3436] hover:text-white hover:border-[#2D3436] transition-all flex items-center justify-center gap-2"
                >
                  {t('products.requestDemo')} <ExternalLink size={16} className="rtl:mr-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 md:hidden text-center">
          <Link 
            to="/products" 
            className="w-full block px-6 py-4 bg-[#2D3436] text-white rounded-lg font-bold"
          >
            {t('products.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;