
'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    <div className="mt-4 pl-4 border-l-2 border-accent/20 space-y-4">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        replies?.map((reply: any) => (
          <div key={reply.id} className="text-sm bg-secondary/20 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-accent">{reply.authorName}</span>
              <span className="text-[10px] text-muted-foreground">
                {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
              </span>
            </div>
            <p className="text-muted-foreground">{reply.content}</p>
          </div>
        ))
      )}
      
      {user && (
        <form onSubmit={handleReply} className="flex gap-2 mt-4">
          <Input 
            placeholder="Write a reply..." 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="text-xs h-8 bg-background"
          />
          <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()} className="h-8">
            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </form>
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
        // Post the initial content as the first reply for a cleaner NoSQL structure
        const replyData = {
          content: newContent,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          createdAt: serverTimestamp(),
        };
        addDoc(collection(firestore, 'forum_threads', docRef.id, 'replies'), replyData);
        
        setNewTitle('');
        setNewContent('');
        toast({ title: "Thread created!", description: "Your discussion has been started." });
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
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Public Service <span className="text-accent">Forum</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Scalable discussion architecture for the HardTech community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          {user ? (
            <Card className="bg-card border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" /> Start New Thread
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input 
                    placeholder="Thread Subject" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-secondary/30"
                  />
                  <Textarea 
                    placeholder="Provide details..." 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[120px] bg-secondary/30"
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Create Thread
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-secondary/20 border-dashed border-white/10 sticky top-24">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Lock className="h-10 w-10 text-muted-foreground mb-4 opacity-30" />
                <h3 className="font-bold mb-2">Authenticated Only</h3>
                <p className="text-sm text-muted-foreground mb-4">Sign in with your academy account to start discussions.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold font-headline mb-4">Active Threads</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : threads && threads.length > 0 ? (
            threads.map((thread: any) => (
              <Card key={thread.id} className="bg-card/40 border-white/5 hover:border-accent/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold">{thread.authorName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExpand(thread.id)}
                      className="text-xs text-muted-foreground"
                    >
                      {expandedThreads[thread.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="ml-1">{expandedThreads[thread.id] ? 'Collapse' : 'View Replies'}</span>
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{thread.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {expandedThreads[thread.id] && <ThreadReplies threadId={thread.id} />}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground italic">No threads found. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
