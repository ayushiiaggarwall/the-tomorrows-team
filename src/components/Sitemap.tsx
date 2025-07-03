import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Set the content type to XML
    document.title = 'Sitemap';
    
    // Replace the entire page content with the sitemap XML
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Pages -->
  <url>
    <loc>https://thetomorrowsteam.com/</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/join-gd</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/watch-learn</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/leaderboard</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/resources</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Content Pages -->
  <url>
    <loc>https://thetomorrowsteam.com/blog</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/achievements</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Information Pages -->
  <url>
    <loc>https://thetomorrowsteam.com/about</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://thetomorrowsteam.com/contact</loc>
    <lastmod>2025-01-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;

    // Replace the entire body content with the XML
    document.body.innerHTML = `<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">${sitemapXML}</pre>`;
    
    // Set content type header (this might not work in client-side but worth trying)
    document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/xml; charset=utf-8">';
  }, []);

  return null; // Component returns null since we're replacing the entire body
};

export default Sitemap;