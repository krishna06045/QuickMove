import type { RequirementChange } from "@/types";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface RequirementChangeCardProps {
  change: RequirementChange;
  onJumpToMessage?: (messageId: string) => void;
}

export function RequirementChangeCard({ change, onJumpToMessage }: RequirementChangeCardProps) {
  return (
    <div className="border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 p-1.5 rounded-full shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-500 mb-2">
            Requirement Changed: {change.field}
          </h4>
          
          <div className="flex items-center gap-3 bg-white dark:bg-background/50 rounded-md border border-amber-100 dark:border-amber-500/10 px-3 py-2 mb-3">
            <span className="text-sm text-muted-foreground line-through decoration-amber-500/50">{change.oldValue}</span>
            <ArrowRight className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">{change.newValue}</span>
          </div>
          
          <div className="text-sm text-amber-800 dark:text-amber-200/80 mb-3">
            <span className="font-semibold">Reason:</span> {change.reason}
          </div>
          
          {change.sourceEvidence && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-500/20">
              <div className="text-xs text-muted-foreground">
                Changed at {new Date(change.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                onClick={() => onJumpToMessage?.(change.sourceEvidence!.messageId)}
                className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Jump to latest message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
