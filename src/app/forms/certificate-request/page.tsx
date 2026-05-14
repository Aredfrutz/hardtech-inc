
'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Loader2, Send, CheckCircle2, FileCheck, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function CertificateRequestPage() {
  const { firestore } = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [courseName, setCourseName] = useState('');
  const [completionDate, setCompletionDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) {
      toast({ title: "Unauthorized", description: "Please log in to submit requests.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const requestData = {
      userId: user.uid,
      fullName: fullName,
      courseName: courseName,
      completionDate: completionDate,
      status: 'pending',
      requestedAt: serverTimestamp()
    };

    addDoc(collection(firestore, 'certificate_requests'), requestData)
      .then(() => {
        setSubmitted(true);
        toast({ title: "Request Submitted", description: "Your certificate is being processed." });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'certificate_requests',
          operation: 'create',
          requestResourceData: requestData
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  if (userLoading) return null;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 font-headline tracking-tight">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Digital service requests are exclusive to Academy members. Please log in to proceed.</p>
        <Button asChild className="w-full h-12">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 font-headline uppercase tracking-tight">Request Transmitted</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Your request for <strong>{courseName}</strong> has been logged in the secure ledger. 
          Staff will verify your completion and issue your certificate via email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="h-12 px-8">
            <Link href="/forms">Back to Forms</Link>
          </Button>
          <Button asChild className="h-12 px-8 bg-primary text-primary-foreground">
            <Link href="/">Academy Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/forms" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Forms Registry
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold font-headline mb-4 uppercase tracking-tight">Request <span className="text-primary">Certificate</span></h1>
        <p className="text-muted-foreground">Submit a formal digital request for your technical certification.</p>
      </div>

      <Card className="bg-card border-primary/20 shadow-2xl overflow-hidden">
        <div className="bg-primary/10 border-b border-primary/20 px-8 py-4 flex items-center gap-3">
          <FileCheck className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Service Protocol: Digital Certification</span>
        </div>
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-headline">Verification Details</CardTitle>
          <CardDescription>Ensure all information matches your registration records for faster processing.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Full Student Name</Label>
              <Input 
                id="full-name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                className="bg-secondary/30 h-12 rounded-none border-primary/20 focus:border-primary" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Target Course / Program</Label>
              <Input 
                id="course" 
                placeholder="e.g. Advanced Micro-Soldering"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required 
                className="bg-secondary/30 h-12 rounded-none border-primary/20 focus:border-primary" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Estimated Completion Date</Label>
              <Input 
                id="date" 
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                required 
                className="bg-secondary/30 h-12 rounded-none border-primary/20 focus:border-primary" 
              />
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                Submit Request for Verification
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 italic uppercase tracking-tighter">
                Processing usually takes 3-5 technical cycles after submission.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
