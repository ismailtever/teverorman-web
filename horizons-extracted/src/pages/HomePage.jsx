import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Products from '@/components/Products';
import ForBusinesses from '@/components/ForBusinesses';
import Process from '@/components/Process';
import About from '@/components/About';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Tever Tech - We Build and Scale Digital Products</title>
        <meta
          name="description"
          content="From idea to millions of users - Tever Tech is your technology partner. We build apps, AI solutions, and scale products that make a real impact."
        />
      </Helmet>
      <Hero />
      <Services />
      <Products />
      <ForBusinesses />
      <Process />
      <About />
    </>
  );
};

export default HomePage;