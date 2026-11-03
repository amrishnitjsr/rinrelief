import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/env.mjs";

const credentialsSchema = z.object({
  email: z.string().trim().min(3),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const identifier = parsed.data.email.toLowerCase();
        const caseRecord = identifier.startsWith("case-") ? await prisma.debtCase.findUnique({ where: { caseNumber: identifier.toUpperCase() }, select: { clientEmail: true } }) : null;
        const user = await prisma.user.findUnique({ where: { email: (caseRecord?.clientEmail ?? identifier).toLowerCase() } });
        if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, mustChangePassword: user.mustChangePassword };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.sub || session.user.email) {
          const userById = token.sub
            ? await prisma.user.findUnique({ where: { id: token.sub }, select: { id: true, phone: true, role: true, mustChangePassword: true } })
            : null;
          const user = userById ?? (session.user.email
            ? await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true, phone: true, role: true, mustChangePassword: true } })
            : null);
          if (user) session.user.id = user.id;
          session.user.phone = user?.phone ?? (typeof token.phone === "string" ? token.phone : undefined);
          session.user.role = user?.role ?? token.role as "SUPER_ADMIN" | "ADVOCATE" | "CLIENT";
          session.user.mustChangePassword = user?.mustChangePassword ?? token.mustChangePassword === true;
        } else {
          session.user.phone = typeof token.phone === "string" ? token.phone : undefined;
          session.user.role = token.role as "SUPER_ADMIN" | "ADVOCATE" | "CLIENT";
          session.user.mustChangePassword = token.mustChangePassword === true;
        }
      }
      return session;
    },
    authorized({ auth: session, request }) {
      if (!request.nextUrl.pathname.startsWith("/admin")) return true;
      return session?.user?.role === "ADVOCATE" || session?.user?.role === "SUPER_ADMIN";
    },
  },
});
