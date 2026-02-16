import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import "./globals.css";
import Footer from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "New Ramadan New Me",
    template: "%s | New Ramadan New Me",
  },
  description:
    "A spiritual self-transformation platform for Ramadan. Track your Quran reading, complete daily challenges, reflect, and grow with accountability partners.",
  keywords: [
    "Ramadan",
    "Quran",
    "Islamic",
    "spiritual growth",
    "accountability",
    "challenges",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F1E9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1628" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <SupabaseProvider>
              {children}
              <Footer />
            </SupabaseProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
