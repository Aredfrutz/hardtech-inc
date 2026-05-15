
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar, Zap, Users, Code, FileText, Megaphone, Info } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Home() {
  const { firestore } = useFirestore();

  // Fetch Announcements for News
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('timestamp', 'desc'), limit(4));
  }, [firestore]);
  const { data: announcements, loading: announcementsLoading } = useCollection(announcementsQuery);

  // Fetch Officials for Leadership
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'), limit(3));
  }, [firestore]);
  const { data: officials, loading: officialsLoading } = useCollection(officialsQuery);

  // Fetch Public Forms for Resources
  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), orderBy('title', 'asc'), limit(4));
  }, [firestore]);
  const { data: forms, loading: formsLoading } = useCollection(formsQuery);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/BGhomepage.png" 
            alt="HardTech Background"
            fill
            className="object-cover opacity-50 transition-all duration-1000 -scale-x-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 rounded-none uppercase font-bold text-[10px] tracking-widest">
              Enrollment Now Open: Master Class May 2026
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-headline uppercase tracking-tighter">
              Master the <span className="text-gradient">Hard Skills</span> of the Future.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed uppercase text-[10px] font-bold tracking-[0.2em] opacity-80">
              HardTech Information Technology provides actual advanced board-level training and hardware troubleshooting education for professional technicians.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-white hover:text-black h-14 px-8 rounded-none uppercase font-bold text-xs tracking-widest transition-all" asChild>
                <Link href="/courses">Explore Programs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground h-14 px-8 rounded-none uppercase font-bold text-xs tracking-widest transition-all" asChild>
                <Link href="/forms">Download & Submit Forms</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements / News Section */}
      <section className="py-24 border-y border-white/5 bg-[#080808]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Latest <span className="text-primary">News</span></h2>
              <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-2">Official Broadcasts and Updates</p>
            </div>
            <Button variant="link" className="text-primary text-[10px] font-bold uppercase tracking-widest" asChild>
              <Link href="/announcements">View All Announcements <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {announcementsLoading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 bg-secondary/20 rounded-none" />)
            ) : announcements?.length ? (
              announcements.map((news) => (
                <Card key={news.id} className="bg-card/40 border-white/5 overflow-hidden group rounded-none flex flex-col h-full hover:border-primary/20 transition-all">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="text-[8px] uppercase font-bold bg-primary/10 text-primary border-none rounded-none">{news.priority || 'Update'}</Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">{news.timestamp?.toDate ? format(news.timestamp.toDate(), 'MMM d, yyyy') : 'Recent'}</span>
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 flex-grow">
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3 uppercase font-medium opacity-70">
                      {news.body}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground uppercase text-xs font-bold opacity-30 tracking-[0.3em]">
                No news logs detected in system.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Academy Resources / Forms Section */}
      <section className="py-24 bg-white text-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Public <br/><span className="text-[#a3ff00] bg-black px-2">Resources</span></h2>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
                Access official technical documentation, waivers, and certification request forms provided by the academy.
              </p>
              <Button className="rounded-none bg-black text-white hover:bg-[#a3ff00] hover:text-black transition-all h-12 px-8 uppercase font-bold text-[10px] tracking-widest" asChild>
                <Link href="/forms">Open Forms Registry</Link>
              </Button>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {formsLoading ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-secondary/10 rounded-none" />)
              ) : forms?.length ? (
                forms.map((form) => (
                  <Link key={form.id} href="/forms" className="group p-6 border-2 border-black/5 hover:border-black transition-all flex items-center gap-4 bg-secondary/5">
                    <div className="h-10 w-10 bg-black text-white flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-tight group-hover:underline">{form.title}</h4>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">{form.category || 'General Form'}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-[10px] uppercase font-bold opacity-30 text-center">Repository empty.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Officials Section */}
      <section className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Academy <span className="text-primary">Leadership</span></h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60 max-w-lg mx-auto leading-relaxed">
              Our official directory of center directors and technical staff members dedicated to professional training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {officialsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-48 bg-secondary/20 rounded-none" />)
            ) : officials?.length ? (
              officials.map((staff) => (
                <Card key={staff.id} className="bg-secondary/10 border-white/5 rounded-none p-8 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                  <div className="h-20 w-20 bg-primary/20 rounded-none border-2 border-primary/40 flex items-center justify-center mb-6 text-2xl font-black text-primary group-hover:bg-primary group-hover:text-black transition-all">
                    {staff.name?.charAt(0)}
                  </div>
                  <h3 className="font-bold uppercase text-lg tracking-tight mb-1">{staff.name}</h3>
                  <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-4">{staff.position}</p>
                  <p className="text-[9px] uppercase font-medium text-muted-foreground opacity-60 leading-relaxed max-w-[200px]">
                    {staff.department || 'Technical Division'}
                  </p>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center opacity-20">
                <Users className="h-10 w-10 mx-auto mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-widest">Directory data pending synchronization.</p>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" className="rounded-none border-primary/20 uppercase font-bold text-[10px] tracking-widest h-12 px-10" asChild>
              <Link href="/officials">View Full Officials List</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
