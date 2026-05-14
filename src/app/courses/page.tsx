import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Clock, BookOpen, UserCheck, Star } from 'lucide-react';

const COURSES = [
  {
    id: 'ai-engineering',
    title: 'Advanced AI & Machine Learning',
    category: 'Artificial Intelligence',
    duration: '12 Weeks',
    level: 'Advanced',
    description: 'Master large language models, neural networks, and generative AI systems with hands-on projects.',
    imageId: 'course-ai',
    rating: 4.9
  },
  {
    id: 'robotics-systems',
    title: 'Industrial Robotics & Automation',
    category: 'Robotics',
    duration: '16 Weeks',
    level: 'Intermediate',
    description: 'Design, build, and program industrial-grade robotic systems using ROS and modern hardware.',
    imageId: 'course-robotics',
    rating: 4.8
  },
  {
    id: 'full-stack-hardtech',
    title: 'High-Performance Systems Engineering',
    category: 'Software Engineering',
    duration: '10 Weeks',
    level: 'Pro',
    description: 'Learn to build ultra-low latency systems, optimized for hardware efficiency and scalability.',
    imageId: 'course-coding',
    rating: 5.0
  }
];

export default function CourseCatalog() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Our <span className="text-primary">Training Programs</span></h1>
        <p className="text-muted-foreground">Choose from our intensive courses designed to bridge the gap between academic theory and high-tech industry practice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSES.map((course) => {
          const image = PlaceHolderImages.find(img => img.id === course.imageId);
          return (
            <Card key={course.id} className="flex flex-col bg-card border-border/40 card-hover overflow-hidden">
              <div className="relative h-56 w-full">
                {image && (
                  <Image 
                    src={image.imageUrl} 
                    alt={course.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">{course.category}</Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-accent" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{course.level}</Badge>
                </div>
                <CardTitle className="text-2xl font-headline group-hover:text-primary">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>12 Modules</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  <Link href={`/courses/${course.id}`}>View Program Details</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-card to-background border text-center">
        <h2 className="text-3xl font-bold mb-4 font-headline">Can't find what you're looking for?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Our curriculum evolves fast. Sign up for our newsletter to get notified when we launch new specialized tech modules.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="bg-secondary/50 border border-border rounded-lg px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="bg-primary text-primary-foreground">Subscribe</Button>
        </div>
      </div>
    </div>
  );
}