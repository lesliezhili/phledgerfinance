import { signIn } from '../../../lib/auth/users';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const result = await signIn(email, password);
  if (result.error) return res.status(401).json({ error: result.error });
  res.json({ success: true, user: result.user, token: result.token });
}
