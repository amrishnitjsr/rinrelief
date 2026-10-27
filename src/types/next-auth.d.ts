import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; phone?: string; role: "SUPER_ADMIN" | "ADVOCATE" | "CLIENT" } & DefaultSession["user"];
  }
  interface User {
    phone?: string;
    role: "SUPER_ADMIN" | "ADVOCATE" | "CLIENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "SUPER_ADMIN" | "ADVOCATE" | "CLIENT";
    phone?: string;
  }
}
