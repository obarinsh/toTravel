'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  // On non-landing pages, always show solid header
  const showSolidHeader = !isLandingPage || scrolled;

  // Hide header on auth pages
  if (isAuthPage) return null;

  const textClass = showSolidHeader 
    ? 'text-stone' 
    : 'text-white mix-blend-difference';
  
  const textStyle = showSolidHeader ? { color: '#4A4F45' } : undefined;

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
          className={`text-sm font-medium transition-colors ${textClass}`}
          style={textStyle}
        >
          toTravel
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link 
                    href="/trips" 
                    className={`text-sm transition-colors hover:opacity-70 ${textClass}`}
                    style={textStyle}
                  >
                    My Trips
                  </Link>
                  
                  {/* User menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-1.5 text-sm transition-colors hover:opacity-70 ${textClass}`}
                      style={textStyle}
                    >
                      <User size={16} strokeWidth={1.5} />
                      <span className="hidden sm:inline max-w-[100px] truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown size={14} strokeWidth={1.5} />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[160px] z-50">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} strokeWidth={1.5} style={{ color: '#9A9A94' }} />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className={`text-sm transition-colors hover:opacity-70 ${textClass}`}
                    style={textStyle}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="text-sm px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#5C6B4A' }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
