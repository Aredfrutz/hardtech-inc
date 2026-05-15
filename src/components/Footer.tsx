import Link from 'next/link';
import Image from 'next/image';
import { Cpu, Facebook, Youtube } from 'lucide-react'; // Added Youtube icon

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0a0a] py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image 
                src="/logo.jpg" 
                alt="HardTech Logo" 
                width={32} 
                height={32} 
                className="rounded-full border border-primary object-cover h-8 w-8" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-widest leading-none">HARDTECH</span>
                <span className="text-[8px] font-medium tracking-tighter text-gray-400 uppercase">Information Technology</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400 max-w-sm mb-6 uppercase font-medium">
              Leading provider of professional board-level repair training and hardware troubleshooting education.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <Link 
                href="https://www.facebook.com/profile.php?id=61577279713121" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-[#80ef26]/10 text-gray-400 hover:text-[#80ef26] transition-all duration-300"
                aria-label="Visit our Facebook page"
              >
                <Facebook size={20} />
              </Link>
              
              <Link 
                href="https://www.youtube.com/@hardtechvlog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-[#80ef26]/10 text-gray-400 hover:text-[#80ef26] transition-all duration-300"
                aria-label="Visit our YouTube channel"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[10px] font-medium text-gray-400 uppercase">
              <li><Link href="/" className="hover:text-[#80ef26] transition-colors">Home</Link></li>
              <li><Link href="/forum" className="hover:text-[#80ef26] transition-colors">Public Service Forum</Link></li>
              <li><Link href="/announcements" className="hover:text-[#80ef26] transition-colors">Announcements</Link></li>
              <li><Link href="/officials" className="hover:text-[#80ef26] transition-colors">Officials List</Link></li>
              <li><Link href="#" className="hover:text-[#80ef26] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest mb-4">Popular Courses</h4>
            <ul className="space-y-2 text-[10px] font-medium text-gray-400 uppercase">
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">Android Board Repair</li>
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">iPhone Board Repair</li>
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">Laptop Repair</li>
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">Micro-Soldering</li>
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">Data Recovery</li>
              <li className="hover:text-[#80ef26] transition-colors cursor-pointer">Tablet Repair</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
          <span>© 2024 Hardtech Information Technology. All rights reserved.</span>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span className="hover:text-[#80ef26] cursor-pointer transition-colors">Terms of Service</span>
             <span className="hover:text-[#80ef26] cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}