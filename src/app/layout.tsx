import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yogeshwaran.space';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Yogeshwaran G — Software Engineer",
    template: "%s | Yogeshwaran G",
  },
  description:
    "Software engineer building things with code. Currently at JMAN Group, working on full-stack apps, data pipelines, and AI.",
  keywords: [
    "Yogeshwaran G",
    "Software Engineer",
    "Full-Stack Developer",
    "Chennai",
  ],
  authors: [{ name: "Yogeshwaran G" }],
  creator: "Yogeshwaran G",
  openGraph: {
    title: "Yogeshwaran G — Software Engineer",
    description:
      "Software engineer building things with code.",
    url: baseUrl,
    siteName: "Yogeshwaran G",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yogeshwaran G — Software Engineer",
    description:
      "Software engineer building things with code.",
    creator: "@Yogeshwaran__g",
    site: "@Yogeshwaran__g",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme !== 'light';
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} antialiased grain bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
