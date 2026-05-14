
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
import { Sparkles, Save, FileText, ListChecks, Loader2, Wand2, Lock, HelpCircle, Users, Target, Wrench, CreditCard } from 'lucide-react';
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
      toast({ title: "Information Enriched", description: "Comprehensive curriculum drafted." });
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
      ncLevel: generatedContent.ncLevel,
      modules: generatedContent.modules,
      prerequisites: generatedContent.prerequisites,
      requiredTools: generatedContent.requiredTools,
      targetAudience: generatedContent.targetAudience,
      faqs: generatedContent.faqs,
      instructorIds: [], // To be linked manually later
      fees: {
        tuition: 15000,
        materials: 5000,
        total: 20000
      },
      durationHours: 40,
      status: "Active",
      imageId: "course-ai",
      createdAt: serverTimestamp()
    };

    addDoc(collection(firestore, 'courses'), courseData)
      .then(() => {
        toast({ title: "Comprehensive Program Published!", description: "Curriculum registry updated." });
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
        <h1 className="text-4xl font-bold font-headline mb-2 uppercase tracking-tighter">Information <span className="text-primary">Enrichment Hub</span></h1>
        <p className="text-muted-foreground">Architecting "Kumpleto ang impormasyon" (Complete Information) using technical AI augmentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-primary/20 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Technical Draftsman
              </CardTitle>
              <CardDescription>
                Convert minimal inputs into a deeply structured technical lesson plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Core Topic / Keywords</Label>
                <Input 
                  id="keywords" 
                  placeholder="e.g. Micro-Soldering, PCB Analysis" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-secondary/30 h-12 rounded-none"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 rounded-none uppercase font-bold text-xs tracking-widest">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Enrich Information
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {generatedContent ? (
            <Card className="bg-card h-full flex flex-col border-primary/20 shadow-2xl overflow-hidden rounded-none">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-black font-bold text-[10px] uppercase">VERIFIED COMPLETE DATA</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setGeneratedContent(null)} className="h-8 text-[10px] font-bold uppercase">Clear</Button>
                </div>
                <CardTitle className="text-3xl font-headline uppercase tracking-tight">{generatedContent.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <Tabs defaultValue="curriculum" className="w-full flex flex-col h-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 p-0">
                    <TabsTrigger value="curriculum" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><ListChecks className="h-3 w-3 mr-2" /> Lesson Plan</TabsTrigger>
                    <TabsTrigger value="reqs" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><Wrench className="h-3 w-3 mr-2" /> Logistics</TabsTrigger>
                    <TabsTrigger value="faqs" className="px-6 rounded-none h-full text-[10px] font-bold uppercase"><HelpCircle className="h-3 w-3 mr-2" /> FAQs</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8 overflow-y-auto max-h-[600px]">
                    <TabsContent value="curriculum" className="mt-0 space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Syllabus Breakdown</h4>
                      {generatedContent.modules.map((mod, i) => (
                        <div key={i} className="space-y-2 p-4 bg-secondary/10 border-l-2 border-primary">
                          <p className="font-bold text-xs uppercase text-primary">{mod.day}: {mod.topic}</p>
                          <p className="text-sm text-muted-foreground">{mod.details}</p>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="reqs" className="mt-0 space-y-8">
                       <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]">Prerequisites</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.prerequisites.map((p, i) => (
                            <Badge key={i} variant="outline" className="border-primary/20">{p}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-accent tracking-[0.2em]">Mandatory Toolset</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.requiredTools.map((t, i) => (
                            <Badge key={i} variant="outline" className="border-accent/20">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="faqs" className="mt-0 space-y-6">
                      <h4 className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.2em]">Support Data</h4>
                      {generatedContent.faqs.map((faq, i) => (
                        <div key={i} className="space-y-2 p-4 bg-secondary/10">
                          <p className="font-bold text-sm">Q: {faq.question}</p>
                          <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t p-6 bg-secondary/20 justify-between items-center">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Integrated Enrichment Active
                </span>
                <Button onClick={handlePublish} disabled={isPublishing} className="bg-primary text-black font-bold uppercase text-xs px-10 h-12 tracking-widest rounded-none shadow-lg">
                  {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Execute Publication
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-primary/10 rounded-none flex flex-col items-center justify-center text-center p-12 bg-secondary/5">
              <Sparkles className="h-16 w-16 text-muted-foreground opacity-10 mb-6" />
              <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Information Registry Empty</h3>
              <p className="text-muted-foreground max-w-sm text-sm font-medium">Use the drafting tool to generate a comprehensive technical profile that satisfies academic transparency requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
