import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Galileo Research Agent",
  description: "Multi-step AI research assistant powered by GPT-4o-mini and Galileo observability",
  keywords: ["AI", "research", "agent", "Galileo", "LLM", "observability"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
