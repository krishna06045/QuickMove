export type RelocationStatus = "New" | "In Progress" | "Pending Review" | "Completed";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: RelocationStatus;
  unreadCount?: number;
  origin: string;
  destination: string;
  moveDate: string;
  budget: string;
  propertyConfig: string;
  preferredLocality: string;
  inventorySummary: string;
  recentActivity: string;
  avatarUrl?: string;
  createdAt: string;
}

// Conversation Types
export type MessageType = "text" | "image" | "voice" | "pdf" | "location" | "call-summary" | "system-event";

export interface Message {
  id: string;
  customerId: string;
  sender: "customer" | "system" | "agent";
  type: MessageType;
  content: string;
  timestamp: string;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    duration?: number; // for voice
    audioBase64?: string;
    mimeType?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    systemEventIcon?: string;
  };
}

// AI Analysis Types
export type ExtractionStatus = "Confirmed" | "Updated" | "Missing" | "Needs Clarification" | "Conflicting";

export interface SourceEvidence {
  messageId: string;
  timestamp: string;
  preview: string;
}

export interface ReasoningEvent {
  messageId: string;
  timestamp: string;
  description: string;
  type: "statement" | "conflict" | "resolution";
}

export interface ExtractedField<T = string> {
  value: T;
  previousValue?: T;
  confidence: number; // 0 to 100
  status: ExtractionStatus;
  reasoning?: string;
  reasoningTimeline?: ReasoningEvent[];
  sourceEvidence?: SourceEvidence;
  // Human validation state
  approved?: boolean;
  rejected?: boolean;
}

export interface RequirementChange {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  sourceEvidence?: SourceEvidence;
}

export interface AuditHistoryEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  confidenceDiff?: number;
  operatorDecision: "Approved" | "Rejected" | "Pending";
}

export interface OperationsNotes {
  requirementsSummary: string;
  unresolvedQuestions: string[];
  risks: string[];
  nextActions: string[];
  vendorFollowUps: string[];
}

export interface AIAnalysis {
  customerId: string;
  profile: {
    name: ExtractedField;
    contact: ExtractedField;
    familySize: ExtractedField;
    pets: ExtractedField;
    dietaryPreferences: ExtractedField;
  };
  moveDetails: {
    origin: ExtractedField;
    destination: ExtractedField;
    propertyConfig: ExtractedField;
    preferredLocality: ExtractedField;
  };
  budget: {
    amount: ExtractedField;
    flexibility: ExtractedField;
  };
  timeline: {
    expectedMoveDate: ExtractedField;
    flexibility: ExtractedField;
  };
  inventory: {
    summary: ExtractedField;
    specialItems: ExtractedField<string[]>;
  };
  utilities: {
    requirements: ExtractedField<string[]>;
  };
  requirementChanges: RequirementChange[];
  processingSummary: string;
  missingInformation: string[];
  suggestedNextActions: string[];
  suggestedReply: string;
  operationsNotes: OperationsNotes;
  overallConfidence: number;
}

// Image Intelligence Types
export interface ImageInventoryItem {
  item: string;
  quantity: number;
  confidence: number;
  approved?: boolean;
  rejected?: boolean;
}

export interface ImageDamageIssue {
  item: string;
  issue: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  approved?: boolean;
  rejected?: boolean;
}

export interface ImageApartmentRisk {
  risk: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  approved?: boolean;
  rejected?: boolean;
}

export interface ImageDocumentField {
  key: string;
  value: string;
  confidence: number;
  approved?: boolean;
  rejected?: boolean;
}

export interface ImageAnalysisResult {
  imageType: "Inventory" | "Damage" | "Apartment" | "Document" | "Other";
  inventory?: ImageInventoryItem[];
  damage?: ImageDamageIssue[];
  apartmentRisks?: ImageApartmentRisk[];
  documentFields?: ImageDocumentField[];
  summary: string;
  overallConfidence: number;
}
