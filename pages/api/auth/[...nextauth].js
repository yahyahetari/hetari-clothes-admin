import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import jwt from 'jsonwebtoken';

const adminEmails = ['yahyahetari2002@gmail.com', 'yahyaalhetari5@gmail.com', 'Hazembohloly@gmail.com'];

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt', // Use JWT for session handling
    maxAge: 24 * 60 * 60, // Set session expiration (1 day)
    updateAge: 12 * 60 * 60, // Update the session every 12 hours
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Add the refresh token to the token object when first logging in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the access token to the session object
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      // Handle admin users
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      } else {
        return false; // Prevent non-admin access
      }
    },
    async signIn({ account, profile }) {
      // Add additional security checks if needed
      return true;
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true, // Enable encryption for better security
  },
};

export default NextAuth(authOptions);

// To check if the user is admin for protected routes
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401).end('Not an admin');
    throw 'not an admin';
  }
}
