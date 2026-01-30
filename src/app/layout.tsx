import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yogeshwaran G | Full-Stack Software Engineer",
  description:
    "Full-Stack Software Engineer specializing in generative AI, data engineering, and cloud-native applications. Building scalable systems and AI solutions.",
  keywords: [
    "Full-Stack Developer",
    "Software Engineer",
    "React",
    "Next.js",
    "Python",
    "GenAI",
    "Amazon Bedrock",
    "Data Engineering",
    "Cloud Development",
  ],
  authors: [{ name: "Yogeshwaran G" }],
  openGraph: {
    title: "Yogeshwaran G | Full-Stack Software Engineer",
    description:
      "Specializing in generative AI, data engineering, and cloud-native applications.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yogeshwaran G | Full-Stack Software Engineer",
    description:
      "Specializing in generative AI, data engineering, and cloud-native applications.",
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
