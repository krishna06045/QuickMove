import { Key, Link, Users, Building, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Settings() {
  const [activeTab, setActiveTab] = useState("api");
  const [geminiKey, setGeminiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || "************************");
  const [webhookUrl, setWebhookUrl] = useState(import.meta.env.VITE_MAKE_WEBHOOK_URL || "https://hook.us1.make.com/xxxxxxxxxxx");

  const handleSave = () => {
    toast.success("Settings Saved", { description: "Your API configurations have been updated locally." });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Settings</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'api' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              <Key className="w-4 h-4" /> API Keys
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              <Link className="w-4 h-4" /> Integrations
            </button>
            <button 
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              <Users className="w-4 h-4" /> Team & Roles
            </button>
            <button 
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'company' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              <Building className="w-4 h-4" /> Company Profile
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-card border rounded-xl p-6 shadow-sm min-h-[400px]">
            {activeTab === "api" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">AI Provider Configuration</h2>
                  <p className="text-sm text-muted-foreground mb-4">Configure your Large Language Model connection for data extraction.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Google Gemini API Key</label>
                  <input 
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full h-10 px-3 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Requires gemini-2.5-flash access.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Workflow Automations</h2>
                  <p className="text-sm text-muted-foreground mb-4">Connect QuickMove Console to your external master sheets and CRMs.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Make.com / Zapier Webhook URL</label>
                  <input 
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full h-10 px-3 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">This endpoint receives the HTTP POST with approved JSON data.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                    <Save className="w-4 h-4" /> Save Integration
                  </button>
                </div>
              </div>
            )}

            {(activeTab === "team" || activeTab === "company") && (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p>This module is disabled in the prototype version.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
