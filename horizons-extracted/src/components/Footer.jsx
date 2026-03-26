import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/mustafa-eymen-tever-8b081810b', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Tever Tech
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We build and scale digital products from idea to millions of users. Your trusted technology partner for innovation and growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-white font-semibold text-lg mb-4 block">Quick Links</span>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <span className="text-white font-semibold text-lg mb-4 block">Contact</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} />
                <span className="text-sm">info@tevertechnology.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} />
                <span className="text-sm">+90 534 414 12 24</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin size={18} />
                <span className="text-sm">Nato Yolu Cad., Narin Sok. No:3/4, İstanbul</span>
              </div>
              <div className="flex space-x-4 mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Tever Orman Mamülleri Sanayi ve Ticaret A.Ş. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;