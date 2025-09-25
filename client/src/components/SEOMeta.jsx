import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOMeta = ({
  title = "Hotel Legacy Grand - Luxury Accommodation",
  description = "Experience luxury and comfort at Hotel Legacy Grand.",
  keywords = "Best hotels in Gachibowli, Gachibowli, AIG hospital, near gachibowli, near AIG, luxury hotel, accommodation, comfort",
  canonical = "https://legacygrandhotel.com",
  image = "/images/og-image.jpg",
  imageAlt = "Hotel Legacy Grand",
  type = "website",
  twitterCard = "summary_large_image"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="Hotel Legacy Grand" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Modern PWA Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="Hotel Legacy Grand" />
      
      {/* Keep Apple meta tags for Safari compatibility while using modern alternatives */}
      <meta name="apple-mobile-web-app-title" content="Hotel Legacy Grand" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Theme Colors */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Language */}
      <meta httpEquiv="Content-Language" content="en" />

      {/* REMOVED: X-Frame-Options (must be set as HTTP header, not meta tag) */}
      {/* REMOVED: apple-mobile-web-app-capable (deprecated, replaced with mobile-web-app-capable) */}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hotel",
          "name": "Hotel Legacy Grand",
          "description": description,
          "url": canonical,
          "image": image,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": " 6th Floor, Plot No: 25, 40, Babukhan Ln, near AIG Hospital, P Janardhan Reddy Nagar",
            "addressLocality": "Gachibowli",
            "addressRegion": "Hyderabad",
            "postalCode": "500032",
            "addressCountry": "INDIA"
          },
          "telephone": "+91 9985997755",
          "priceRange": "1799-3999",
          "starRating": {
            "@type": "Rating",
            "ratingValue": "5"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOMeta;