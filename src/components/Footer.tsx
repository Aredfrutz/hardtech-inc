import Link from 'next/link';
import { Cpu, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-card mt-auto py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Cpu className="h-8 w-8 text-primary" />
              <span className="font-headline font-bold text-xl tracking-tight">
                HARDTECH <span className="text-primary">ACADEMY</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Empowering the next generation of tech leaders with cutting-edge training, hands-on labs, and AI-driven curriculum.
            </p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="font-headline font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors">Course Catalog</Link></li>
              <li><Link href="/enroll" className="hover:text-primary transition-colors">Enrollment</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-headline font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Student Portal</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Staff Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HardTech Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}