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
      console.log("Sign In Attempt:", { user, account, profile });
      if (account.provider === "google" && adminEmails.includes(user.email)) {
        console.log("Sign In Successful");
        return true;
      }
      console.log("Sign In Failed: Not an admin");
      return false;
    },
    async session({ session, user }) {
      console.log("Session Callback:", { session, user });
      if (adminEmails.includes(session?.user?.email)) {
        session.user.id = user.id;
        return session;
      }
      return null;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: true, // Enable debug messages in the console
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
