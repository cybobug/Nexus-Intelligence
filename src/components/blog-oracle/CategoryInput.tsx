
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryInputProps {
  onGenerate: (category: string) => void;
}

export function CategoryInput({ onGenerate }: CategoryInputProps) {
  const [category, setCategory] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim()) {
      onGenerate(category.trim());
    }
  };

  return (
    <motion.div 
      className="relative group"
      animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div className="relative">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="E.g., Sustainable Tech, Future of Remote Work, AI Ethics..."
            className="h-16 px-6 py-4 text-xl rounded-2xl bg-card border-2 border-border focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 shadow-2xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <Sparkles className="w-6 h-6 text-muted-foreground/30" />
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={!category.trim()}
          className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(220,20,60,0.4)] group overflow-hidden relative transition-all active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Consult the Oracle
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </span>
          <motion.div 
            className="absolute inset-0 bg-accent/20"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </Button>
      </form>
      
      {/* Decorative Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-3xl" />
    </motion.div>
  );
}
