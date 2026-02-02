'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      // Consider scrolled after passing the hero section (roughly viewport height)
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On non-landing pages, always show solid header
  const showSolidHeader = !isLandingPage || scrolled;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-16 py-5 transition-all duration-300 ${
        showSolidHeader 
          ? 'bg-white/95 backdrop-blur-sm shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className={`text-sm font-medium transition-colors ${
            showSolidHeader 
              ? 'text-stone' 
              : 'text-white mix-blend-difference'
          }`}
          style={showSolidHeader ? { color: '#4A4F45' } : undefined}
        >
          toTravel
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          <Link 
            href="/" 
            className={`text-sm transition-colors hover:opacity-70 ${
              showSolidHeader 
                ? 'text-stone' 
                : 'text-white mix-blend-difference'
            }`}
            style={showSolidHeader ? { color: '#4A4F45' } : undefined}
          >
            Explore
          </Link>
          <Link 
            href="/trips" 
            className={`text-sm transition-colors hover:opacity-70 ${
              showSolidHeader 
                ? 'text-stone' 
                : 'text-white mix-blend-difference'
            }`}
            style={showSolidHeader ? { color: '#4A4F45' } : undefined}
          >
            My Trips
          </Link>
        </div>
      </div>
    </header>
  );
}
