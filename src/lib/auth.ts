import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 本番環境での必須環境変数チェック
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required in production");
}

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // 本番環境では詳細なエラー情報を隠す
          if (process.env.NODE_ENV === "production") {
            console.error("Authentication failed for user:", credentials.email);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    // ログイン後のリダイレクト先を制御
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // セキュリティ: オープンリダイレクト攻撃を防ぐ
      try {
        const allowedDomains = [baseUrl];

        // ログアウト後の場合はサインインページへ
        if (url.includes("/auth/signin")) {
          return `${baseUrl}/auth/signin`;
        }

        // 相対URLの場合は baseUrl と結合
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // 完全なURLの場合、許可されたドメインかチェック
        if (url.startsWith("http")) {
          const urlObj = new URL(url);
          const isAllowed = allowedDomains.some(
            (domain) => urlObj.origin === new URL(domain).origin
          );

          if (isAllowed) {
            return url;
          }
        }

        // デフォルトはダッシュボードへ
        return `${baseUrl}/dashboard`;
      } catch {
        // URL解析に失敗した場合はデフォルトへ
        return `${baseUrl}/dashboard`;
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
