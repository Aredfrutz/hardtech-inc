
"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, doc } from 'firebase/firestore';
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
import { cn } from '@/lib/utils';

export default function CourseCatalog() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch courses
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'));
  }, [firestore]);
  const { data: courses, loading: coursesLoading } = useCollection(coursesQuery);

  // Fetch user profile for role-based access
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userProfile } = useDoc(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';

  // Filter courses by title only
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
      instructor: formData.get('instructor') as string,
      duration: formData.get('duration') as string,
      status: 'Active',
      imageId: 'course-coding'
    };

    setIsAdding(true);
    addDoc(collection(firestore, 'courses'), newCourse)
      .then(() => {
        toast({ title: "Course added successfully" });
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
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        );
      case 'Draft':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
            <CircleDashed className="h-3 w-3" /> Draft
          </Badge>
        );
      case 'Archived':
        return (
          <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 font-sans">
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-headline tracking-tight">
          Official <span className="text-primary">Training Catalog</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Explore our high-performance curriculum designed for the next generation of technical leaders.
        </p>
      </div>

      {/* Admin Quick Add Section */}
      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <ShieldCheck className="h-6 w-6 text-primary" /> Administrative Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase tracking-wider font-bold opacity-70">Course Title</Label>
                <Input id="title" name="title" placeholder="Advanced Systems" required className="bg-background/50 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-xs uppercase tracking-wider font-bold opacity-70">Instructor</Label>
                <Input id="instructor" name="instructor" placeholder="Lead Engineer" required className="bg-background/50 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs uppercase tracking-wider font-bold opacity-70">Duration</Label>
                <Input id="duration" name="duration" placeholder="12 Weeks" required className="bg-background/50 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wider font-bold opacity-70">Description</Label>
                <Input id="description" name="description" placeholder="Brief syllabus..." required className="bg-background/50 h-12" />
              </div>
              <div className="md:col-span-4 flex justify-end pt-4">
                <Button type="submit" disabled={isAdding} className="h-12 px-8 font-bold shadow-lg shadow-primary/20">
                  {isAdding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Register New Program
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-xl mx-auto mb-20 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by technical domain or title..." 
          className="pl-12 bg-secondary/20 border-white/5 h-14 rounded-2xl text-lg focus:ring-primary/50 transition-all shadow-inner" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {coursesLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Synchronizing with course registry...</p>
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map((course: any) => {
            const image = PlaceHolderImages.find(img => img.id === course.imageId) || PlaceHolderImages[0];
            return (
              <Card key={course.id} className="group relative flex flex-col bg-card/40 border-white/5 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={image.imageUrl} 
                    alt={course.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(course.status)}
                  </div>
                </div>
                
                <CardHeader className="p-8 pb-3">
                  <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 pt-0 flex-grow space-y-6">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Instructor</span>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Duration</span>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-8 pt-0">
                  <Button asChild variant="secondary" className="w-full h-12 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href={`/courses/${course.id}`}>Explore Syllabus</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed rounded-[2rem] bg-secondary/5 border-white/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold mb-2">No matching curricula</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Our catalog is constantly expanding. Try a different search term or check back soon.</p>
        </div>
      )}
    </div>
  );
}
