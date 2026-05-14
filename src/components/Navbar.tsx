"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Cpu, Menu, X, LogIn, LogOut, User, Zap, Shield, GraduationCap } from 'lucide-react';
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
  { name: 'Official List', href: '/courses' },
  { name: 'Announcements', href: '/announcements' },
  { name: 'Public Forum', href: '/forum' },
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
        description: "Invalid credentials. Please check your username and password.",
        variant: "destructive"
      });
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
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    {user.role === 'admin' ? <Shield className="h-2 w-2 text-primary" /> : <GraduationCap className="h-2 w-2" />}
                    {user.role}
                  </span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <AvatarFallback className="bg-secondary text-primary font-bold">
                    {user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={logout} className="text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                      Log In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Academy Login</DialogTitle>
                      <DialogDescription>
                        Enter your student or staff credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground">
                        Sign In
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold px-6">
                  <Link href="/enroll">
                    <Zap className="h-4 w-4 mr-2 fill-current" /> Enroll Now
                  </Link>
                </Button>
              </div>
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
              <Button onClick={logout} variant="destructive" className="w-full h-14 font-bold text-lg rounded-xl">
                <LogOut className="h-5 w-5 mr-2" /> Sign Out
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Button onClick={() => { setIsOpen(false); setIsLoginOpen(true); }} variant="outline" className="w-full h-14 font-bold text-lg rounded-xl">
                  <LogIn className="h-5 w-5 mr-2" /> Log In
                </Button>
                <Button asChild className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/20">
                  <Link href="/enroll" onClick={() => setIsOpen(false)}>
                    Enroll Now
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
