export default async function handler(req, res) {
  // Extract path from query or URL
  let pathStr = '';
  if (req.query && req.query.path) {
    pathStr = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else {
    const parsedUrl = new URL(req.url, 'http://localhost');
    pathStr = parsedUrl.pathname.replace(/^\/api\/?/, '');
  }

  // Ensure clean path with trailing slash for Wargaming Vortex API
  const cleanPath = pathStr.replace(/\/+$/, '');
  const targetUrl = `https://vortex.worldofwarships.eu/api/${cleanPath}/`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });

    const body = await upstream.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');

    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).json({ error: String(err?.message || err) });
  }
}
