import React from 'react';
import About from '@/components/About';
import SEOHead from '@/components/SEOHead';
import { pageSeo, generateOrganizationSchema } from '@/config/seo';

const AboutPage = () => {
  const seo = pageSeo.about;
  const schema = generateOrganizationSchema();

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        schema={schema}
        image="https://images.unsplash.com/photo-1684400661290-50c3f2600cf0" // Team Image
      />
      <About />
    </>
  );
};

export default AboutPage;