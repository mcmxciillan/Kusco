import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kusco - Clinician AI Assistant",
  description: "Secure clinician-AI patient notes, chat, and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">{children}</body>
    </html>
  );
}
