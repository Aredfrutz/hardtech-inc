"use client"

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, BookOpen, Send, CheckCircle2 } from 'lucide-react';

function EnrollmentFormContent() {
  const searchParams = useSearchParams();
  const initialCourse = searchParams.get('course') || '';
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast({
      title: "Application Submitted",
      description: "We've received your enrollment request. Our admissions team will review it shortly.",
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your application for <strong>{initialCourse || 'your selected course'}</strong> has been received. 
          Check your email for a confirmation and next steps.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 font-headline">Join <span className="text-primary">HardTech Academy</span></h1>
        <p className="text-muted-foreground">Complete the form below to begin your journey. All applications are reviewed for technical readiness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Enrollment Application</CardTitle>
              <CardDescription>All fields are required unless marked optional.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="first-name" placeholder="Jane" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="last-name" placeholder="Doe" className="pl-10" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="jane.doe@example.com" className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Select Program</Label>
                  <Select defaultValue={initialCourse}>
                    <SelectTrigger className="w-full bg-secondary/30">
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-engineering">Advanced AI & Machine Learning</SelectItem>
                      <SelectItem value="robotics-systems">Industrial Robotics & Automation</SelectItem>
                      <SelectItem value="full-stack-hardtech">High-Performance Systems Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Relevant Experience</Label>
                  <Textarea 
                    id="experience" 
                    placeholder="Briefly describe your technical background or current role..." 
                    className="min-h-[120px] bg-secondary/30"
                    required
                  />
                </div>

                <div className="flex items-start space-x-2 py-4">
                  <Checkbox id="terms" required />
                  <label 
                    htmlFor="terms" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the terms and conditions and the student code of conduct.
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground h-12 text-lg hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing Application..." : "Submit Application"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-secondary/50 border border-border">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Application Process
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <p className="font-semibold text-sm">Submit Form</p>
                  <p className="text-xs text-muted-foreground">Fill in your details and selected program.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <p className="font-semibold text-sm">Review</p>
                  <p className="text-xs text-muted-foreground">Our instructors review your technical experience.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <p className="font-semibold text-sm">Assessment</p>
                  <p className="text-xs text-muted-foreground">Short 15-min technical screening (if required).</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <div>
                  <p className="font-semibold text-sm">Payment</p>
                  <p className="text-xs text-muted-foreground">Secure your spot with deposit or full payment.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">Our admissions advisors are here to help you choose the right path.</p>
            <Button variant="link" className="p-0 text-accent h-auto">Chat with us</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading...</div>}>
      <EnrollmentFormContent />
    </Suspense>
  );
}