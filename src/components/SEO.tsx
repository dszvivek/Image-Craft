import React, { useEffect } from 'react';
import metadata from '../routes/metadata.json';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  schema?: Record<string, any> | Record<string, any>[];
  faqs?: Array<{ q: string; a: string }>;
}

export const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonicalUrl, schema, faqs }) => {
  // Determine current path to fetch dynamic metadata
  let cleanPath = window.location.pathname;
  if (cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  const meta = (metadata as any)[cleanPath];
  const finalTitle = meta?.title || title;
  const finalDescription = meta?.description || description;
  const finalKeywords = meta?.keywords || keywords;
  const finalSchema = meta?.schema || schema;
  const howToSteps = meta?.howTo || null;

  // Build the full document title matching the routing suffix convention
  const isHome = cleanPath === '';
  const fullTitle = isHome || finalTitle.includes('ImagePlumber') ? finalTitle : `${finalTitle} | ImagePlumber`;

  // Dynamic console checks for SERP limits to prevent regression
  useEffect(() => {
    if (fullTitle.length >= 60) {
      console.warn(`[SEO Warning] Page title is too long (${fullTitle.length} chars). Keep under 60 characters to avoid SERP truncation: "${fullTitle}"`);
    }
    if (finalDescription.length >= 160) {
      console.warn(`[SEO Warning] Meta description is too long (${finalDescription.length} chars). Keep under 160 characters to avoid SERP truncation: "${finalDescription}"`);
    }
  }, [fullTitle, finalDescription]);

  const getCleanCanonical = (urlStr: string) => {
    try {
      const url = new URL(urlStr, 'https://imageplumber.com');
      let path = url.pathname;
      if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return `https://imageplumber.com${path}`;
    } catch {
      let path = urlStr;
      if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return `https://imageplumber.com${path}`;
    }
  };

  const defaultCanonical = getCleanCanonical(canonicalUrl || window.location.pathname);
  const schemaString = finalSchema ? JSON.stringify(finalSchema) : '';

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
        element.setAttribute(rel, rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 2. Update core title & description meta tags
    updateMetaTag('name', 'title', fullTitle);
    updateMetaTag('name', 'description', finalDescription);

    // 3. Keywords (optional per-page)
    if (finalKeywords) {
      updateMetaTag('name', 'keywords', finalKeywords);
    }

    // 4. Update Open Graph Meta Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:url', defaultCanonical);
    updateMetaTag('property', 'og:image', 'https://imageplumber.com/og-image.png');
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
    const imageAlt = isHome ? "ImagePlumber - Free Privacy-First Local Image Tools" : (finalTitle.includes('ImagePlumber') ? finalTitle : `${finalTitle} - ImagePlumber`);
    updateMetaTag('property', 'og:image:alt', imageAlt);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'ImagePlumber');
    updateMetaTag('property', 'og:locale', 'en_US');

    // 5. Update Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', finalDescription);
    updateMetaTag('name', 'twitter:image', 'https://imageplumber.com/og-image.png');
    updateMetaTag('name', 'twitter:image:alt', imageAlt);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:url', defaultCanonical);

    // 6. Update Canonical URL & Hreflang
    updateLinkTag('canonical', defaultCanonical);
    updateLinkTag('alternate', defaultCanonical);

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
      description: finalDescription,
      url: defaultCanonical,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ImagePlumber',
        alternateName: ['Image Plumber', 'ImagePlumber Tools', 'ImagePlumber Online'],
        url: 'https://imageplumber.com',
      },
    });

    // 8. Inject BreadcrumbList JSON-LD schema
    const breadcrumbLdId = 'page-breadcrumb-jsonld';
    let breadcrumbScript = document.getElementById(breadcrumbLdId);
    if (!isHome) {
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.setAttribute('type', 'application/ld+json');
        breadcrumbScript.id = breadcrumbLdId;
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://imageplumber.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: finalTitle,
            item: defaultCanonical,
          },
        ],
      });
    } else if (breadcrumbScript) {
      breadcrumbScript.remove();
    }

    // 9. Inject HowTo JSON-LD schema (if defined for the tool)
    const howToLdId = 'page-howto-jsonld';
    let howToScript = document.getElementById(howToLdId);
    if (howToSteps && Array.isArray(howToSteps) && howToSteps.length > 0) {
      if (!howToScript) {
        howToScript = document.createElement('script');
        howToScript.setAttribute('type', 'application/ld+json');
        howToScript.id = howToLdId;
        document.head.appendChild(howToScript);
      }
      howToScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${finalTitle}`,
        description: finalDescription,
        step: howToSteps.map((step: any, idx: number) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.name,
          text: step.text,
        })),
      });
    } else if (howToScript) {
      howToScript.remove();
    }

    // 10. Inject FAQPage JSON-LD schema (if faqs passed)
    const faqLdId = 'page-faq-jsonld';
    let faqScript = document.getElementById(faqLdId);
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.setAttribute('type', 'application/ld+json');
        faqScript.id = faqLdId;
        document.head.appendChild(faqScript);
      }
      faqScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      });
    } else if (faqScript) {
      faqScript.remove();
    }

    // 11. Inject additional JSON-LD schemas
    const extraLdJsonId = 'page-extra-jsonld';
    let extraLdScript = document.getElementById(extraLdJsonId);
    if (schemaString) {
      if (!extraLdScript) {
        extraLdScript = document.createElement('script');
        extraLdScript.setAttribute('type', 'application/ld+json');
        extraLdScript.id = extraLdJsonId;
        document.head.appendChild(extraLdScript);
      }
      extraLdScript.textContent = schemaString;
    } else if (extraLdScript) {
      extraLdScript.remove();
    }

    // Cleanup extra schema on unmount to prevent leaks
    return () => {
      const extraScript = document.getElementById(extraLdJsonId);
      if (extraScript) {
        extraScript.remove();
      }
    };

  }, [fullTitle, finalDescription, finalKeywords, defaultCanonical, isHome, schemaString, howToSteps, faqs]);

  return null;
};
