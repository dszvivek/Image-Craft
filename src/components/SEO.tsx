import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonicalUrl }) => {
  const fullTitle = `${title} | ImageGiri`;
  const defaultCanonical = canonicalUrl || window.location.href;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to set or create meta tags
    const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to update link tags
    const updateLinkTag = (rel: string, hrefValue: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 2. Update Description
    updateMetaTag('name', 'description', description);

    // 3. Keywords (optional per-page)
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // 4. Update Open Graph Meta Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', defaultCanonical);
    updateMetaTag('property', 'og:image', 'https://imagegiri.com/og-image.png');
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
    updateMetaTag('property', 'og:image:alt', `${title} - ImageGiri`);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'ImageGiri');
    updateMetaTag('property', 'og:locale', 'en_US');

    // 5. Update Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', 'https://imagegiri.com/og-image.png');
    updateMetaTag('name', 'twitter:image:alt', `${title} - ImageGiri`);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');

    // 6. Update Canonical URL
    updateLinkTag('canonical', defaultCanonical);

    // 7. Inject per-page JSON-LD WebPage schema
    const ldJsonId = 'page-jsonld';
    let ldScript = document.getElementById(ldJsonId);
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.setAttribute('type', 'application/ld+json');
      ldScript.id = ldJsonId;
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: fullTitle,
      description: description,
      url: defaultCanonical,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ImageGiri',
        url: 'https://imagegiri.com',
      },
    });

  }, [title, description, keywords, defaultCanonical, fullTitle]);

  return null;
};
