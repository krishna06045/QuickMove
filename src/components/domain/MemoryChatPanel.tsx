import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Brain, ListTodo, AlertTriangle, Info } from "lucide-react";
import { getMemoryFromFirestore, askMemoryAgent, type CustomerMemory } from "@/services/memoryService";
import type { Message } from "@/types";

interface MemoryChatPanelProps {
  customerId: string;
  customerName: string;
  messages: Message[];
}

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
}

export function MemoryChatPanel({ customerId, customerName, messages }: MemoryChatPanelProps) {
  const [memory, setMemory] = useState<CustomerMemory | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMemory = async () => {
      setIsLoadingMemory(true);
      const mem = await getMemoryFromFirestore(customerId);
      setMemory(mem);
      setIsLoadingMemory(false);
    };
    fetchMemory();
  }, [customerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleAsk = async () => {
    if (!inputValue.trim() || !memory) return;
    
    const userMsg = inputValue;
    setInputValue("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAsking(true);

    try {
      const response = await askMemoryAgent(customerName, userMsg, memory, messages);
      setChatHistory(prev => [...prev, { role: 'agent', content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'agent', content: "Sorry, I encountered an error querying the memory." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  if (isLoadingMemory) {
    return (
      <div className="w-[450px] border-l flex flex-col items-center justify-center bg-card">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-4" />
        <h3 className="text-sm text-muted-foreground">Fetching Persistent Memory...</h3>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="w-[450px] border-l flex flex-col items-center justify-center bg-card text-center p-6">
        <Brain className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground mb-2">No Memory Found</h3>
        <p className="text-sm text-muted-foreground">
          This customer does not have a persistent memory in Firestore yet. Run "Analyze Conversation" to generate one.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[450px] flex flex-col h-full border-l bg-card overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b px-4 flex items-center bg-background shrink-0 font-semibold gap-2 text-sm">
        <Brain className="w-4 h-4 text-purple-500" />
        Memory Agent (Firestore)
        <span className="ml-auto text-xs text-muted-foreground font-normal bg-secondary px-2 py-0.5 rounded-full">
          Delta Processing Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {/* Memory View */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Summary
            </h4>
            <p className="text-sm text-foreground/90 bg-secondary/30 p-3 rounded-md leading-relaxed">{memory.summary}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <ListTodo className="w-3.5 h-3.5" /> Tasks
              </h4>
              <ul className="text-sm list-disc pl-4 space-y-1 text-foreground/90">
                {memory.pendingTasks.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Risks
              </h4>
              <ul className="text-sm list-disc pl-4 space-y-1 text-foreground/90">
                {memory.risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t my-2"></div>

        {/* Chat History */}
        <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
          {chatHistory.length === 0 && (
             <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center italic px-4">
               Ask me operational questions like "Has the token amount been paid?" or "Why is this relocation delayed?"
             </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : 'bg-secondary text-secondary-foreground rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isAsking && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground text-sm px-3 py-2 rounded-lg rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Retrieving from memory...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-background shrink-0">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about this customer..."
            className="w-full h-16 py-2 pl-3 pr-12 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all bg-card resize-none shadow-sm"
          />
          <button 
            onClick={handleAsk}
            disabled={isAsking || !inputValue.trim()}
            className="absolute right-2 bottom-2 aspect-square p-1.5 flex items-center justify-center text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
