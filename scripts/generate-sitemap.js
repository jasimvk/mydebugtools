const fs = require('fs');
const path = require('path');

// Define your website URL
const siteUrl = 'https://mydebugtools.com';

// Define the list of pages and tools
const pages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/tools/', changefreq: 'weekly', priority: 0.9 },
  { url: '/tools/json/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/jwt/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/base64/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/api/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/regex/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/color/', changefreq: 'monthly', priority: 0.8 },
  { url: '/tools/icons/', changefreq: 'monthly', priority: 0.8 },
  // Add more tools as they are added to your application
];

// Get current date in YYYY-MM-DD format for lastmod
const currentDate = new Date().toISOString().split('T')[0];

// Generate sitemap XML content
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Write sitemap to public directory
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemapContent);

console.log('Sitemap generated successfully!'); 