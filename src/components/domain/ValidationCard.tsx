import type { ExtractedField } from "@/types";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  HelpCircle,
  Clock,
  Activity,
  ArrowRight,
  MessageSquare,
  Check,
  X,
  Edit2,
  Lock
} from "lucide-react";
import { AIReasoningTimeline } from "./AIReasoningTimeline";
import { toast } from "sonner";
import React from "react";

interface ValidationCardProps {
  label: string;
  field: ExtractedField | ExtractedField<string[]>;
  fieldKey: string;
  isApproved: boolean;
  isRejected: boolean;
  onApprove: (key: string, label: string) => void;
  onReject: (key: string, label: string) => void;
  onJumpToMessage?: (messageId: string) => void;
}

export const ValidationCard = React.memo(({ 
  label, field, fieldKey, isApproved, isRejected, onApprove, onReject, onJumpToMessage 
}: ValidationCardProps) => {
  const isArray = Array.isArray(field.value);
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState<string | string[]>(field.value);

  // Sync state if field prop changes
  React.useEffect(() => {
    setCurrentValue(field.value);
  }, [field.value]);

  const handleSaveEdit = () => {
    setIsEditing(false);
    toast.success(`${label} updated manually.`);
  };

  const getStatusIcon = (status: ExtractedField["status"]) => {
    switch (status) {
      case "Confirmed": return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "Updated": return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case "Conflicting": return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case "Needs Clarification": return <HelpCircle className="w-3.5 h-3.5 text-amber-500" />;
      case "Missing": return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ExtractedField["status"]) => {
    switch (status) {
      case "Confirmed": return "border-l-green-500 bg-green-500/5";
      case "Updated": return "border-l-blue-500 bg-blue-500/5";
      case "Conflicting": return "border-l-red-500 bg-red-500/5";
      case "Needs Clarification": return "border-l-amber-500 bg-amber-500/5";
      case "Missing": return "border-l-transparent bg-secondary/20";
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border mb-3 shadow-sm transition-all duration-300", 
      getStatusColor(field.status),
      isApproved && "opacity-60 bg-secondary/10 border-l-border filter grayscale-[50%]",
      isRejected && "border-red-500/50 bg-red-500/5"
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-background px-1.5 py-0.5 rounded border text-muted-foreground flex items-center gap-1 shadow-sm">
            <Activity className="w-3 h-3" />
            {field.confidence}%
          </span>
          {getStatusIcon(field.status)}
        </div>
      </div>
      
      {/* Value Display or Edit Input */}
      <div className="mb-3">
        {field.previousValue && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="line-through">{Array.isArray(field.previousValue) ? field.previousValue.join(", ") : field.previousValue}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </div>
        )}
        
        {isEditing ? (
          isArray ? (
            <textarea
              value={(currentValue as string[]).join("\n")}
              onChange={(e) => setCurrentValue(e.target.value.split("\n"))}
              className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={currentValue as string}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            />
          )
        ) : (
          isArray ? (
            <ul className="list-disc list-inside text-sm text-foreground font-medium space-y-0.5">
              {(currentValue as string[]).map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          ) : (
            <p className={cn("text-sm font-medium transition-colors", isRejected ? "text-red-600 dark:text-red-400 line-through" : "text-foreground")}>
              {currentValue as string}
            </p>
          )
        )}
      </div>
      
      {field.reasoning && !isApproved && (
        <p className="text-xs text-muted-foreground mb-3 bg-background/50 p-2 rounded border-l-2 border-l-primary/30">
          <span className="font-semibold text-primary/70">AI Note:</span> {field.reasoning}
        </p>
      )}

      {field.sourceEvidence && !isApproved && (
        <div className="flex items-center justify-between bg-card border rounded p-2 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center gap-2 overflow-hidden">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground italic truncate">
              "{field.sourceEvidence.preview}"
            </span>
          </div>
          <button 
            onClick={() => onJumpToMessage?.(field.sourceEvidence!.messageId)}
            className="text-[10px] font-medium text-primary hover:underline shrink-0 ml-2 whitespace-nowrap"
          >
            Jump to Msg
          </button>
        </div>
      )}

      {field.reasoningTimeline && !isApproved && (
        <AIReasoningTimeline timeline={field.reasoningTimeline} onJumpToMessage={onJumpToMessage} />
      )}

      {/* Validation Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
        {isApproved ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-500 w-full justify-center">
            <Lock className="w-3.5 h-3.5" /> Approved
          </div>
        ) : (
          <>
            <button 
              onClick={() => onApprove(fieldKey, label)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400 rounded text-xs font-medium transition-colors active:scale-95"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            {isEditing ? (
              <button 
                onClick={handleSaveEdit}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-medium transition-colors active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded text-xs font-medium transition-colors active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button 
              onClick={() => onReject(fieldKey, label)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 rounded text-xs font-medium transition-colors active:scale-95"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
});
