
'use server';
/**
 * @fileOverview An AI tool for administrators to generate comprehensive course content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminCourseDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('Minimal keywords or a short phrase describing the course, e.g., "Advanced AI, Machine Learning, Python".'),
});
export type AdminCourseDescriptionInput = z.infer<typeof AdminCourseDescriptionInputSchema>;

const AdminCourseDescriptionOutputSchema = z.object({
  courseTitle: z.string().describe('A suggested, engaging title for the course.'),
  ncLevel: z.string().describe('Estimated TESDA NC Level (e.g., NC II, NC III).'),
  summary: z.string().describe('A professional 3-sentence summary highlighting the core value proposition.'),
  description: z.string().describe('A comprehensive draft course description.'),
  modules: z.array(z.object({
    day: z.string().describe('Day or Week number.'),
    topic: z.string().describe('Module title.'),
    details: z.string().describe('Detailed sub-topics covered.'),
  })).describe('A day-by-day or week-by-week lesson plan.'),
  prerequisites: z.array(z.string()).describe('Required prior knowledge or certificates.'),
  requiredTools: z.array(z.string()).describe('Tools students must bring or use.'),
  learningOutcomes: z.array(z.string()).describe('Key learning outcomes. Minimum of 5.'),
  faqs: z.array(z.object({
    question: z.string().describe('Common technical or administrative question.'),
    answer: z.string().describe('Concise answer.'),
  })).describe('Frequently asked questions.'),
  targetAudience: z.array(z.string()).describe('Ideal student profile tags.'),
});
export type AdminCourseDescriptionOutput = z.infer<typeof AdminCourseDescriptionOutputSchema>;

export async function generateCourseContent(
  input: AdminCourseDescriptionInput
): Promise<AdminCourseDescriptionOutput> {
  return adminCourseDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminCourseDescriptionPrompt',
  input: {schema: AdminCourseDescriptionInputSchema},
  output: {schema: AdminCourseDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in creating engaging and comprehensive course content for HardTech Academy (specializing in board-level electronics repair).

To ensure the information is "Kumpleto" (Complete), you must provide:
1. A suggested title and estimated NC Level.
2. A professional 3-sentence summary.
3. A module-by-module LESSON PLAN (Day/Week, Topic, Details).
4. Prerequisite skills and mandatory tools for students.
5. Exactly 5 clear learning objectives.
6. A set of domain-specific FAQs.
7. Tags for the target audience.

The content should reflect a high-tech, innovative focus on microsoldering, robotics, and hardware engineering.

Keywords for the course: {{{keywords}}}`,
});

const adminCourseDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'adminCourseDescriptionGeneratorFlow',
    inputSchema: AdminCourseDescriptionInputSchema,
    outputSchema: AdminCourseDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
