
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Users, Info, ShieldCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function OfficialsPage() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');

  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, loading } = useCollection(officialsQuery);

  const isAdmin = user?.role === 'admin';

  const handleAddOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !name.trim() || !position.trim()) return;

    setIsAdding(true);
    const officialData = {
      name: name.trim(),
      position: position.trim(),
      department: department.trim(),
      email: email.trim(),
      imageId: 'official-placeholder'
    };

    addDoc(collection(firestore, 'officials'), officialData)
      .then(() => {
        toast({ title: "Official Registered", description: `${name} has been added to the directory.` });
        setName('');
        setPosition('');
        setDepartment('');
        setEmail('');
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'officials',
          operation: 'create',
          requestResourceData: officialData
        }));
      })
      .finally(() => setIsAdding(false));
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight uppercase">
          Academy <span className="text-primary">Leadership</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          Official directory of center leadership and technical staff members.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" /> Personnel Management
            </CardTitle>
            <CardDescription>Register new official records into the Academy directory.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleAddOfficial} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. John Egbert" 
                  required 
                  className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Position</Label>
                <Input 
                  id="position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  placeholder="e.g. Center Director" 
                  required 
                  className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Department</Label>
                <Input 
                  id="department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  placeholder="e.g. Engineering" 
                  className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="official@hardtech.academy" 
                  className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isAdding} 
                  className="h-12 w-full font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground rounded-none uppercase text-xs tracking-widest"
                >
                  {isAdding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                  Register
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold uppercase text-xs tracking-widest">Retrieving staff directory...</p>
        </div>
      ) : officials && officials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {officials.map((official: any) => (
            <Card key={official.id} className="bg-card/40 border-white/5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 group">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-6 border-2 border-primary/20 ring-4 ring-primary/5 transition-transform group-hover:scale-105 rounded-none">
                  <AvatarFallback className="bg-secondary text-primary font-bold text-2xl uppercase rounded-none">
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
          <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">Directory Offline</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No official profiles have been registered yet. Staff accounts will appear here once registered by an administrator.</p>
        </div>
      )}
    </div>
  );
}
