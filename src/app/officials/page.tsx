
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Users, Info, ShieldCheck, DatabaseBackup } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const MOCK_OFFICIALS = [
  { name: "Dr. Elena Vance", position: "Executive Director", department: "Administration", email: "e.vance@hardtech.academy" },
  { name: "Marcus Thorne", position: "Academic Dean", department: "Education", email: "m.thorne@hardtech.academy" },
  { name: "Sarah Jenkins", position: "Lead AI Instructor", department: "AI & ML", email: "s.jenkins@hardtech.academy" },
  { name: "Robert Chen", position: "Head of Robotics", department: "Robotics", email: "r.chen@hardtech.academy" },
  { name: "Anita Desai", position: "Senior Systems Engineer", department: "Infrastructure", email: "a.desai@hardtech.academy" },
  { name: "Victor Stone", position: "Board Repair Specialist", department: "Hardware Lab", email: "v.stone@hardtech.academy" },
  { name: "Maya Lopez", position: "Student Affairs Manager", department: "Student Services", email: "m.lopez@hardtech.academy" },
  { name: "Kevin Flynn", position: "Grid Systems Architect", department: "Software Eng", email: "k.flynn@hardtech.academy" },
  { name: "Diana Prince", position: "External Relations", department: "Partnerships", email: "d.prince@hardtech.academy" },
  { name: "Tony Stark", position: "Technical Advisor", department: "Innovation Lab", email: "t.stark@hardtech.academy" }
];

export default function OfficialsPage() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, loading } = useCollection(officialsQuery);

  const isAdmin = user?.role === 'admin';

  const handleSeedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    
    let count = 0;
    try {
      for (const official of MOCK_OFFICIALS) {
        await addDoc(collection(firestore, 'officials'), official);
        count++;
      }
      toast({
        title: "Directory Seeded",
        description: `Successfully added ${count} staff profiles to the directory.`
      });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'officials',
        operation: 'create'
      }));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight">
          Academy <span className="text-primary">Leadership</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          Meet the dedicated officials and technical experts driving innovation at HardTech Academy.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline">Administrative Setup</h3>
                <p className="text-sm text-muted-foreground">Initialize the staff directory with pre-configured technical leadership profiles.</p>
              </div>
            </div>
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding} 
              className="h-12 px-8 font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
            >
              {isSeeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DatabaseBackup className="mr-2 h-5 w-5" />}
              Seed Official Directory
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Retrieving staff directory...</p>
        </div>
      ) : officials && officials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {officials.map((official: any) => (
            <Card key={official.id} className="bg-card/40 border-white/5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 group">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-6 border-2 border-primary/20 ring-4 ring-primary/5 transition-transform group-hover:scale-105">
                  <AvatarFallback className="bg-secondary text-primary font-bold text-2xl uppercase">
                    {official.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold mb-1 font-headline group-hover:text-primary transition-colors">{official.name}</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{official.position}</p>
                
                <div className="w-full h-px bg-white/5 mb-4" />
                
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5" />
                    <span>{official.department || 'Staff'}</span>
                  </div>
                  {official.email && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer pt-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[150px]">{official.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-secondary/5 border-white/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold mb-2">Directory Offline</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No official profiles have been registered yet. Staff accounts will appear here once broadcast.</p>
        </div>
      )}
    </div>
  );
}
