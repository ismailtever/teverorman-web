import React from 'react';
import Products from '@/components/Products';
import SEOHead from '@/components/SEOHead';
import { pageSeo, generateProductSchema } from '@/config/seo';

const ProductsPage = () => {
  const seo = pageSeo.products;
  
  // Example for a main product suite schema
  const schema = generateProductSchema(
    'OpsCore Platform',
    'Centralized command center for managing distributed field operations and workforce coordination.'
  );

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        schema={schema}
      />
      <Products />
    </>
  );
};

export default ProductsPage;