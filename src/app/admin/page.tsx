
"use client"

import { useState } from 'react';
import { generateCourseContent, AdminCourseDescriptionOutput } from '@/ai/flows/admin-course-description-generator';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Save, FileText, ListChecks, Loader2, Wand2, Lock, HelpCircle, Users, Target, Wrench, CreditCard, Database, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function AdminDashboard() {
  const { firestore } = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  // AI Flow States
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Publication States
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');

  // Fetch Officials for selection
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: officials } = useCollection(officialsQuery);

  // Manual / AI Content State
  const [courseData, setCourseData] = useState<Partial<AdminCourseDescriptionOutput & { tuition: number; materials: number; duration: number; selectedInstructorIds: string[] }>>({
    courseTitle: '',
    description: '',
    summary: '',
    ncLevel: 'NC II',
    modules: [{ day: 'Day 1', topic: '', details: '' }],
    prerequisites: [''],
    requiredTools: [''],
    faqs: [{ question: '', answer: '' }],
    tuition: 15000,
    materials: 5000,
    duration: 40,
    selectedInstructorIds: []
  });

  if (userLoading) return null;

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <Lock className="h-16 w-16 text-muted-foreground opacity-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 font-headline tracking-tight">Access Restricted</h1>
        <p className="text-muted-foreground mb-8">This portal is for authorized HardTech Staff only.</p>
        <Button asChild className="w-full h-12">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const handleAiGenerate = async () => {
    if (!keywords) {
      toast({ title: "Missing keywords", description: "Enter some keywords first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateCourseContent({ keywords });
      setCourseData({
        ...courseData,
        ...result,
      });
      toast({ title: "Information Enriched", description: "Comprehensive curriculum drafted." });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!firestore || !courseData.courseTitle) return;
    setIsPublishing(true);

    const finalData = {
      title: courseData.courseTitle,
      summary: courseData.summary,
      description: courseData.description,
      ncLevel: courseData.ncLevel,
      modules: courseData.modules,
      prerequisites: courseData.prerequisites,
      requiredTools: courseData.requiredTools,
      faqs: courseData.faqs,
      instructorIds: courseData.selectedInstructorIds || [],
      fees: {
        tuition: courseData.tuition || 15000,
        materials: courseData.materials || 5000,
        total: (courseData.tuition || 0) + (courseData.materials || 0)
      },
      durationHours: courseData.duration || 40,
      status: "Active",
      imageId: "course-coding",
      createdAt: serverTimestamp()
    };

    addDoc(collection(firestore, 'courses'), finalData)
      .then(() => {
        toast({ title: "Program Published!", description: "Curriculum registry updated." });
        setCourseData({
          courseTitle: '',
          description: '',
          summary: '',
          ncLevel: 'NC II',
          modules: [{ day: 'Day 1', topic: '', details: '' }],
          prerequisites: [''],
          requiredTools: [''],
          faqs: [{ question: '', answer: '' }],
          tuition: 15000,
          materials: 5000,
          duration: 40,
          selectedInstructorIds: []
        });
        setKeywords('');
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'courses',
          operation: 'create',
          requestResourceData: finalData
        }));
      })
      .finally(() => setIsPublishing(false));
  };

  const handleSeedPrograms = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    // Pick a few real instructor IDs if available
    const availableIds = officials?.map(o => o.id) || [];
    const getRandomIds = () => {
      if (availableIds.length === 0) return [];
      const count = Math.min(availableIds.length, 1 + Math.floor(Math.random() * 2));
      const shuffled = [...availableIds].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const techPrograms = [
      {
        title: "Advanced iPhone Motherboard Repair",
        summary: "Master board-level troubleshooting and microsoldering for Apple devices, focusing on A-series CPU reballing.",
        description: "Deep dive into iPhone circuit analysis, short circuit detection, and advanced soldering techniques.",
        ncLevel: "NC III",
        durationHours: 60,
        status: "Active",
        imageId: "course-ai",
        modules: [
          { day: "Day 1-2", topic: "Schematic Reading", details: "ZXW and Phoneboard tracing." },
          { day: "Day 3-5", topic: "IC Replacement", details: "Removing baseband and power ICs." }
        ],
        prerequisites: ["Electronics Basics"],
        requiredTools: ["Digital Microscope", "ZXW Dongle"],
        fees: { tuition: 25000, materials: 10000, total: 35000 },
        faqs: [{ question: "Are boards provided?", answer: "Yes." }],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Android Hardware & IC Specialist",
        summary: "Professional training for Android device repair and IC replacement.",
        description: "Diagnose Android hardware failures using advanced JTAG and ISP protocols.",
        ncLevel: "NC II",
        durationHours: 48,
        status: "Active",
        imageId: "course-robotics",
        modules: [
          { day: "Day 1-3", topic: "Board Architecture", details: "Samsung/Xiaomi components." }
        ],
        prerequisites: ["Basic Hardware Knowledge"],
        requiredTools: ["UFI Box", "Heat Gun"],
        fees: { tuition: 18000, materials: 7000, total: 25000 },
        faqs: [{ question: "Generic Androids?", answer: "All major brands." }],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "MacBook Logic Board Restoration",
        summary: "Advanced troubleshooting for macOS hardware, liquid damage, and power rails.",
        description: "Restore failing MacBook logic boards using schematic analysis and board-view software.",
        ncLevel: "NC III",
        durationHours: 72,
        status: "Active",
        imageId: "hero-bg",
        modules: [
          { day: "Week 1", topic: "G3Hot Rails & Power States", details: "Understanding S0 to S5 power transitions." }
        ],
        prerequisites: ["Microsoldering Level 1"],
        requiredTools: ["Power Supply", "Oscilloscope"],
        fees: { tuition: 30000, materials: 15000, total: 45000 },
        faqs: [{ question: "Includes M1 chips?", answer: "Yes, focused on newer architectures." }],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Smartwatch Microsoldering Specialist",
        summary: "Precision repair for Apple Watch and Samsung Galaxy Watch hardware.",
        description: "Intensive training on extremely high-density boards found in wearables.",
        ncLevel: "NC II",
        durationHours: 32,
        status: "Active",
        imageId: "course-ai",
        modules: [{ day: "Day 1", topic: "Precision Disassembly", details: "Removing OLEDs without damage." }],
        prerequisites: ["Steady hands"],
        requiredTools: ["0.1mm Solder Tip"],
        fees: { tuition: 12000, materials: 4000, total: 16000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Data Recovery for Water-Damaged Devices",
        summary: "Advanced chemical cleaning and ultrasonic restoration for data retrieval.",
        description: "Techniques for temporary board restoration to recover critical user data.",
        ncLevel: "NC III",
        durationHours: 40,
        status: "Active",
        imageId: "course-coding",
        modules: [{ day: "Day 1", topic: "Ultrasonic Principles", details: "Chemical solution ratios." }],
        prerequisites: ["Basic Electronics"],
        requiredTools: ["Ultrasonic Cleaner"],
        fees: { tuition: 15000, materials: 10000, total: 25000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "EMMC & UFS Memory Programming",
        summary: "Mastering NAND memory protocols for dead-boot Android devices.",
        description: "Full training on using UFI, EasyJTAG, and Medusa for memory repairs.",
        ncLevel: "NC III",
        durationHours: 40,
        status: "Active",
        imageId: "course-robotics",
        modules: [{ day: "Day 1", topic: "ISP Pinouts", details: "Soldering directly to EMMC lines." }],
        prerequisites: ["Android Hardware Specialist"],
        requiredTools: ["EasyJTAG Box"],
        fees: { tuition: 20000, materials: 8000, total: 28000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Mobile Screen Refurbishing (OCA)",
        summary: "Professional glass-only replacement for curved and flat AMOLED screens.",
        description: "Using vacuum laminators and bubble removers for factory-finish screen repair.",
        ncLevel: "NC II",
        durationHours: 40,
        status: "Active",
        imageId: "news-1",
        modules: [{ day: "Day 1", topic: "Glass Separation", details: "Wire techniques." }],
        prerequisites: ["Basic Screen Disassembly"],
        requiredTools: ["Vacuum Laminator"],
        fees: { tuition: 15000, materials: 12000, total: 27000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Laptop Power Management Analysis",
        summary: "In-depth diagnostic training for laptop charging and power distribution circuits.",
        description: "Identify faulty mosfets, capacitors, and power controllers on PC laptops.",
        ncLevel: "NC II",
        durationHours: 48,
        status: "Active",
        imageId: "course-coding",
        modules: [{ day: "Day 1", topic: "19V Main Rail", details: "Tracing from DC Jack." }],
        prerequisites: ["Basic Soldering"],
        requiredTools: ["DC Power Supply"],
        fees: { tuition: 18000, materials: 6000, total: 24000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Basic Electronics for Technicians",
        summary: "The foundation for all board-level repair technicians.",
        description: "Understanding V, I, R, and component functions like diodes and transistors.",
        ncLevel: "NC I",
        durationHours: 24,
        status: "Active",
        imageId: "course-ai",
        modules: [{ day: "Day 1", topic: "Component ID", details: "Identifying SMD components." }],
        prerequisites: ["None"],
        requiredTools: ["Multimeter"],
        fees: { tuition: 8000, materials: 3000, total: 11000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      },
      {
        title: "Tablet Hardware & Battery Management",
        summary: "Specialized repair for iPad and high-end Android tablets.",
        description: "Battery controller replacement and large-screen board repair.",
        ncLevel: "NC II",
        durationHours: 32,
        status: "Active",
        imageId: "course-robotics",
        modules: [{ day: "Day 1", topic: "Large Scale Disassembly", details: "Heat pad usage." }],
        prerequisites: ["Basic Smartphone Repair"],
        requiredTools: ["Large Heat Pad"],
        fees: { tuition: 14000, materials: 6000, total: 20000 },
        faqs: [],
        instructorIds: getRandomIds(),
        createdAt: serverTimestamp()
      }
    ];

    try {
      const promises = techPrograms.map(prog => addDoc(collection(firestore, 'courses'), prog));
      await Promise.all(promises);
      toast({ title: "Registry Populated", description: "10 Technical Programs added with faculty links." });
    } catch (error) {
      toast({ title: "Seed Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const updateModule = (index: number, field: string, value: string) => {
    const newModules = [...(courseData.modules || [])];
    newModules[index] = { ...newModules[index], [field]: value };
    setCourseData({ ...courseData, modules: newModules });
  };

  const toggleInstructor = (id: string) => {
    const current = courseData.selectedInstructorIds || [];
    const updated = current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
    setCourseData({ ...courseData, selectedInstructorIds: updated });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 uppercase tracking-tighter">Information <span className="text-primary underline decoration-primary decoration-4 underline-offset-8">Enrichment Hub</span></h1>
          <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-4">Manual Registry and AI Technical Augmentation</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSeedPrograms} 
          disabled={isSeeding}
          className="border-primary/30 text-primary h-12 rounded-none uppercase font-bold text-xs tracking-widest bg-black hover:bg-primary hover:text-black transition-all"
        >
          {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          Seed 10 Technical Programs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-primary/20 border-2 rounded-none shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase text-sm tracking-widest">
                <Sparkles className="h-4 w-4 text-primary" /> Technical Draftsman
              </CardTitle>
              <CardDescription className="text-[10px] uppercase">
                Choose entry protocol for curriculum registry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 p-1 bg-secondary/20 border border-white/10">
                <Button 
                  onClick={() => setActiveMode('ai')} 
                  variant={activeMode === 'ai' ? 'default' : 'ghost'}
                  className="flex-grow rounded-none text-[10px] font-bold uppercase h-10"
                >
                  AI Assisted
                </Button>
                <Button 
                  onClick={() => setActiveMode('manual')} 
                  variant={activeMode === 'manual' ? 'default' : 'ghost'}
                  className="flex-grow rounded-none text-[10px] font-bold uppercase h-10"
                >
                  Manual Entry
                </Button>
              </div>

              {activeMode === 'ai' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Technical Keywords</Label>
                    <Input 
                      placeholder="e.g. Micro-Soldering, PCB Analysis" 
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="bg-secondary/30 h-12 rounded-none border-primary/20"
                    />
                  </div>
                  <Button onClick={handleAiGenerate} disabled={isLoading} className="w-full h-12 rounded-none uppercase font-bold text-xs tracking-widest">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Enrich Information
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-[10px] text-muted-foreground uppercase text-center font-bold">Manual Entry Active</p>
                  <Button onClick={() => setKeywords('')} variant="outline" className="w-full h-12 rounded-none uppercase text-xs font-bold border-white/10">
                    Clear Workspace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="bg-card border-white/5 shadow-2xl overflow-hidden rounded-none min-h-[600px] flex flex-col">
            <CardHeader className="border-b bg-secondary/10 flex flex-row justify-between items-center p-8">
              <div className="space-y-2 flex-grow mr-8">
                <Label className="text-[10px] uppercase font-bold text-primary">Program Title</Label>
                <Input 
                  value={courseData.courseTitle || ''} 
                  onChange={(e) => setCourseData({...courseData, courseTitle: e.target.value})}
                  className="bg-transparent border-0 border-b border-primary/20 text-2xl font-headline uppercase focus:ring-0 rounded-none h-14 p-0 placeholder:opacity-20"
                  placeholder="ENTER PROGRAM TITLE"
                />
              </div>
              <Badge className="bg-primary text-black font-bold text-[10px] uppercase h-8 px-4">REGISTRY WORKSPACE</Badge>
            </CardHeader>
            
            <CardContent className="p-0 flex-grow">
              <Tabs defaultValue="description" className="w-full h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-14 p-0">
                  <TabsTrigger value="description" className="px-8 rounded-none h-full text-[10px] font-bold uppercase tracking-widest">Profile</TabsTrigger>
                  <TabsTrigger value="curriculum" className="px-8 rounded-none h-full text-[10px] font-bold uppercase tracking-widest">Syllabus</TabsTrigger>
                  <TabsTrigger value="faculty" className="px-8 rounded-none h-full text-[10px] font-bold uppercase tracking-widest">Faculty</TabsTrigger>
                  <TabsTrigger value="logistics" className="px-8 rounded-none h-full text-[10px] font-bold uppercase tracking-widest">Logistics</TabsTrigger>
                </TabsList>
                
                <div className="p-8 overflow-y-auto max-h-[500px]">
                  <TabsContent value="description" className="mt-0 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">3-Sentence Summary (Enriched)</Label>
                      <Textarea 
                        value={courseData.summary || ''} 
                        onChange={(e) => setCourseData({...courseData, summary: e.target.value})}
                        className="bg-secondary/10 border-white/10 min-h-[80px] rounded-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Comprehensive Description</Label>
                      <Textarea 
                        value={courseData.description || ''} 
                        onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                        className="bg-secondary/10 border-white/10 min-h-[150px] rounded-none text-sm"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest">Lesson Plan Matrix</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCourseData({ ...courseData, modules: [...(courseData.modules || []), { day: `Day ${(courseData.modules?.length || 0) + 1}`, topic: '', details: '' }] })}
                        className="h-8 text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Module
                      </Button>
                    </div>
                    {courseData.modules?.map((mod, i) => (
                      <div key={i} className="p-4 bg-secondary/10 border-l-2 border-primary space-y-4 group">
                        <div className="flex gap-4 items-center">
                          <Input 
                            value={mod.day} 
                            onChange={(e) => updateModule(i, 'day', e.target.value)}
                            className="w-24 bg-transparent border-0 font-bold text-primary uppercase text-[10px] p-0 h-auto" 
                          />
                          <Input 
                            value={mod.topic} 
                            onChange={(e) => updateModule(i, 'topic', e.target.value)}
                            placeholder="Module Topic"
                            className="flex-grow bg-transparent border-0 border-b border-white/10 rounded-none text-xs font-bold" 
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const newMods = [...(courseData.modules || [])];
                              newMods.splice(i, 1);
                              setCourseData({ ...courseData, modules: newMods });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Textarea 
                          value={mod.details} 
                          onChange={(e) => updateModule(i, 'details', e.target.value)}
                          placeholder="Technical details..."
                          className="bg-transparent border-0 border-l border-white/20 rounded-none min-h-[60px] text-xs resize-none p-2 focus:ring-0" 
                        />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="faculty" className="mt-0 space-y-6">
                    <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest">Assign Specialized Instructors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {officials?.map((official: any) => (
                        <div 
                          key={official.id} 
                          onClick={() => toggleInstructor(official.id)}
                          className={`p-4 border cursor-pointer flex items-center gap-4 transition-all ${
                            courseData.selectedInstructorIds?.includes(official.id) 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-secondary/10 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`h-4 w-4 border flex items-center justify-center ${courseData.selectedInstructorIds?.includes(official.id) ? 'bg-primary border-primary' : 'border-white/20'}`}>
                            {courseData.selectedInstructorIds?.includes(official.id) && <span className="text-[10px] text-black font-bold">✓</span>}
                          </div>
                          <div className="flex-grow">
                            <p className="text-xs font-bold uppercase">{official.name}</p>
                            <p className="text-[8px] text-muted-foreground uppercase">{official.position}</p>
                          </div>
                        </div>
                      ))}
                      {!officials?.length && <p className="text-[10px] text-muted-foreground italic">No faculty registered in Official Lists.</p>}
                    </div>
                  </TabsContent>

                  <TabsContent value="logistics" className="mt-0 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-bold text-primary">Academic Data</Label>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-9px uppercase font-bold opacity-50">NC Level</span>
                              <Input 
                                value={courseData.ncLevel || ''} 
                                onChange={(e) => setCourseData({...courseData, ncLevel: e.target.value})}
                                className="bg-secondary/20 h-10 rounded-none border-white/10"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-9px uppercase font-bold opacity-50">Hours</span>
                              <Input 
                                type="number"
                                value={courseData.duration || 40} 
                                onChange={(e) => setCourseData({...courseData, duration: parseInt(e.target.value)})}
                                className="bg-secondary/20 h-10 rounded-none border-white/10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-bold text-accent">Investment Registry (PHP)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-9px uppercase font-bold opacity-50">Tuition</span>
                            <Input 
                              type="number"
                              value={courseData.tuition || 0} 
                              onChange={(e) => setCourseData({...courseData, tuition: parseInt(e.target.value)})}
                              className="bg-secondary/20 h-10 rounded-none border-white/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-9px uppercase font-bold opacity-50">Materials</span>
                            <Input 
                              type="number"
                              value={courseData.materials || 0} 
                              onChange={(e) => setCourseData({...courseData, materials: parseInt(e.target.value)})}
                              className="bg-secondary/20 h-10 rounded-none border-white/10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>

            <CardFooter className="border-t p-8 bg-secondary/10 flex justify-between items-center">
               <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-8px uppercase font-bold text-muted-foreground mb-1">Total Fee</p>
                    <p className="text-lg font-bold">₱ {((courseData.tuition || 0) + (courseData.materials || 0)).toLocaleString()}</p>
                  </div>
               </div>
               <Button 
                onClick={handlePublish} 
                disabled={isPublishing || !courseData.courseTitle} 
                className="bg-primary text-black font-bold uppercase text-xs px-12 h-14 tracking-widest rounded-none shadow-lg hover:bg-white transition-all"
               >
                 {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                 Execute Publication
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
