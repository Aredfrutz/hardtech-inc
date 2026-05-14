import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, ArrowLeft, Clock, BarChart, BookOpen, Info } from 'lucide-react';

const COURSES_DATA = {
  'ai-engineering': {
    title: 'Advanced AI & Machine Learning',
    category: 'Artificial Intelligence',
    level: 'Advanced',
    duration: '12 Weeks',
    format: 'Hybrid',
    description: 'An intensive, project-driven course focusing on the architecture and implementation of modern AI systems. Students will move beyond basic libraries to building their own custom models and fine-tuning large-scale architectures.',
    outline: [
      'Foundations of Neural Networks & Calculus',
      'Advanced Python for Data Science',
      'Transformer Architectures & Attention Mechanisms',
      'Fine-tuning Large Language Models (LLMs)',
      'Generative Adversarial Networks (GANs)',
      'Deployment: Scale & Performance Optimization'
    ],
    outcomes: [
      'Ability to design custom neural network architectures.',
      'Proficiency in fine-tuning BERT, GPT, and Llama models.',
      'Deep understanding of ML Ops and production deployment.',
      'Portfolio of 3 production-grade AI projects.'
    ],
    prerequisites: 'Strong Python proficiency, solid foundation in linear algebra and statistics.',
    imageId: 'course-ai'
  },
  'robotics-systems': {
    title: 'Industrial Robotics & Automation',
    category: 'Robotics',
    level: 'Intermediate',
    duration: '16 Weeks',
    format: 'In-Person',
    description: 'Bridge the gap between hardware and software. This course provides hands-on experience with industrial robotic arms, sensors, and the Robot Operating System (ROS).',
    outline: [
      'Robotics Fundamentals & Kinematics',
      'Sensors and Perception Systems',
      'Introduction to ROS (Robot Operating System)',
      'Path Planning & Obstacle Avoidance',
      'Actuators & Control Systems',
      'Final Project: Autonomous Warehouse Navigation'
    ],
    outcomes: [
      'Hands-on experience with UR5 and Fanuc robotic arms.',
      'Complete proficiency in ROS2 and Gazebo simulation.',
      'Understanding of industrial safety standards (ISO 10218).',
      'Development of custom firmware for IoT integration.'
    ],
    prerequisites: 'Basic C++ or Python knowledge, introductory physics.',
    imageId: 'course-robotics'
  },
  'full-stack-hardtech': {
    title: 'High-Performance Systems Engineering',
    category: 'Software Engineering',
    level: 'Pro',
    duration: '10 Weeks',
    format: 'Virtual',
    description: 'For software engineers who want to go deeper. We focus on low-level optimization, memory management, and high-concurrency architectures. This isn\'t just about writing code; it\'s about crafting hardware-efficient solutions.',
    outline: [
      'Low-Level Systems & Computer Architecture',
      'Memory Management & Garbage Collection Deep Dive',
      'Concurrency Patterns: Go Routines vs. Threads',
      'Networking Protocols & Latency Reduction',
      'Database Internals & Performance Tuning',
      'Site Reliability Engineering at Scale'
    ],
    outcomes: [
      'Mastery of system-level performance profiling.',
      'Ability to build systems handling 1M+ req/sec.',
      'Deep knowledge of distributed systems consistency.',
      'SRE certification from HardTech Academy.'
    ],
    prerequisites: '2+ years professional software development experience.',
    imageId: 'course-coding'
  }
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = COURSES_DATA[params.id as keyof typeof COURSES_DATA];

  if (!course) {
    notFound();
  }

  const image = PlaceHolderImages.find(img => img.id === course.imageId);

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 mb-4 px-3 py-1 border-primary/30">
              {course.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline">{course.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
              <span className="font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {course.duration}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Level</span>
              <span className="font-bold flex items-center gap-2"><BarChart className="h-4 w-4 text-accent" /> {course.level}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Format</span>
              <span className="font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {course.format}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Certification</span>
              <span className="font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Yes</span>
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/50 border-b rounded-none h-12 p-0 mb-8">
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-8">Curriculum</TabsTrigger>
              <TabsTrigger value="outcomes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-8">Outcomes</TabsTrigger>
              <TabsTrigger value="prerequisites" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-8">Requirements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Course Outline</h3>
              <div className="space-y-4">
                {course.outline.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-card border border-border/50">
                    <span className="font-mono text-primary font-bold">0{index + 1}</span>
                    <p className="font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="outcomes" className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">What you'll achieve</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.outcomes.map((outcome, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="prerequisites" className="space-y-6">
              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-accent" />
                  <h3 className="text-2xl font-bold">Prerequisites</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {course.prerequisites}
                </p>
                <div className="mt-6 p-4 bg-background/50 rounded-lg text-sm italic">
                  Note: If you are unsure if you meet these requirements, please contact our admissions team for a technical assessment.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar / Enrollment Card */}
        <div className="space-y-8">
          <div className="sticky top-24">
            <div className="rounded-2xl border bg-card overflow-hidden shadow-2xl shadow-primary/5">
              <div className="relative h-48 w-full">
                {image && (
                  <Image src={image.imageUrl} alt={course.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-8">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold">$1,299</span>
                  <span className="text-sm text-muted-foreground line-through">$1,800</span>
                  <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">25% OFF</Badge>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Cohort</span>
                    <span className="font-semibold">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seats Left</span>
                    <span className="text-primary font-bold">8 Remaining</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-semibold">English</span>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg">
                  <Link href={`/enroll?course=${params.id}`}>Enroll Now</Link>
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-4">
                  Secure checkout powered by Stripe. 14-day money back guarantee.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 rounded-xl border border-dashed border-muted-foreground/30 text-center">
              <h4 className="font-bold mb-2">Corporate Training?</h4>
              <p className="text-sm text-muted-foreground mb-4">We offer customized programs for teams and enterprises.</p>
              <Button variant="outline" size="sm" className="w-full">Inquire about Team Rates</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}