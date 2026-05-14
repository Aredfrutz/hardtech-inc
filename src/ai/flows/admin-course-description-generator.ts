'use server';
/**
 * @fileOverview An AI tool for administrators to generate draft course descriptions, outlines, and learning outcomes.
 *
 * - generateCourseContent - A function that generates comprehensive course content.
 * - AdminCourseDescriptionInput - The input type for the generateCourseContent function.
 * - AdminCourseDescriptionOutput - The return type for the generateCourseContent function.
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
  description: z.string().describe('A comprehensive draft course description, highlighting what the course covers and its benefits.'),
  outline: z
    .array(z.string())
    .describe('A detailed course outline, with each element representing a key module or topic.'),
  learningOutcomes: z
    .array(z.string())
    .describe('Key learning outcomes students will achieve upon completing the course.'),
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
Your task is to generate a course title, a detailed course description, a structured outline, and clear learning outcomes based on the provided keywords.

The course should be designed for students interested in technology and advanced skills, fitting the profile of HardTech Academy.
Make sure the content is professional, engaging, and reflects the high-tech, innovative focus of HardTech Academy.

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
