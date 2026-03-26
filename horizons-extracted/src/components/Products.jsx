import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ExternalLink } from 'lucide-react';

const Products = () => {
  const products = [
    {
      name: 'StreamFlow',
      icon: '🎥',
      description: 'Next-generation video streaming platform with AI-powered recommendations and social features.',
      users: '2M+ users',
      category: 'Media & Entertainment',
    },
    {
      name: 'DataViz AI',
      icon: '📊',
      description: 'Transform complex data into beautiful, interactive visualizations powered by artificial intelligence.',
      users: '500K+ users',
      category: 'Analytics & BI',
    },
    {
      name: 'GrowthHub',
      icon: '🚀',
      description: 'All-in-one marketing automation platform helping businesses scale their digital presence.',
      users: '1M+ users',
      category: 'Marketing Tech',
    },
    {
      name: 'HealthSync',
      icon: '💊',
      description: 'Comprehensive health tracking and telemedicine platform connecting patients with healthcare providers.',
      users: '800K+ users',
      category: 'Healthcare',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Successful apps we've built and scaled to millions of users
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 group"
            >
              <div className="text-5xl mb-4">{product.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-purple-600 font-semibold mb-3">{product.category}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700">{product.users}</span>
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Smartphone size={18} className="text-gray-700" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <ExternalLink size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;