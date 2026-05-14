
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2, User as UserIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function ThreadPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const threadRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'forum_threads', id as string);
  }, [firestore, id]);

  const repliesQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(collection(firestore, 'forum_threads', id as string, 'replies'), orderBy('createdAt', 'asc'));
  }, [firestore, id]);

  const { data: thread, loading: threadLoading } = useDoc(threadRef);
  const { data: replies, loading: repliesLoading } = useCollection(repliesQuery);

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (replies.length > 0) {
      scrollToBottom();
    }
  }, [replies]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !id || !replyContent.trim()) return;

    setIsSubmitting(true);
    const replyData = {
      content: replyContent,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'forum_threads', id as string, 'replies'), replyData)
      .then(() => {
        setReplyContent('');
        toast({ title: "Reply posted" });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `forum_threads/${id}/replies`,
          operation: 'create',
          requestResourceData: replyData
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  if (threadLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving transmission...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 font-headline">Discussion Not Found</h2>
        <p className="text-muted-foreground mb-8">The thread you are looking for may have been archived or removed.</p>
        <Button asChild variant="outline">
          <Link href="/forum"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      {/* Header / Parent Thread Info */}
      <div className="border-b bg-card/30 backdrop-blur-md sticky top-16 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link href="/forum" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="h-3 w-3" /> BACK TO COMMUNITY
          </Link>
          <div className="flex gap-4 items-start">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
              <AvatarFallback className="bg-secondary text-primary font-bold text-lg">
                {thread.authorName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-headline leading-tight">{thread.title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground/80">
                  <UserIcon className="h-3 w-3 text-primary" /> {thread.authorName}
                </span>
                <span>•</span>
                <span>
                  {thread.createdAt?.toDate ? format(thread.createdAt.toDate(), 'MMMM d, yyyy h:mm a') : 'Recently Published'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies List */}
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl pb-40">
        <div className="space-y-6">
          {repliesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : replies.length > 0 ? (
            replies.map((reply: any, index: number) => (
              <div key={reply.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`flex gap-4 p-5 rounded-2xl border transition-all shadow-sm ${index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card/40 border-white/5 hover:border-white/10'}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {reply.authorName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{reply.authorName}</span>
                        {index === 0 && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">TOPIC STARTER</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
                        {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'h:mm a · MMM d') : 'Pending Sync'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/30">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No replies yet. Start the conversation!</p>
            </div>
          )}
          <div ref={repliesEndRef} />
        </div>
      </div>

      {/* Reply Bar - Fixed to Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t p-4 z-30">
        <div className="container mx-auto max-w-4xl">
          {user ? (
            <form onSubmit={handleReply} className="flex gap-4 items-end">
              <div className="flex-grow">
                <Textarea 
                  placeholder="Share your expert opinion..." 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-secondary/20 border-white/10 min-h-[60px] max-h-[150px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e as any);
                    }
                  }}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !replyContent.trim()} className="h-[60px] px-6 bg-primary text-primary-foreground">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="ml-2 hidden sm:inline">Reply</span>
              </Button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-secondary/50 border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">
                Access denied. You must be signed in to contribute to the discussion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
