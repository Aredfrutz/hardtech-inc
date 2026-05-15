
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Microscope,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();

  // Mock enrollment data for visualization
  const activeProgram = {
    title: "iPhone Logic Board Specialist",
    progress: 65,
    modules: [
      { name: "Micro-soldering Fundamentals", completed: true },
      { name: "Schematic Analysis", completed: true },
      { name: "Power Rail Troubleshooting", completed: false },
      { name: "Advanced IC Replacement", completed: false }
    ]
  };

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), limit(3));
  }, [firestore]);
  const { data: featuredPrograms } = useCollection(coursesQuery);

  if (userLoading) return null;

  if (!user || user.role !== 'student') {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">This portal is reserved for Enrolled Students (JuanTech).</p>
        <Button asChild><Link href="/">Return Home</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            Welcome, <span className="text-primary">{user.displayName}</span>
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" /> Active Learning Session: {activeProgram.title}
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-none border-primary/20 uppercase font-bold text-[10px] tracking-widest h-12 px-6">
             <Calendar className="h-4 w-4 mr-2" /> Class Schedule
           </Button>
           <Button className="rounded-none bg-primary text-black font-bold uppercase text-[10px] tracking-widest h-12 px-8">
             <Microscope className="h-4 w-4 mr-2" /> Enter Virtual Lab
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Progress Tracker Card */}
        <Card className="lg:col-span-2 bg-card/40 border-primary/20 rounded-none overflow-hidden backdrop-blur-md">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl uppercase tracking-tight">Technical Progress</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">
                  {activeProgram.title} Registry
                </CardDescription>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Total Mastery</span>
                <span className="text-primary">{activeProgram.progress}% Completed</span>
              </div>
              <Progress value={activeProgram.progress} className="h-3 bg-secondary rounded-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProgram.modules.map((mod, i) => (
                <div key={i} className={`p-4 border flex items-center justify-between ${mod.completed ? 'bg-primary/5 border-primary/20' : 'bg-secondary/10 border-white/5 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    {mod.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-tight">{mod.name}</span>
                  </div>
                  {mod.completed && <Badge className="bg-primary text-black text-[8px] rounded-none">VERIFIED</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Quick Protocol</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/forms/certificate-request" className="p-6 bg-secondary/10 border border-white/5 hover:border-primary/50 transition-all text-center group">
              <Award className="h-6 w-6 mx-auto mb-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest block">Claim Cert</span>
            </Link>
            <Link href="/forms" className="p-6 bg-secondary/10 border border-white/5 hover:border-primary/50 transition-all text-center group">
              <FileText className="h-6 w-6 mx-auto mb-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest block">Lab Manuals</span>
            </Link>
            <Link href="/announcements" className="p-6 bg-secondary/10 border border-white/5 hover:border-primary/50 transition-all text-center group">
              <ShieldCheck className="h-6 w-6 mx-auto mb-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest block">System Updates</span>
            </Link>
            <Link href="/courses" className="p-6 bg-secondary/10 border border-white/5 hover:border-primary/50 transition-all text-center group">
              <BookOpen className="h-6 w-6 mx-auto mb-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest block">Catalog</span>
            </Link>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/10 space-y-4">
             <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                 <Zap className="h-4 w-4 text-primary" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest">Technician Tip</p>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed italic">
               "Always check the VCC_MAIN rail before assuming a CPU fault. 90% of boot loops originate from power delivery."
             </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Recommended <span className="text-primary">Advanced Curricula</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPrograms?.map((course: any) => (
            <Card key={course.id} className="bg-card/40 border-white/5 rounded-none overflow-hidden group hover:border-primary/20 transition-all">
              <CardHeader className="p-6">
                <Badge variant="outline" className="w-fit mb-4 text-[8px] uppercase font-black border-primary/30 text-primary">{course.ncLevel}</Badge>
                <CardTitle className="text-sm font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                     <Clock className="h-3 w-3" /> {course.durationHours} Hrs
                   </div>
                   <Button asChild variant="ghost" size="sm" className="h-8 px-0 text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-primary">
                     <Link href={`/courses/${course.id}`}>Open Packet <ArrowRight className="ml-2 h-3 w-3" /></Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
