import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Set document content type to XML
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Type');
    metaTag.setAttribute('content', 'application/xml; charset=utf-8');
    document.head.appendChild(metaTag);
    
    // Remove all existing body content and styling
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin: 0; padding: 0; font-family: monospace; background: white;';
    
    // Create and insert the XML content directly
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-style.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://thetomorrowsteam.com/</loc>
    <lastmod>2025-07-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://thetomorrowsteam.com/join-gd</loc>
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
    <loc>https://thetomorrowsteam.com/achievements</loc>
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

    // Display as formatted XML
    const pre = document.createElement('pre');
    pre.textContent = xmlContent;
    pre.style.cssText = 'margin: 0; padding: 20px; font-family: monospace; line-height: 1.4; color: #333; white-space: pre; overflow: auto;';
    document.body.appendChild(pre);
    
    // Set page title
    document.title = 'Sitemap - thetomorrowsteam.com';
  }, []);

  return null;
};

export default Sitemap;