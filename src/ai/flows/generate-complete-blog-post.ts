'use server';
/**
 * @fileOverview A Genkit flow for generating a complete blog post based on a category.
 *
 * - generateCompleteBlogPost - A function that handles the blog post generation process.
 * - GenerateCompleteBlogPostInput - The input type for the generateCompleteBlogPost function.
 * - GenerateCompleteBlogPostOutput - The return type for the generateCompleteBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCompleteBlogPostInputSchema = z.object({
  category: z.string().describe('The category for which to generate the blog post.'),
});
export type GenerateCompleteBlogPostInput = z.infer<typeof GenerateCompleteBlogPostInputSchema>;

const GenerateCompleteBlogPostOutputSchema = z.object({
  blogContent: z.string().describe('The complete blog post content in Markdown format, engaging and humanized.'),
  seoData: z.object({
    title: z.string().describe('An SEO-optimized title for the blog post.'),
    description: z.string().describe('An SEO-optimized meta description for the blog post.'),
    keywords: z.array(z.string()).describe('A list of SEO keywords relevant to the blog post.'),
  }).describe('Search Engine Optimization data for the blog post.'),
  visualPlan: z.string().describe('A detailed plan for visual content (images, videos, infographics, etc.) to accompany the blog post, including suggestions for their placement and content.'),
  mediumAssets: z.object({
    featuredImageDescription: z.string().describe('A description suitable for generating or selecting a featured image for a Medium article.'),
    tags: z.array(z.string()).describe('A list of suggested tags for publishing on Medium.'),
    estimatedReadTimeMinutes: z.number().describe('The estimated read time of the blog post in minutes.'),
  }).describe('Suggested assets and metadata specifically for publishing on Medium.'),
});
export type GenerateCompleteBlogPostOutput = z.infer<typeof GenerateCompleteBlogPostOutputSchema>;

export async function generateCompleteBlogPost(input: GenerateCompleteBlogPostInput): Promise<GenerateCompleteBlogPostOutput> {
  return generateCompleteBlogPostFlow(input);
}

const blogPostPrompt = ai.definePrompt({
  name: 'generateCompleteBlogPostPrompt',
  input: {schema: GenerateCompleteBlogPostInputSchema},
  output: {schema: GenerateCompleteBlogPostOutputSchema},
  prompt: `You are an AI blog oracle specialized in generating comprehensive blog posts tailored to a given category.
Your task is to generate a complete blog post in Markdown format, including engaging and humanized text.
In addition to the blog content, you need to provide SEO-optimized data (title, meta description, and keywords), a detailed visual content plan, and specific assets/metadata suitable for publishing on platforms like Medium.

Focus on generating high-quality, relevant, and creative content for the given category.
Ensure the output adheres strictly to the JSON schema provided.

Category: {{{category}}}

Blog Content:
The blog content should be detailed, informative, and engaging. Use Markdown formatting including headings, subheadings, lists, bold text, and code blocks where appropriate. Aim for a substantial length that would warrant an estimated read time of at least 5-10 minutes.

Visual Plan:
Describe the type of images, videos, or infographics that would enhance the blog post. Include ideas for captions or specific content for these visuals, and suggest where they might be placed within the article.

Medium Assets:
Provide a concise description for a featured image, suitable for AI image generation or manual selection. Suggest 3-5 relevant tags for Medium. Estimate the read time in minutes based on the generated blog content (assume an average reading speed of 200 words per minute).`,
});

const generateCompleteBlogPostFlow = ai.defineFlow(
  {
    name: 'generateCompleteBlogPostFlow',
    inputSchema: GenerateCompleteBlogPostInputSchema,
    outputSchema: GenerateCompleteBlogPostOutputSchema,
  },
  async (input) => {
    const {output} = await blogPostPrompt(input);
    if (!output) {
      throw new Error('Failed to generate blog post output.');
    }
    return output;
  }
);
