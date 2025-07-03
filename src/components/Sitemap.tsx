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
</url>
<url>
<loc>https://thetomorrowsteam.com/about</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/join-gd</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/leaderboard</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/watch-learn</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/resources</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/blog</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/achievements</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/contact</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/login</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/reset-password</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/dashboard</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/dashboard/profile</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/notifications</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/participation-history</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/admin</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/check-email</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/email-verified</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/reset-email-sent</loc>
</url>
<url>
<loc>https://thetomorrowsteam.com/already-registered</loc>
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