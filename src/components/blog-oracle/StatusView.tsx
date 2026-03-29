
"use client";

import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusViewProps {
  status: "idle" | "generating" | "completed" | "error";
  message?: string;
}

export function StatusView({ status, message }: StatusViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      {status === "generating" && (
        <div className="space-y-8 flex flex-col items-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <motion.h3
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold text-foreground"
            >
              {message || "Consulting the Oracle..."}
            </motion.h3>
            <p className="text-muted-foreground max-w-sm">
              Our multi-agent pipeline is currently processing your request.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-destructive">Oracle Interrupted</h3>
            <p className="text-muted-foreground">{message || "The vision was unclear. Please try again later."}</p>
          </div>
        </motion.div>
      )}

      {status === "completed" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold">Vision Received</h3>
        </motion.div>
      )}
    </div>
  );
}
