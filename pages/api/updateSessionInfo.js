import { getServerSession } from 'next-auth/react';
import User from '@/models/User';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId, deviceInfo } = req.body;

    try {
      await User.findOneAndUpdate(
        { 'sessions.sessionId': sessionId },
        { 
          $set: { 
            'sessions.$.deviceInfo': deviceInfo,
            'sessions.$.lastLogin': new Date(),
            'sessions.$.isActive': true
          }
        }
      );
      res.status(200).json({ message: 'Session info updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update session info' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
