import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Zap, Users, Code, Target, Compass } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const eventImage = PlaceHolderImages.find(img => img.id === 'event-1');
  const newsImage = PlaceHolderImages.find(img => img.id === 'news-1');

  const newsItems = [
    {
      title: "HardTech Academy Expands AI Lab",
      date: "Oct 12, 2023",
      category: "News",
      description: "We are excited to announce a 5,000 sq ft expansion to our specialized robotics and AI lab facilities."
    },
    {
      title: "New Partnership with Global Tech",
      date: "Oct 05, 2023",
      category: "Announcement",
      description: "Students will now have direct access to internships and mentorship programs through our new industry partners."
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
      title: "Advanace Board-Level Specialist Training",
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
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-50 transition-all duration-1000"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 rounded-none uppercase font-bold text-[10px] tracking-widest">
              Enrollment Now Open for Winter 2024
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
                <Link href="/enroll">Quick Enroll</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-secondary/10 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Our <span className="text-primary underline underline-offset-8 decoration-2">Mission</span></h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground font-medium border-l-2 border-primary/30 pl-8 italic">
                To provide comprehensive, hands-on, and direct-to-the-point training that equips students with advanced diagnostics, microsoldering, and troubleshooting skills, transforming beginners into professional technicians.
              </p>
            </div>
            
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Compass className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Our <span className="text-accent underline underline-offset-8 decoration-2">Vision</span></h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground font-medium border-l-2 border-accent/30 pl-8 italic">
                To empower the next generation of expert cellphone technicians, setting the standard for professional board-level repair and innovation in the mobile industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-none border border-white/5 bg-card/30 card-hover relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-20 w-20 text-primary" />
              </div>
              <Zap className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Accelerated Learning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed uppercase font-bold text-[10px] tracking-widest opacity-60">Intensive programs designed to take you from zero to expert in months, not years.</p>
            </div>
            <div className="p-8 rounded-none border border-white/5 bg-card/30 card-hover relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code className="h-20 w-20 text-accent" />
              </div>
              <Code className="h-10 w-10 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Expert-Led Curriculum</h3>
              <p className="text-muted-foreground text-sm leading-relaxed uppercase font-bold text-[10px] tracking-widest opacity-60">Learn from active industry professionals who build the technology you use daily.</p>
            </div>
            <div className="p-8 rounded-none border border-white/5 bg-card/30 card-hover relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="h-20 w-20 text-primary" />
              </div>
              <Users className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Elite Community</h3>
              <p className="text-muted-foreground text-sm leading-relaxed uppercase font-bold text-[10px] tracking-widest opacity-60">Join a network of top-tier talent and collaborative hackerspaces.</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* News Section */}
            <div className="lg:col-span-2 space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Latest <span className="text-primary">News</span></h2>
                <Button variant="link" className="text-accent uppercase text-[10px] font-bold tracking-widest">View all news</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {newsItems.map((item, i) => (
                  <Card key={i} className="bg-card/40 border-white/5 overflow-hidden group rounded-none">
                    {newsImage && (
                      <div className="relative h-56 w-full grayscale group-hover:grayscale-0 transition-all duration-700">
                        <Image 
                          src={newsImage.imageUrl} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          data-ai-hint={newsImage.imageHint}
                        />
                      </div>
                    )}
                    <CardHeader className="p-8">
                      <div className="flex gap-4 mb-4">
                        <Badge className="text-[9px] uppercase font-bold bg-primary/10 text-primary border-none rounded-none">{item.category}</Badge>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.date}</span>
                      </div>
                      <CardTitle className="text-xl font-headline uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                      <p className="text-muted-foreground text-[11px] leading-relaxed uppercase font-bold tracking-tight opacity-70 line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Events Sidebar */}
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
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex flex-col gap-1">
                        <span>{event.date}</span>
                        <span>{event.location}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-[8px] border-accent/30 text-accent rounded-none font-black uppercase tracking-tighter">{event.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative h-72 w-full rounded-none overflow-hidden group border border-white/10">
                {eventImage && (
                  <Image src={eventImage.imageUrl} alt="Event Background" fill className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" data-ai-hint={eventImage.imageHint} />
                )}
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-background via-background/40 to-transparent">
                  <p className="font-black text-white uppercase tracking-tighter text-xl mb-4 leading-none">Don't miss our Open Day</p>
                  <Button size="sm" className="bg-primary text-black font-bold uppercase text-[10px] tracking-widest w-fit h-10 px-6 rounded-none hover:bg-white transition-all">Register Now</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
