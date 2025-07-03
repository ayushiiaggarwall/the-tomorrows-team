import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Set the content type to XML
    document.title = 'Sitemap';
    
    // Replace the entire page content with the sitemap XML
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
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

    // Replace the entire body content with the XML
    document.body.innerHTML = sitemapXML;
    
    // Set content type header for XML
    document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/xml; charset=utf-8">';
  }, []);

  return null; // Component returns null since we're replacing the entire body
};

export default Sitemap;