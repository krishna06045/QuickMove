import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  MapPin, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert,
  Play
} from "lucide-react";

import React from "react";

interface ConversationFeedProps {
  messages: Message[];
  customerName: string;
}

export const ConversationFeed = React.memo(({ messages, customerName }: ConversationFeedProps) => {
  
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case "text":
        return <p className="text-sm leading-relaxed">{message.content}</p>;
        
      case "image":
        return (
          <div className="flex flex-col gap-2">
            <div className="w-full h-40 bg-secondary/80 rounded-md overflow-hidden flex items-center justify-center">
              {/* Placeholder for actual image */}
              <span className="text-xs text-muted-foreground">Image: {message.metadata?.fileName}</span>
            </div>
            <p className="text-xs text-muted-foreground">{message.content}</p>
          </div>
        );
        
      case "voice":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-background/50 p-2 rounded-md border w-full min-w-[200px]">
              {message.metadata?.audioBase64 ? (
                <audio controls className="w-full h-8 max-w-[250px]" src={message.metadata.audioBase64} />
              ) : (
                <>
                  <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 ml-0.5" />
                  </button>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex items-center gap-0.5">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-full bg-primary/40 w-full rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-medium min-w-[32px]">0:{message.metadata?.duration}</span>
                </>
              )}
            </div>
            {message.content && message.content.startsWith("Transcript:") ? (
              <div className="bg-secondary/40 p-2.5 rounded-md text-xs italic text-foreground/90 mt-1 shadow-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <p className="text-xs italic text-foreground/70">{message.content}</p>
            )}
          </div>
        );
        
      case "pdf":
        return (
          <div className="flex items-center gap-3 bg-background/50 p-3 rounded-md border">
            <div className="w-10 h-10 rounded bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{message.metadata?.fileName}</p>
              <p className="text-xs text-muted-foreground">{message.metadata?.fileSize} • PDF</p>
            </div>
          </div>
        );
        
      case "location":
        return (
          <div className="flex flex-col gap-2">
            <div className="w-full h-32 bg-secondary/80 rounded-md overflow-hidden flex items-center justify-center relative">
              <MapPin className="w-6 h-6 text-red-500 absolute" />
              <span className="text-[10px] text-muted-foreground absolute bottom-2 right-2">Map Preview</span>
            </div>
            <div>
              <p className="text-sm font-medium">{message.content}</p>
              <p className="text-xs text-muted-foreground truncate">{message.metadata?.address}</p>
            </div>
          </div>
        );
        
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-secondary/10 relative">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
        {messages.map((message) => {
          
          if (message.type === "system-event" || message.type === "call-summary") {
            const isAlert = message.metadata?.systemEventIcon === "alert-triangle" || message.metadata?.systemEventIcon === "shield-alert";
            return (
              <div key={message.id} className="flex justify-center my-2">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm max-w-lg text-center",
                  message.type === "call-summary" ? "bg-card text-foreground" : 
                  isAlert ? "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400" : 
                  "bg-card text-muted-foreground"
                )}>
                  {message.type === "call-summary" && <PhoneCall className="w-3.5 h-3.5" />}
                  {message.metadata?.systemEventIcon === "alert-triangle" && <AlertTriangle className="w-3.5 h-3.5" />}
                  {message.metadata?.systemEventIcon === "shield-alert" && <ShieldAlert className="w-3.5 h-3.5" />}
                  {message.content}
                </div>
              </div>
            );
          }

          const isCustomer = message.sender === "customer";

          return (
            <div id={message.id} key={message.id} className={cn("flex gap-3", isCustomer ? "flex-row" : "flex-row-reverse")}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm mt-auto mb-1",
                isCustomer ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
              )}>
                {isCustomer ? customerName.charAt(0) : "QM"}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex flex-col gap-1 max-w-[75%] lg:max-w-[65%]",
                isCustomer ? "items-start" : "items-end"
              )}>
                <div className={cn(
                  "p-3 shadow-sm",
                  message.type === "text" ? "rounded-2xl" : "rounded-xl w-64 md:w-72",
                  isCustomer 
                    ? "bg-card border rounded-bl-none text-foreground" 
                    : "bg-primary text-primary-foreground rounded-br-none"
                )}>
                  {renderMessageContent(message)}
                </div>
                <span className="text-[10px] text-muted-foreground px-1 font-medium">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
