import React from 'react';
import Services from '@/components/Services';
import SEOHead from '@/components/SEOHead';
import { pageSeo, generateServiceSchema } from '@/config/seo';

const ServicesPage = () => {
  const seo = pageSeo.services;
  
  // Aggregate multiple service schemas if needed, or pick a main one.
  // For simplicity, we define a general Digital Transformation service.
  const schema = generateServiceSchema(
    'Digital Transformation Services',
    'Custom software development, AI solutions, and industrial automation services.'
  );

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        schema={schema}
      />
      <Services />
    </>
  );
};

export default ServicesPage;