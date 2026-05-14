
'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, Loader2, Plus, Lock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function ForumPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const threadsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forum_threads'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: threads, loading } = useCollection(threadsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    const threadData = {
      title: newTitle,
      category: newCategory,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'forum_threads'), threadData)
      .then((docRef) => {
        const replyData = {
          content: newContent,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          createdAt: serverTimestamp(),
        };
        addDoc(collection(firestore, 'forum_threads', docRef.id, 'replies'), replyData);
        
        setNewTitle('');
        setNewContent('');
        setShowForm(false);
        toast({ title: "Thread published", description: "Your topic is now live." });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'forum_threads',
          operation: 'create',
          requestResourceData: threadData
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-primary mb-2">Public Service Forum</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Technical Repository & Discussion Archive</p>
          
          <div className="flex justify-between items-center bg-card p-4 border border-primary/20 shadow-lg shadow-primary/5">
            {user ? (
              <Button 
                onClick={() => setShowForm(!showForm)} 
                variant="outline"
                className="text-xs font-bold uppercase border-primary/30 hover:bg-primary/10 text-primary h-10 px-6"
              >
                {showForm ? 'Cancel Operation' : (
                  <>
                    <Plus className="mr-2 h-3 w-3" /> New Discussion
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold text-muted-foreground px-2 flex items-center gap-2 uppercase tracking-widest border-r border-white/10 pr-6">
                  <Lock className="h-3 w-3 text-primary" /> Login Required to Contribute
                </div>
                <div className="text-[9px] font-medium text-muted-foreground/60 flex items-center gap-2 uppercase italic">
                  <Info className="h-3 w-3" /> Browsing as Guest: Public viewing active
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Sort Protocol</span>
              <Select defaultValue="newest">
                <SelectTrigger className="h-8 w-[140px] text-[10px] bg-primary text-primary-foreground rounded-none border-none font-bold uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="newest">Latest Sync</SelectItem>
                  <SelectItem value="popular">High Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showForm && user && (
          <div className="mb-8 p-8 bg-card border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-primary tracking-widest">
              <MessageSquare className="h-4 w-4" /> Initialize Discussion Thread
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Topic Title</Label>
                  <Input 
                    placeholder="Enter discussion title..." 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-12 text-sm rounded-none border-primary/20 bg-background/50 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Domain</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="h-12 text-sm rounded-none border-primary/20 bg-background/50">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-primary/20">
                      <SelectItem value="Issues">Hardware Issues</SelectItem>
                      <SelectItem value="Inquiries">Tech Inquiries</SelectItem>
                      <SelectItem value="Suggestions">Lab Suggestions</SelectItem>
                      <SelectItem value="General">General Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Initial Transmission</Label>
                <Textarea 
                  placeholder="Details of the inquiry..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[150px] text-sm rounded-none border-primary/20 bg-background/50 focus:border-primary"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 font-bold uppercase text-xs tracking-widest">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Broadcast Topic
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-primary/10 shadow-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="hover:bg-transparent border-primary/20">
                <TableHead className="text-primary font-bold uppercase text-[11px] h-12 tracking-widest">Topic</TableHead>
                <TableHead className="text-primary font-bold uppercase text-[11px] h-12 text-center w-32 tracking-widest">Domain</TableHead>
                <TableHead className="text-primary font-bold uppercase text-[11px] h-12 text-center w-24 tracking-widest">Activity</TableHead>
                <TableHead className="text-primary font-bold uppercase text-[11px] h-12 text-right w-40 tracking-widest">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground animate-pulse uppercase text-xs font-bold tracking-widest">
                    Retrieving Discussion Packets...
                  </TableCell>
                </TableRow>
              ) : threads && threads.length > 0 ? (
                threads.map((thread: any) => (
                  <TableRow key={thread.id} className="group cursor-pointer hover:bg-primary/5 transition-colors border-primary/10">
                    <TableCell className="p-0">
                      <Link href={`/forum/${thread.id}`} className="block px-4 py-6 text-sm font-bold hover:text-primary transition-colors">
                        {thread.title}
                        <span className="block text-[10px] text-muted-foreground font-medium uppercase mt-1">Initiated by {thread.authorName}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold">
                      <span className="px-2 py-1 bg-secondary/30 rounded text-muted-foreground">
                        {thread.category || 'General'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">
                      SYNCED
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground font-mono uppercase">
                      {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMM d, yyyy') : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold uppercase tracking-widest opacity-30">
                    No active transmissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
