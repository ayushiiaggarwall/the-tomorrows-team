import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

const SEO = ({
  title = "The Tomorrows Team – Real Group Discussions for Future Thinkers",
  description = "Join meaningful group discussions on careers, education, AI & more. Speak your mind, sharpen your skills, and be part of tomorrow's leaders.",
  keywords = "group discussions, leadership development, communication skills, debate, reward points, team building, professional development",
  image = "/og-image.jpg",
  url = "https://www.thetomorrowsteam.com",
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  noindex = false
}: SEOProps) => {
  const fullTitle = title.includes("The Tomorrows Team") ? title : `${title} | The Tomorrows Team`;
  const fullUrl = url.startsWith('http') ? url : `https://www.thetomorrowsteam.com${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://www.thetomorrowsteam.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="The Tomorrows Team" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "The Tomorrows Team",
          "description": "Leadership development through group discussions and structured debates",
          "url": "https://www.thetomorrowsteam.com",
          "logo": "https://www.thetomorrowsteam.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-234-567-8900",
            "contactType": "customer service",
            "availableLanguage": "en"
          },
          "sameAs": [
            "https://www.linkedin.com/company/thetomorrowsteam",
            "https://twitter.com/thetomorrowsteam",
            "https://www.instagram.com/thetomorrowsteam"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;