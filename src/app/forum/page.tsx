
'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User as UserIcon, Lock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';

function ThreadReplies({ threadId }: { threadId: string }) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repliesQuery = useMemoFirebase(() => {
    if (!firestore || !threadId) return null;
    return query(collection(firestore, 'forum_threads', threadId, 'replies'), orderBy('createdAt', 'asc'));
  }, [firestore, threadId]);

  const { data: replies, loading } = useCollection(repliesQuery);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !replyContent.trim()) return;

    setIsSubmitting(true);
    const replyData = {
      content: replyContent,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'forum_threads', threadId, 'replies'), replyData)
      .then(() => {
        setReplyContent('');
        toast({ title: "Reply posted" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `forum_threads/${threadId}/replies`,
          operation: 'create',
          requestResourceData: replyData
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          replies?.map((reply: any) => (
            <div key={reply.id} className="flex gap-4 p-4 rounded-xl bg-secondary/10 border border-white/5">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {reply.authorName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{reply.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'MMM d, h:mm a') : 'Syncing...'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {user ? (
        <form onSubmit={handleReply} className="flex gap-3 pt-4 border-t border-white/5">
          <Input 
            placeholder="Share your thoughts..." 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="flex-grow bg-secondary/20 border-white/10"
          />
          <Button type="submit" disabled={isSubmitting || !replyContent.trim()} size="icon">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-4 italic">Sign in to join the conversation.</p>
      )}
    </div>
  );
}

export default function ForumPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  const threadsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forum_threads'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: threads, loading } = useCollection(threadsQuery);

  const toggleExpand = (id: string) => {
    setExpandedThreads(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      .catch(async (error) => {
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

      {/* New Thread Form */}
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
                <Button type="submit" disabled={isSubmitting} className="px-8">
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Establishing real-time link...</p>
          </div>
        ) : threads && threads.length > 0 ? (
          threads.map((thread: any) => {
            const isExpanded = expandedThreads[thread.id];
            return (
              <div key={thread.id} className="group">
                <div 
                  onClick={() => toggleExpand(thread.id)}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer transition-all border border-white/5 rounded-2xl",
                    isExpanded 
                      ? "bg-secondary/30 border-primary/20 rounded-b-none" 
                      : "bg-card/40 hover:bg-card hover:border-white/10 hover:shadow-xl hover:shadow-primary/5"
                  )}
                >
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
                          <UserIcon className="h-3 w-3" /> {thread.authorName}
                        </span>
                        <span>•</span>
                        <span>
                          {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 sm:mt-0 ml-auto sm:ml-0">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-8 border-x border-b border-primary/20 rounded-b-2xl bg-secondary/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ThreadReplies threadId={thread.id} />
                  </div>
                )}
              </div>
            );
          })
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
