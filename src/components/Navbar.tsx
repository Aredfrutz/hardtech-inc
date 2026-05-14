"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Cpu, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'Enroll', href: '/enroll' },
  { name: 'Admin', href: '/admin' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Cpu className="h-8 w-8 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight">
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
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/courses">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b bg-background p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-medium py-2 border-b border-transparent",
                pathname === link.href ? "text-primary border-primary/20" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild onClick={() => setIsOpen(false)} className="w-full bg-primary text-primary-foreground">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}