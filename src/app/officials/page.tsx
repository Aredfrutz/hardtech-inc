
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Users, Info } from 'lucide-react';

export default function OfficialsPage() {
  const { firestore } = useFirestore();

  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, loading } = useCollection(officialsQuery);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight">
          Academy <span className="text-primary">Leadership</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          Meet the dedicated officials and technical experts driving innovation at HardTech Academy.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Retrieving staff directory...</p>
        </div>
      ) : officials && officials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {officials.map((official: any) => (
            <Card key={official.id} className="bg-card/40 border-white/5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-6 border-2 border-primary/20 ring-4 ring-primary/5">
                  <AvatarFallback className="bg-secondary text-primary font-bold text-2xl uppercase">
                    {official.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold mb-1 font-headline">{official.name}</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">{official.position}</p>
                
                <div className="w-full h-px bg-white/5 mb-4" />
                
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{official.department || 'Staff'}</span>
                  </div>
                  {official.email && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{official.email}</span>
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
          <p className="text-muted-foreground max-w-sm mx-auto">No official profiles have been registered yet. Check back soon for the leadership list.</p>
        </div>
      )}
    </div>
  );
}
