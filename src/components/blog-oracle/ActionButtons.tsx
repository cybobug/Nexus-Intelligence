
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionButtonsProps {
  content: string;
  title: string;
}

export function ActionButtons({ content, title }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    document.body.appendChild(element);
    element.click();
    toast({
      description: `Downloaded as .${format}`,
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCopy}
        className="rounded-xl border-border hover:bg-muted/50 transition-all flex items-center gap-2"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied" : "Copy MD"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-border hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl bg-card border-border">
          <DropdownMenuItem onClick={() => handleDownload('md')} className="flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('txt')} className="flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Plain Text (.txt)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
