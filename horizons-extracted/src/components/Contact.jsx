import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import WhatsAppButton from './WhatsAppButton';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = `${t('contact.form.name')} is required`;
    if (!formData.email.trim()) {
      newErrors.email = `${t('contact.form.email')} is required`;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = `${t('contact.form.message')} is required`;
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: t('contact.form.validationError'),
        description: t('contact.form.validationDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Simulate form submission
    toast({
      title: t('contact.form.success'),
      description: t('contact.form.successDesc'),
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.info.email'), value: 'info@tevertechnology.com' },
    { icon: Phone, label: t('contact.info.phone'), value: '+90 534 414 12 24' },
    { icon: MapPin, label: t('contact.info.location'), value: 'Nato Yolu Caddesi, Narin Sokak No: 3/4, İstanbul, Türkiye' },
  ];

  const whatsappPhone = "+905344141224";
  const whatsappMessage = t('whatsapp.hello_message');

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
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form.title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder={t('contact.form.name')}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
                  placeholder={t('contact.form.message')}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{t('contact.form.send')}</span>
                <Send size={20} className="rtl:mr-2 rtl:rotate-180" />
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* WhatsApp Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 relative overflow-hidden group hover:border-green-300 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="p-2 bg-green-100 rounded-full text-green-600">
                  <Phone size={20} />
                </span>
                {t('whatsapp.support')}
              </h3>

              <p className="text-gray-600 mb-6">
                {t('whatsapp.message_us')} directly on WhatsApp for quick responses.
              </p>

              <div className="text-lg font-mono text-gray-800 mb-6 tracking-wide">
                +90 534 414 12 24
              </div>

              <WhatsAppButton
                phoneNumber={whatsappPhone}
                message={whatsappMessage}
                className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform group-hover:scale-[1.02]"
              >
                {t('whatsapp.chat')}
              </WhatsAppButton>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">{t('contact.info.title')}</h3>
              <p className="text-white/90 mb-6">
                {t('contact.info.desc')}
              </p>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start space-x-3">
                    <info.icon className="text-white/90 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold">{info.label}</p>
                      <p className="text-white/80">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('contact.info.officeHours')}</h3>
              <div className="space-y-2 text-gray-600">
                <p>{t('contact.info.weekdays')}</p>
                <p>{t('contact.info.weekends')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;