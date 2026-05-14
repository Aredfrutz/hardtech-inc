
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Loader2, Sparkles, X, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { summarizeForumThread } from '@/ai/flows/forum-summarizer';
import Link from 'next/link';

export default function ThreadPage() {
  const { id } = useParams();
  const { user } = useAuthUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        scrollToBottom();
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

  const handleReplyToUser = (authorName: string) => {
    setReplyContent((prev) => `@${authorName} ${prev}`);
    inputRef.current?.focus();
  };

  const handleSummarize = async () => {
    if (replies.length === 0) {
      toast({ title: "No content to summarize", variant: "destructive" });
      return;
    }

    setIsSummarizing(true);
    setSummary(null);
    try {
      const replyTexts = replies.map((r: any) => r.content);
      const result = await summarizeForumThread({ replies: replyTexts });
      setSummary(result.summary);
    } catch (error) {
      toast({ title: "Summarization failed", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  function useAuthUser() {
    const { user } = useUser();
    return { user };
  }

  if (threadLoading) return null;

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase mb-4 text-primary">Discussion Not Found</h2>
        <Button asChild variant="outline" className="rounded-none border-primary/30">
          <Link href="/forum">Back to Registry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-40">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-primary mb-4">Public Service Forum</h1>
          <div className="flex justify-between items-center bg-card p-4 border border-primary/20 shadow-lg">
            <Link href="/forum" className="text-xs font-bold uppercase hover:text-primary flex items-center gap-2 tracking-widest">
              <ArrowLeft className="h-4 w-4" /> Back to Index
            </Link>
            
            <div className="flex items-center gap-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSummarize} 
                disabled={isSummarizing || replies.length === 0}
                className="text-[10px] font-bold uppercase h-8 px-4 border-primary/30 text-primary hover:bg-primary/10"
              >
                {isSummarizing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                Analyze Discussion
              </Button>
              <div className="w-[1px] h-6 bg-primary/20 mx-1" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Protocol</span>
              <Select defaultValue="standard">
                <SelectTrigger className="h-8 w-[120px] text-[10px] bg-primary text-primary-foreground rounded-none border-none font-bold uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {summary && (
          <div className="mb-10 p-8 bg-primary/10 border-l-4 border-primary shadow-2xl relative animate-in fade-in slide-in-from-top-4 backdrop-blur-sm">
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-6 w-6 text-primary hover:bg-primary/20" onClick={() => setSummary(null)}>
                <X className="h-4 w-4" />
              </Button>
              <h3 className="text-xs font-bold uppercase text-primary mb-4 flex items-center gap-2 tracking-widest">
                <Sparkles className="h-4 w-4" /> AI Faculty Intelligence Summary
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">{summary}</p>
          </div>
        )}

        <div className="bg-card border border-primary/10 shadow-2xl mb-12 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Faculty/Member Profile</span>
            <span className="text-[10px] font-bold uppercase text-primary tracking-widest flex-grow ml-32">Packet Subject: {thread.title}</span>
          </div>

          {/* Messages */}
          {repliesLoading ? (
            <div className="p-32 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Synchronizing Thread Data...</div>
          ) : replies.length > 0 ? (
            replies.map((reply: any, index: number) => (
              <div key={reply.id} className="flex border-b border-primary/10 last:border-0 min-h-[300px]">
                {/* Author Sidebar */}
                <div className="w-56 bg-secondary/20 border-r border-primary/10 p-6 space-y-4 shrink-0">
                  <div className="space-y-1">
                    <span className="text-sm font-bold block text-primary">{reply.authorName}</span>
                    <span className="text-[10px] uppercase text-muted-foreground block font-bold tracking-widest">Academy Contributor</span>
                  </div>
                  <Avatar className="h-20 w-20 rounded-none border-2 border-primary/30 shadow-lg">
                    <AvatarFallback className="bg-background text-primary font-bold text-xl rounded-none">
                      {reply.authorName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Content Area */}
                <div className="flex-grow p-8 flex flex-col bg-background/30">
                  <div className="mb-6 pb-3 border-b border-primary/10 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                      Transmission Date: {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'MMM d, yyyy · h:mm a') : 'Now'}
                    </span>
                    {user && (
                       <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-7 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary tracking-widest hover:bg-primary/10 px-4"
                       onClick={() => handleReplyToUser(reply.authorName)}
                     >
                       <Reply className="h-4 w-4 mr-2" /> Reference
                     </Button>
                    )}
                  </div>
                  <div className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap flex-grow font-sans tracking-wide">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-32 text-center text-muted-foreground font-bold uppercase tracking-widest opacity-30">No packet data found in this discussion.</div>
          )}
        </div>
      </div>

      {/* Reply Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-primary/30 p-6 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto max-w-6xl">
            <form onSubmit={handleReply} className="flex gap-6 items-end">
              <div className="flex-grow">
                <Label className="text-[10px] uppercase text-primary mb-2 block font-bold tracking-widest">Transmit Reply</Label>
                <Textarea 
                  ref={inputRef}
                  placeholder="Draft your technical response..." 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-background/80 border-primary/20 rounded-none min-h-[80px] max-h-[200px] resize-none text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !replyContent.trim()} className="h-[80px] rounded-none px-10 bg-primary text-primary-foreground uppercase font-bold text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="ml-3">Execute Upload</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
