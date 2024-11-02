import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    authToken?: string;
  }

  interface Session extends DefaultSession {
    user: User;
    authToken?: string;
  }
}
