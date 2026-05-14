'use server';
/**
 * @fileOverview A Genkit flow to summarize forum discussions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForumSummarizerInputSchema = z.object({
  replies: z.array(z.string()).describe('A list of reply contents from the forum thread.'),
});
export type ForumSummarizerInput = z.infer<typeof ForumSummarizerInputSchema>;

const ForumSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise, bulleted summary of the core arguments or solutions discussed.'),
});
export type ForumSummarizerOutput = z.infer<typeof ForumSummarizerOutputSchema>;

export async function summarizeForumThread(input: ForumSummarizerInput): Promise<ForumSummarizerOutput> {
  return forumSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forumSummarizerPrompt',
  input: {schema: ForumSummarizerInputSchema},
  output: {schema: ForumSummarizerOutputSchema},
  prompt: `You are an expert technical moderator and analyst for HardTech Academy.
Your task is to analyze the provided discussion replies and generate a concise, professional, bulleted summary of the core arguments, technical solutions, or key insights shared in the thread.

If there are no replies, or the replies contain no useful information, state that clearly.

Discussion Replies:
{{#each replies}}
- {{{this}}}
{{/each}}`,
});

const forumSummarizerFlow = ai.defineFlow(
  {
    name: 'forumSummarizerFlow',
    inputSchema: ForumSummarizerInputSchema,
    outputSchema: ForumSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
