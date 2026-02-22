import React from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website',
  canonical 
}) => {
  const location = useLocation();
  const siteName = 'Advance SMS';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const baseUrl = 'https://gt-schoolhub.com.ng';
  const url = `${baseUrl}${location.pathname}`;

  React.useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || 'Empower your school with intelligent digital tools. Streamline operations, boost student performance, and connect your entire school community.');

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keyword"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keyword');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || 'school management system, digital education, school portal, e-learning, admin tools');

    // Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical || url);

    // Open Graph Tags
    const ogTags = {
      'og:title': fullTitle,
      'og:description': description,
      'og:url': url,
      'og:image': ogImage || `${baseUrl}/og-image.jpg`,
      'og:type': ogType,
      'og:site_name': siteName
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      }
    });

  }, [fullTitle, description, keywords, ogImage, ogType, url, canonical]);

  return null;
};

export default SEO;
