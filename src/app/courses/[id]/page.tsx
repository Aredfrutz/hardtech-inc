
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, ArrowLeft, Clock, BarChart, BookOpen, Info, Loader2 } from 'lucide-react';

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
      <Link href="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 mb-4 px-3 py-1 border-primary/30">
              {course.instructor}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline">{course.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
              <span className="font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {course.duration}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
              <span className="font-bold flex items-center gap-2"><BarChart className="h-4 w-4 text-accent" /> {course.status}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Format</span>
              <span className="font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Online</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Certification</span>
              <span className="font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Included</span>
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/50 border-b rounded-none h-12 p-0 mb-8">
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-8">Details</TabsTrigger>
              <TabsTrigger value="requirements" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-8">Requirements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Course Overview</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-accent" />
                  <h3 className="text-2xl font-bold">Prerequisites</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Basic knowledge of the technical domain is recommended. HardTech Academy provides foundational modules for those starting out.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <div className="sticky top-24">
            <div className="rounded-2xl border bg-card overflow-hidden shadow-2xl shadow-primary/5">
              <div className="relative h-48 w-full">
                <Image src={image.imageUrl} alt={course.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-8">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold">$1,299</span>
                  <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">ENROLLING</Badge>
                </div>
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg">
                  <Link href={`/enroll?course=${id}`}>Apply to Join</Link>
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-4">
                  All applications are reviewed for technical readiness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
