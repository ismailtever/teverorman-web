import React from 'react';
import { Helmet } from 'react-helmet';
import ForBusinesses from '@/components/ForBusinesses';

const ForBusinessesPage = () => {
  return (
    <>
      <Helmet>
        <title>For Businesses - Tever Tech | Long-term Technology Partnership</title>
        <meta
          name="description"
          content="Partner with Tever Tech for strategic technology collaboration. We become your dedicated tech team, invested in your long-term success."
        />
      </Helmet>
      <ForBusinesses />
    </>
  );
};

export default ForBusinessesPage;