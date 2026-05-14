
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const { user } = useUser();
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

  if (threadLoading) return null;

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase mb-4">Discussion Not Found</h2>
        <Button asChild variant="outline" className="rounded-none">
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-40">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground/80 mb-2">Hardtech Forums</h1>
          <div className="flex justify-between items-center bg-white p-2 border border-border shadow-sm">
            <Link href="/forum" className="text-xs font-bold uppercase hover:underline px-2 flex items-center gap-2">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSummarize} 
                disabled={isSummarizing || replies.length === 0}
                className="text-[10px] font-bold uppercase h-7 px-2"
              >
                {isSummarizing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Summarize
              </Button>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Sort</span>
              <Select defaultValue="standard">
                <SelectTrigger className="h-7 w-[100px] text-[10px] bg-black text-white rounded-none border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {summary && (
          <div className="mb-8 p-6 bg-primary/10 border-l-4 border-primary shadow-sm relative animate-in fade-in slide-in-from-top-4">
             <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setSummary(null)}>
                <X className="h-3 w-3" />
              </Button>
              <h3 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Faculty Summary
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        <div className="bg-white border border-border shadow-sm mb-12">
          {/* Header Bar */}
          <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase">Author</span>
            <span className="text-[10px] font-bold uppercase flex-grow ml-44">Topic: {thread.title}</span>
          </div>

          {/* Messages */}
          {repliesLoading ? (
            <div className="p-20 text-center text-muted-foreground animate-pulse">Synchronizing thread...</div>
          ) : replies.length > 0 ? (
            replies.map((reply: any, index: number) => (
              <div key={reply.id} className="flex border-b last:border-0 min-h-[250px]">
                {/* Author Sidebar */}
                <div className="w-48 bg-secondary/10 border-r p-4 space-y-2 shrink-0">
                  <span className="text-sm font-bold block">{reply.authorName}</span>
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">Member</span>
                  <Avatar className="h-16 w-16 rounded-none border border-border">
                    <AvatarFallback className="bg-white rounded-none text-primary font-bold">
                      {reply.authorName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pt-4 space-y-1">
                    <span className="text-[9px] uppercase text-muted-foreground block">Posts: --</span>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="flex-grow p-6 flex flex-col">
                  <div className="mb-4 pb-2 border-b flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">
                      {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'MMM d, yyyy · h:mm a') : 'Recently'}
                    </span>
                    {user && (
                       <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-6 text-[9px] uppercase font-bold text-muted-foreground hover:text-primary"
                       onClick={() => handleReplyToUser(reply.authorName)}
                     >
                       <Reply className="h-3 w-3 mr-1" /> Quote
                     </Button>
                    )}
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap flex-grow">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-muted-foreground">No content in this discussion.</div>
          )}
        </div>
      </div>

      {/* Reply Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30 shadow-2xl">
          <div className="container mx-auto max-w-6xl">
            <form onSubmit={handleReply} className="flex gap-4 items-end">
              <div className="flex-grow">
                <Textarea 
                  ref={inputRef}
                  placeholder="Type your reply here..." 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-[#fcfcfc] border-border rounded-none min-h-[60px] max-h-[150px] resize-none text-sm"
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !replyContent.trim()} className="h-[60px] rounded-none px-8 bg-black text-white uppercase font-bold text-xs tracking-wider">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="ml-2">Submit Reply</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
