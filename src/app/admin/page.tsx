"use client"

import { useState } from 'react';
import { generateCourseContent, AdminCourseDescriptionOutput } from '@/ai/flows/admin-course-description-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Save, FileText, ListChecks, GraduationCap, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AdminCourseDescriptionOutput | null>(null);

  const handleGenerate = async () => {
    if (!keywords) {
      toast({
        title: "Missing keywords",
        description: "Please enter some keywords to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCourseContent({ keywords });
      setGeneratedContent(result);
      toast({
        title: "Content Generated",
        description: "Course draft has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-headline mb-2">Staff <span className="text-primary">Admin Tool</span></h1>
        <p className="text-muted-foreground">Internal utilities for managing HardTech Academy content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* AI Generator Sidebar */}
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
                  placeholder="e.g. Quantum Computing, Qiskit, Python" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-secondary/30"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Tip: Use technical terms for more accurate curriculum drafts.
                </p>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Dreaming up syllabus...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" /> Generate Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-xl bg-secondary/50 border border-border">
            <h4 className="font-bold mb-4 flex items-center gap-2"><Save className="h-4 w-4" /> Draft Management</h4>
            <div className="space-y-3">
              <div className="text-sm p-3 rounded bg-background border border-border flex justify-between items-center group cursor-pointer hover:border-primary">
                <span className="truncate">Cybersecurity Fundamentals...</span>
                <span className="text-[10px] text-muted-foreground">Oct 20</span>
              </div>
              <div className="text-sm p-3 rounded bg-background border border-border flex justify-between items-center group cursor-pointer hover:border-primary">
                <span className="truncate">Biohacking for Engineers...</span>
                <span className="text-[10px] text-muted-foreground">Oct 18</span>
              </div>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-8">
          {generatedContent ? (
            <Card className="bg-card h-full min-h-[600px] flex flex-col">
              <CardHeader className="border-b pb-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-primary border-primary/30">DRAFT GENERATED</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setGeneratedContent(null)}>Clear</Button>
                </div>
                <CardTitle className="text-3xl font-headline text-gradient">{generatedContent.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <Tabs defaultValue="description" className="w-full flex flex-col h-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12">
                    <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 rounded-none h-full"><FileText className="h-4 w-4 mr-2" /> Description</TabsTrigger>
                    <TabsTrigger value="outline" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 rounded-none h-full"><ListChecks className="h-4 w-4 mr-2" /> Outline</TabsTrigger>
                    <TabsTrigger value="outcomes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 rounded-none h-full"><GraduationCap className="h-4 w-4 mr-2" /> Outcomes</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8 overflow-y-auto max-h-[600px]">
                    <TabsContent value="description" className="mt-0">
                      <h3 className="text-xl font-bold mb-4">Course Description</h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {generatedContent.description}
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="outline" className="mt-0 space-y-4">
                      <h3 className="text-xl font-bold mb-4">Proposed Curriculum</h3>
                      {generatedContent.outline.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                          <span className="h-8 w-8 rounded-full bg-background border flex items-center justify-center text-xs font-mono">{i + 1}</span>
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="outcomes" className="mt-0 space-y-4">
                      <h3 className="text-xl font-bold mb-4">Learning Outcomes</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {generatedContent.learningOutcomes.map((outcome, i) => (
                          <div key={i} className="flex gap-3 items-start p-4 rounded-lg border border-accent/20 bg-accent/5">
                            <GraduationCap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                            <p>{outcome}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t p-6 bg-secondary/20 justify-between items-center">
                <span className="text-xs text-muted-foreground">Drafted by HardTech AI v2.5</span>
                <Button className="bg-primary text-primary-foreground px-8">
                  Publish to Catalog
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 bg-secondary/5">
              <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Course Selected</h3>
              <p className="text-muted-foreground max-w-sm">
                Enter keywords on the left and click "Generate Draft" to start architecting a new training program.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}