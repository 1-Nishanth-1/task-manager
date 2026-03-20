import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const secret = process.env.BACKEND_JWT_SECRET;

  if (!secret) {
    console.error("BACKEND_JWT_SECRET is not set");
    return NextResponse.json(
      { success: false, message: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const token = jwt.sign(
    {
      sub: session.user.email,
      email: session.user.email,
      name: session.user.name,
      picture: (session.user as any).image,
    },
    secret,
  );

  return NextResponse.json({ success: true, token });
}
