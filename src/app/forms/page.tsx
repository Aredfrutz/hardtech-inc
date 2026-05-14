
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Info, Search, Send, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function FormsPage() {
  const { firestore } = useFirestore();
  const [search, setSearch] = useState('');

  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), orderBy('title', 'asc'));
  }, [firestore]);

  const { data: forms, loading } = useCollection(formsQuery);

  const filteredForms = forms?.filter(f => 
    f.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight">
          Public Service <span className="text-primary">Forms</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Access essential technical documents or submit digital service requests to the academy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Flagship Digital Service: Certificate Request */}
        <Card className="bg-primary/5 border-primary/20 shadow-xl shadow-primary/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileCheck className="h-24 w-24 text-primary" />
          </div>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
              <Send className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-headline">Request for Training Certificate</CardTitle>
            <CardDescription className="text-primary/70">Fast-track your official certification process with our digital request portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Submit your training details for verification. Once approved, your certificate will be generated and issued via your registered email address.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full h-12 font-bold bg-primary text-primary-foreground">
              <Link href="/forms/certificate-request">Open Digital Request Form</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Informational Placeholder for other Digital Services */}
        <Card className="bg-secondary/20 border-border/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground">More Services Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Info className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              We are digitizing our entire administrative process. New interactive forms are currently in development.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md mx-auto mb-16">
        <h2 className="text-xl font-bold mb-8 text-center uppercase tracking-widest text-muted-foreground">Downloadable Documents</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents by name or category..." 
            className="pl-10 bg-secondary/20 border-white/5 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading document repository...</p>
        </div>
      ) : filteredForms && filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredForms.map((form: any) => (
            <Card key={form.id} className="bg-card/40 border-white/5 hover:border-primary/20 transition-all group">
              <CardHeader className="flex flex-row items-start gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{form.title}</CardTitle>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{form.category || 'General'}</span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {form.description}
                </p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="secondary" className="w-full h-11 font-bold">
                  <Download className="mr-2 h-4 w-4" /> Download Document
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-secondary/5 border-white/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold mb-2">Repository Empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No public service forms match your current search.</p>
        </div>
      )}
    </div>
  );
}
