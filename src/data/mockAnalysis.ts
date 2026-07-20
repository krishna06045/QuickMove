import type { AIAnalysis } from "../types";

export const mockAnalysis: Record<string, AIAnalysis> = {
  "cus_002": {
    customerId: "cus_002",
    profile: {
      name: { value: "Priya Desai", confidence: 99, status: "Confirmed", sourceEvidence: { messageId: "m_2", timestamp: "2026-07-15T09:15:00Z", preview: "Hi Priya!" } },
      contact: { value: "+91 91234 56789", confidence: 95, status: "Confirmed" },
      familySize: { value: "2 Adults", confidence: 85, status: "Updated", reasoning: "Customer mentioned sister is moving with her.", sourceEvidence: { messageId: "m_22", timestamp: "2026-07-17T10:15:00Z", preview: "my sister is moving with me" } },
      pets: { 
        value: "1 Dog (Golden Retriever)", 
        previousValue: "No pets", 
        confidence: 95, 
        status: "Conflicting", 
        reasoning: "Customer originally said no pets, but later added a Golden Retriever.", 
        sourceEvidence: { messageId: "m_22", timestamp: "2026-07-17T10:15:00Z", preview: "she has a Golden Retriever" },
        reasoningTimeline: [
          { messageId: "m_12", timestamp: "2026-07-15T13:10:00Z", description: "Customer explicitly stated 'No pets.'", type: "statement" },
          { messageId: "m_22", timestamp: "2026-07-17T10:15:00Z", description: "Customer stated sister is moving with a Golden Retriever.", type: "conflict" },
          { messageId: "m_24", timestamp: "2026-07-17T10:30:00Z", description: "Agent confirmed pet relocation services and charges.", type: "resolution" }
        ]
      },
      dietaryPreferences: { value: "Vegan (Sister)", confidence: 90, status: "Confirmed", reasoning: "Customer requested vegan grocery delivery options.", sourceEvidence: { messageId: "m_36", timestamp: "2026-07-18T09:00:00Z", preview: "my sister is strictly vegan" } }
    },
    moveDetails: {
      origin: { value: "Andheri West, Mumbai", confidence: 95, status: "Confirmed", sourceEvidence: { messageId: "m_4", timestamp: "2026-07-15T10:21:00Z", preview: "I have a 3BHK here in Andheri West." } },
      destination: { value: "Lodha Bellezza, Banjara Hills, Hyderabad", confidence: 98, status: "Updated", reasoning: "Customer provided specific destination address.", sourceEvidence: { messageId: "m_28", timestamp: "2026-07-17T12:01:00Z", preview: "Lodha Bellezza, Banjara Hills" } },
      propertyConfig: { value: "3 BHK", confidence: 99, status: "Confirmed", sourceEvidence: { messageId: "m_4", timestamp: "2026-07-15T10:21:00Z", preview: "I have a 3BHK here" } },
      preferredLocality: { value: "Banjara Hills", previousValue: "Gachibowli", confidence: 100, status: "Updated", reasoning: "Initially considering Gachibowli/Hitech City, but finalized Banjara Hills.", sourceEvidence: { messageId: "m_15", timestamp: "2026-07-16T11:07:00Z", preview: "I think Banjara Hills might be better" } }
    },
    budget: {
      amount: { 
        value: "₹84,500 (Quoted)", 
        previousValue: "₹60,000", 
        confidence: 95, 
        status: "Conflicting", 
        reasoning: "Customer agreed to ₹84,500 but now wants to add a dining table for free.", 
        sourceEvidence: { messageId: "m_40", timestamp: "2026-07-18T10:05:00Z", preview: "hoping it fits since the pet cost was a bit high" },
        reasoningTimeline: [
          { messageId: "m_6", timestamp: "2026-07-15T11:00:00Z", description: "Customer stated initial budget of ₹60,000.", type: "statement" },
          { messageId: "m_21", timestamp: "2026-07-17T09:45:00Z", description: "Agent quoted ₹76,000 after removing heavy items.", type: "statement" },
          { messageId: "m_29", timestamp: "2026-07-17T14:00:00Z", description: "Agent finalized quote at ₹84,500 including pet relocation.", type: "resolution" },
          { messageId: "m_38", timestamp: "2026-07-18T10:00:00Z", description: "Customer requested to add dining table back without increasing ₹84,500 budget.", type: "conflict" }
        ]
      },
      flexibility: { value: "Low (Company reimbursing ₹75k)", confidence: 80, status: "Confirmed", sourceEvidence: { messageId: "m_17", timestamp: "2026-07-16T12:00:00Z", preview: "my company is only reimbursing ₹75k" } }
    },
    timeline: {
      expectedMoveDate: { value: "July 24, 2026", previousValue: "August 1, 2026", confidence: 95, status: "Updated", reasoning: "Company joining date moved up to July 28th.", sourceEvidence: { messageId: "m_15", timestamp: "2026-07-16T11:07:00Z", preview: "Can we do the move on July 24th instead?" } },
      flexibility: { value: "Strict", confidence: 85, status: "Confirmed" }
    },
    inventory: {
      summary: { value: "L-shaped sofa, 2 double beds, double-door fridge, 2 ACs, glassware, large TV. (Dining table status pending)", confidence: 90, status: "Needs Clarification", reasoning: "Customer wants to add dining table back into inventory without budget increase.", sourceEvidence: { messageId: "m_38", timestamp: "2026-07-18T10:00:00Z", preview: "we've decided to bring the dining table after all" } },
      specialItems: { value: ["Golden Retriever (Air Transport)", "Large TV", "Fragile Glassware"], confidence: 98, status: "Confirmed", sourceEvidence: { messageId: "m_12", timestamp: "2026-07-15T13:10:00Z", preview: "glassware and a large flat-screen TV" } }
    },
    utilities: {
      requirements: { value: ["AC Uninstallation (Origin)", "Pet Relocation"], confidence: 95, status: "Confirmed", reasoning: "AC installation at destination is NOT included.", sourceEvidence: { messageId: "m_31", timestamp: "2026-07-17T14:30:00Z", preview: "We only handle uninstallation at the origin." } }
    },
    requirementChanges: [
      {
        id: "rc_1",
        field: "Move Date",
        oldValue: "August 1, 2026",
        newValue: "July 24, 2026",
        reason: "Company joining date moved up.",
        timestamp: "2026-07-16T11:07:00Z",
        sourceEvidence: { messageId: "m_15", timestamp: "2026-07-16T11:07:00Z", preview: "Can we do the move on July 24th instead?" }
      }
    ],
    processingSummary: "The customer finalized the destination (Banjara Hills) and updated the move date to July 24th. A pet was added to the requirement, increasing the cost. The customer is currently trying to add a dining table back to the inventory without increasing the agreed ₹84,500 quote.",
    missingInformation: [
      "Final confirmation on dining table inclusion",
      "Advance payment receipt"
    ],
    suggestedNextActions: [
      "Review budget impact of adding the dining table.",
      "Send payment link for the advance.",
      "Book pet relocation slot for July 24th."
    ],
    suggestedReply: "Hi Priya, I see you want to add the dining table. Let me check with our logistics team if we can accommodate it within the same quote. Will confirm shortly!",
    operationsNotes: {
      requirementsSummary: "Moving 3BHK + Golden Retriever to Banjara Hills by July 24th.",
      unresolvedQuestions: ["Will the dining table fit in the existing ₹84,500 quote?"],
      risks: ["Tight timeline (July 24th)", "Budget constraints (Company limit ₹75k)"],
      nextActions: ["Confirm logistics for dining table", "Send advance payment link"],
      vendorFollowUps: ["Check pet relocation slot via Air Transport"]
    },
    overallConfidence: 88
  }
};
