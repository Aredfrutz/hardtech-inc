
"use client"

import { useState } from 'react';
import { generateCourseContent, AdminCourseDescriptionOutput } from '@/ai/flows/admin-course-description-generator';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save, FileText, ListChecks, Loader2, Wand2, Lock, HelpCircle, Users, Target } from 'lucide-react';
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
      toast({ title: "Content Enriched", description: "Comprehensive course data drafted." });
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
      summary: generatedContent.summary,
      description: generatedContent.description,
      instructor: "AI Faculty Agent",
      duration: "12 Weeks",
      status: "Active",
      imageId: "course-ai",
      outline: generatedContent.outline,
      learningOutcomes: generatedContent.learningOutcomes,
      targetAudience: generatedContent.targetAudience,
      faqs: generatedContent.faqs,
      createdAt: serverTimestamp()
    };

    addDoc(collection(firestore, 'courses'), courseData)
      .then(() => {
        toast({ title: "Published!", description: "Comprehensive course profile is now live." });
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
        <h1 className="text-4xl font-bold font-headline mb-2 uppercase tracking-tighter">Content <span className="text-primary">Enrichment Portal</span></h1>
        <p className="text-muted-foreground">AI-powered system for ensuring "Kumpleto ang impormasyon" (Complete Information).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-primary/20 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Curriculum Architect
              </CardTitle>
              <CardDescription>
                Convert minimal keywords into a comprehensive technical profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Core Topic / Keywords</Label>
                <Input 
                  id="keywords" 
                  placeholder="e.g. PCB Fabrication, Micro-Soldering" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-secondary/30 h-12"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-12">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Comprehensive Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {generatedContent ? (
            <Card className="bg-card h-full flex flex-col border-primary/20 shadow-2xl overflow-hidden">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-black font-bold text-[10px] uppercase">ENRICHED DATA PREVIEW</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setGeneratedContent(null)} className="h-8 text-[10px] font-bold uppercase">Clear</Button>
                </div>
                <CardTitle className="text-3xl font-headline uppercase tracking-tight">{generatedContent.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 p-0">
                    <TabsTrigger value="overview" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><FileText className="h-3 w-3 mr-2" /> Overview</TabsTrigger>
                    <TabsTrigger value="curriculum" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><ListChecks className="h-3 w-3 mr-2" /> Syllabus</TabsTrigger>
                    <TabsTrigger value="faqs" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><HelpCircle className="h-3 w-3 mr-2" /> FAQs</TabsTrigger>
                    <TabsTrigger value="audience" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><Target className="h-3 w-3 mr-2" /> Audience</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8 overflow-y-auto max-h-[600px]">
                    <TabsContent value="overview" className="mt-0 space-y-8">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Professional Summary</h4>
                        <p className="text-lg leading-relaxed font-medium italic opacity-90">"{generatedContent.summary}"</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Learning Outcomes</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {generatedContent.learningOutcomes.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm items-start p-3 bg-secondary/20 rounded-lg">
                              <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="curriculum" className="mt-0 space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Module Breakdown</h4>
                      {generatedContent.outline.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <span className="h-10 w-10 rounded-none bg-background border-2 border-primary/20 flex items-center justify-center text-xs font-mono text-primary">{i + 1}</span>
                          <span className="font-bold uppercase text-xs tracking-wider">{item}</span>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="faqs" className="mt-0 space-y-6">
                      <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Frequently Asked Questions</h4>
                      {generatedContent.faqs.map((faq, i) => (
                        <div key={i} className="space-y-2 p-4 bg-secondary/10 border-l-2 border-primary">
                          <p className="font-bold text-sm">Q: {faq.question}</p>
                          <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="audience" className="mt-0 space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Ideal For</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.targetAudience.map((tag, i) => (
                          <Badge key={i} variant="outline" className="h-10 px-4 text-xs uppercase tracking-widest border-primary/20 bg-primary/5">{tag}</Badge>
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t p-6 bg-secondary/20 justify-between items-center">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Verified by Academy AI
                </span>
                <Button onClick={handlePublish} disabled={isPublishing} className="bg-primary text-black font-bold uppercase text-xs px-10 h-12 tracking-widest rounded-none shadow-lg shadow-primary/20">
                  {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Finalize & Publish
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-primary/10 rounded-none flex flex-col items-center justify-center text-center p-12 bg-secondary/5">
              <Sparkles className="h-16 w-16 text-muted-foreground opacity-10 mb-6" />
              <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Information Registry Empty</h3>
              <p className="text-muted-foreground max-w-sm text-sm font-medium">Use the architect tool to generate comprehensive course data that satisfies technical transparency requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
