import { getUser } from '../../../lib/auth/users';
export default async function handler(req, res) {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const email = Buffer.from(auth, 'base64').toString().split(':')[0];
    const user = await getUser(email);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ success: true, user });
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
