'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ForumPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forum-posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, loading } = useCollection(postsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({ title: "Validation Error", description: "Please fill in both title and content.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const postData = {
      title: newPostTitle,
      content: newPostContent,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous User',
      authorPhoto: user.photoURL || null,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'forum-posts'), postData)
      .then(() => {
        setNewPostTitle('');
        setNewPostContent('');
        toast({ title: "Post shared!", description: "Your discussion has been added to the forum." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'forum-posts',
          operation: 'create',
          requestResourceData: postData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Public Service <span className="text-accent">Forum</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">A collaborative space for students and engineers to discuss projects, share technical insights, and build the future together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          {user ? (
            <Card className="bg-card border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Start a Discussion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Topic Title" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="What's on your mind?" 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[150px] bg-secondary/30"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Post Discussion
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-secondary/20 border-dashed border-white/10 sticky top-24">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
                <h3 className="font-bold mb-2">Sign in to contribute</h3>
                <p className="text-sm text-muted-foreground mb-6">Join the conversation by signing in with your academy account.</p>
                <Button variant="outline" className="w-full">Sign In with Google</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold font-headline mb-4">Recent Discussions</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <Card key={post.id} className="bg-card/40 border-white/5 hover:border-accent/30 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={post.authorPhoto || ''} />
                      <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{post.authorName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 border-t border-white/5 mt-4 pt-4 flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                    <MessageSquare className="h-4 w-4 mr-2" /> Reply
                  </Button>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"> Discussion Thread </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-32 border-2 border-dashed rounded-3xl bg-secondary/5">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground">The forum is quiet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
