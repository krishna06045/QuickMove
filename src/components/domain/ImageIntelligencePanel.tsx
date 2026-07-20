import React, { useState, useRef } from "react";
import type { ImageAnalysisResult } from "@/types";
import { analyzeImage } from "@/services/aiService";
import { getMemoryFromFirestore, saveMemoryToFirestore } from "@/services/memoryService";
import { cn } from "@/lib/utils";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  AlertTriangle,
  FileText,
  Home,
  Package
} from "lucide-react";
import { toast } from "sonner";

interface ImageIntelligencePanelProps {
  customerId: string;
  customerName: string;
}

interface UploadedImage {
  id: string;
  previewUrl: string;
  file?: File;
  status: "idle" | "analyzing" | "done" | "error";
  analysis?: ImageAnalysisResult;
}

export const ImageIntelligencePanel: React.FC<ImageIntelligencePanelProps> = ({ customerId }) => {
  const [images, setImages] = useState<UploadedImage[]>([
    {
      id: "sample_1",
      previewUrl: "/images/inventory.jpg",
      status: "idle"
    },
    {
      id: "sample_2",
      previewUrl: "/images/damage.jpg",
      status: "idle"
    },
    {
      id: "sample_3",
      previewUrl: "/images/apartment.jpg",
      status: "idle"
    },
    {
      id: "sample_4",
      previewUrl: "/images/document.jpg",
      status: "idle"
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "idle" as const
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getBase64FromUrl = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        resolve({
          base64: reader.result as string,
          mimeType: blob.type || 'image/jpeg'
        });
      };
      reader.onerror = reject;
    });
  };

  const triggerAnalysis = async (imageId: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, status: "analyzing" } : img));
    
    try {
      const img = images.find(i => i.id === imageId);
      if (!img) return;

      let base64Data = "";
      let mimeType = "image/jpeg";

      if (img.file) {
        base64Data = await toBase64(img.file);
        mimeType = img.file.type;
      } else {
        const res = await getBase64FromUrl(img.previewUrl);
        base64Data = res.base64;
        mimeType = res.mimeType;
      }

      const analysis = await analyzeImage(base64Data, mimeType);
      
      setImages(prev => prev.map(i => i.id === imageId ? { ...i, status: "done", analysis } : i));
      toast.success(`Analysis complete: ${analysis.imageType} detected`);
    } catch (error) {
      console.error("Image analysis failed:", error);
      setImages(prev => prev.map(i => i.id === imageId ? { ...i, status: "error" } : i));
      toast.error("Failed to analyze image. Please try again.");
    }
  };

  const handleApproveField = async (imageId: string, category: keyof ImageAnalysisResult, index: number, summaryText: string) => {
    // 1. Update UI state locally
    setImages(prev => prev.map(img => {
      if (img.id !== imageId || !img.analysis) return img;
      
      const newAnalysis = { ...img.analysis };
      const arr = newAnalysis[category] as any[];
      if (arr && arr[index]) {
        arr[index] = { ...arr[index], approved: true, rejected: false };
      }
      return { ...img, analysis: newAnalysis };
    }));

    // 2. Persist to Firestore Customer Memory
    try {
      let existingMemory = await getMemoryFromFirestore(customerId);
      if (!existingMemory) {
        existingMemory = { summary: "", timeline: [], facts: [], preferences: [], pendingTasks: [], risks: [], lastUpdated: Date.now() };
      }
      
      if (category === "damage" || category === "apartmentRisks") {
        existingMemory.risks.push(summaryText);
      } else if (category === "inventory") {
        existingMemory.facts.push(summaryText);
      } else if (category === "documentFields") {
        existingMemory.facts.push(summaryText);
      }
      
      existingMemory.lastUpdated = Date.now();
      await saveMemoryToFirestore(customerId, existingMemory);
      toast.success("Saved to Customer Memory");
      
    } catch (err) {
      console.error("Failed to save memory:", err);
      toast.error("Failed to save to Firestore");
    }
  };

  const handleRejectField = (imageId: string, category: keyof ImageAnalysisResult, index: number) => {
    setImages(prev => prev.map(img => {
      if (img.id !== imageId || !img.analysis) return img;
      
      const newAnalysis = { ...img.analysis };
      const arr = newAnalysis[category] as any[];
      if (arr && arr[index]) {
        arr[index] = { ...arr[index], approved: false, rejected: true };
      }
      return { ...img, analysis: newAnalysis };
    }));
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case "Inventory": return <Package className="w-4 h-4 text-blue-500" />;
      case "Damage": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "Apartment": return <Home className="w-4 h-4 text-purple-500" />;
      case "Document": return <FileText className="w-4 h-4 text-emerald-500" />;
      default: return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header & Upload */}
      <div className="p-4 border-b shrink-0 bg-card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Image Intelligence
        </h2>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click or Drag images to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Supports Inventory, Damages, Documents, and Properties</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {images.map((img) => (
          <div key={img.id} className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="flex items-start p-4 gap-4">
              <div className="w-32 h-32 rounded-md bg-secondary overflow-hidden shrink-0 border relative">
                <img src={img.previewUrl} alt="Upload" className="w-full h-full object-cover" />
                {img.status === "analyzing" && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {img.analysis && getIconForType(img.analysis.imageType)}
                    <h3 className="font-semibold text-sm">
                      {img.analysis ? `Detected: ${img.analysis.imageType}` : "Ready for Analysis"}
                    </h3>
                  </div>
                  {img.status === "idle" && (
                    <button 
                      onClick={() => triggerAnalysis(img.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90"
                    >
                      Analyze Image
                    </button>
                  )}
                  {img.status === "done" && img.analysis && (
                    <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-700 rounded-full border border-green-500/20">
                      Confidence: {img.analysis.overallConfidence}%
                    </span>
                  )}
                </div>

                {img.status === "done" && img.analysis && (
                  <p className="text-xs text-muted-foreground italic mb-4">{img.analysis.summary}</p>
                )}

                {/* Analysis Results - Human in the loop */}
                {img.status === "done" && img.analysis && (
                  <div className="space-y-3">
                    
                    {/* Inventory */}
                    {img.analysis.inventory?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-secondary/30 p-2 rounded text-sm border">
                        <div>
                          <span className="font-medium">{item.quantity}x {item.item}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">({item.confidence}% confident)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleApproveField(img.id, 'inventory', idx, `Customer owns ${item.quantity}x ${item.item}`)}
                            className={cn("p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors", item.approved && "bg-green-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleRejectField(img.id, 'inventory', idx)}
                            className={cn("p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors", item.rejected && "bg-red-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Damages */}
                    {img.analysis.damage?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-red-500/5 p-2 rounded text-sm border border-red-500/10">
                        <div>
                          <span className="font-medium text-red-700">{item.item}: {item.issue}</span>
                          <span className="text-[10px] text-red-600/70 ml-2">({item.severity} severity)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleApproveField(img.id, 'damage', idx, `Damage Detected: ${item.item} has ${item.issue}`)}
                            className={cn("p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors", item.approved && "bg-green-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleRejectField(img.id, 'damage', idx)}
                            className={cn("p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors", item.rejected && "bg-red-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Apartment Risks */}
                    {img.analysis.apartmentRisks?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-purple-500/5 p-2 rounded text-sm border border-purple-500/10">
                        <div>
                          <span className="font-medium text-purple-700">{item.risk}</span>
                          <span className="text-[10px] text-purple-600/70 ml-2">({item.severity} risk)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleApproveField(img.id, 'apartmentRisks', idx, `Property Risk: ${item.risk}`)}
                            className={cn("p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors", item.approved && "bg-green-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleRejectField(img.id, 'apartmentRisks', idx)}
                            className={cn("p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors", item.rejected && "bg-red-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Document OCR */}
                    {img.analysis.documentFields?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-emerald-500/5 p-2 rounded text-sm border border-emerald-500/10">
                        <div>
                          <span className="text-xs text-muted-foreground mr-2">{item.key}:</span>
                          <span className="font-medium text-emerald-800">{item.value}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleApproveField(img.id, 'documentFields', idx, `Document extraction - ${item.key}: ${item.value}`)}
                            className={cn("p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors", item.approved && "bg-green-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={item.approved || item.rejected}
                            onClick={() => handleRejectField(img.id, 'documentFields', idx)}
                            className={cn("p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors", item.rejected && "bg-red-500/20 opacity-50 cursor-not-allowed")}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
