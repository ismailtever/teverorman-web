import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import TeverTechHeader from '@/components/TeverTechHeader';
import TeverTechFooter from '@/components/TeverTechFooter';
import TeverTechHomePage from '@/components/TeverTechHomePage';
import ServicesPage from '@/pages/ServicesPage';
import ProductsPage from '@/pages/ProductsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import '@/i18n/config'; // Initialize i18n
import { useTranslation } from 'react-i18next';
import { rtlLanguages } from '@/i18n/locales';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Handle RTL direction updates based on current language
    const currentLang = i18n.language;
    const isRtl = rtlLanguages.includes(currentLang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <TeverTechHeader />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TeverTechHomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/industries" element={<TeverTechHomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/careers" element={<AboutPage />} />
            <Route path="/privacy" element={<TeverTechHomePage />} />
            <Route path="/terms" element={<TeverTechHomePage />} />
          </Routes>
        </main>
        <TeverTechFooter />
      </div>
    </Router>
  );
}

export default App;