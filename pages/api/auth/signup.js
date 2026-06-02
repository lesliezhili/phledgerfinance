import { signUp } from '../../../lib/auth/users';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name, country } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be 8+ characters' });
  const result = await signUp(email, password, name, country || 'AU');
  if (result.error) return res.status(409).json({ error: result.error });
  res.json({ success: true, user: result.user });
}
