import NextAuth, {
  NextAuthOptions,
  Session,
  User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import jwt from "jsonwebtoken";

interface AuthToken {
  id: string;
  email: string;
  userType: string;
}

interface User extends NextAuthUser {
  authToken?: string;
  refreshToken?: string;
}

interface SessionWithTokens extends Session {
  authToken?: string;
  refreshToken?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        try {
          const response = await axios.post(
            `https://pandora-api-staging.onrender.com/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          const { authToken, refreshToken } = response.data;

          if (authToken) {
            // Decode the authToken to get user information
            const decodedToken = jwt.decode(authToken) as AuthToken;

            return {
              id: decodedToken.id,
              email: decodedToken.email,
              userType: decodedToken.userType,
              authToken,
              refreshToken,
            } as User;
          } else {
            return null;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              const status = error.response.status;
              const message =
                error.response.data?.message || "Authentication failed";

              console.error(
                `Authentication error: ${message} (status code: ${status})`
              );

              throw new Error(message);
            } else if (error.request) {
              console.error(
                "No response received from the authentication server"
              );
              throw new Error(
                "No response from server. Please try again later."
              );
            } else {
              console.error(
                "Error in setting up the authentication request:",
                error.message
              );
              throw new Error(
                "An error occurred while setting up the request. Please try again."
              );
            }
          } else {
            console.error("Unexpected error during authentication:", error);
            throw new Error("An unexpected error occurred. Please try again.");
          }
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // Adjust the login route as necessary
    error: "/auth/error", // Customize your error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user info and tokens to the token
        token.id = user.id;
        token.email = user.email;

        token.authToken = user.authToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Add token info to the session
        session.user = {
          id: token.id as string,
          email: token.email as string,
          userType: token.userType as string,
        } as User;
        session.authToken = token.authToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT strategy for session management
  },
  secret: "https://pandora-api-staging.onrender.com/", // Ensure this is set in your environment
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
