
"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Clock, 
  User, 
  Search, 
  Loader2, 
  Info, 
  Plus, 
  ShieldCheck, 
  CheckCircle, 
  CircleDashed, 
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function CourseCatalog() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Courses
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'));
  }, [firestore]);
  
  const { data: courses, loading: coursesLoading } = useCollection(coursesQuery);

  // Fetch Officials for Instructor Lookup
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'));
  }, [firestore]);

  const { data: officials } = useCollection(officialsQuery);

  const instructorMap = useMemo(() => {
    const map: Record<string, string> = {};
    officials?.forEach(off => {
      map[off.id] = off.name;
    });
    return map;
  }, [officials]);

  const isAdmin = user?.role === 'admin';

  const filteredCourses = courses?.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getImageUrl = (imageId: string) => {
    if (!imageId) return PlaceHolderImages[0].imageUrl;
    if (imageId.startsWith('http')) return imageId;
    const found = PlaceHolderImages.find(img => img.id === imageId);
    return found ? found.imageUrl : PlaceHolderImages[0].imageUrl;
  };

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const formData = new FormData(e.currentTarget);
    const newCourse = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructorIds: [],
      durationHours: parseInt(formData.get('durationHours') as string) || 0,
      status: 'Active',
      imageId: 'course-coding',
      fees: { tuition: 0, materials: 0, total: 0 },
      modules: []
    };

    setIsAdding(true);
    addDoc(collection(firestore, 'courses'), newCourse)
      .then(() => {
        toast({ title: "Program Drafted", description: "Technical curriculum added to registry." });
        (e.target as HTMLFormElement).reset();
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'courses',
          operation: 'create',
          requestResourceData: newCourse
        }));
      })
      .finally(() => setIsAdding(false));
  };

  return (
    <div className="container mx-auto px-4 py-20 font-sans max-w-7xl">
      <div className="text-center mb-24 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-7xl font-black mb-6 font-headline tracking-tighter uppercase leading-[0.9]">
          Master <span className="text-primary underline decoration-primary/30 underline-offset-8">Hardware</span>
        </h1>
        <div className="flex justify-center gap-4">
           <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 rounded-none uppercase font-bold text-[10px] tracking-widest bg-primary/5">
             Professional Repair Curricula
           </Badge>
           <Badge variant="outline" className="border-white/10 text-muted-foreground px-4 py-1 rounded-none uppercase font-bold text-[10px] tracking-widest">
             Pioneer Batch 2024
           </Badge>
        </div>
      </div>

      {isAdmin && (
        <Card className="mb-20 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden rounded-none shadow-2xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" /> Technical Entry Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Program Title</Label>
                <Input id="title" name="title" placeholder="Advanced Microsoldering" required className="bg-background/50 h-12 rounded-none border-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationHours" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Duration (Hours)</Label>
                <Input id="durationHours" name="durationHours" type="number" placeholder="40" required className="bg-background/50 h-12 rounded-none border-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold opacity-70">Brief Overview</Label>
                <Input id="description" name="description" placeholder="Technical focus..." required className="bg-background/50 h-12 rounded-none border-primary/20" />
              </div>
              <div className="md:col-span-3 flex justify-end pt-4">
                <Button type="submit" disabled={isAdding} className="h-12 px-12 font-bold shadow-lg shadow-primary/20 rounded-none uppercase text-xs tracking-widest">
                  {isAdding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Register New Program
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative w-full max-w-2xl mx-auto mb-20">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Filter technical programs by keywords..." 
          className="pl-16 bg-secondary/20 border-white/5 h-16 rounded-none text-sm uppercase font-black tracking-widest focus:ring-primary/50 transition-all placeholder:opacity-30" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {coursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-6">
              <Skeleton className="h-56 w-full rounded-none bg-secondary/20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 rounded-none bg-secondary/20" />
                <Skeleton className="h-4 w-full rounded-none bg-secondary/20" />
                <Skeleton className="h-4 w-full rounded-none bg-secondary/20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map((course: any) => {
            const courseImageUrl = getImageUrl(course.imageId);
            const instructorName = course.instructorIds?.[0] && instructorMap[course.instructorIds[0]] 
              ? instructorMap[course.instructorIds[0]] 
              : 'STAFF FACULTY';
            
            return (
              <Card key={course.id} className="group relative flex flex-col bg-card/40 border-white/5 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:border-primary/40 rounded-none h-full shadow-2xl">
                <div className="relative h-64 w-full overflow-hidden">
                  <Image 
                    src={courseImageUrl} 
                    alt={course.title} 
                    fill 
                    loading="lazy"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary text-black font-black text-[8px] uppercase px-3 py-1 rounded-none flex items-center gap-1 shadow-lg">
                      <Target className="h-3 w-3" /> {course.ncLevel || 'VERIFIED'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-8 pb-3">
                  <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors line-clamp-2 leading-tight uppercase tracking-tighter">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 pt-0 flex-grow space-y-6">
                  <p className="text-muted-foreground text-[10px] leading-relaxed line-clamp-3 font-bold uppercase tracking-widest opacity-60">
                    {course.summary || course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/80">
                      <User className="h-3 w-3" /> {instructorName}
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/80">
                      <Clock className="h-3 w-3" /> {course.durationHours} HRS
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-8 pt-0">
                  <Button asChild variant="outline" className="w-full h-14 font-black rounded-none uppercase text-[10px] tracking-[0.3em] group-hover:bg-primary group-hover:text-black border-primary/20 transition-all duration-500">
                    <Link href={`/courses/${course.id}`}>Execute Entry <Zap className="ml-2 h-3 w-3" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-none bg-secondary/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">No Active Curricula</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-[10px] uppercase font-bold tracking-widest opacity-40">Registry update in progress. Synchronizing with cloud assets...</p>
        </div>
      )}
    </div>
  );
}
