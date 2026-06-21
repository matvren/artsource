import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const adminUsers = ['artsources', 'racibuls'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  const sessionUser = await kv.get(`session:${token}`);
  if (!sessionUser) return res.status(401).json({ error: 'Invalid session' });

  if (req.method === 'GET') {
    if (!adminUsers.includes(sessionUser)) return res.status(403).json({ error: 'Not authorized' });
    const keys = await kv.keys('user:*');
    const users = keys.map(k => k.replace('user:', ''));
    return res.json({ users, admins: adminUsers });
  }

  if (req.method === 'DELETE') {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    if (username !== sessionUser && !adminUsers.includes(sessionUser)) return res.status(403).json({ error: 'Not authorized' });
    if (adminUsers.includes(username)) return res.status(400).json({ error: 'Cannot delete admin' });
    await kv.del(`user:${username}`);
    await kv.del(`favs:${username}`);
    const sessionKeys = await kv.keys(`session:*`);
    for (const key of sessionKeys) {
      const val = await kv.get(key);
      if (val === username) await kv.del(key);
    }
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
