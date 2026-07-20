import { useState, useEffect, useRef } from "react";
import { Search, Filter, MessageSquare, Loader2, BrainCircuit, Brain, Paperclip, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer, AIAnalysis, Message } from "@/types";
import { ConversationFeed } from "./ConversationFeed";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { MemoryChatPanel } from "./MemoryChatPanel";
import { ImageIntelligencePanel } from "./ImageIntelligencePanel";
import { mockConversations } from "@/data/mockConversations";
import { analyzeConversation } from "@/services/aiService";
import { generateCustomerMemory, getMemoryFromFirestore } from "@/services/memoryService";
import { transcribeAudio } from "@/services/audioService";
import { toast } from "sonner";

interface CustomerInboxProps {
  customers: Customer[];
}

type RightPanelTab = "validation" | "memory" | "image-intel";

export function CustomerInbox({ customers }: CustomerInboxProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [liveAnalysis, setLiveAnalysis] = useState<Record<string, AIAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<RightPanelTab>("validation");
  const [hasAttempted, setHasAttempted] = useState<Record<string, boolean>>({});
  
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const analysis = selectedCustomer ? liveAnalysis[selectedCustomer.id] : undefined;

  useEffect(() => {
    if (selectedCustomer) {
      setConversationMessages(mockConversations[selectedCustomer.id] || []);
    } else {
      setConversationMessages([]);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomer || conversationMessages.length === 0) return;
    
    if (liveAnalysis[selectedCustomer.id] || hasAttempted[selectedCustomer.id]) return;

    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      setHasAttempted(prev => ({ ...prev, [selectedCustomer.id]: true }));
      try {
        const result = await analyzeConversation(selectedCustomer.id, selectedCustomer.name, conversationMessages);
        setLiveAnalysis(prev => ({ ...prev, [selectedCustomer.id]: result }));
        
        const existingMemory = await getMemoryFromFirestore(selectedCustomer.id);
        generateCustomerMemory(selectedCustomer.id, selectedCustomer.name, conversationMessages, existingMemory).catch(err => {
          console.error("Background memory generation failed:", err);
        });
      } catch (error) {
        toast.error("AI Analysis Failed", {
          description: "Could not fetch analysis from Gemini. Check console for details."
        });
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchAnalysis();
  }, [selectedCustomerId, hasAttempted, liveAnalysis]); // We removed conversationMessages from dependencies to prevent auto-triggering on every upload, we'll let users manually re-analyze

  const handleManualAnalyze = async () => {
    if (!selectedCustomer || conversationMessages.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeConversation(selectedCustomer.id, selectedCustomer.name, conversationMessages);
      setLiveAnalysis(prev => ({ ...prev, [selectedCustomer.id]: result }));
      
      const existingMemory = await getMemoryFromFirestore(selectedCustomer.id);
      await generateCustomerMemory(selectedCustomer.id, selectedCustomer.name, conversationMessages, existingMemory);
      toast.success("Analysis Updated", { description: "Memory and fields updated successfully." });
    } catch (error) {
      toast.error("AI Analysis Failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCustomer) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Audio = e.target?.result as string;
      
      const tempId = "msg_audio_" + Date.now();
      const newVoiceMsg: Message = {
        id: tempId,
        customerId: selectedCustomer.id,
        sender: "customer",
        type: "voice",
        content: "Transcribing audio (Gemini 1.5 Flash)...",
        timestamp: new Date().toISOString(),
        metadata: {
          fileName: file.name,
          mimeType: file.type,
          audioBase64: base64Audio
        }
      };
      
      setConversationMessages(prev => [...prev, newVoiceMsg]);
      setIsUploadingAudio(true);

      try {
        const transcript = await transcribeAudio(base64Audio, file.type);
        setConversationMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, content: `Transcript: ${transcript}` } : msg
        ));
      } catch (error) {
        setConversationMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, content: "Transcription failed." } : msg
        ));
      } finally {
        setIsUploadingAudio(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status: Customer["status"]) => {
    switch (status) {
      case "New": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "In Progress": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "Pending Review": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "Completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(messageId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary/20', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        el.classList.remove('bg-primary/20');
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Left Pane - List */}
      <div className="w-[320px] lg:w-[350px] flex flex-col border-r h-full bg-card shrink-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
            <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full h-9 pl-9 pr-4 text-sm bg-secondary/50 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-secondary/40 transition-colors relative",
                selectedCustomerId === customer.id && "bg-secondary/60"
              )}
            >
              {selectedCustomerId === customer.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-sm text-foreground">{customer.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-sm", getStatusColor(customer.status))}>
                  {customer.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {customer.origin} <span className="text-[10px]">→</span> {customer.destination}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {customer.recentActivity}
              </p>
              {customer.unreadCount && customer.unreadCount > 0 && (
                <div className="absolute right-4 bottom-4 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-medium shadow-sm">
                  {customer.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Middle & Right Panes */}
      {!selectedCustomer ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 opacity-50" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-1">No conversation selected</h2>
          <p className="text-sm">Select a customer from the inbox to view details.</p>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Middle Pane - Conversation Feed */}
          <div className="flex-1 flex flex-col min-w-[400px]">
            <div className="h-14 border-b px-6 flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary text-secondary-foreground font-semibold rounded-full flex items-center justify-center text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">{selectedCustomer.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleManualAnalyze}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isAnalyzing ? "Processing..." : "Analyze Conversation"}
                </button>
              </div>
            </div>

            {conversationMessages.length > 0 ? (
              <ConversationFeed messages={conversationMessages} customerName={selectedCustomer.name} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-secondary/10">
                No conversation history found for this customer.
              </div>
            )}
            
            <div className="p-3 bg-background border-t shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAudio}
                  className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Upload Voice Note"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Type a message to customer..." 
                    className="w-full h-10 pl-4 pr-12 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-card shadow-sm"
                  />
                  <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center text-primary-foreground bg-primary rounded-md shadow-sm hover:opacity-90">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Tabs and Content */}
          <div className="w-[450px] flex flex-col h-full border-l bg-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b bg-background shrink-0">
              <button
                onClick={() => setActiveTab("validation")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "validation" 
                    ? "border-b-2 border-primary text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <BrainCircuit className="w-4 h-4" />
                AI Validation
              </button>
              <button
                onClick={() => setActiveTab("memory")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "memory" 
                    ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Brain className="w-4 h-4" />
                Memory Chat
              </button>
              <button
                onClick={() => setActiveTab("image-intel")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "image-intel" 
                    ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Camera className="w-4 h-4" />
                Images
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "validation" ? (
              isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-card">
                  <div className="relative flex items-center justify-center w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-spin-reverse"></div>
                    <Loader2 className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Gemini AI is Processing...</h3>
                  <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                      Parsing WhatsApp History
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      Extracting Structured Entities
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" style={{ animationDelay: '1s' }}></div>
                      Running Conflict Checks
                    </span>
                  </div>
                </div>
              ) : analysis ? (
                <AIAnalysisPanel analysis={analysis} onJumpToMessage={handleJumpToMessage} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-card">
                  No AI Analysis available.
                </div>
              )
            ) : activeTab === "memory" ? (
              <MemoryChatPanel customerId={selectedCustomer.id} customerName={selectedCustomer.name} messages={conversationMessages} />
            ) : (
              <ImageIntelligencePanel customerId={selectedCustomer.id} customerName={selectedCustomer.name} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
