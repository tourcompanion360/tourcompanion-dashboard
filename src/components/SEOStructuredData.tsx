import React from 'react';
import { useAgency } from '@/contexts/AgencyContext';

interface SEOStructuredDataProps {
  type?: 'organization' | 'website' | 'realestate';
}

const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({ type = 'website' }) => {
  const { agencySettings } = useAgency();
  
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": `${agencySettings.agency_name} Dashboard`,
      "description": "gestisci il tuo virtual tour con un click",
      "url": "https://eec03a89-7554-4793-b88b-68fe18925d71.lovableproject.com",
      "logo": {
        "@type": "ImageObject",
        "url": `https://eec03a89-7554-4793-b88b-68fe18925d71.lovableproject.com${agencySettings.agency_logo}`,
        "width": 512,
        "height": 512
      },
      "sameAs": [],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IT"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Italian"
      }
    };

    if (type === 'website') {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": `${agencySettings.agency_name} Dashboard`,
        "description": "gestisci il tuo virtual tour con un click",
        "url": "https://eec03a89-7554-4793-b88b-68fe18925d71.lovableproject.com",
        "publisher": baseData,
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://eec03a89-7554-4793-b88b-68fe18925d71.lovableproject.com/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "it",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Real Estate",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
          "category": "Free"
        }
      };
    }

    if (type === 'realestate') {
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Tour Virtuali Immobiliari",
        "description": "Servizio professionale di tour virtuali per immobili, gestione appuntamenti e analisi statistiche",
        "provider": baseData,
        "serviceType": "Real Estate Services",
        "areaServed": {
          "@type": "Country",
          "name": "Italy"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Servizi Immobiliari",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Tour Virtuali",
                "description": "Creazione e gestione di tour virtuali per immobili"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Gestione Appuntamenti",
                "description": "Sistema di prenotazione e gestione appuntamenti per visite immobiliari"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Analisi Statistiche",
                "description": "Dashboard con statistiche e analisi performance immobiliare"
              }
            }
          ]
        }
      };
    }

    return baseData;
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
};

export default SEOStructuredData;