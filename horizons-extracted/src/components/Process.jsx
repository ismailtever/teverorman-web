import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Hammer, Rocket, BarChart3, Users } from 'lucide-react';

const Process = () => {
  const stages = [
    {
      icon: Lightbulb,
      title: 'Idea',
      description: 'Transform your vision into a concrete product strategy',
      color: 'from-yellow-400 to-orange-400',
    },
    {
      icon: Hammer,
      title: 'Build',
      description: 'Develop with cutting-edge tech and best practices',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      icon: Rocket,
      title: 'Launch',
      description: 'Deploy to production and reach your first users',
      color: 'from-purple-400 to-pink-400',
    },
    {
      icon: BarChart3,
      title: 'Scale',
      description: 'Optimize performance and grow to millions',
      color: 'from-green-400 to-emerald-400',
    },
    {
      icon: Users,
      title: 'Partner',
      description: 'Continuous collaboration and long-term success',
      color: 'from-red-400 to-pink-400',
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
            Our Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From concept to scale, we guide you through every stage of your product journey
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden md:flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 transform -translate-y-1/2"></div>
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative z-10 flex-1 flex flex-col items-center"
            >
              <div className={`p-4 rounded-full bg-gradient-to-r ${stage.color} shadow-lg mb-4`}>
                <stage.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{stage.title}</h3>
              <p className="text-sm text-gray-600 text-center max-w-xs">{stage.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-8">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className={`p-3 rounded-full bg-gradient-to-r ${stage.color} shadow-lg flex-shrink-0`}>
                <stage.icon className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{stage.title}</h3>
                <p className="text-gray-600">{stage.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;