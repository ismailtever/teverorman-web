import React from 'react';
import HeroSection from '@/components/HeroSection';
import WhatWeDo from '@/components/WhatWeDo';
import IndustriesSection from '@/components/IndustriesSection';
import ProductsSection from '@/components/ProductsSection';
import PartnershipModel from '@/components/PartnershipModel';
import ProcessSection from '@/components/ProcessSection';
import SEOHead from '@/components/SEOHead';
import { pageSeo, generateOrganizationSchema } from '@/config/seo';

const TeverTechHomePage = () => {
  const seo = pageSeo.home;
  const schema = generateOrganizationSchema();

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        schema={schema}
        image="https://images.unsplash.com/photo-1684479350733-b70f1318d953" // Hero Image
      />
      
      <main className="flex flex-col w-full overflow-hidden">
        <HeroSection />
        <WhatWeDo />
        <IndustriesSection />
        <ProductsSection />
        <PartnershipModel />
        <ProcessSection />
      </main>
    </>
  );
};

export default TeverTechHomePage;