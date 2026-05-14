
'use server';
/**
 * @fileOverview An AI tool for administrators to generate comprehensive course content.
 * 
 * Satisfies the requirement for "Kumpleto ang impormasyon" (Complete Information)
 * by enriching minimal admin inputs into detailed curricula.
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
  summary: z.string().describe('A professional 3-sentence summary highlighting the core value proposition.'),
  description: z.string().describe('A comprehensive draft course description, highlighting what the course covers and its benefits.'),
  outline: z
    .array(z.string())
    .describe('A detailed course outline, with each element representing a key module or topic.'),
  learningOutcomes: z
    .array(z.string())
    .describe('Key learning outcomes students will achieve upon completing the course. Minimum of 5.'),
  faqs: z
    .array(z.object({
      question: z.string().describe('Common technical or administrative question students might have.'),
      answer: z.string().describe('Concise and helpful answer.'),
    }))
    .describe('A list of frequently asked questions for this specific technical domain.'),
  targetAudience: z
    .array(z.string())
    .describe('Labels or tags describing the ideal student profile for this course.'),
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
  prompt: `You are an AI assistant specialized in creating engaging and comprehensive course content for a modern tech training center called HardTech Academy.
Your task is to generate an architecturally complete course profile based on minimal provided keywords. 

To ensure the information is "Kumpleto" (Complete), you must provide:
1. A suggested title.
2. A professional 3-sentence summary for quick reading.
3. A detailed syllabus description.
4. A module-by-module course outline.
5. Exactly 5 clear learning objectives/outcomes.
6. A set of specific FAQs that address technical prerequisites or equipment needed.
7. Tags for the target audience.

The content should reflect the high-tech, innovative focus of HardTech Academy (specializing in board-level repair, robotics, and advanced IT).

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
