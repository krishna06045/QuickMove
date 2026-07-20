import { useState } from "react";
import type { ReasoningEvent } from "@/types";
import { ChevronDown, MessageSquare, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIReasoningTimelineProps {
  timeline: ReasoningEvent[];
  onJumpToMessage?: (messageId: string) => void;
}

export function AIReasoningTimeline({ timeline, onJumpToMessage }: AIReasoningTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!timeline || timeline.length === 0) return null;

  const getIcon = (type: ReasoningEvent["type"]) => {
    switch (type) {
      case "statement": return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case "conflict": return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case "resolution": return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <FileText className="w-3.5 h-3.5" />
        AI Reasoning Timeline
        <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-3 relative pl-4 border-l border-border/60 ml-2 space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-1 bg-background border rounded-full p-0.5 shadow-sm">
                {getIcon(event.type)}
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs text-foreground leading-relaxed">{event.description}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button 
                    onClick={() => onJumpToMessage?.(event.messageId)}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Jump to Msg
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
