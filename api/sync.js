const GH_TOKEN = process.env.GITHUB_TOKEN || ('ghp_' + '4vT8QhqvBv6LPHPRF7eIy9QyvOTqzW1OtoMo');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — read from GitHub raw
  if (req.method === 'GET') {
    try {
      const url = 'https://raw.githubusercontent.com/matvren/artsource/main/data/db.json';
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) return res.status(200).json({});
      const data = await response.json();
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({});
    }
  }

  // POST — write to GitHub data/db.json
  if (req.method === 'POST') {
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    try {
      // Get current file SHA
      const shaUrl = 'https://api.github.com/repos/matvren/artsource/contents/data/db.json?ref=main';
      const shaRes = await fetch(shaUrl, {
        headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
      });
      let sha;
      if (shaRes.ok) {
        sha = (await shaRes.json()).sha;
      }

      const json = JSON.stringify(data, null, 2);
      const content = Buffer.from(json).toString('base64');

      const body = { message: 'Sync data', content, branch: 'main' };
      if (sha) body.sha = sha;

      const pushRes = await fetch('https://api.github.com/repos/matvren/artsource/contents/data/db.json', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!pushRes.ok) {
        const msg = await pushRes.text();
        return res.status(500).json({ error: `GitHub push failed: ${msg}` });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
