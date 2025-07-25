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
  description = "Join a growing community of bold thinkers sharpening their communication skills through live group discussions, podcasts, and meaningful resources. Speak your mind and grow with The Tomorrows Team.",
  keywords = "group discussions platform, online group discussion for students, public speaking group discussions, live discussion community, communication skills, debate, podcasts and resources for communication skills, critical thinking community activities, AI debate group for young professionals, book group discussion sessions online, leadership development, team building, professional development",
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
      
      {/* Brand Recognition Meta Tags */}
      <meta name="application-name" content="The Tomorrows Team" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" content="#000000" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content="The Tomorrows Team - Leadership Development Platform" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="The Tomorrows Team" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tomorrowsteam" />
      <meta name="twitter:creator" content="@tomorrowsteam" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content="The Tomorrows Team - Leadership Development Platform" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Organization/Brand JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.thetomorrowsteam.com/#organization",
              "name": "The Tomorrows Team",
              "alternateName": ["Tomorrows Team", "TTT", "TheTomorrowsTeam"],
              "description": "Leadership development platform through group discussions and structured debates",
              "url": "https://www.thetomorrowsteam.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.thetomorrowsteam.com/lovable-uploads/9a14afb5-743e-45db-a54e-f2731a7bf608.png",
                "caption": "The Tomorrows Team Logo"
              },
              "image": "https://www.thetomorrowsteam.com/lovable-uploads/9a14afb5-743e-45db-a54e-f2731a7bf608.png",
              "foundingDate": "2024",
              "knowsAbout": [
                "Leadership Development",
                "Group Discussions",
                "Communication Skills",
                "Public Speaking",
                "Professional Development",
                "Team Building"
              ],
              "areaServed": "Worldwide",
              "serviceType": "Educational Platform",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "en",
                "url": "https://www.thetomorrowsteam.com/contact"
              },
              "sameAs": [
                "https://www.linkedin.com/company/thetomorrowsteam",
                "https://twitter.com/tomorrowsteam",
                "https://www.instagram.com/thetomorrowsteam"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://www.thetomorrowsteam.com/#website",
              "url": "https://www.thetomorrowsteam.com",
              "name": "The Tomorrows Team",
              "description": "Join meaningful group discussions on careers, education, AI & more. Speak your mind, sharpen your skills, and be part of tomorrow's leaders.",
              "publisher": {
                "@id": "https://www.thetomorrowsteam.com/#organization"
              },
              "potentialAction": [
                {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.thetomorrowsteam.com/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              ]
            },
            {
              "@type": "EducationalOrganization",
              "@id": "https://www.thetomorrowsteam.com/#educational-org",
              "name": "The Tomorrows Team",
              "description": "Platform for developing leadership and communication skills through structured group discussions",
              "educationalCredentialAwarded": "Communication Skills Certification",
              "hasCredential": "Leadership Development Program",
              "courseMode": "online",
              "teaches": [
                "Leadership Skills",
                "Communication",
                "Group Discussion",
                "Public Speaking",
                "Critical Thinking"
              ]
            }
          ]
        })}
      </script>
      
      {/* Website JSON-LD Schema for current page */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": fullTitle,
          "description": description,
          "url": fullUrl,
          "isPartOf": {
            "@id": "https://www.thetomorrowsteam.com/#website"
          },
          "about": {
            "@id": "https://www.thetomorrowsteam.com/#organization"
          },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": fullImageUrl
          },
          "datePublished": publishedTime || "2024-01-01",
          "dateModified": modifiedTime || new Date().toISOString(),
          "author": {
            "@id": "https://www.thetomorrowsteam.com/#organization"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;