
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Clock, BookOpen, Star, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Official <span className="text-primary">Training Directory</span></h1>
        <p className="text-muted-foreground">Elite technical curriculum designed to bridge academic theory with high-stakes industrial practice. Accredited by HardTech Academy.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search technical courses..." className="pl-10 bg-secondary/30" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-secondary/20"><Filter className="h-4 w-4 mr-2" /> All Categories</Button>
          <Button variant="outline" size="sm" className="bg-secondary/20">All Levels</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSES.map((course) => {
          const image = PlaceHolderImages.find(img => img.id === course.imageId);
          return (
            <Card key={course.id} className="flex flex-col bg-card/60 border-white/5 card-hover overflow-hidden backdrop-blur-sm group">
              <div className="relative h-56 w-full">
                {image && (
                  <Image 
                    src={image.imageUrl} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-md">{course.category}</Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-accent" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-white/10">{course.level}</Badge>
                </div>
                <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-white/5 pt-4">
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
                <Button asChild className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  <Link href={`/courses/${course.id}`}>Review Syllabus</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
