
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Clock, User, Search, Loader2, Info, Plus, ShieldCheck, CheckCircle, CircleDashed, Archive } from 'lucide-react';
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

  // Create a lookup map for instructors
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

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const formData = new FormData(e.currentTarget);
    const newCourse = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructorIds: [], // Defaults to empty for quick add
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 uppercase text-[9px] font-bold">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        );
      case 'Draft':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1 uppercase text-[9px] font-bold">
            <CircleDashed className="h-3 w-3" /> Draft
          </Badge>
        );
      default:
        return <Badge variant="outline" className="uppercase text-[9px] font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 font-sans">
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-headline tracking-tight uppercase">
          Official <span className="text-primary underline decoration-primary/30 underline-offset-8">Registry</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed uppercase text-xs font-bold tracking-widest opacity-60">
          High-performance mobile repair and technical hardware curricula.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden shadow-2xl rounded-none">
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

      <div className="relative w-full max-w-xl mx-auto mb-20 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search curriculum registry..." 
          className="pl-12 bg-secondary/20 border-white/5 h-14 rounded-none text-sm uppercase font-bold focus:ring-primary/50 transition-all" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {coursesLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold uppercase text-[10px] tracking-widest">Synchronizing Registry...</p>
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map((course: any) => {
            const image = PlaceHolderImages.find(img => img.id === course.imageId) || PlaceHolderImages[0];
            const instructorName = course.instructorIds?.[0] && instructorMap[course.instructorIds[0]] 
              ? instructorMap[course.instructorIds[0]] 
              : 'STAFF FACULTY';
            
            return (
              <Card key={course.id} className="group relative flex flex-col bg-card/40 border-white/5 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:border-primary/30 rounded-none">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={image.imageUrl} 
                    alt={course.title} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(course.status)}
                  </div>
                </div>
                
                <CardHeader className="p-8 pb-3">
                  <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 pt-0 flex-grow space-y-6">
                  <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-3 font-medium uppercase tracking-tight opacity-70">
                    {course.summary || course.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-widest font-black text-primary/50">Instructor</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <User className="h-3 w-3 text-primary" />
                        <span className="truncate">{instructorName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-widest font-black text-primary/50">Duration</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>{course.durationHours || '--'} Hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-8 pt-0">
                  <Button asChild variant="secondary" className="w-full h-12 font-bold rounded-none uppercase text-[10px] tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all">
                    <Link href={`/courses/${course.id}`}>Open Syllabus</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 border border-white/5 rounded-none bg-secondary/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">No Active Curricula</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-[10px] uppercase font-bold tracking-widest opacity-40">Registry update in progress. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
