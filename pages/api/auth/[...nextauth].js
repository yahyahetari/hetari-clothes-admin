import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from "@/lib/mongodb";
import User from '@/models/User';

const adminEmails = ['yahyahetari2002@gmail.com','yahyaalhetari5@gmail.com','Hazembohloly@gmail.com'];

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({session, token, user}) {
      if (adminEmails.includes(session?.user?.email)) {
        // Add session info
        const sessionId = `session_${Date.now()}`;
        const deviceInfo = 'Unknown Device'; // Default value
        
        await User.findByIdAndUpdate(user.id, {
          $push: {
            sessions: {
              sessionId,
              deviceInfo,
              lastLogin: new Date(),
              isActive: true
            }
          }
        });

        session.sessionId = sessionId;
        return session;
      } else {
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
}
