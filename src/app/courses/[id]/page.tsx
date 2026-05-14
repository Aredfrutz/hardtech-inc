
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  Loader2, 
  ListChecks, 
  HelpCircle, 
  Wrench, 
  Users, 
  CreditCard,
  Info
} from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { firestore } = useFirestore();

  const courseRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'courses', id as string);
  }, [firestore, id]);

  const { data: course, loading } = useDoc(courseRef);

  // Fetch instructors if available
  const instructorsQuery = useMemoFirebase(() => {
    if (!firestore || !course?.instructorIds?.length) return null;
    return collection(firestore, 'officials');
  }, [firestore, course?.instructorIds]);

  const { data: instructors } = useCollection(instructorsQuery);
  const filteredInstructors = instructors?.filter(i => course?.instructorIds?.includes(i.id));

  const getImageUrl = (imageId: string) => {
    if (imageId?.startsWith('http')) return imageId;
    const found = PlaceHolderImages.find(img => img.id === imageId);
    return found ? found.imageUrl : PlaceHolderImages[0].imageUrl;
  };

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

  const courseImageUrl = getImageUrl(course.imageId);

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
                {course.ncLevel || 'Technical Program'}
              </Badge>
              {course.targetAudience?.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] uppercase tracking-widest opacity-60">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 font-headline leading-tight uppercase tracking-tighter">{course.title}</h1>
            <p className="text-2xl text-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-8 py-2">
              {course.summary}
            </p>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/20 border-b border-white/5 rounded-none h-14 p-0 mb-12 overflow-x-auto">
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <ListChecks className="h-3 w-3 mr-2" /> Lesson Plan
              </TabsTrigger>
              <TabsTrigger value="instructors" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <Users className="h-3 w-3 mr-2" /> Faculty
              </TabsTrigger>
              <TabsTrigger value="requirements" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <Wrench className="h-3 w-3 mr-2" /> Logistics
              </TabsTrigger>
              <TabsTrigger value="faqs" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-full px-8 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <HelpCircle className="h-3 w-3 mr-2" /> Support
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-8">Detailed Day-by-Day Syllabus</h3>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {course.modules?.map((module: any, i: number) => (
                  <AccordionItem key={i} value={`module-${i}`} className="border-white/5 bg-card/50 px-6">
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex gap-4 items-center text-left">
                        <span className="h-8 w-8 rounded-none border border-primary/20 flex items-center justify-center text-[10px] font-mono text-primary">
                          {module.day}
                        </span>
                        <span className="font-bold uppercase text-xs tracking-wider">{module.topic}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6 pl-12">
                      {module.details}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="instructors" className="space-y-8">
              <h3 className="text-xl font-bold uppercase tracking-tight">Assigned Faculty Experts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInstructors?.length ? filteredInstructors.map((instructor: any) => (
                  <div key={instructor.id} className="flex items-center gap-6 p-6 bg-card border border-white/5">
                    <Avatar className="h-20 w-20 rounded-none border-2 border-primary/20">
                      <AvatarFallback className="bg-secondary text-primary font-bold text-xl uppercase rounded-none">
                        {instructor.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-sm tracking-tight">{instructor.name}</h4>
                      <p className="text-[10px] uppercase font-bold text-primary">{instructor.position}</p>
                      <div className="flex flex-wrap gap-1">
                        {instructor.certifications?.map((cert: string, j: number) => (
                          <Badge key={j} className="text-[8px] bg-primary/10 text-primary border-none">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full flex items-center gap-4 p-8 bg-secondary/10 border border-dashed border-white/10">
                    <Users className="h-10 w-10 text-primary opacity-50" />
                    <div>
                      <p className="font-bold uppercase text-sm">Staff Faculty</p>
                      <p className="text-[10px] text-muted-foreground uppercase">General Technical Support Team</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Prerequisites</h4>
                  <ul className="space-y-4">
                    {course.prerequisites?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm font-medium items-center p-3 bg-secondary/20 rounded">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Required Equipment</h4>
                  <ul className="space-y-4">
                    {course.requiredTools?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm font-medium items-center p-3 bg-accent/5 rounded">
                        <Wrench className="h-4 w-4 text-accent shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Comprehensive Fee Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 bg-secondary/10 border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-2">Tuition Fee</span>
                    <span className="text-xl font-bold">₱ {course.fees?.tuition?.toLocaleString()}</span>
                  </div>
                  <div className="p-6 bg-secondary/10 border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-2">Materials & Labs</span>
                    <span className="text-xl font-bold">₱ {course.fees?.materials?.toLocaleString()}</span>
                  </div>
                  <div className="p-6 bg-primary/10 border border-primary/20">
                    <span className="text-[9px] uppercase font-bold text-primary block mb-2">Total Investment</span>
                    <span className="text-xl font-bold">₱ {course.fees?.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-8">
              <h3 className="text-xl font-bold uppercase tracking-tight">Course Logistics & Support</h3>
              <Accordion type="single" collapsible className="w-full">
                {course.faqs?.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-white/5">
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
                  src={courseImageUrl} 
                  alt={course.title} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Program Status</span>
                    <span className="text-4xl font-black">{course.status}</span>
                  </div>
                  <Badge className="bg-primary text-black font-black text-[10px] uppercase px-3">Enrolling</Badge>
                </div>

                <div className="space-y-4">
                  <Button asChild size="lg" className="w-full bg-primary text-black font-black uppercase text-xs h-16 tracking-[0.2em] hover:bg-white hover:text-black rounded-none transition-all shadow-lg shadow-primary/20">
                    <Link href={`/enroll?course=${id}`}>Execute Enrollment</Link>
                  </Button>
                  <p className="text-center text-[9px] uppercase font-black text-muted-foreground tracking-tighter opacity-50 flex items-center justify-center gap-2">
                    <Info className="h-3 w-3" /> Technical Readiness Assessment Required
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Core Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground">Contact Hours</span>
                      <span>{course.durationHours || 40} Hrs</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground">Certification Type</span>
                      <span>Digital Certificate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
