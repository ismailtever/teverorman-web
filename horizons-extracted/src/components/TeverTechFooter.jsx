import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WhatsAppButton from './WhatsAppButton';

const TeverTechFooter = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: t('footer.company'),
      links: [
        { name: t('header.about'), path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'News & Press', path: '/news' },
        { name: t('header.contact'), path: '/contact' },
      ],
    },
    {
      title: t('footer.services'),
      links: [
        { name: t('whatWeDo.services.development.title'), path: '/services' },
        { name: t('whatWeDo.services.ai.title'), path: '/services' },
        { name: t('whatWeDo.services.processes.title'), path: '/services' },
        { name: t('whatWeDo.services.partnership.title'), path: '/services' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Cookie Policy', path: '/cookies' },
      ],
    },
  ];

  const whatsappPhone = "+905397960230";
  const whatsappMessage = t('whatsapp.hello_message');

  return (
    <footer className="bg-[#1F4D3D] text-white pt-16 pb-8 border-t border-[#2D3436]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-[#1F4D3D] font-bold text-lg">
                TT
              </div>
              <span className="text-2xl font-bold tracking-tight">TeverTech</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-[#2a6652] rounded-full hover:bg-[#4ADE80] hover:text-[#1F4D3D] transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-2 bg-[#2a6652] rounded-full hover:bg-[#4ADE80] hover:text-[#1F4D3D] transition-all">
                <Twitter size={20} />
              </a>
              <WhatsAppButton 
                phoneNumber={whatsappPhone}
                message={whatsappMessage}
                variant="icon-only"
                className="bg-[#2a6652] text-white hover:bg-[#25D366] hover:text-white"
              />
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-6 text-[#4ADE80]">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-flex items-center gap-2 text-sm"
                    >
                      <span className="w-1 h-1 bg-[#4ADE80] rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2a6652] pt-8 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          <p className="text-gray-400 text-sm order-2 md:order-1 lg:col-span-1">
            &copy; {currentYear} Tever Tech Solutions. {t('footer.rights')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-300 order-1 md:order-2 lg:col-span-2 lg:justify-end">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#4ADE80]" />
              <span>contact@tevertech.com</span>
            </div>
            <div className="hidden md:block text-gray-500">|</div>
            <div className="flex items-center gap-2">
              <WhatsAppButton
                phoneNumber={whatsappPhone}
                message={whatsappMessage}
                showIcon={true}
                iconSize={16}
                className="text-gray-300 hover:text-[#4ADE80]"
              >
                +90 539 796 02 30
              </WhatsAppButton>
            </div>
            <div className="hidden md:block text-gray-500">|</div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#4ADE80]" />
              <span>Global Operations</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TeverTechFooter;