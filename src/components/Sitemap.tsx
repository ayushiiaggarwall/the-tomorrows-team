import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Set proper XML content type and headers
    document.title = 'Sitemap';
    
    // Set the document content type to XML
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Type');
    metaTag.setAttribute('content', 'application/xml; charset=utf-8');
    document.head.appendChild(metaTag);
    
    // Clear body and set XML content
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin: 0; padding: 0; font-family: monospace; background: white;';
    
    // Create XML content with proper header
    const xmlContent = `This XML file does not appear to have any style information associated with it. The document tree is shown below.
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thetomorrowsteam.com/</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/joinsession</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/watch-learn</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/leaderboard</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/resources</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/blog</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/milestones</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/about</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/contact</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/login</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/dashboard</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/dashboard/profile</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/notifications</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/participation-history</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/admin</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>`;

    // Display as pre-formatted text
    const pre = document.createElement('pre');
    pre.textContent = xmlContent;
    pre.style.cssText = 'margin: 0; padding: 20px; font-family: monospace; line-height: 1.4; color: #333; white-space: pre; overflow: auto;';
    document.body.appendChild(pre);
  }, []);

  return null;
};

export default Sitemap;