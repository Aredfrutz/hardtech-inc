
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, AlertTriangle, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function AnnouncementsPage() {
  const { firestore } = useFirestore();
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchAnnouncements = useCallback(async (isNextPage = false) => {
    if (!firestore) return;

    if (isNextPage) setLoadingMore(true);
    else setLoading(true);

    try {
      const announcementsRef = collection(firestore, 'announcements');
      let announcementsQuery = query(
        announcementsRef,
        orderBy('timestamp', 'desc'),
        limit(PAGE_SIZE)
      );

      if (isNextPage && lastDoc) {
        announcementsQuery = query(
          announcementsRef,
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(announcementsQuery);
      
      const newAnnouncements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (isNextPage) {
        setAnnouncements(prev => [...prev, ...newAnnouncements]);
      } else {
        setAnnouncements(newAnnouncements);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [firestore, lastDoc]);

  useEffect(() => {
    fetchAnnouncements();
  }, [firestore]); // Only trigger on mount or if firestore instance changes

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High': return "border-destructive text-destructive bg-destructive/5";
      case 'Medium': return "border-accent text-accent bg-accent/5";
      default: return "border-primary text-primary bg-primary/5";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4" />;
      case 'Medium': return <Info className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight">
          Academy <span className="text-primary">Announcements</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Official stream of administrative updates and technical notices.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Syncing with HQ...</p>
        </div>
      ) : announcements.length > 0 ? (
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {announcements.map((announcement, index) => (
            <div key={announcement.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-primary/50">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>

              {/* Card Container */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 md:p-0">
                <Card className="bg-card/50 border-white/5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="outline" className={cn(
                        "flex items-center gap-1.5 px-3 py-1",
                        getPriorityStyles(announcement.priority)
                      )}>
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority}
                      </Badge>
                      <time className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {announcement.timestamp?.toDate 
                          ? format(announcement.timestamp.toDate(), 'MMMM d, yyyy') 
                          : 'Recent Update'}
                      </time>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3 font-headline leading-tight">
                      {announcement.title}
                    </h2>
                    
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {announcement.body}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={() => fetchAnnouncements(true)} 
                disabled={loadingMore}
                variant="outline"
                className="rounded-full px-8 py-6 border-primary/20 hover:bg-primary/5 group"
              >
                {loadingMore ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                )}
                Load Previous Announcements
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/50">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold mb-2">The desk is quiet...</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No announcements have been broadcasted yet. Check back soon for administrative news.</p>
        </div>
      )}
    </div>
  );
}
