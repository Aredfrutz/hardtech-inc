
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Info, Search, Send, FileCheck, ShieldCheck, Plus, Trash2, Edit2, Save, Database, Clock, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { format } from 'date-fns';

export default function FormsPage() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  // Admin Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), orderBy('title', 'asc'));
  }, [firestore]);

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'certificate_requests'), orderBy('requestedAt', 'desc'));
  }, [firestore]);

  const { data: forms, loading: formsLoading } = useCollection(formsQuery);
  const { data: requests, loading: requestsLoading } = useCollection(requestsQuery);

  const isAdmin = user?.role === 'admin';

  const filteredForms = forms?.filter(f => 
    f.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newTitle.trim() || !newTitle.trim()) return;

    setIsAdding(true);
    const formData = {
      title: newTitle,
      category: newCategory,
      description: newDescription,
      fileUrl: newFileUrl || '/forms/certificate-request'
    };

    addDoc(collection(firestore, 'public_forms'), formData)
      .then(() => {
        toast({ title: "Form Added", description: `${newTitle} is now in the repository.` });
        setNewTitle('');
        setNewCategory('');
        setNewDescription('');
        setNewFileUrl('');
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'public_forms',
          operation: 'create',
          requestResourceData: formData
        }));
      })
      .finally(() => setIsAdding(false));
  };

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (!firestore || !isAdmin) return;
    deleteDoc(doc(firestore, 'public_forms', formId))
      .then(() => toast({ title: "Document Removed", description: `${formTitle} has been deleted.` }))
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `public_forms/${formId}`, operation: 'delete' })));
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (!firestore || !isAdmin) return;
    updateDoc(doc(firestore, 'certificate_requests', requestId), { status: newStatus })
      .then(() => toast({ title: "Status Updated", description: `Request marked as ${newStatus}.` }))
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `certificate_requests/${requestId}`, operation: 'update' })));
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!firestore || !isAdmin) return;
    deleteDoc(doc(firestore, 'certificate_requests', requestId))
      .then(() => toast({ title: "Request Deleted", description: "The request has been removed from the records." }))
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `certificate_requests/${requestId}`, operation: 'delete' })));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected': return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight uppercase">
          Public Service <span className="text-primary">Forms</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Access essential technical documents or submit digital service requests to the academy.
        </p>
      </div>

      {isAdmin && (
        <div className="space-y-8 mb-16">
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tight">
                  <ShieldCheck className="h-6 w-6 text-primary" /> Admin Controls
                </CardTitle>
                <CardDescription>Manage document repository and service requests.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleAddForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Form Title</Label>
                    <Input 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      placeholder="e.g. Enrollment Waiver" 
                      required 
                      className="bg-background/50 h-12 border-primary/20 rounded-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                    <Input 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)} 
                      placeholder="e.g. Administrative" 
                      className="bg-background/50 h-12 border-primary/20 rounded-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Digital Path</Label>
                    <Input 
                      value={newFileUrl} 
                      onChange={(e) => setNewFileUrl(e.target.value)} 
                      placeholder="/forms/certificate-request" 
                      className="bg-background/50 h-12 border-primary/20 rounded-none" 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isAdding} 
                    className="h-12 px-10 font-bold bg-primary text-primary-foreground rounded-none uppercase text-xs tracking-widest"
                  >
                    {isAdding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                    Add Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/40">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" /> Certificate Requests Ledger
              </CardTitle>
              <CardDescription>Track and process student certification applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-none border border-white/5">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Student</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Course</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 opacity-50">Syncing ledger...</TableCell></TableRow>
                    ) : requests && requests.length > 0 ? (
                      requests.map((req: any) => (
                        <TableRow key={req.id} className="border-white/5">
                          <TableCell className="font-bold text-sm">{req.fullName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{req.courseName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{req.certificateType || 'Standard'}</TableCell>
                          <TableCell className="text-[10px] font-mono opacity-60">
                            {req.requestedAt?.toDate ? format(req.requestedAt.toDate(), 'MMM d, h:mm a') : 'Now'}
                          </TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Select defaultValue={req.status} onValueChange={(val) => handleUpdateStatus(req.id, val)}>
                                <SelectTrigger className="w-[100px] h-8 text-[10px] uppercase font-bold bg-secondary/30 border-white/10 rounded-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approve</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(req.id)} className="h-8 w-8 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No requests found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
        {!isAdmin && (
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold rounded-none uppercase tracking-widest h-14 px-8 shadow-lg shadow-primary/20">
            <Link href="/forms/certificate-request">
              <Send className="mr-2 h-5 w-5" /> Request Certification
            </Link>
          </Button>
        )}
        
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents repository..." 
            className="pl-10 bg-secondary/20 border-white/5 h-12 rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {formsLoading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : filteredForms && filteredForms.length > 0 ? (
          filteredForms.map((form: any) => (
            <Card key={form.id} className="bg-card/40 border-white/5 hover:border-primary/20 transition-all group relative">
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteForm(form.id, form.title)} className="h-8 w-8 bg-black/50 hover:bg-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <CardHeader className="flex flex-row items-start gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors uppercase tracking-tight">{form.title}</CardTitle>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{form.category || 'General'}</span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{form.description}</p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button asChild variant="secondary" className="w-full h-11 font-bold rounded-none uppercase text-[10px] tracking-widest">
                  <Link href={form.fileUrl || '#'}>
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Fill Up
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-none bg-secondary/5">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Repository Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
