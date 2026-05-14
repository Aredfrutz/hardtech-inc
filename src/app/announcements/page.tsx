'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  addDoc,
  serverTimestamp,
  DocumentData, 
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Info, AlertTriangle, CheckCircle2, Loader2, ChevronDown, Megaphone, Send, ShieldAlert, Database } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PAGE_SIZE = 10;

export default function AnnouncementsPage() {
  const { firestore } = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form State
  const [isPublishing, setIsPublishing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState('Low');

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
    if (firestore) {
      fetchAnnouncements();
    }
  }, [firestore, fetchAnnouncements]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newTitle.trim() || !newBody.trim()) return;

    setIsPublishing(true);
    const announcementData = {
      title: newTitle,
      body: newBody,
      priority: newPriority,
      timestamp: serverTimestamp()
    };

    addDoc(collection(firestore, 'announcements'), announcementData)
      .then(() => {
        toast({ title: "Broadcast Successful", description: "The announcement is now live." });
        setNewTitle('');
        setNewBody('');
        setNewPriority('Low');
        fetchAnnouncements(); // Refresh the list
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'announcements',
          operation: 'create',
          requestResourceData: announcementData
        }));
      })
      .finally(() => setIsPublishing(false));
  };

  const handleSeedAnnouncements = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    const mockData = [
      {
        title: "Critical Infrastructure Patch Required",
        body: "Students are advised to back up their local workstation data before the global cluster reboot tonight at 23:00. This is mandatory for all Batch 01 systems.",
        priority: "High",
        timestamp: serverTimestamp()
      },
      {
        title: "New Lab Access Protocol",
        body: "Starting next week, all hardware labs will require biometric authentication. Please visit the registrar office near the Main Hall to update your digital profile.",
        priority: "Medium",
        timestamp: serverTimestamp()
      },
      {
        title: "Open House: Robotics Showcase",
        body: "Join us this Friday for a live demonstration of the new robotic arm systems developed by our senior engineering batch. Snacks and networking to follow.",
        priority: "Low",
        timestamp: serverTimestamp()
      }
    ];

    try {
      const promises = mockData.map(data => addDoc(collection(firestore, 'announcements'), data));
      await Promise.all(promises);
      toast({ title: "Seeding Complete", description: "3 official announcements have been added." });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: "Seeding Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

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

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-bold uppercase text-[10px] tracking-widest">Initialising Terminal...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight uppercase">
          Academy <span className="text-primary">Announcements</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Official stream of administrative updates and technical notices.
        </p>
      </div>

      {/* Admin Broadcast Console */}
      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5 rounded-none">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tight">
                <ShieldAlert className="h-6 w-6 text-primary" /> Staff Broadcast Command
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Publish official notices to the student body.</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSeedAnnouncements} 
              disabled={isSeeding}
              className="border-primary/30 text-primary hover:bg-primary/10 rounded-none h-8 text-[10px] uppercase font-bold"
            >
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Seed Announcements
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleCreateAnnouncement} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="ann-title" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Announcement Title</Label>
                  <Input 
                    id="ann-title" 
                    placeholder="e.g. System Maintenance Window" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required 
                    className="bg-background/50 h-12 rounded-none border-primary/20 focus:border-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-priority" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Priority Level</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="bg-background/50 h-12 rounded-none border-primary/20">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-primary/20">
                      <SelectItem value="Low">Low Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-body" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Announcement Body</Label>
                <Textarea 
                  id="ann-body" 
                  placeholder="Detailed description of the update..." 
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required 
                  className="bg-background/50 min-h-[100px] rounded-none border-primary/20 focus:border-primary" 
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPublishing} className="h-12 px-8 font-bold rounded-none bg-primary text-primary-foreground uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                  {isPublishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Megaphone className="mr-2 h-5 w-5" />}
                  Broadcast Update
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold uppercase text-[10px] tracking-widest">Syncing with HQ...</p>
        </div>
      ) : announcements.length > 0 ? (
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-primary/50">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>

              {/* Card Container */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 md:p-0">
                <Card className="bg-card/50 border-white/5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-none">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="outline" className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-widest",
                        getPriorityStyles(announcement.priority)
                      )}>
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority}
                      </Badge>
                      <time className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {announcement.timestamp?.toDate 
                          ? format(announcement.timestamp.toDate(), 'MMMM d, yyyy') 
                          : 'Recent Update'}
                      </time>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3 font-headline leading-tight uppercase tracking-tight">
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
                className="rounded-none px-8 py-6 border-primary/20 hover:bg-primary/5 group text-[10px] font-bold uppercase tracking-widest"
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
        <div className="text-center py-20 border-2 border-dashed rounded-none bg-secondary/5 border-border/50">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold mb-2 uppercase tracking-widest opacity-40">The desk is quiet...</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-xs font-bold uppercase tracking-tighter">No announcements have been broadcasted yet. Check back soon for administrative news.</p>
        </div>
      )}
    </div>
  );
}
