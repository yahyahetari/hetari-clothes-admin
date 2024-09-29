import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from "@/lib/mongodb";
import User from '@/models/User';

const adminEmails = ['yahyahetari2002@gmail.com','yahyaalhetari5@gmail.com','Hazembohloly@gmail.com'];

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign in attempt:", email);
      return true; // Allow all sign-ins for now
    },
    async session({session, token, user}) {
      console.log("Session callback called", { sessionUser: session?.user, dbUser: user });
      
      if (!session?.user?.email) {
        console.log("No user email in session");
        return null;
      }

      if (adminEmails.includes(session.user.email)) {
        console.log("Admin user detected:", session.user.email);
        
        try {
          // Add session info
          const sessionId = `session_${Date.now()}`;
          const deviceInfo = 'Unknown Device'; // You might want to pass this from the client

          const updatedUser = await User.findByIdAndUpdate(user.id, {
            $push: {
              sessions: {
                sessionId,
                deviceInfo,
                lastLogin: new Date(),
                isActive: true
              }
            }
          }, { new: true });

          console.log("User updated with new session:", updatedUser);

          session.sessionId = sessionId;
          session.isAdmin = true;
          return session;
        } catch (error) {
          console.error("Error updating user session:", error);
          // Still return the session even if update fails
          session.isAdmin = true;
          return session;
        }
      } else {
        console.log("Non-admin user:", session.user.email);
        return null; // or return session if you want to allow non-admin users
      }
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("JWT callback called", { token, user });
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

export async function isAdminRequest(req,res) {
  const session = await getServerSession(req,res,authOptions);
  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
}
