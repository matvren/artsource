import { put, head } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — read from Vercel Blob, fall back to GitHub
  if (req.method === 'GET') {
    try {
      const blob = await head('db.json');
      const response = await fetch(blob.url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch {
      // No data in Blob yet — migrate from GitHub
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
  }

  // POST — write to Vercel Blob
  if (req.method === 'POST') {
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    try {
      await put('db.json', JSON.stringify(data, null, 2), { access: 'public', addRandomSuffix: false });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
