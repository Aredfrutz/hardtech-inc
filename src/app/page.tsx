"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap, Users, Code, FileText, Megaphone, ShieldCheck, ClipboardList, Loader2, ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Home() {
  const { firestore } = useFirestore();

  // Fetch Latest Announcements
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('timestamp', 'desc'), limit(2));
  }, [firestore]);
  const { data: announcements, loading: announcementsLoading } = useCollection(announcementsQuery);

  // Fetch Official Highlights
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'), limit(2));
  }, [firestore]);
  const { data: officials, loading: officialsLoading } = useCollection(officialsQuery);

  // Fetch Featured Forms
  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), limit(2));
  }, [firestore]);
  const { data: forms, loading: formsLoading } = useCollection(formsQuery);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/hardtech-hero/1200/800" 
            alt="HardTech Background"
            fill
            className="object-cover opacity-60 transition-all duration-1000"
            priority
            data-ai-hint="electronics lab"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 rounded-none uppercase font-bold text-[10px] tracking-widest">
              Digital Academy Registry Active
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-headline uppercase tracking-tighter">
              Master the <span className="text-gradient">Hard Skills</span> of the Future.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed uppercase text-[10px] font-bold tracking-[0.2em] opacity-80">
              HardTech Information Technology provides actual advanced board-level training and hardware troubleshooting education for professional technicians.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-black hover:bg-white hover:text-black h-14 px-8 rounded-none uppercase font-bold text-xs tracking-widest transition-all shadow-lg border-2 border-primary" asChild>
                <Link href="/forms">
                  Download & Submit Forms <FileText className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-16 max-w-4xl">
            <h3 className="text-xl font-bold uppercase text-white mb-6 tracking-widest">About Hardtech Information Technology</h3>
            <p className="text-primary text-sm md:text-base font-medium leading-relaxed">
              Hardtech Information Technology Corporation is a SEC-registered training institution dedicated to developing skilled and competent technicians in the field of electronics and IT. We specialize in providing actual, hands-on advanced board-level training.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-1.5 bg-white min-h-[120px] rounded-full shrink-0"></div>
                <div className="pt-1">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Mission</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    To provide comprehensive, hands-on, and direct-to-the-point training that equips students with advanced diagnostics, microsoldering, and troubleshooting skills, transforming beginners into professional technicians.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-1.5 bg-white min-h-[120px] rounded-full shrink-0"></div>
                <div className="pt-1">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Vision</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    To empower the next generation of expert cellphone technicians, setting the standard for professional board-level repair and innovation in the mobile industry.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] w-full border border-white/10 group overflow-hidden bg-card/20">
              <Image 
                src="https://picsum.photos/seed/hardtech-team/800/1000" 
                alt="HardTech Instructors and Team" 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                data-ai-hint="technical team"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized News & Academy Resources */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left Column: Announcements (Latest News) */}
            <div className="lg:col-span-2 space-y-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Latest <span className="text-primary">News</span></h2>
                <Button asChild variant="link" className="text-accent uppercase text-[10px] font-bold tracking-widest h-auto p-0">
                  <Link href="/announcements">View all transmissions <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>

              {announcementsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {announcements?.length ? announcements.map((item, i) => (
                    <Card key={item.id} className="bg-card/40 border-white/5 overflow-hidden group rounded-none flex flex-col h-full">
                      <div className="relative h-56 w-full grayscale group-hover:grayscale-0 transition-all duration-700">
                        <Image 
                          src={`https://picsum.photos/seed/news-${i}/800/600`} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          data-ai-hint="technology lab"
                        />
                      </div>
                      <CardHeader className="p-8 pb-4">
                        <div className="flex gap-4 mb-4 items-center">
                          <Badge className={`text-[9px] uppercase font-bold rounded-none ${item.priority === 'High' ? 'bg-destructive text-white' : 'bg-primary/10 text-primary'}`}>
                            {item.priority || 'General'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {item.timestamp?.toDate ? format(item.timestamp.toDate(), 'MMM d, yyyy') : 'Recent'}
                          </span>
                        </div>
                        <CardTitle className="text-xl font-headline uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 pt-0 flex-grow">
                        <p className="text-muted-foreground text-[11px] leading-relaxed uppercase font-bold tracking-tight opacity-70 line-clamp-3">
                          {item.body}
                        </p>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">No active transmissions in registry.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Academy Resources (Officials & Forms) */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Officials <span className="text-accent">List</span></h2>
                <div className="space-y-4">
                  {officialsLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
                  ) : (
                    <div className="space-y-4">
                      {officials?.length ? officials.map((official, i) => (
                        <div key={official.id} className="flex gap-6 p-6 bg-secondary/20 border border-white/5 group hover:border-accent/50 transition-all rounded-none">
                          <div className="bg-accent/10 p-4 rounded-none h-fit border border-accent/20 group-hover:bg-accent/20">
                            <ShieldCheck className="h-6 w-6 text-accent" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold uppercase text-xs tracking-tight group-hover:text-accent transition-colors">{official.name}</h4>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{official.position}</p>
                            <Badge variant="outline" className="mt-2 text-[8px] border-accent/30 text-accent rounded-none font-black uppercase tracking-tighter">
                              {official.department || 'Technical Staff'}
                            </Badge>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[10px] text-muted-foreground italic uppercase">Registry offline.</p>
                      )}
                      <Button asChild variant="link" className="text-[10px] font-bold uppercase tracking-widest h-auto p-0 mt-2">
                        <Link href="/officials">View Academy Directory</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8 pt-4 border-t border-white/5">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Technical <span className="text-primary">Forms</span></h2>
                <div className="space-y-4">
                  {formsLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-4">
                      {forms?.length ? forms.map((form) => (
                        <Card key={form.id} className="bg-secondary/10 border-white/5 hover:border-primary/30 transition-all rounded-none overflow-hidden">
                          <CardContent className="p-6 flex items-center gap-4">
                            <ClipboardList className="h-8 w-8 text-primary opacity-50 shrink-0" />
                            <div className="space-y-1 flex-grow overflow-hidden">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest truncate">{form.title}</h5>
                              <p className="text-[8px] text-muted-foreground uppercase truncate">{form.category || 'General Form'}</p>
                            </div>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary hover:text-black">
                              <Link href={form.fileUrl || '/forms'}><ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )) : (
                        <p className="text-[10px] text-muted-foreground italic uppercase">No documents published.</p>
                      )}
                      <Button asChild variant="link" className="text-[10px] font-bold uppercase tracking-widest h-auto p-0 mt-2">
                        <Link href="/forms">Explore Documentation Center</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
