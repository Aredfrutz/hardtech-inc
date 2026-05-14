
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, ArrowLeft, Clock, BarChart, BookOpen, Info, Loader2, Target, ListChecks, HelpCircle, FileText } from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { firestore } = useFirestore();

  const courseRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'courses', id as string);
  }, [firestore, id]);

  const { data: course, loading } = useDoc(courseRef);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Course not found</h2>
        <Button asChild variant="outline">
          <Link href="/courses">Return to Catalog</Link>
        </Button>
      </div>
    );
  }

  const image = PlaceHolderImages.find(img => img.id === course.imageId) || PlaceHolderImages[0];

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-bold text-[10px] uppercase">
                {course.instructor}
              </Badge>
              {course.targetAudience?.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] uppercase tracking-widest opacity-60">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 font-headline leading-tight uppercase tracking-tighter">{course.title}</h1>
            <p className="text-2xl text-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-8 py-2">
              {course.summary || course.description?.split('.').slice(0, 2).join('.') + '.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            <div className="flex flex-col gap-1 border-t-2 border-primary pt-4">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Duration</span>
              <span className="font-bold flex items-center gap-2 text-sm"><Clock className="h-3 w-3 text-primary" /> {course.duration}</span>
            </div>
            <div className="flex flex-col gap-1 border-t-2 border-accent pt-4">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Enrollment</span>
              <span className="font-bold flex items-center gap-2 text-sm"><BarChart className="h-3 w-3 text-accent" /> {course.status}</span>
            </div>
            <div className="flex flex-col gap-1 border-t-2 border-primary pt-4">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Method</span>
              <span className="font-bold flex items-center gap-2 text-sm"><BookOpen className="h-3 w-3 text-primary" /> Hybrid/Lab</span>
            </div>
            <div className="flex flex-col gap-1 border-t-2 border-accent pt-4">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Verification</span>
              <span className="font-bold flex items-center gap-2 text-sm"><CheckCircle2 className="h-3 w-3 text-accent" /> Digital Cert</span>
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/20 border-b border-white/5 rounded-none h-14 p-0 mb-12">
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest">
                <ListChecks className="h-3 w-3 mr-2" /> Syllabus
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest">
                <FileText className="h-3 w-3 mr-2" /> Outcomes
              </TabsTrigger>
              <TabsTrigger value="faqs" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest">
                <HelpCircle className="h-3 w-3 mr-2" /> Support
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-8">Technical Module Breakdown</h3>
              <div className="space-y-4">
                {course.outline?.map((item: string, i: number) => (
                  <div key={i} className="flex gap-4 items-center p-6 bg-card border border-white/5 group hover:border-primary/50 transition-colors">
                    <span className="h-10 w-10 shrink-0 border-2 border-primary/20 flex items-center justify-center text-xs font-mono text-primary group-hover:bg-primary group-hover:text-black transition-colors">{i + 1}</span>
                    <span className="font-bold uppercase text-sm tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-tight">Full Course Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-tight">Key Learning Objectives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learningOutcomes?.map((outcome: string, i: number) => (
                    <div key={i} className="flex gap-3 p-4 bg-secondary/20 rounded-lg border border-white/5">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-medium">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-xl font-bold uppercase tracking-tight">Course Logistics & FAQs</h3>
              <Accordion type="single" collapsible className="w-full">
                {course.faqs?.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                    <AccordionTrigger className="text-left font-bold uppercase text-xs py-6 hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <div className="sticky top-24">
            <div className="rounded-none border-2 border-primary/20 bg-card overflow-hidden shadow-2xl shadow-primary/5">
              <div className="relative h-64 w-full group overflow-hidden">
                <Image 
                  src={image.imageUrl} 
                  alt={course.title} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Investment</span>
                    <span className="text-4xl font-black">₱ 14,999</span>
                  </div>
                  <Badge className="bg-primary text-black font-black text-[10px] uppercase px-3">Enrolling</Badge>
                </div>

                <div className="space-y-4">
                  <Button asChild size="lg" className="w-full bg-primary text-black font-black uppercase text-xs h-16 tracking-[0.2em] hover:bg-white hover:text-black rounded-none transition-all shadow-lg shadow-primary/20">
                    <Link href={`/enroll?course=${id}`}>Execute Application</Link>
                  </Button>
                  <p className="text-center text-[9px] uppercase font-black text-muted-foreground tracking-tighter opacity-50 flex items-center justify-center gap-2">
                    <Info className="h-3 w-3" /> Technical Readiness Assessment Required
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Prerequisites</h4>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                      <Target className="h-3 w-3 text-primary" /> Basic Electronics Logic
                    </li>
                    <li className="flex gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                      <Target className="h-3 w-3 text-primary" /> Core Hardware Familiarity
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
