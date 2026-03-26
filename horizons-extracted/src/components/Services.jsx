import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Brain, TrendingUp, HeartHandshake as Handshake } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Code2,
      title: 'App Development',
      description: 'We build native and cross-platform mobile apps that users love. From iOS to Android, we create seamless experiences.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'AI Solutions',
      description: 'Integrate cutting-edge AI and machine learning into your products. We make complex AI accessible and practical.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Product Growth & Scaling',
      description: 'Scale from thousands to millions of users. We optimize performance, infrastructure, and user experience.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Handshake,
      title: 'Technology Partnership',
      description: 'Long-term collaboration, not just projects. We become your dedicated tech team, invested in your success.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive solutions to bring your ideas to life and scale them to success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${service.gradient} mb-4`}>
                <service.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-300 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;