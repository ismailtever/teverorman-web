import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Shield, Users } from 'lucide-react';

const ForBusinesses = () => {
  const benefits = [
    {
      icon: Target,
      title: 'Strategic Partnership',
      description: 'We align with your business goals and become an extension of your team.',
    },
    {
      icon: Zap,
      title: 'Rapid Development',
      description: 'Ship features fast without compromising quality or scalability.',
    },
    {
      icon: Shield,
      title: 'Long-term Support',
      description: 'We stay with you beyond launch, ensuring continuous growth and evolution.',
    },
    {
      icon: Users,
      title: 'Dedicated Team',
      description: 'Work with experienced engineers, designers, and product managers.',
    },
  ];

  const process = [
    { step: '01', title: 'Discovery', description: 'We dive deep into your vision and objectives' },
    { step: '02', title: 'Planning', description: 'Strategic roadmap with clear milestones' },
    { step: '03', title: 'Execution', description: 'Agile development with regular updates' },
    { step: '04', title: 'Growth', description: 'Continuous optimization and scaling' },
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
            Partnership Model
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We don't just build products—we build long-term relationships. Your success is our success.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
            >
              <benefit.icon className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Collaboration Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Our Collaboration Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {process.map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForBusinesses;