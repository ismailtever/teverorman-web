import React from 'react';
import Contact from '@/components/Contact';
import SEOHead from '@/components/SEOHead';
import { pageSeo, generateLocalBusinessSchema } from '@/config/seo';

const ContactPage = () => {
  const seo = pageSeo.contact;
  const schema = generateLocalBusinessSchema();

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        schema={schema}
      />
      <Contact />
    </>
  );
};

export default ContactPage;