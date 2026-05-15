
"use client"

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Wrench,
  ShieldCheck,
  Zap
} from 'lucide-react';

function EnrollmentFormContent() {
  const searchParams = useSearchParams();
  const initialCourse = searchParams.get('course') || '';
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    course: initialCourse,
    experience: '',
    terms: false
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    // Simulation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast({
      title: "Transmission Successful",
      description: "Application logged in Academy Registry.",
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center px-4">
        <div className="mb-12 flex justify-center">
          <div className="h-24 w-24 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Registry Synchronized</h1>
        <p className="text-muted-foreground mb-12 uppercase text-[10px] font-bold tracking-[0.2em] leading-relaxed">
          Application for <strong className="text-white">{formData.course || 'Technical Program'}</strong> received.<br />
          Reference: <span className="text-primary">HT-APL-{Math.floor(Math.random() * 900000) + 100000}</span>
        </p>
        <Button asChild size="lg" className="bg-primary text-black font-bold uppercase tracking-widest rounded-none h-14 px-12">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    );
  }

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <div className="mb-16 text-center space-y-4">
        <h1 className="text-5xl font-black mb-4 font-headline uppercase tracking-tighter">
          Pioneer <span className="text-primary">Enrollment</span>
        </h1>
        <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest opacity-60">
          Professional Hardware Repair Certification Registry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="mb-8 space-y-2">
             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-2">
                <span className="text-primary">Step {step} of 3</span>
                <span className="text-muted-foreground">{step === 1 ? 'Personal Profile' : step === 2 ? 'Technical Background' : 'Course Selection'}</span>
             </div>
             <Progress value={progress} className="h-1 bg-secondary rounded-none" />
          </div>

          <Card className="bg-card border-white/5 rounded-none shadow-2xl overflow-hidden">
            <CardHeader className="bg-secondary/10 p-8 border-b border-white/5">
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-3">
                 {step === 1 && <User className="h-5 w-5 text-primary" />}
                 {step === 2 && <Wrench className="h-5 w-5 text-primary" />}
                 {step === 3 && <ShieldCheck className="h-5 w-5 text-primary" />}
                 {step === 1 ? 'Operator Identity' : step === 2 ? 'Technical Assessment' : 'Curriculum Selection'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">First Name</Label>
                        <Input value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} required className="h-12 bg-secondary/20 border-white/10 rounded-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Last Name</Label>
                        <Input value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} required className="h-12 bg-secondary/20 border-white/10 rounded-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
                      <Input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} required className="h-12 bg-secondary/20 border-white/10 rounded-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
                      <Input value={formData.phone} onChange={e => updateField('phone', e.target.value)} required className="h-12 bg-secondary/20 border-white/10 rounded-none focus:border-primary" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Experience Level (Electronics/IT)</Label>
                      <Select defaultValue="beginner" onValueChange={val => updateField('experienceLevel', val)}>
                        <SelectTrigger className="h-12 bg-secondary/20 border-white/10 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10">
                          <SelectItem value="beginner">Entry Level (No Experience)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (Basic Repair Skills)</SelectItem>
                          <SelectItem value="advanced">Advanced (Micro-soldering Skills)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Detailed Background / Motivation</Label>
                      <Textarea value={formData.experience} onChange={e => updateField('experience', e.target.value)} className="min-h-[150px] bg-secondary/20 border-white/10 rounded-none focus:border-primary" required />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Target Program</Label>
                      <Select defaultValue={formData.course} onValueChange={val => updateField('course', val)}>
                        <SelectTrigger className="h-12 bg-secondary/20 border-white/10 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10">
                          <SelectItem value="logic-board">iPhone Logic Board Repair</SelectItem>
                          <SelectItem value="micro-soldering">Advanced Micro-Soldering</SelectItem>
                          <SelectItem value="macbook">MacBook Power Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-start space-x-3 pt-4 p-4 bg-primary/5 border border-primary/20">
                      <Checkbox id="terms" checked={formData.terms} onCheckedChange={val => updateField('terms', val)} required className="mt-1" />
                      <label htmlFor="terms" className="text-[10px] font-bold uppercase tracking-tight leading-relaxed opacity-70">
                        I confirm that the data provided is accurate and I agree to the Academy's technical code of conduct.
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-8 border-t border-white/5">
                  <Button type="button" variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary disabled:opacity-30">
                    <ArrowLeft className="h-3 w-3 mr-2" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary text-black font-bold uppercase text-[10px] tracking-widest px-8 rounded-none h-12">
                    {isSubmitting ? 'Syncing...' : step === 3 ? 'Execute Enrollment' : 'Next Protocol'}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-secondary/10 border border-white/5 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
                 <Zap className="h-3 w-3" /> Registration Path
              </h3>
              <ul className="space-y-8 relative">
                {[1, 2, 3].map((s) => (
                  <li key={s} className="flex gap-4 items-start relative z-10">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${step >= s ? 'bg-primary text-black' : 'bg-white/10 text-white/30'}`}>
                      {s}
                    </div>
                    <div className={step >= s ? 'opacity-100' : 'opacity-30'}>
                      <p className="text-[10px] font-bold uppercase tracking-tight">Step {s}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{s === 1 ? 'Identity' : s === 2 ? 'Technical' : 'Selection'}</p>
                    </div>
                  </li>
                ))}
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/5 -z-0" />
              </ul>
           </div>

           <div className="p-8 bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest">Enrollment Support</p>
              <p className="text-[11px] leading-relaxed uppercase opacity-70 font-bold">
                Need technical guidance? Chat with our Admissions Faculty for program placement advice.
              </p>
              <Button variant="link" className="px-0 h-auto text-primary text-[10px] uppercase font-black mt-4 underline-offset-4 decoration-2">
                Talk to an Expert
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]"><Zap className="h-8 w-8 animate-pulse text-primary" /></div>}>
      <EnrollmentFormContent />
    </Suspense>
  );
}
