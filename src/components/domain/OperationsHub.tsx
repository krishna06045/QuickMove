import type { OperationsNotes } from "@/types";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface OperationsHubProps {
  suggestedReply: string;
  operationsNotes: OperationsNotes;
}

export const OperationsHub = React.memo(({ suggestedReply, operationsNotes }: OperationsHubProps) => {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">Operations Hub</h3>
      
      <div className="bg-background border rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="bg-secondary/30 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Reply</span>
          <button 
            onClick={() => handleCopy(suggestedReply, "Reply")}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {suggestedReply || "Hi there! I'm reviewing your requirements and will get back to you shortly with a quote."}
          </p>
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="bg-blue-100/50 dark:bg-blue-500/10 px-4 py-2 border-b border-blue-100 dark:border-blue-500/20 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400">Internal Ops Notes</span>
          <button 
            onClick={() => handleCopy(operationsNotes?.nextActions?.join("\n") || "", "Notes")}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Notes
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Next Actions:</span>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              {operationsNotes?.nextActions?.map((action, i) => (
                <li key={i}>{action}</li>
              )) || <li>Review requirements</li>}
            </ul>
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Risks:</span>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              {operationsNotes?.risks?.map((risk, i) => (
                <li key={i}>{risk}</li>
              )) || <li>None identified</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});
