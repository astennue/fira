import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/providers/query-provider";

const displayFont = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interFont = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchWise — One Platform. Smarter Matching. Better Hiring.",
  description:
    "MatchWise by FIRA — AI-matched web-based recruitment platform connecting Filipino workers with verified employers, powered by semantic + skills + experience scoring, a 19-state application tracker, and a two-step endorsement workflow.",
  keywords: [
    "MatchWise",
    "FIRA",
    "OFW",
    "recruitment",
    "AI matching",
    "Filipino workers",
    "overseas jobs",
    "Morocco",
    "domestic helper",
    "caregiver",
  ],
  icons: {
    icon: [
      { url: "/mw-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${interFont.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
