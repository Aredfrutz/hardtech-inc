
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
import { Clock, User, Search, Loader2, Info, Plus, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Official <span className="text-primary">Training List</span></h1>
        <p className="text-muted-foreground">Master elite technical skills through our industry-accredited curriculum.</p>
      </div>

      {/* Admin Quick Add Section */}
      {isAdmin && (
        <Card className="mb-12 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> Admin Control: Add New Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" name="title" placeholder="e.g. Advanced Rust" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input id="instructor" name="instructor" placeholder="Dr. Smith" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="6 Weeks" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input id="description" name="description" placeholder="Brief overview..." required className="bg-background" />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Register Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-12">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by title..." 
          className="pl-10 bg-secondary/30 h-12 rounded-full" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {coursesLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCourses.map((course: any) => {
            const image = PlaceHolderImages.find(img => img.id === course.imageId) || PlaceHolderImages[0];
            return (
              <Card key={course.id} className="flex flex-col bg-card/60 border-white/5 overflow-hidden backdrop-blur-sm group hover:border-primary/20 transition-all">
                <div className="relative h-48 w-full">
                  <Image 
                    src={image.imageUrl} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors line-clamp-1">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3 h-15">
                    {course.description}
                  </p>
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                    <Link href={`/courses/${course.id}`}>View Syllabus</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No matches found</h3>
          <p className="text-muted-foreground">Try searching for a different course title.</p>
        </div>
      )}
    </div>
  );
}
