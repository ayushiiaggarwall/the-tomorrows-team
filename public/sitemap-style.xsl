<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - The Tomorrow's Team</title>
        <meta charset="utf-8"/>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            color: #334155;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .stats {
            background: #f1f5f9;
            padding: 20px 30px;
            border-bottom: 1px solid #e2e8f0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
          }
          .stat-label {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th {
            background: #f8fafc;
            padding: 15px 20px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 12px 20px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
          }
          tr:hover {
            background-color: #f8fafc;
          }
          .url {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
          }
          .url:hover {
            text-decoration: underline;
          }
          .priority {
            font-weight: 600;
          }
          .priority-high { color: #dc2626; }
          .priority-medium { color: #ea580c; }
          .priority-low { color: #16a34a; }
          .changefreq {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          .freq-daily { background: #fef2f2; color: #dc2626; }
          .freq-weekly { background: #fefbeb; color: #d97706; }
          .freq-monthly { background: #f0fdf4; color: #16a34a; }
          .lastmod {
            color: #64748b;
            font-family: 'Monaco', 'Consolas', monospace;
          }
          .footer {
            padding: 30px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <p>This sitemap contains <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs for The Tomorrow's Team</p>
          </div>
          
          <div class="stats">
            <div class="stats-grid">
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url)"/></div>
                <div class="stat-label">Total URLs</div>
              </div>
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[sm:changefreq='daily'])"/></div>
                <div class="stat-label">Daily Updates</div>
              </div>
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[sm:changefreq='weekly'])"/></div>
                <div class="stat-label">Weekly Updates</div>
              </div>
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[sm:changefreq='monthly'])"/></div>
                <div class="stat-label">Monthly Updates</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <xsl:sort select="sm:priority" order="descending"/>
                <tr>
                  <td>
                    <a href="{sm:loc}" class="url">
                      <xsl:value-of select="sm:loc"/>
                    </a>
                  </td>
                  <td class="lastmod">
                    <xsl:value-of select="sm:lastmod"/>
                  </td>
                  <td>
                    <span>
                      <xsl:attribute name="class">
                        changefreq freq-<xsl:value-of select="sm:changefreq"/>
                      </xsl:attribute>
                      <xsl:value-of select="sm:changefreq"/>
                    </span>
                  </td>
                  <td>
                    <span>
                      <xsl:attribute name="class">
                        priority
                        <xsl:choose>
                          <xsl:when test="sm:priority &gt;= 0.8"> priority-high</xsl:when>
                          <xsl:when test="sm:priority &gt;= 0.5"> priority-medium</xsl:when>
                          <xsl:otherwise> priority-low</xsl:otherwise>
                        </xsl:choose>
                      </xsl:attribute>
                      <xsl:value-of select="sm:priority"/>
                    </span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on <xsl:value-of select="sm:urlset/sm:url[1]/sm:lastmod"/> • The Tomorrow's Team</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>