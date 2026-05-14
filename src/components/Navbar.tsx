
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block">
            HARDTECH <span className="text-primary">ACADEMY</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-all hover:text-primary relative py-1",
                pathname === link.href ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex items-center gap-4 border-l border-white/10 pl-6 ml-2">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-white/10 bg-background/95 backdrop-blur-lg p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-medium py-2 transition-colors",
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-white/10">
            {user ? (
              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            ) : (
              <Button onClick={handleSignIn} className="w-full bg-primary text-primary-foreground">
                <LogIn className="h-4 w-4 mr-2" /> Sign In with Google
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
