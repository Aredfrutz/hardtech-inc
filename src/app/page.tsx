import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Zap, Users, Code } from 'lucide-react';
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
      title: "Robotics Hackathon 2024",
      date: "Nov 15, 2024",
      location: "Main Campus, Lab A",
      type: "Competition"
    },
    {
      title: "Web3 & Blockchain Seminar",
      date: "Dec 01, 2024",
      location: "Online / Virtual",
      type: "Workshop"
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
              className="object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1">
              Enrollment Now Open for Winter 2024
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-headline">
              Master the <span className="text-gradient">Hard Skills</span> of the Future.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              HardTech Academy provides elite technical training for developers, engineers, and tech enthusiasts ready to build what's next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8" asChild>
                <Link href="/courses">Explore Programs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground h-12 px-8" asChild>
                <Link href="/enroll">Quick Enroll</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card/50 card-hover">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Accelerated Learning</h3>
              <p className="text-muted-foreground">Intensive programs designed to take you from zero to expert in months, not years.</p>
            </div>
            <div className="p-6 rounded-xl border bg-card/50 card-hover">
              <Code className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert-Led Curriculum</h3>
              <p className="text-muted-foreground">Learn from active industry professionals who build the technology you use daily.</p>
            </div>
            <div className="p-6 rounded-xl border bg-card/50 card-hover">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Elite Community</h3>
              <p className="text-muted-foreground">Join a network of top-tier talent and collaborative hackerspaces.</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* News Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold font-headline">Latest <span className="text-primary">News</span></h2>
                <Button variant="link" className="text-accent">View all news</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.map((item, i) => (
                  <Card key={i} className="bg-card border-none overflow-hidden group">
                    {newsImage && (
                      <div className="relative h-48 w-full">
                        <Image 
                          src={newsImage.imageUrl} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <CardHeader className="p-6">
                      <div className="flex gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">{item.category}</Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Events Sidebar */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold font-headline">Upcoming <span className="text-accent">Events</span></h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50 group hover:border-accent transition-all">
                    <div className="bg-accent/10 p-3 rounded-lg h-fit group-hover:bg-accent/20 transition-colors">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{event.title}</h4>
                      <div className="text-xs text-muted-foreground flex flex-col gap-1">
                        <span>{event.date}</span>
                        <span>{event.location}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-[10px] border-accent/30 text-accent">{event.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative h-64 w-full rounded-xl overflow-hidden">
                {eventImage && (
                  <Image src={eventImage.imageUrl} alt="Event Background" fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-background to-transparent">
                  <p className="font-bold text-white mb-2">Don't miss our Open Day</p>
                  <Button size="sm" className="bg-primary text-primary-foreground w-fit">Register Now</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}