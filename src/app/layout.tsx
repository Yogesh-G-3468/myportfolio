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

export const metadata: Metadata = {
  title: "Yogeshwaran G — Software Engineer",
  description:
    "Software engineer building things with code. Currently at JMAN Group, working on full-stack apps, data pipelines, and AI.",
  keywords: [
    "Yogeshwaran G",
    "Software Engineer",
    "Full-Stack Developer",
    "Chennai",
  ],
  authors: [{ name: "Yogeshwaran G" }],
  openGraph: {
    title: "Yogeshwaran G — Software Engineer",
    description:
      "Software engineer building things with code.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Yogeshwaran G — Software Engineer",
    description:
      "Software engineer building things with code.",
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
