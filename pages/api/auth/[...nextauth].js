import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from "@/lib/mongodb";

const adminEmails = ['yahyahetari2002@gmail.com', 'yahyaalhetari5@gmail.com', 'Hazembohloly@gmail.com'];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in if user's email is in the admin list
      return adminEmails.includes(user.email);
    },
    async session({ session, user }) {
      // Check if user is still an admin (in case admin list changes)
      if (adminEmails.includes(session?.user?.email)) {
        session.user.isAdmin = true;
        return session;
      }
      // If not an admin, return null to prevent session creation
      return null;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  // This will log out the user if their email is removed from adminEmails
  events: {
    async session({ session }) {
      if (session && !adminEmails.includes(session.user.email)) {
        // Force sign out if user is no longer an admin
        session.destroy();
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user.isAdmin) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
}
