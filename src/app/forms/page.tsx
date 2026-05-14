
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Info, Search, Send, FileCheck, ShieldCheck, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  // Admin Edit State
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);

  const formsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'public_forms'), orderBy('title', 'asc'));
  }, [firestore]);

  const { data: forms, loading } = useCollection(formsQuery);

  const isAdmin = user?.role === 'admin';

  const filteredForms = forms?.filter(f => 
    f.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newTitle.trim()) return;

    setIsAdding(true);
    const formData = {
      title: newTitle,
      category: newCategory,
      description: newDescription,
      fileUrl: newFileUrl || '#'
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
      .then(() => {
        toast({ title: "Document Removed", description: `${formTitle} has been deleted.` });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `public_forms/${formId}`,
          operation: 'delete'
        }));
      });
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingForm) return;

    setIsUpdating(true);
    const formRef = doc(firestore, 'public_forms', editingForm.id);
    const updateData = {
      title: editingForm.title,
      category: editingForm.category,
      description: editingForm.description,
      fileUrl: editingForm.fileUrl
    };

    updateDoc(formRef, updateData)
      .then(() => {
        toast({ title: "Document Updated", description: "Changes have been saved successfully." });
        setEditingForm(null);
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `public_forms/${editingForm.id}`,
          operation: 'update',
          requestResourceData: updateData
        }));
      })
      .finally(() => setIsUpdating(false));
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight uppercase">
          Public Service <span className="text-primary">Forms</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Access essential technical documents or submit digital service requests to the academy.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-16 border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" /> Form Management Console
            </CardTitle>
            <CardDescription>Upload metadata for new downloadable documents into the Academy repository.</CardDescription>
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
                    className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                  <Input 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)} 
                    placeholder="e.g. Administrative" 
                    className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">File URL (Mock)</Label>
                  <Input 
                    value={newFileUrl} 
                    onChange={(e) => setNewFileUrl(e.target.value)} 
                    placeholder="https://storage..." 
                    className="bg-background/50 h-12 border-primary/20 rounded-none focus:border-primary" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</Label>
                <Textarea 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="Brief explanation of the form's purpose..." 
                  className="bg-background/50 border-primary/20 rounded-none focus:border-primary min-h-[80px]" 
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isAdding} 
                  className="h-12 px-10 font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground rounded-none uppercase text-xs tracking-widest"
                >
                  {isAdding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Register Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="bg-primary/5 border-primary/20 shadow-xl shadow-primary/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileCheck className="h-24 w-24 text-primary" />
          </div>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
              <Send className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-headline uppercase tracking-tight">Request for Certificate</CardTitle>
            <CardDescription className="text-primary/70">Fast-track your official certification process with our digital request portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Submit your training details for verification. Once approved, your certificate will be generated and issued via your registered email address.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full h-12 font-bold bg-primary text-primary-foreground rounded-none uppercase text-xs tracking-widest">
              <Link href="/forms/certificate-request">Open Digital Request Form</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/20 border-border/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground uppercase tracking-tight">System Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Info className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              We are digitizing our entire administrative process. All document records are synced with our secure central registry.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md mx-auto mb-16">
        <h2 className="text-xl font-bold mb-8 text-center uppercase tracking-widest text-muted-foreground">Downloadable Documents</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents by name..." 
            className="pl-10 bg-secondary/20 border-white/5 h-12 rounded-none focus:border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold uppercase text-xs tracking-widest">Loading document repository...</p>
        </div>
      ) : filteredForms && filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredForms.map((form: any) => (
            <Card key={form.id} className="bg-card/40 border-white/5 hover:border-primary/20 transition-all group relative">
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Dialog open={!!editingForm && editingForm.id === form.id} onOpenChange={(open) => !open && setEditingForm(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingForm(form)} className="h-8 w-8 bg-black/50 hover:bg-primary hover:text-primary-foreground">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-primary/20 sm:max-w-[425px] rounded-none">
                      <DialogHeader>
                        <DialogTitle className="uppercase tracking-widest text-primary">Modify Document Data</DialogTitle>
                        <DialogDescription>Update the repository record for this technical document.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateForm} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Title</Label>
                          <Input 
                            value={editingForm?.title || ''} 
                            onChange={(e) => setEditingForm({...editingForm, title: e.target.value})}
                            className="bg-background/50 border-primary/20 rounded-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                          <Input 
                            value={editingForm?.category || ''} 
                            onChange={(e) => setEditingForm({...editingForm, category: e.target.value})}
                            className="bg-background/50 border-primary/20 rounded-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">File URL</Label>
                          <Input 
                            value={editingForm?.fileUrl || ''} 
                            onChange={(e) => setEditingForm({...editingForm, fileUrl: e.target.value})}
                            className="bg-background/50 border-primary/20 rounded-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</Label>
                          <Textarea 
                            value={editingForm?.description || ''} 
                            onChange={(e) => setEditingForm({...editingForm, description: e.target.value})}
                            className="bg-background/50 border-primary/20 rounded-none min-h-[100px]"
                          />
                        </div>
                        <Button type="submit" disabled={isUpdating} className="w-full bg-primary text-primary-foreground uppercase font-bold text-xs tracking-widest h-12 rounded-none">
                          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Commit Changes
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteForm(form.id, form.title)} 
                    className="h-8 w-8 bg-black/50 hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <CardHeader className="flex flex-row items-start gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors uppercase tracking-tight">{form.title}</CardTitle>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{form.category || 'General'}</span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {form.description}
                </p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="secondary" className="w-full h-11 font-bold rounded-none uppercase text-[10px] tracking-widest">
                  <Download className="mr-2 h-4 w-4" /> Download Document
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-secondary/5 border-white/5">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">Repository Empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No public service forms match your current search.</p>
        </div>
      )}
    </div>
  );
}
