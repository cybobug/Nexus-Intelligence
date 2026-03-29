"use client";

import { useState } from "react";
import { CategoryInput } from "@/components/blog-oracle/CategoryInput";
import { StatusView } from "@/components/blog-oracle/StatusView";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, FileText, CheckCircle, Edit3, Wand2, Copy, Check, ShieldCheck, Globe, Zap } from "lucide-react";

type AppStep = "idle" | "researching" | "ideas_ready" | "titles_ready" | "outlining" | "outline_ready" | "writing" | "completed";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Sub-components for better organization ---

const BackgroundDecor = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
    <Icon className="w-5 h-5 text-red-500" />
    <h4 className="font-bold text-sm">{title}</h4>
    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

// --- Main Component ---

export default function Home() {
  const [step, setStep] = useState<AppStep>("idle");
  const [category, setCategory] = useState("");
  const [ideas, setIdeas] = useState("");
  const [selectedIdea, setSelectedIdea] = useState("");
  const [titles, setTitles] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [outline, setOutline] = useState("");
  const [finalBlog, setFinalBlog] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return String(error);
  };

  const processStream = async (response: Response, dataKey: string, onUpdate: (data: string) => void) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("Stream not available");
    let accumulated = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data[dataKey]) {
              accumulated = data[dataKey];
              onUpdate(accumulated);
            }
          } catch (err) { }
        }
      }
    }
    return accumulated;
  };

  const startResearch = async (cat: string) => {
    setCategory(cat);
    setError(null);
    setStep("researching");
    try {
      const res = await fetch(`${API_BASE_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat }),
      });
      if (!res.ok) throw new Error("Failed to fetch ideas");
      const data = await res.json();
      setIdeas(data.ideas);
      setStep("ideas_ready");
    } catch (e) {
      setError(getErrorMessage(e) || "Failed to research ideas.");
      setStep("idle");
    }
  };

  const generateTitles = async () => {
    if (!selectedIdea.trim()) return;
    setError(null);
    setStep("researching");
    try {
      const res = await fetch(`${API_BASE_URL}/api/titles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_idea: selectedIdea }),
      });
      if (!res.ok) throw new Error("Failed to fetch titles");
      const data = await res.json();
      setTitles(data.titles);
      setStep("titles_ready");
    } catch (e) {
      setError(getErrorMessage(e) || "Failed to generate titles.");
      setStep("ideas_ready");
    }
  };

  const generateOutline = async () => {
    if (!selectedTitle.trim()) return;
    setError(null);
    setStep("outlining");
    try {
      const response = await fetch(`${API_BASE_URL}/api/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_title: selectedTitle }),
      });
      await processStream(response, "outline", setOutline);
      setStep("outline_ready");
    } catch (e) {
      setError(getErrorMessage(e) || "Failed to generate outline.");
      setStep("titles_ready");
    }
  };

  const generateFinalBlog = async () => {
    setError(null);
    setStep("writing");
    try {
      const response = await fetch(`${API_BASE_URL}/api/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: selectedTitle, outline }),
      });
      await processStream(response, "blog", setFinalBlog);
      setStep("completed");
    } catch (e) {
      setError(getErrorMessage(e) || "Failed to generate blog.");
      setStep("outline_ready");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalBlog);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetApp = () => {
    setCategory("");
    setIdeas("");
    setSelectedIdea("");
    setTitles("");
    setSelectedTitle("");
    setOutline("");
    setFinalBlog("");
    setError(null);
    setStep("idle");
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-white p-8 font-[family-name:var(--font-geist-sans)] selection:bg-red-500/30">
      <BackgroundDecor />

      <div className="max-w-4xl mx-auto space-y-12 py-12">
        {/* HEADER */}
        <header className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" /> Agentic Intelligence
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Agentic Scribe
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Transform raw concepts into SEO-optimized, globally relevant stories with autonomous precision.
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* STEP 0: Idle State with Features */}
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <section className="max-w-2xl mx-auto">
                <CategoryInput onGenerate={startResearch} />
              </section>

              {/* Added Features Section to fill the empty space */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                <FeatureCard
                  icon={Zap}
                  title="Deep Research"
                  desc="Agents scan real-time trends to find unique angles."
                />
                <FeatureCard
                  icon={Globe}
                  title="GEO Optimized"
                  desc="Localized examples tailored for global relevance."
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Plagiarism Free"
                  desc="100% original synthesis with a human-like voice."
                />
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {(step === "researching" || step === "outlining" || step === "writing") && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20">
              <StatusView
                status="generating"
                message={
                  step === "researching" ? "Hunting for viral trends..." :
                    step === "outlining" ? "Architecting your masterpiece..." :
                      "Ghostwriting your story..."
                }
              />
            </motion.div>
          )}

          {/* STEP 1: Ideas Discovery */}
          {step === "ideas_ready" && (
            <motion.div key="ideas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wand2 className="text-red-500" /> 1. Research Discovery
                </h2>
                <div className="prose prose-invert max-w-none bg-black/40 p-6 rounded-2xl border border-white/5 max-h-[400px] overflow-y-auto scrollbar-hide">
                  <ReactMarkdown
                    components={{
                      ol: ({ ...props }) => <ol className="list-decimal pl-6 space-y-6 mb-4" {...props} />,
                      li: ({ ...props }) => <li className="text-white/90 leading-relaxed pl-2" {...props} />,
                      strong: ({ ...props }) => <strong className="text-red-400 font-bold" {...props} />,
                    }}
                  >{ideas}</ReactMarkdown>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Type or paste your favorite idea and angle below:</p>
                  <textarea
                    value={selectedIdea}
                    onChange={(e) => setSelectedIdea(e.target.value)}
                    placeholder="E.g. The contrarian take on AI agents failing in 2026..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                  <button
                    onClick={generateTitles}
                    disabled={!selectedIdea.trim()}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    Generate Title Ideas <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ... (Keep rest of the steps, applying similar bg-white/[0.02] styling) ... */}
          {step === "titles_ready" && (
            <motion.div key="titles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Edit3 className="text-red-500" /> 2. Headline Strategy
                </h2>
                <div className="prose prose-invert max-w-none bg-black/40 p-6 rounded-2xl border border-white/5">
                  <ReactMarkdown
                    components={{
                      ol: ({ ...props }) => <ol className="list-decimal pl-6 space-y-4 mb-2" {...props} />,
                      li: ({ ...props }) => <li className="text-white font-medium hover:text-red-400 transition-colors cursor-pointer" {...props} />,
                    }}
                  >{titles}</ReactMarkdown>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                    placeholder="Enter the title that will stop the scroll..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                  <button
                    onClick={generateOutline}
                    disabled={!selectedTitle.trim()}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    Build Detailed Outline <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "outline_ready" && (
            <motion.div key="outline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="text-red-500" /> 3. Structural Blueprint
                </h2>
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  className="w-full h-[450px] bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="flex gap-4">
                  <button onClick={() => setStep("titles_ready")} className="flex-1 border border-white/10 hover:bg-white/5 py-4 rounded-2xl font-bold">
                    Back to Titles
                  </button>
                  <button onClick={generateFinalBlog} disabled={!outline.trim()} className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                    Process Final Writeup <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-20">
              <div className="text-center p-8 bg-green-500/5 border border-green-500/20 rounded-3xl flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-3xl font-bold text-green-500">Blog Ready!</h2>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl shadow-2xl relative">
                <button onClick={handleCopy} className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-all">
                  {isCopied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Content</>}
                </button>
                <div className="prose prose-invert prose-lg max-w-none mt-6">
                  <ReactMarkdown>{finalBlog}</ReactMarkdown>
                </div>
              </div>
              <button onClick={resetApp} className="w-full py-4 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold">
                Start New Research
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center font-bold">
            ⚠️ {error}
          </motion.div>
        )}
      </div>
    </main>
  );
}