
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Cpu, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navLinks = [
  { name: 'Official List', href: '/courses' },
  { name: 'Announcements', href: '/announcements' },
  { name: 'Public Forum', href: '/forum' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth();
  const { user } = useUser();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all shadow-inner">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block">
            HARDTECH <span className="text-primary">ACADEMY</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-all hover:text-primary relative py-2",
                    isActive 
                      ? "text-primary after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full after:shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-6 border-l border-white/10 pl-8">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="text-xs font-bold leading-none">{user.displayName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Student</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-secondary"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold px-6">
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-background/95 backdrop-blur-2xl p-8 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-xl font-bold py-3 transition-colors flex items-center justify-between",
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              {link.name}
              {pathname === link.href && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}
            </Link>
          ))}
          <div className="pt-6 mt-4 border-t border-white/10 flex flex-col gap-4">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold">{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Button onClick={handleSignOut} variant="destructive" className="w-full h-14 font-bold text-lg rounded-xl">
                  <LogOut className="h-5 w-5 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/20">
                <LogIn className="h-5 w-5 mr-2" /> Sign In with Google
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
