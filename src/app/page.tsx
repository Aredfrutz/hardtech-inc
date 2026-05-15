import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Zap, Users, Code } from 'lucide-react';

export default function Home() {
  const newsItems = [
    {
      title: "New State-of-the-Art Micro-Soldering Lab Opens",
      date: "Oct 12, 2025",
      category: "News",
      description: "We are excited to announce the expansion of our training center, featuring new high-end microscopes and specialized soldering stations.",
      image: "/missionandvisionbg.jpg" // Using this as a news placeholder
    },
    {
      title: "Partnership with Major Repair Networks",
      date: "Oct 05, 2025",
      category: "Announcement",
      description: "Graduates will now have direct access to job placement programs and advanced certification tracks through our new industry partners.",
      image: "/missionnvision.jpg" // Using this as a news placeholder
    }
  ];

  const upcomingEvents = [
    {
      title: "HARDTECH Motherboard Repair Master Class",
      date: "May 20, 2026",
      location: "Butuan City",
      type: "Open For Reservation"
    },
    {
      title: "Advanced Board-Level Specialist Training",
      date: "May 25, 2026",
      location: "Zamboanga City",
      type: "Limited Slot Only"
    }
  ];

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
              Enrollment Now Open: Master Class May 20, 2026
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
              <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-1.5 bg-white min-h-[120px] rounded-full shrink-0"></div>
                <div className="pt-1">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Mission</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    To provide comprehensive, hands-on training that equips students with advanced diagnostics and microsoldering skills.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="w-1.5 bg-white min-h-[120px] rounded-full shrink-0"></div>
                <div className="pt-1">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Vision</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    To empower the next generation of expert cellphone technicians in the mobile industry.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] w-full border border-white/10 group overflow-hidden bg-card/20">
              <Image 
                src="/missionnvision.jpg" 
                alt="Mission and Vision" 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* News & Events Section */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Latest <span className="text-primary">News</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {newsItems.map((item, i) => (
                  <Card key={i} className="bg-card/40 border-white/5 overflow-hidden group rounded-none">
                    <div className="relative h-56 w-full grayscale group-hover:grayscale-0 transition-all duration-700">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader className="p-8">
                      <div className="flex gap-4 mb-4">
                        <Badge className="text-[9px] uppercase font-bold bg-primary/10 text-primary border-none rounded-none">{item.category}</Badge>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.date}</span>
                      </div>
                      <CardTitle className="text-xl font-headline uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Upcoming <span className="text-accent">Events</span></h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-none bg-secondary/20 border border-white/5 group hover:border-accent/50 transition-all">
                    <div className="bg-accent/10 p-4 rounded-none h-fit group-hover:bg-accent/20 transition-colors border border-accent/20">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-xs tracking-tight group-hover:text-accent transition-colors">{event.title}</h4>
                      <Badge variant="outline" className="mt-2 text-[8px] border-accent/30 text-accent rounded-none font-black uppercase tracking-tighter">{event.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative h-72 w-full rounded-none overflow-hidden group border border-white/10">
                <Image 
                  src="/events.PNG" 
                  alt="Event Background" 
                  fill 
                  className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}