'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User as UserIcon, Lock, Plus, ChevronRight } from 'lucide-react';
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
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // CRITICAL: Only initiate query if user is authenticated to satisfy Security Rules
  const threadsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'forum_threads'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: threads, loading } = useCollection(threadsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    const threadData = {
      title: newTitle,
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
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline tracking-tight">
            Community <span className="text-primary">Forum</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Technical discussions, troubleshooting, and collaboration for HardTech students.
          </p>
        </div>
        
        {user ? (
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className={cn(
              "shadow-lg transition-all",
              showForm ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Start New Discussion
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 px-4 py-2 rounded-full border border-white/5">
            <Lock className="h-4 w-4" /> Sign in to contribute
          </div>
        )}
      </div>

      {showForm && user && (
        <Card className="mb-12 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <MessageSquare className="h-5 w-5 text-primary" /> Create a New Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="A descriptive title for your discussion..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background border-white/10 h-12 text-lg font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Textarea 
                  placeholder="Provide context, ask a question, or share your knowledge..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[150px] bg-background border-white/10"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="px-8 bg-primary text-primary-foreground">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Publish Topic
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {!user ? (
          <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/50">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-bold mb-2">Access Denied</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Please sign in to view the community discussions and participate in the forum.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Establishing real-time link...</p>
          </div>
        ) : threads && threads.length > 0 ? (
          threads.map((thread: any) => (
            <Link key={thread.id} href={`/forum/${thread.id}`} className="group block">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer transition-all border border-white/5 rounded-2xl bg-card/40 hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-4 items-center flex-grow">
                  <Avatar className="h-10 w-10 shrink-0 hidden md:flex">
                    <AvatarFallback className="bg-secondary text-primary font-bold">
                      {thread.authorName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground/70">
                        <UserIcon className="h-3 w-3 text-primary" /> {thread.authorName}
                      </span>
                      <span>•</span>
                      <span>
                        {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMM d, yyyy') : 'Recently Published'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 sm:mt-0 ml-auto sm:ml-0 text-muted-foreground group-hover:text-primary transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Join Discussion</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/50">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-bold mb-2">The forum is empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Be the first to start a discussion and build the HardTech knowledge base.</p>
          </div>
        )}
      </div>
    </div>
  );
}
