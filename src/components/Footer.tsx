import Link from 'next/link';
import Image from 'next/image'; // Added this import
import { Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 bg-[#f8f9fa] py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-black">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              
              {/* Updated Logo Section */}
              <Image 
                src="/logo.jpg" 
                alt="HardTech Logo" 
                width={32} 
                height={32} 
                className="rounded-full border border-primary object-cover h-8 w-8" 
              />
              
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-widest leading-none">HARDTECH</span>
                <span className="text-[8px] font-medium tracking-tighter text-muted-foreground uppercase">Information Technology</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground max-w-sm mb-6 uppercase font-medium">
              Leading provider of professional board-level repair training and hardware troubleshooting education.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[10px] font-medium text-muted-foreground uppercase">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/forum" className="hover:text-primary transition-colors">Public Service Forum</Link></li>
              <li><Link href="/announcements" className="hover:text-primary transition-colors">Announcements</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest mb-4">Popular Courses</h4>
            <ul className="space-y-2 text-[10px] font-medium text-muted-foreground uppercase">
              <li>Android Board Repair</li>
              <li>iPhone Board Repair</li>
              <li>Laptop Repair</li>
              <li>Micro-Soldering</li>
              <li>Data Recovery</li>
              <li>Tablet Repair</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">
          <span>© 2024 Hardtech Information Technology. All rights reserved.</span>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span>Terms of Service</span>
             <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}