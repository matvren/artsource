import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h.toString(36);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, username, password, oldPassword, newPassword } = req.body;

  if (!username) return res.status(400).json({ error: 'Username required' });

  if (action === 'signup') {
    if (!password || password.length < 3) return res.status(400).json({ error: 'Password too short' });
    const existing = await kv.get(`user:${username}`);
    if (existing) return res.status(400).json({ error: 'Username taken' });
    await kv.set(`user:${username}`, hash(password));
    await kv.set(`favs:${username}`, '[]');
    const token = hash(username + Date.now());
    await kv.set(`session:${token}`, username, { ex: 86400 * 7 });
    return res.json({ token, username });
  }

  if (action === 'login') {
    if (!password) return res.status(400).json({ error: 'Password required' });
    const stored = await kv.get(`user:${username}`);
    if (!stored || stored !== hash(password)) return res.status(400).json({ error: 'Wrong username or password' });
    const token = hash(username + Date.now());
    await kv.set(`session:${token}`, username, { ex: 86400 * 7 });
    return res.json({ token, username });
  }

  if (action === 'reset') {
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Fill in all fields' });
    if (newPassword.length < 3) return res.status(400).json({ error: 'New password too short' });
    const stored = await kv.get(`user:${username}`);
    if (!stored || stored !== hash(oldPassword)) return res.status(400).json({ error: 'Wrong current password' });
    await kv.set(`user:${username}`, hash(newPassword));
    return res.json({ success: true });
  }

  if (action === 'verify') {
    const token = req.body.token;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const user = await kv.get(`session:${token}`);
    if (!user) return res.status(401).json({ error: 'Invalid session' });
    return res.json({ username: user });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
