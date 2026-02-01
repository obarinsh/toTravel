import type { Metadata } from "next";
import { Inter, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${inter.variable} ${instrumentSans.variable} antialiased min-h-screen`}
      >
        {/* Premium Navigation */}
        <nav className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-8 py-5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
                <MapPin size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-2xl font-semibold text-foreground tracking-tight">
                ToTravel
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/trips"
                className="px-5 py-2.5 text-muted hover:text-foreground transition-colors duration-300 font-body text-sm font-medium"
              >
                <span className="label-premium">My Trips</span>
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark hover:scale-[1.02] transition-all duration-300 font-body text-sm font-medium"
              >
                <Plus size={16} strokeWidth={2} />
                <span className="label-premium">New Trip</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content with generous spacing */}
        <main className="max-w-7xl mx-auto px-8 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
