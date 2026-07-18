import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DsaSidebar from "@/components/DsaSidebar";

export default function DsaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-16 flex flex-col bg-background">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col lg:flex-row gap-10 py-6">
                    <DsaSidebar />
                    <main className="flex-1 min-w-0 bg-background">
                        {children}
                    </main>
                </div>
                <Footer />
            </div>
        </>
    );
}
