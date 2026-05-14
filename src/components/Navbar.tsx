
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, Shield, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { name: 'ANNOUNCEMENTS/NEWS', href: '/announcements' },
  { name: 'BOARD REPAIR PROGRAMS', href: '/courses' },
  { name: 'LIST OF PASSERS', href: '#' },
  { name: 'FORUM', href: '/forum' },
  { name: 'ABOUT US', href: '#' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { user, login, logout } = useAuth();
  const { toast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      toast({ title: "Welcome back!", description: `Logged in as ${username}` });
      setIsLoginOpen(false);
      setUsername('');
      setPassword('');
    } else {
      toast({ 
        title: "Login failed", 
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="w-full bg-[#0a0a0a] border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 border-primary overflow-hidden">
             <div className="w-8 h-8 bg-black rounded-full border border-primary flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
             </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-white leading-none">HARDTECH</span>
            <span className="text-[9px] font-medium tracking-tighter text-muted-foreground uppercase">Information Technology</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-[10px] font-bold transition-all hover:text-primary uppercase tracking-wider px-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-primary/30">
                  <AvatarFallback className="bg-black text-primary font-bold text-xs uppercase">
                    {user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={logout} className="text-[10px] font-bold text-muted-foreground uppercase hover:text-destructive">
                  <LogOut className="h-3.5 w-3.5 mr-2" /> Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase">
                      Log In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-none border-primary">
                    <DialogHeader>
                      <DialogTitle className="uppercase text-sm tracking-widest">Academy Login</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="rounded-none" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-none" />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-none uppercase font-bold text-xs">
                        Sign In
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 rounded-full text-[10px] uppercase">
              <Link href="/enroll">Enroll Now</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black border-t border-primary/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-muted-foreground hover:text-primary uppercase py-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-white/5">
             <Button asChild className="w-full bg-primary text-primary-foreground font-bold uppercase text-[10px] h-10 rounded-full">
                <Link href="/enroll" onClick={() => setIsOpen(false)}>Enroll Now</Link>
             </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
