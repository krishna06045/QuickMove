import type { AIAnalysis } from "@/types";
import { BrainCircuit, ChevronDown, Activity, Download, Sheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { RequirementChangeCard } from "./RequirementChangeCard";
import { AuditHistory } from "./AuditHistory";
import { ValidationCard } from "./ValidationCard";
import { OperationsHub } from "./OperationsHub";
import { useValidationWorkflow } from "@/hooks/useValidationWorkflow";
import React, { useState } from "react";

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
  onJumpToMessage?: (messageId: string) => void;
}

export const AIAnalysisPanel = React.memo(({ analysis, onJumpToMessage }: AIAnalysisPanelProps) => {
  const { approvedFields, rejectedFields, approveField, rejectField } = useValidationWorkflow(analysis.customerId);
  const [isExporting, setIsExporting] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<{
    aiValidation: boolean;
    sheetsSync: boolean;
    internalEmail: boolean;
  } | null>(null);

  const handleCopyToSheets = () => {
    // Format into Tab-Separated Values (TSV) for easy pasting into Google Sheets
    const headers = ["Customer Name", "Contact", "Origin", "Destination", "Budget", "Move Date"];
    const row = [
      analysis.profile.name.value,
      analysis.profile.contact.value,
      analysis.moveDetails.origin.value,
      analysis.moveDetails.destination.value,
      analysis.budget.amount.value,
      analysis.timeline.expectedMoveDate.value
    ];
    
    const tsv = `${headers.join("\t")}\n${row.join("\t")}`;
    navigator.clipboard.writeText(tsv);
    toast.success("Copied to clipboard!", { description: "You can now paste directly into Google Sheets." });
  };

  const handleSyncToMake = async () => {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      toast.error("Webhook URL missing", {
        description: "Please add VITE_MAKE_WEBHOOK_URL to your .env.local file."
      });
      return;
    }

    setIsExporting(true);
    setWorkflowStatus(null);
    
    try {
      const getValue = (fieldKey: string, value: string) => approvedFields[fieldKey] ? value : "";

      const payload = {
        customerId: analysis.customerId || "unknown",
        customerName: getValue("profile_name", analysis.profile.name.value),
        email: getValue("profile_contact", analysis.profile.contact.value), 
        phone: getValue("profile_contact", analysis.profile.contact.value),
        sourceCity: getValue("move_origin", analysis.moveDetails.origin.value),
        destinationCity: getValue("move_destination", analysis.moveDetails.destination.value),
        moveDate: getValue("timeline_date", analysis.timeline.expectedMoveDate.value),
        budget: getValue("budget_amount", analysis.budget.amount.value),
        inventory: getValue("inventory_summary", analysis.inventory.summary.value),
        preferences: getValue("move_config", analysis.moveDetails.propertyConfig.value),
        aiSummary: analysis.processingSummary,
        approvedBy: "Operations Team",
        approvedAt: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Network response was not ok");

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // If not JSON, but the response was ok, we assume success for Make webhooks
        // However, if we reach this without error, we shouldn't fail.
        responseData = { sheetsSync: true, internalEmail: true };
      }

      setWorkflowStatus({
        aiValidation: true,
        sheetsSync: responseData.sheetsSync ?? true,
        internalEmail: responseData.internalEmail ?? true
      });

      toast.success("Workflow Executed", { 
        description: "Data synced and emails triggered successfully." 
      });
    } catch (error) {
      toast.error("Sync Failed", {
        description: "Could not reach the webhook. Check your URL or network."
      });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 cursor-pointer group">
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-[450px] flex flex-col h-full border-l bg-card overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b px-4 flex items-center justify-between bg-background shrink-0">
        <div className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="w-4 h-4 text-primary" />
          AI Analysis & Validation
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 shadow-sm mr-2" title="Overall AI Confidence">
            <Activity className="w-3 h-3" />
            {analysis.overallConfidence}%
          </div>
          <button 
            onClick={handleCopyToSheets}
            className="flex items-center gap-1.5 text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded border border-green-500/20 hover:bg-green-500/20 transition-colors"
            title="Copy as TSV for Google Sheets"
          >
            <Sheet className="w-3.5 h-3.5" />
            Copy Row
          </button>
          <button 
            onClick={handleSyncToMake}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "Syncing..." : "Sync Webhook"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
        
        {/* Processing Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
            Context Summary
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {analysis.processingSummary}
          </p>
        </div>

        {/* Workflow Status */}
        {workflowStatus && (
          <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
            <h4 className="text-sm font-bold tracking-tight text-foreground mb-4">
              Workflow Status
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                <CheckCircle2 className="w-4 h-4" /> <span>AI Validation Completed</span>
              </div>
              <div className={workflowStatus.sheetsSync ? "flex items-center gap-2 text-green-600 dark:text-green-500 font-medium" : "flex items-center gap-2 text-red-600 dark:text-red-500 font-medium"}>
                {workflowStatus.sheetsSync ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Google Sheets Updated</span>
              </div>
              <div className={workflowStatus.internalEmail ? "flex items-center gap-2 text-green-600 dark:text-green-500 font-medium" : "flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium"}>
                {workflowStatus.internalEmail ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{workflowStatus.internalEmail ? "Internal Ops Team Notified" : "Internal Email Failed"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Change Detection Alerts */}
        {analysis.requirementChanges?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">Requirement Changes Detected</h3>
            {analysis.requirementChanges.map(change => (
              <RequirementChangeCard key={change.id} change={change} onJumpToMessage={onJumpToMessage} />
            ))}
          </div>
        )}

        <hr className="my-6 border-border/50" />

        {/* Structured Data Validation */}
        <Section title="Customer Profile">
          <ValidationCard label="Name" field={analysis.profile.name} fieldKey="profile_name" isApproved={approvedFields["profile_name"] || false} isRejected={rejectedFields["profile_name"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Contact" field={analysis.profile.contact} fieldKey="profile_contact" isApproved={approvedFields["profile_contact"] || false} isRejected={rejectedFields["profile_contact"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Family Size" field={analysis.profile.familySize} fieldKey="profile_familySize" isApproved={approvedFields["profile_familySize"] || false} isRejected={rejectedFields["profile_familySize"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Pets" field={analysis.profile.pets} fieldKey="profile_pets" isApproved={approvedFields["profile_pets"] || false} isRejected={rejectedFields["profile_pets"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Dietary Requirements" field={analysis.profile.dietaryPreferences} fieldKey="profile_dietary" isApproved={approvedFields["profile_dietary"] || false} isRejected={rejectedFields["profile_dietary"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
        </Section>

        <Section title="Move Details">
          <ValidationCard label="Origin" field={analysis.moveDetails.origin} fieldKey="move_origin" isApproved={approvedFields["move_origin"] || false} isRejected={rejectedFields["move_origin"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Destination" field={analysis.moveDetails.destination} fieldKey="move_destination" isApproved={approvedFields["move_destination"] || false} isRejected={rejectedFields["move_destination"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Configuration" field={analysis.moveDetails.propertyConfig} fieldKey="move_config" isApproved={approvedFields["move_config"] || false} isRejected={rejectedFields["move_config"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Preferred Locality" field={analysis.moveDetails.preferredLocality} fieldKey="move_locality" isApproved={approvedFields["move_locality"] || false} isRejected={rejectedFields["move_locality"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
        </Section>

        <Section title="Budget & Timeline">
          <ValidationCard label="Budget Amount" field={analysis.budget.amount} fieldKey="budget_amount" isApproved={approvedFields["budget_amount"] || false} isRejected={rejectedFields["budget_amount"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Budget Flexibility" field={analysis.budget.flexibility} fieldKey="budget_flexibility" isApproved={approvedFields["budget_flexibility"] || false} isRejected={rejectedFields["budget_flexibility"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Move Date" field={analysis.timeline.expectedMoveDate} fieldKey="timeline_date" isApproved={approvedFields["timeline_date"] || false} isRejected={rejectedFields["timeline_date"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Timeline Flexibility" field={analysis.timeline.flexibility} fieldKey="timeline_flexibility" isApproved={approvedFields["timeline_flexibility"] || false} isRejected={rejectedFields["timeline_flexibility"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
        </Section>

        <Section title="Inventory & Utilities">
          <ValidationCard label="Inventory Summary" field={analysis.inventory.summary} fieldKey="inventory_summary" isApproved={approvedFields["inventory_summary"] || false} isRejected={rejectedFields["inventory_summary"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Special Items" field={analysis.inventory.specialItems} fieldKey="inventory_special" isApproved={approvedFields["inventory_special"] || false} isRejected={rejectedFields["inventory_special"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
          <ValidationCard label="Utility Requirements" field={analysis.utilities.requirements} fieldKey="utilities_req" isApproved={approvedFields["utilities_req"] || false} isRejected={rejectedFields["utilities_req"] || false} onApprove={approveField} onReject={rejectField} onJumpToMessage={onJumpToMessage} />
        </Section>

        <hr className="my-8 border-border/50" />

        <OperationsHub suggestedReply={analysis.suggestedReply} operationsNotes={analysis.operationsNotes} />

        <AuditHistory entries={[]} />

      </div>
    </div>
  );
});
