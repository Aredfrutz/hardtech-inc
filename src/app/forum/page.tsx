
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
import { MessageSquare, Send, Loader2, Plus, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
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
    <div className="bg-[#f4f4f4] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground/80 mb-2">Hardtech Forums</h1>
          <div className="flex justify-between items-center bg-white p-2 border border-border shadow-sm">
            {user ? (
              <Button 
                onClick={() => setShowForm(!showForm)} 
                variant="ghost"
                className="text-xs font-bold uppercase hover:bg-primary/10"
              >
                {showForm ? 'Cancel' : (
                  <>
                    <Plus className="mr-2 h-3 w-3" /> New Topic
                  </>
                )}
              </Button>
            ) : (
              <div className="text-xs font-medium text-muted-foreground px-2 flex items-center gap-2">
                <Lock className="h-3 w-3" /> Sign in to post
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Sort</span>
              <Select defaultValue="newest">
                <SelectTrigger className="h-7 w-[100px] text-[10px] bg-black text-white rounded-none border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showForm && user && (
          <div className="mb-8 p-6 bg-white border border-border shadow-md animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Create Discussion
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Input 
                    placeholder="Title" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 text-sm rounded-none border-border"
                    required
                  />
                </div>
                <div>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="h-10 text-sm rounded-none border-border">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Issues">Issues</SelectItem>
                      <SelectItem value="Inquiries">Inquiries</SelectItem>
                      <SelectItem value="Suggestions">Suggestions</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea 
                placeholder="Content..." 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[120px] text-sm rounded-none border-border"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="rounded-none bg-black text-white hover:bg-black/90 px-8">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Post Topic
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-black">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white font-bold uppercase text-[11px] h-10">Topic</TableHead>
                <TableHead className="text-white font-bold uppercase text-[11px] h-10 text-center w-32">Category</TableHead>
                <TableHead className="text-white font-bold uppercase text-[11px] h-10 text-center w-24">Replies</TableHead>
                <TableHead className="text-white font-bold uppercase text-[11px] h-10 text-right w-40">Last Reply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground animate-pulse">
                    Loading threads...
                  </TableCell>
                </TableRow>
              ) : threads && threads.length > 0 ? (
                threads.map((thread: any) => (
                  <TableRow key={thread.id} className="group cursor-pointer hover:bg-secondary/20 transition-colors border-b last:border-0">
                    <TableCell className="p-0">
                      <Link href={`/forum/${thread.id}`} className="block px-4 py-4 text-sm font-medium hover:underline text-blue-600">
                        {thread.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-medium">
                      {thread.category || 'General'}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-medium">
                      --
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                      {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMM d, yyyy') : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No discussions found.
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
