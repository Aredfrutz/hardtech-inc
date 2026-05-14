'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  serverTimestamp,
  DocumentData, 
} from 'firebase/firestore';
import { generateAnnouncementContent } from '@/ai/flows/announcement-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  ShieldAlert, 
  Database, 
  Megaphone,
  Plus,
  Wand2,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AnnouncementsPage() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Form State
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState('Low');

  const fetchAnnouncements = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const announcementsRef = collection(firestore, 'announcements');
      const announcementsQuery = query(
        announcementsRef,
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(announcementsQuery);
      
      const priorityMap: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
      
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        // Sort by Priority first
        const pA = priorityMap[a.priority as string] || 0;
        const pB = priorityMap[b.priority as string] || 0;
        if (pB !== pA) return pB - pA;
        
        // Then by Timestamp (newest first)
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return tB - tA;
      });

      setAnnouncements(fetched);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

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
        setShowAdminForm(false);
        fetchAnnouncements();
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

  const handleAiGenerate = async () => {
    if (!newTitle && !newBody) {
      toast({ 
        title: "Input Required", 
        description: "Please provide a few keywords in the title or body to guide the AI.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const topic = newTitle || newBody;
      const result = await generateAnnouncementContent({ topic });
      setNewTitle(result.title);
      setNewBody(result.body);
      toast({ title: "Draft Generated", description: "AI has refined your announcement." });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeedAnnouncements = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    const mockData = [
      {
        title: "ACTUAL ADVANCE BOARD-LEVEL TRAINING",
        body: "Hardtech Information Technology Corporation proudly invites aspiring technicians and professionals to join our Actual Advance Board-Level Training. Gain industry-ready skills through hands-on instruction led by seasoned experts.\n\nWHERE: PANABO & TAGUM\nWHEN: April 18, 2026\nZAMBOANGA CITY\nSchedule to be Announced\n\nTraining Highlights:\n- Cellphone Repair for Android and Apple Devices\n- Circuit Line Tracing and Troubleshooting\n- Microsoldering and Reballing Techniques\n- Professional Technician Tips and Tricks",
        priority: "High",
        timestamp: serverTimestamp()
      },
      {
        title: "INFRASTRUCTURE PATCH: V4.2 PROTOCOL",
        body: "Hardtech Information Technology Corporation is upgrading the main laboratory infrastructure to V4.2. This patch introduces optimized voltage monitoring and board trace visualization tools for all student workstations.",
        priority: "Medium",
        timestamp: serverTimestamp()
      },
      {
        title: "ACADEMY ROBOTICS SHOWCASE 2024",
        body: "Join us for the annual Hardtech Robotics Showcase where students display their final projects. Witness advanced diagnostics and circuit isolation strategies in action.",
        priority: "Low",
        timestamp: serverTimestamp()
      }
    ];

    try {
      const promises = mockData.map(data => addDoc(collection(firestore, 'announcements'), data));
      await Promise.all(promises);
      toast({ title: "Seeding Complete", description: "Academy announcements added." });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: "Seeding Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const mainAnnouncement = announcements[0];
  const sideAnnouncements = announcements.slice(1);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Admin Controls Floating Bar */}
      {isAdmin && (
        <div className="bg-[#1a1a1a] border-b border-primary/20 p-4 sticky top-20 z-40 flex justify-between items-center px-8">
          <div className="flex items-center gap-4">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Terminal</span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAdminForm(!showAdminForm)}
              className="rounded-none border-primary/30 text-primary h-8 text-[10px] uppercase font-bold"
            >
              {showAdminForm ? 'Close Console' : <><Plus className="h-3 w-3 mr-2" /> New Broadcast</>}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSeedAnnouncements} 
              disabled={isSeeding}
              className="rounded-none border-primary/30 text-primary h-8 text-[10px] uppercase font-bold"
            >
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Database className="h-3 w-3 mr-2" /> Seed Data</>}
            </Button>
          </div>
        </div>
      )}

      {/* Admin Form Overlay */}
      {showAdminForm && isAdmin && (
        <div className="bg-[#111] border-b border-primary/20 p-8">
          <form onSubmit={handleCreateAnnouncement} className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Title / Keywords</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required={!newBody}
                    placeholder="e.g. Lab Maintenance Schedule"
                    className="bg-black border-primary/20 h-10 rounded-none flex-grow" 
                  />
                  <Button 
                    type="button" 
                    onClick={handleAiGenerate} 
                    disabled={isGenerating}
                    variant="secondary"
                    className="bg-primary/10 text-primary h-10 rounded-none border border-primary/30 px-3 hover:bg-primary/20"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger className="bg-black border-primary/20 h-10 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-primary/20">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Body Content</Label>
                <span className="text-[8px] uppercase font-bold text-primary/50 tracking-tighter flex items-center gap-1">
                  <Sparkles className="h-2 w-2" /> AI Draft Assistant Enabled
                </span>
              </div>
              <Textarea 
                value={newBody} 
                onChange={(e) => setNewBody(e.target.value)} 
                required 
                placeholder="Draft the announcement details or let AI generate from keywords..."
                className="bg-black border-primary/20 min-h-[150px] rounded-none" 
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPublishing} className="bg-primary text-black rounded-none font-bold uppercase text-[10px] px-8 h-10">
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Megaphone className="h-4 w-4 mr-2" /> Broadcast</>}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col lg:flex-row flex-grow">
        {/* Left Column: Spotlight (White Theme) */}
        <div className="w-full lg:w-[60%] bg-white text-black p-8 lg:p-20 relative overflow-y-auto max-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-black uppercase tracking-tight mb-8">ANNOUNCEMENTS</h1>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-black" /></div>
            ) : mainAnnouncement ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-2">
                   <div className="h-1 w-12 bg-[#a3ff00]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Priority Transmission</span>
                </div>
                <h2 className="text-3xl font-black uppercase leading-[1.1] tracking-tighter">{mainAnnouncement.title}</h2>
                <div className="text-sm leading-relaxed whitespace-pre-wrap space-y-4 font-medium opacity-80">
                  {mainAnnouncement.body}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground uppercase text-xs font-bold tracking-widest">No priority broadcast available.</div>
            )}
          </div>
        </div>

        {/* Right Column: News Feed (Dark Theme) */}
        <div className="w-full lg:w-[40%] bg-[#080808] text-white p-8 lg:p-12 border-l border-white/5 overflow-y-auto max-h-screen">
          <h2 className="text-[#a3ff00] text-xl font-black uppercase tracking-tight mb-12">LATEST NEWS</h2>
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#a3ff00]" /></div>
          ) : sideAnnouncements.length > 0 ? (
            <div className="space-y-16">
              {sideAnnouncements.map((news) => (
                <div key={news.id} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-sm font-black uppercase leading-tight tracking-wide">{news.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {news.timestamp?.toDate ? format(news.timestamp.toDate(), 'd MMMM yyyy') : 'Recent'}
                    </div>
                    {news.priority === 'High' && (
                      <span className="text-[8px] font-black bg-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Priority</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {news.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">No additional news logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
