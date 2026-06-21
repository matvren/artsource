import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  const username = await kv.get(`session:${token}`);
  if (!username) return res.status(401).json({ error: 'Invalid session' });

  if (req.method === 'GET') {
    const favs = await kv.get(`favs:${username}`);
    return res.json({ favorites: favs ? JSON.parse(favs) : [] });
  }

  if (req.method === 'POST') {
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) return res.status(400).json({ error: 'Invalid favorites' });
    await kv.set(`favs:${username}`, JSON.stringify(favorites));
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
