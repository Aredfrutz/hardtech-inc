
"use client"

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AnnouncementsPage() {
  const { firestore } = useFirestore();
  const announcementsQuery = firestore ? query(collection(firestore, 'announcements'), orderBy('date', 'desc')) : null;
  const { data: announcements, loading } = useCollection(announcementsQuery);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'Medium': return <Info className="h-4 w-4 text-accent" />;
      default: return <CheckCircle2 className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Academy <span className="text-primary">Announcements</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Stay updated with the latest news, curriculum changes, and campus events from the HardTech Academy administration.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {announcements.map((announcement: any) => (
            <Card key={announcement.id} className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-primary/20 transition-all">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn(
                      "flex items-center gap-1.5",
                      announcement.priority === 'High' ? "border-destructive text-destructive bg-destructive/5" :
                      announcement.priority === 'Medium' ? "border-accent text-accent bg-accent/5" :
                      "border-primary text-primary bg-primary/5"
                    )}>
                      {getPriorityIcon(announcement.priority)}
                      {announcement.priority} Priority
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {announcement.date ? format(new Date(announcement.date), 'MMM d, yyyy') : 'No date'}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-headline">{announcement.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No announcements yet</h3>
          <p className="text-muted-foreground">Check back later for updates from the academy.</p>
        </div>
      )}
    </div>
  );
}
