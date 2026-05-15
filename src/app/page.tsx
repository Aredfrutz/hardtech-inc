
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  Target, 
  Zap, 
  Users, 
  ShieldCheck, 
  FileText, 
  Award,
  BookOpen
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Home() {
  const { firestore } = useFirestore();

  // Fetch Announcements for News
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('timestamp', 'desc'), limit(3));
  }, [firestore]);
  const { data: announcements, loading: announcementsLoading } = useCollection(announcementsQuery);

  // Fetch Officials for Leadership
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'), limit(4));
  }, [firestore]);
  const { data: officials, loading: officialsLoading } = useCollection(officialsQuery);

  // Fetch Public Forms for Resources
  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), orderBy('title', 'asc'), limit(3));
  }, [firestore]);
  const { data: forms, loading: formsLoading } = useCollection(formsQuery);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/hardtech-hero/1200/800"
            alt="HardTech Background"
            fill
            className="object-cover opacity-40 transition-all duration-1000"
            priority
            data-ai-hint="tech server"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary text-primary bg-primary/5 px-4 py-1.5 rounded-none uppercase font-bold text-[10px] tracking-widest animate-pulse">
              Pioneer Batch 2026: Enrollment in Progress
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] font-headline uppercase tracking-tighter">
              Master the <br /><span className="text-primary underline decoration-primary/30 underline-offset-8">Hardware</span> Skills.
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed uppercase text-[10px] font-bold tracking-[0.25em] opacity-90 max-w-xl">
              HardTech Information Technology provides actual advanced board-level training and hardware troubleshooting education for professional technicians.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-black hover:bg-white hover:text-black h-16 px-10 rounded-none uppercase font-black text-xs tracking-widest transition-all shadow-lg shadow-primary/20" asChild>
                <Link href="/courses">View Curricula <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black h-16 px-10 rounded-none uppercase font-black text-xs tracking-widest transition-all" asChild>
                <Link href="/enroll">Enroll Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-white text-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">Our <br /><span className="text-primary bg-black px-3">Mission</span></h2>
                <p className="text-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest opacity-70">
                  To provide the highest standard of technical education through actual, hands-on board-level repair training, empowering the next generation of hardware specialists with "Maayos" (organized) and industry-ready skills.
                </p>
              </div>
              <div className="h-px bg-black/10 w-full" />
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">Our <br /><span className="text-primary bg-black px-3">Vision</span></h2>
                <p className="text-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest opacity-70">
                  To be the pioneer hardware training center in the region, recognized for excellence in micro-soldering, circuitry diagnostics, and advanced troubleshooting for modern computing devices.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-secondary/10 relative overflow-hidden group">
                  <Image src="https://picsum.photos/seed/tech1/400/500" alt="Tech" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-ai-hint="microscope repair" />
                </div>
                <div className="aspect-square bg-primary/20 flex items-center justify-center p-8">
                  <Award className="h-12 w-12 text-black" />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square bg-black flex items-center justify-center p-8">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <div className="aspect-[4/5] bg-secondary/10 relative overflow-hidden group">
                  <Image src="https://picsum.photos/seed/tech2/400/500" alt="Tech" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-ai-hint="soldering pcb" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact News & Announcements */}
      <section className="py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">TECHNICAL <span className="text-primary">ANNOUNCEMENTS</span></h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" /> LIVE SYSTEM BROADCASTS
              </p>
            </div>
            <Button variant="outline" className="rounded-none border-primary/20 text-primary uppercase font-bold text-[10px] tracking-widest h-10 px-6" asChild>
              <Link href="/announcements">Open Archives</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {announcementsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-48 bg-secondary/20 rounded-none" />)
            ) : announcements?.length ? (
              announcements.map((news) => (
                <Card key={news.id} className="bg-card/30 border-white/5 hover:border-primary/20 transition-all rounded-none group h-full flex flex-col">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[9px] font-mono text-primary uppercase font-bold">{news.priority || 'UPDATE'}</span>
                       <span className="text-[9px] text-muted-foreground font-mono">{news.timestamp?.toDate ? format(news.timestamp.toDate(), 'MMM d, yyyy') : 'Recent'}</span>
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed line-clamp-3 opacity-60">
                      {news.body}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-[10px] font-bold uppercase tracking-widest opacity-20">No transmissions detected.</div>
            )}
          </div>
        </div>
      </section>

      {/* Compact Officials List */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">OFFICIALS <span className="text-primary">LIST</span></h2>
            <div className="h-1 w-20 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {officialsLoading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-secondary/20 rounded-none" />)
            ) : officials?.length ? (
              officials.map((staff) => (
                <div key={staff.id} className="p-6 bg-secondary/10 border border-white/5 flex flex-col items-center text-center group hover:bg-primary/5 transition-all">
                  <div className="h-12 w-12 bg-primary/20 flex items-center justify-center text-lg font-black text-primary mb-4 rounded-none border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                    {staff.name?.charAt(0)}
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">{staff.name}</h4>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">{staff.position}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-[10px] font-bold uppercase tracking-widest opacity-20">Directory offline.</div>
            )}
          </div>
          
          <div className="mt-12 text-center">
             <Button variant="link" className="text-primary text-[10px] font-bold uppercase tracking-widest h-auto p-0" asChild>
               <Link href="/officials">View Full Staff Directory <ArrowRight className="ml-2 h-3 w-3" /></Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Public Forms / Resources */}
      <section className="py-24 bg-primary text-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">Forms <br /> Registry</h2>
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-70 mb-8">
                Official documentation, waivers, and service request forms for students and academy guests.
              </p>
              <Button className="bg-black text-white rounded-none h-14 px-10 uppercase font-bold text-[10px] tracking-widest" asChild>
                <Link href="/forms">Access Repository</Link>
              </Button>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {formsLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-24 bg-black/10 rounded-none" />)
              ) : forms?.length ? (
                forms.map((form) => (
                  <Link key={form.id} href="/forms" className="p-6 bg-black/5 hover:bg-black hover:text-white transition-all border border-black/10 flex flex-col justify-between h-40 group">
                    <FileText className="h-6 w-6 mb-4 group-hover:text-primary transition-colors" />
                    <div>
                      <h4 className="font-black text-[10px] uppercase leading-tight">{form.title}</h4>
                      <p className="text-[8px] font-bold opacity-60 uppercase mt-1">{form.category || 'General'}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-[10px] font-bold uppercase text-center opacity-30">Registry Empty.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
