
"use client"

import { useState } from 'react';
import { generateCourseContent, AdminCourseDescriptionOutput } from '@/ai/flows/admin-course-description-generator';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save, FileText, ListChecks, Loader2, Wand2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function AdminDashboard() {
  const { firestore } = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AdminCourseDescriptionOutput | null>(null);

  if (userLoading) return null;

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <Lock className="h-16 w-16 text-muted-foreground opacity-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 font-headline tracking-tight">Access Restricted</h1>
        <p className="text-muted-foreground mb-8">This portal is for authorized HardTech Staff only. Please log in with admin credentials.</p>
        <Button asChild className="w-full h-12">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!keywords) {
      toast({ title: "Missing keywords", description: "Enter some keywords first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateCourseContent({ keywords });
      setGeneratedContent(result);
      toast({ title: "Content Generated", description: "Course draft ready for review." });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!firestore || !generatedContent) return;
    setIsPublishing(true);

    const courseData = {
      title: generatedContent.courseTitle,
      description: generatedContent.description,
      instructor: "AI Faculty Agent",
      duration: "8 Weeks",
      status: "Active",
      imageId: "course-ai"
    };

    addDoc(collection(firestore, 'courses'), courseData)
      .then(() => {
        toast({ title: "Published!", description: "The course is now live in the catalog." });
        setGeneratedContent(null);
        setKeywords('');
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'courses',
          operation: 'create',
          requestResourceData: courseData
        }));
      })
      .finally(() => setIsPublishing(false));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-headline mb-2">Staff <span className="text-primary">Admin Tool</span></h1>
        <p className="text-muted-foreground">Internal utilities for managing HardTech Academy content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-primary/20 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI Course Architect
              </CardTitle>
              <CardDescription>
                Generate a full course draft from simple keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords or Phrase</Label>
                <Input 
                  id="keywords" 
                  placeholder="e.g. Quantum Computing, Qiskit" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-secondary/30"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Draft
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {generatedContent ? (
            <Card className="bg-card h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-primary border-primary/30">DRAFT GENERATED</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setGeneratedContent(null)}>Clear</Button>
                </div>
                <CardTitle className="text-3xl font-headline text-gradient">{generatedContent.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <Tabs defaultValue="description" className="w-full flex flex-col h-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12">
                    <TabsTrigger value="description" className="px-6 rounded-none h-full"><FileText className="h-4 w-4 mr-2" /> Description</TabsTrigger>
                    <TabsTrigger value="outline" className="px-6 rounded-none h-full"><ListChecks className="h-4 w-4 mr-2" /> Outline</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8 overflow-y-auto max-h-[600px]">
                    <TabsContent value="description" className="mt-0">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{generatedContent.description}</p>
                    </TabsContent>
                    <TabsContent value="outline" className="mt-0 space-y-4">
                      {generatedContent.outline.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                          <span className="h-8 w-8 rounded-full bg-background border flex items-center justify-center text-xs font-mono">{i + 1}</span>
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t p-6 bg-secondary/20 justify-between items-center">
                <span className="text-xs text-muted-foreground italic">Drafted by HardTech AI v2.5</span>
                <Button onClick={handlePublish} disabled={isPublishing} className="bg-primary text-primary-foreground px-8">
                  {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Publish to Catalog
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 bg-secondary/5">
              <Sparkles className="h-10 w-10 text-muted-foreground opacity-20 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Architect a Course</h3>
              <p className="text-muted-foreground max-w-sm">Enter technical keywords to start generating curricula.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
