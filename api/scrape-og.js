export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow'
        });
        if (!resp.ok) return res.status(200).json({ ogImage: null });

        const html = await resp.text();
        let match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (!match) match = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

        return res.status(200).json({ ogImage: match ? match[1] : null });
    } catch (err) {
        return res.status(200).json({ ogImage: null, error: err.message });
    }
}
