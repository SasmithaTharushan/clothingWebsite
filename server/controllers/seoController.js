import Product from '../models/Product.js';

const siteUrl = (req) =>
  (process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');

// GET /sitemap.xml
export async function sitemap(req, res) {
  const base = siteUrl(req);
  const products = await Product.find({}, { updatedAt: 1 }).lean();
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/products.html', priority: '0.9' },
    ...products.map((p) => ({
      loc: `/ProductDetails.html?productId=${p._id}`,
      lastmod: p.updatedAt?.toISOString().slice(0, 10),
      priority: '0.7',
    })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${base}${u.loc.replace(/&/g, '&amp;')}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`
      )
      .join('\n') +
    '\n</urlset>';
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, s-maxage=3600');
  res.send(xml);
}

// GET /robots.txt
export function robots(req, res) {
  res
    .type('text/plain')
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin-\nDisallow: /cartPage.html\nDisallow: /checkout.html\nDisallow: /profile.html\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`
    );
}
