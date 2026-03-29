
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateCompleteBlogPostOutput } from "@/ai/flows/generate-complete-blog-post";
import { MarkdownView } from "./MarkdownView";
import { ActionButtons } from "./ActionButtons";
import { FileText, Search, Image as ImageIcon, Share2, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContentTabsProps {
  data: GenerateCompleteBlogPostOutput;
}

export function ContentTabs({ data }: ContentTabsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="blog" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 h-14 rounded-2xl border border-border">
          <TabsTrigger value="blog" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Blog Post</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">SEO Data</span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden md:inline">Visual Plan</span>
          </TabsTrigger>
          <TabsTrigger value="medium" className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Medium</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="mt-6 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl min-h-[500px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/50">
               <div className="flex items-center gap-4 text-sm text-muted-foreground">
                 <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.mediumAssets.estimatedReadTimeMinutes} min read</span>
               </div>
               <ActionButtons content={data.blogContent} title={data.seoData.title} />
            </div>
            <MarkdownView content={data.blogContent} />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" /> Meta Title
              </h3>
              <p className="text-foreground p-4 bg-background/50 rounded-xl border border-border">{data.seoData.title}</p>
              
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary mt-6">
                <Search className="w-5 h-5" /> Meta Description
              </h3>
              <p className="text-muted-foreground p-4 bg-background/50 rounded-xl border border-border leading-relaxed">{data.seoData.description}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-accent mb-4">
                <Tag className="w-5 h-5" /> Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.seoData.keywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1 bg-primary/5 hover:bg-primary/10 border-primary/30 transition-colors">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visual" className="mt-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
             <h3 className="text-xl font-bold text-primary">Content Enhancement Plan</h3>
             <div className="prose prose-invert max-w-none">
                <div className="p-6 bg-muted/20 rounded-2xl border border-border/50 leading-loose text-muted-foreground whitespace-pre-wrap">
                  {data.visualPlan}
                </div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="medium" className="mt-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Featured Image Prompt</h3>
              <p className="p-4 bg-muted/30 rounded-xl border border-border italic text-muted-foreground">
                "{data.mediumAssets.featuredImageDescription}"
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Platform Tags</h3>
              <div className="flex flex-wrap gap-2">
                {data.mediumAssets.tags.map((tag, i) => (
                  <Badge key={i} className="bg-accent text-white px-3 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-border flex items-center gap-4 opacity-70">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                 <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ready for Medium</p>
                <p className="text-xs text-muted-foreground">Estimated publication length: {data.blogContent.split(' ').length} words.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
