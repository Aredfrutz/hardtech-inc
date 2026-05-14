'use server';
/**
 * @fileOverview An AI tool for administrators to generate official academy announcements.
 *
 * - generateAnnouncementContent - A function that generates announcement drafts.
 * - AnnouncementGeneratorInput - The input type for the generator.
 * - AnnouncementGeneratorOutput - The return type for the generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnnouncementGeneratorInputSchema = z.object({
  topic: z
    .string()
    .describe('The core topic or keywords for the announcement, e.g., "New lab opening" or "System maintenance".'),
});
export type AnnouncementGeneratorInput = z.infer<typeof AnnouncementGeneratorInputSchema>;

const AnnouncementGeneratorOutputSchema = z.object({
  title: z.string().describe('A professional, high-impact title for the announcement.'),
  body: z.string().describe('The full body content of the announcement, written in a technical and authoritative tone.'),
});
export type AnnouncementGeneratorOutput = z.infer<typeof AnnouncementGeneratorOutputSchema>;

export async function generateAnnouncementContent(
  input: AnnouncementGeneratorInput
): Promise<AnnouncementGeneratorOutput> {
  return announcementGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'announcementGeneratorPrompt',
  input: {schema: AnnouncementGeneratorInputSchema},
  output: {schema: AnnouncementGeneratorOutputSchema},
  prompt: `You are an expert technical communications officer for HardTech Academy.
Your task is to generate a professional, authoritative, and high-impact announcement based on the provided topic or keywords.

The tone should be technical, innovative, and clean. Use uppercase headings where appropriate for emphasis. Ensure the content reflects the high-tech focus of HardTech Academy (specializing in board-level repair, robotics, and advanced IT).

Topic/Keywords: {{{topic}}}`,
});

const announcementGeneratorFlow = ai.defineFlow(
  {
    name: 'announcementGeneratorFlow',
    inputSchema: AnnouncementGeneratorInputSchema,
    outputSchema: AnnouncementGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
