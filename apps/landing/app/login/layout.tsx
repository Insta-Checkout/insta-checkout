import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Insta Checkout | تسجيل دخول",
  description: "Sign in to your Insta Checkout dashboard. سجّل دخولك للوحة التحكم.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
