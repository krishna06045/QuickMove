import { z } from "zod";

export const SourceEvidenceSchema = z.object({
  messageId: z.string(),
  timestamp: z.string(),
  preview: z.string(),
});

export const ExtractedFieldSchema = z.object({
  value: z.string(),
  previousValue: z.string().optional(),
  confidence: z.number().int().min(0).max(100),
  status: z.enum(["Confirmed", "Updated", "Missing", "Needs Clarification", "Conflicting"]),
  reasoning: z.string().optional(),
  sourceEvidence: SourceEvidenceSchema.optional(),
});

export const ExtractedStringArrayFieldSchema = z.object({
  value: z.array(z.string()),
  previousValue: z.array(z.string()).optional(),
  confidence: z.number().int().min(0).max(100),
  status: z.enum(["Confirmed", "Updated", "Missing", "Needs Clarification", "Conflicting"]),
  reasoning: z.string().optional(),
  sourceEvidence: SourceEvidenceSchema.optional(),
});

export const RequirementChangeSchema = z.object({
  id: z.string(),
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
  reason: z.string(),
  timestamp: z.string(),
  sourceEvidence: SourceEvidenceSchema.optional(),
});

export const OperationsNotesSchema = z.object({
  requirementsSummary: z.string(),
  unresolvedQuestions: z.array(z.string()),
  risks: z.array(z.string()),
  nextActions: z.array(z.string()),
  vendorFollowUps: z.array(z.string()),
});

export const AIAnalysisSchema = z.object({
  customerId: z.string(),
  profile: z.object({
    name: ExtractedFieldSchema,
    contact: ExtractedFieldSchema,
    familySize: ExtractedFieldSchema,
    pets: ExtractedFieldSchema,
    dietaryPreferences: ExtractedFieldSchema,
  }),
  moveDetails: z.object({
    origin: ExtractedFieldSchema,
    destination: ExtractedFieldSchema,
    propertyConfig: ExtractedFieldSchema,
    preferredLocality: ExtractedFieldSchema,
  }),
  budget: z.object({
    amount: ExtractedFieldSchema,
    flexibility: ExtractedFieldSchema,
  }),
  timeline: z.object({
    expectedMoveDate: ExtractedFieldSchema,
    flexibility: ExtractedFieldSchema,
  }),
  inventory: z.object({
    summary: ExtractedFieldSchema,
    specialItems: ExtractedStringArrayFieldSchema,
  }),
  utilities: z.object({
    requirements: ExtractedStringArrayFieldSchema,
  }),
  requirementChanges: z.array(RequirementChangeSchema),
  processingSummary: z.string(),
  missingInformation: z.array(z.string()),
  suggestedNextActions: z.array(z.string()),
  suggestedReply: z.string().max(1000),
  operationsNotes: OperationsNotesSchema,
  overallConfidence: z.number().int().min(0).max(100),
});

// Image Intelligence Schemas

export const ImageInventoryItemSchema = z.object({
  item: z.string(),
  quantity: z.number().int(),
  confidence: z.number().int().min(0).max(100),
});

export const ImageDamageIssueSchema = z.object({
  item: z.string(),
  issue: z.string(),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  confidence: z.number().int().min(0).max(100),
});

export const ImageApartmentRiskSchema = z.object({
  risk: z.string(),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  confidence: z.number().int().min(0).max(100),
});

export const ImageDocumentFieldSchema = z.object({
  key: z.string(),
  value: z.string(),
  confidence: z.number().int().min(0).max(100),
});

export const ImageAnalysisSchema = z.object({
  imageType: z.enum(["Inventory", "Damage", "Apartment", "Document", "Other"]),
  inventory: z.array(ImageInventoryItemSchema).optional(),
  damage: z.array(ImageDamageIssueSchema).optional(),
  apartmentRisks: z.array(ImageApartmentRiskSchema).optional(),
  documentFields: z.array(ImageDocumentFieldSchema).optional(),
  summary: z.string(),
  overallConfidence: z.number().int().min(0).max(100),
});
