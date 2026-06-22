export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured on server' });

  const data = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  const OWNER = 'matvren';
  const REPO = 'artsource';
  const FILE_PATH = 'data/db.json';
  const BRANCH = 'main';

  try {
    const shaUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const shaRes = await fetch(shaUrl, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (!shaRes.ok) {
      const msg = await shaRes.text();
      return res.status(500).json({ error: `Failed to get SHA: ${msg}` });
    }
    const { sha } = await shaRes.json();

    const json = JSON.stringify(data, null, 2);
    const content = Buffer.from(json).toString('base64');
    const pushRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Sync data', content, sha, branch: BRANCH }),
      }
    );

    if (!pushRes.ok) {
      const msg = await pushRes.text();
      return res.status(500).json({ error: `GitHub push failed: ${msg}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
