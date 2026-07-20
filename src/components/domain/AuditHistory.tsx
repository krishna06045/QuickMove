import type { AuditHistoryEntry } from "@/types";
import { ArrowRight, History, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditHistoryProps {
  entries: AuditHistoryEntry[];
}

export function AuditHistory({ entries }: AuditHistoryProps) {
  if (entries.length === 0) return null;

  const getDecisionIcon = (decision: AuditHistoryEntry["operatorDecision"]) => {
    switch (decision) {
      case "Approved": return <Check className="w-3.5 h-3.5 text-green-500" />;
      case "Rejected": return <X className="w-3.5 h-3.5 text-red-500" />;
      case "Pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="bg-secondary/30 px-4 py-3 border-b flex items-center gap-2">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Audit History</h3>
      </div>
      
      <div className="divide-y">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{entry.field}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                entry.operatorDecision === "Approved" ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" :
                entry.operatorDecision === "Rejected" ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400" :
                "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
              )}>
                {getDecisionIcon(entry.operatorDecision)}
                {entry.operatorDecision}
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-background/50 rounded border px-3 py-1.5 mb-2 w-fit">
              <span className="text-xs text-muted-foreground line-through">{entry.oldValue}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{entry.newValue}</span>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground/70">Reason:</span> {entry.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
