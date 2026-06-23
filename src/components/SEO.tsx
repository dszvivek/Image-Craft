import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonicalUrl }) => {
  const fullTitle = `${title} | ImageGiri - Privacy-First Image Tools`;
  const defaultCanonical = canonicalUrl || window.location.href;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={defaultCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={defaultCanonical} />
      <meta property="og:site_name" content="ImageGiri" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  );
};
