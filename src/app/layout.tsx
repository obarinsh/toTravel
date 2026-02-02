import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ToTravel - Plan Your Perfect Trip",
  description: "AI-powered trip planner with interactive maps and drag-and-drop itinerary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />

          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Minimal Footer */}
          <footer className="py-12 px-6 md:px-12 lg:px-16 border-t border-moss-light">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-mist">© 2025 toTravel</span>
              <div className="flex gap-8">
                <span className="text-sm cursor-pointer hover:opacity-70 transition-opacity text-mist">About</span>
                <span className="text-sm cursor-pointer hover:opacity-70 transition-opacity text-mist">Privacy</span>
                <span className="text-sm cursor-pointer hover:opacity-70 transition-opacity text-mist">Terms</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
