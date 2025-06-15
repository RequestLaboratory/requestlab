import React from 'react';
import { Helmet } from 'react-helmet';

const Head: React.FC = () => {
  return (
    <Helmet>
      <title>RequestLab - API Testing & Development Tools</title>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <meta name="description" content="RequestLab - Advanced API Testing, JSON Comparison, and Development Tools" />
    </Helmet>
  );
};

export default Head; 