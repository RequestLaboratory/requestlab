import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
}

const pageSEOData: Record<string, PageSEO> = {
  '/': {
    title: 'RequestLab - Free API Testing, JSON Formatter & Comparison Tool',
    description: 'Free online API testing tool with JSON formatter, JSON compare, cURL testing, load testing, and API interceptor. Postman alternative with multi-tab interface. No signup required.',
    keywords: 'API testing, JSON formatter, JSON compare, Postman alternative, free API tool, developer tools'
  },
  '/api-testing': {
    title: 'Free API Testing Tool - REST API Tester | RequestLab',
    description: 'Test REST APIs online for free. Multi-tab interface, auto-save, load testing, collections management. Postman alternative with no signup required. GET, POST, PUT, DELETE support.',
    keywords: 'API testing tool, REST API tester, free API testing, Postman alternative, HTTP client, API debugger, load testing, API collections'
  },
  '/json-compare': {
    title: 'JSON Compare & Diff Tool - Compare JSON Objects Online | RequestLab',
    description: 'Compare two JSON objects side by side with visual diff highlighting. Execute and compare cURL commands. Share comparison results via unique URLs. Free online JSON diff tool.',
    keywords: 'JSON compare, JSON diff, compare JSON online, JSON difference, cURL compare, API response compare, JSON comparison tool'
  },
  '/json-formatter': {
    title: 'JSON Formatter & Validator - Beautify JSON Online Free | RequestLab',
    description: 'Free online JSON formatter and validator. Beautify, minify, and validate JSON instantly. Copy or download formatted JSON. 100% client-side processing for privacy.',
    keywords: 'JSON formatter, JSON beautifier, JSON validator, format JSON online, minify JSON, JSON pretty print, validate JSON'
  },
  '/api-interceptor': {
    title: 'API Interceptor - Monitor & Log API Requests | RequestLab',
    description: 'Intercept and monitor API requests in real-time. Create proxy URLs, log requests/responses, and debug API integrations. Free API monitoring tool.',
    keywords: 'API interceptor, API monitor, request logging, API debugging, proxy API, API traffic monitor, HTTP interceptor'
  },
  '/sql-compare': {
    title: 'MySQL Schema Compare - Database Diff Tool | RequestLab',
    description: 'Compare MySQL database schemas online. Visualize table differences, generate migration scripts with AI assistance. Free SQL schema comparison tool.',
    keywords: 'MySQL compare, schema compare, database diff, SQL comparison, schema migration, database schema tool, MySQL diff'
  },
  '/documentation': {
    title: 'Documentation - RequestLab API Testing Tool',
    description: 'Complete documentation for RequestLab API testing tool. Learn how to use API testing, JSON formatter, JSON compare, API interceptor, and MySQL schema compare features.',
    keywords: 'RequestLab documentation, API testing guide, JSON formatter help, developer tool docs'
  },
  '/npm-analyzer': {
    title: 'NPM Package Analyzer - Check Dependencies Security | RequestLab',
    description: 'Analyze your npm dependencies for security vulnerabilities, maintenance status, and package health using Snyk Advisor. Free npm security scanner.',
    keywords: 'npm package analyzer, npm security check, dependency scanner, snyk advisor, npm vulnerability scanner, package health check'
  }
};

const defaultSEO: PageSEO = {
  title: 'RequestLab - API Testing & Development Tools',
  description: 'Free online API testing tool with JSON formatter, JSON compare, cURL testing, load testing, and API interceptor. Developer tools for API development.',
  keywords: 'API testing, JSON formatter, developer tools, API development'
};

const Head: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const seo = pageSEOData[currentPath] || defaultSEO;
  const canonicalUrl = `https://requestlab.io${currentPath === '/' ? '' : currentPath}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content="https://requestlab.io/og-image.png" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content="https://requestlab.io/og-image.png" />
    </Helmet>
  );
};

export default Head;
