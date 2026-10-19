import type { Metadata } from 'next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Blogs & Insights",
    description: "Thoughts and deep dives on software engineering, generative AI, knowledge graphs, and full-stack systems by Yogeshwaran G.",
    openGraph: {
        title: "Blogs & Insights | Yogeshwaran G",
        description: "Thoughts and deep dives on software engineering, generative AI, knowledge graphs, and full-stack systems.",
        url: "/blogs",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blogs & Insights | Yogeshwaran G",
        description: "Thoughts and deep dives on software engineering, generative AI, knowledge graphs, and full-stack systems.",
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}

