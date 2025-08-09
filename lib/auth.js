import GoogleProvider from 'next-auth/providers/google';

console.log('SERVER-SIDE CHECK: GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID);
console.log('SERVER-SIDE CHECK: GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.name = profile.name;
        token.picture = profile.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};