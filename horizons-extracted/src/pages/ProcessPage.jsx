import React from 'react';
import { Helmet } from 'react-helmet';
import Process from '@/components/Process';

const ProcessPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Process - Tever Tech | From Idea to Scale</title>
        <meta
          name="description"
          content="Learn about Tever Tech's product development process: Idea → Build → Launch → Scale → Partner. We guide you through every stage of success."
        />
      </Helmet>
      <Process />
    </>
  );
};

export default ProcessPage;