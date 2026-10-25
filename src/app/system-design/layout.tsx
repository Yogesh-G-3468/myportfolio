import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/system-design/Sidebar";
import SearchTrigger from "@/components/system-design/SearchTrigger";
import { getAllModules, getAllTopics } from "@/lib/system-design/content";

export const metadata = {
  title: "System Design Hub — Gap-Free Course & Architecture Guide",
  description:
    "A complete, self-paced, book-quality course taking you from fundamentals to real-world and interview mastery with worked architectures, Mermaid diagrams, and trade-off analyses.",
};

export default function SystemDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = getAllModules();
  const allTopics = getAllTopics();

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex flex-col bg-background">
        <div className="max-w-[1512px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col lg:flex-row gap-8 py-6">
          <Sidebar modules={modules} />
          <main className="flex-1 min-w-0 bg-background">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
