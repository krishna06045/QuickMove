import type { Message } from "../types";

export const extraConversations: Record<string, Message[]> = {
  "cus_001": [
    {
      id: "r_1",
      customerId: "cus_001",
      sender: "system",
      type: "system-event",
      content: "Lead assigned to Logistics Coordinator (Bangalore to Pune)",
      timestamp: "2026-07-18T10:30:00Z"
    },
    {
      id: "r_2",
      customerId: "cus_001",
      sender: "agent",
      type: "text",
      content: "Hi Rohan, QuickMove here! We saw your request for a move from Bangalore to Pune.",
      timestamp: "2026-07-18T10:45:00Z"
    },
    {
      id: "r_3",
      customerId: "cus_001",
      sender: "customer",
      type: "text",
      content: "Yes, I need to move a 2BHK and my Royal Enfield bike.",
      timestamp: "2026-07-18T10:50:00Z"
    },
    {
      id: "r_4",
      customerId: "cus_001",
      sender: "customer",
      type: "image",
      content: "Bike registration for transport",
      timestamp: "2026-07-18T10:52:00Z",
      metadata: { fileUrl: "/images/rc.jpg", fileName: "rc_book.jpg", fileSize: "1.2 MB" }
    },
    {
      id: "r_5",
      customerId: "cus_001",
      sender: "agent",
      type: "text",
      content: "Got it. For the bike, we will need the original RC and insurance during transit. Does your 2BHK have any oversized furniture?",
      timestamp: "2026-07-18T11:00:00Z"
    },
    {
      id: "r_6",
      customerId: "cus_001",
      sender: "customer",
      type: "voice",
      content: "I have a solid teakwood wardrobe, it is quite heavy and cannot be dismantled.",
      timestamp: "2026-07-18T11:15:00Z",
      metadata: { duration: 18 }
    },
    {
      id: "r_7",
      customerId: "cus_001",
      sender: "customer",
      type: "text",
      content: "bhai shifting monday kar dena. owner ready hai, agreement kal sign kar lenge.",
      timestamp: "2026-07-18T11:20:00Z"
    },
    {
      id: "r_8",
      customerId: "cus_001",
      sender: "customer",
      type: "text",
      content: "token de diya hai. budget thoda flexible hai, 50k tak chalega.",
      timestamp: "2026-07-18T11:21:00Z"
    },
    {
      id: "r_9",
      customerId: "cus_001",
      sender: "agent",
      type: "text",
      content: "Understood, Monday is confirmed. Is there a lift at your current Bangalore location?",
      timestamp: "2026-07-18T11:25:00Z"
    },
    {
      id: "r_10",
      customerId: "cus_001",
      sender: "customer",
      type: "text",
      content: "lift available nahi hai, third floor hai. fridge aur washing machine bhi include kar dena.",
      timestamp: "2026-07-18T11:28:00Z"
    },
    {
      id: "r_11",
      customerId: "cus_001",
      sender: "agent",
      type: "text",
      content: "No problem, we will send extra labor for the 3rd floor. What about the destination in Pune?",
      timestamp: "2026-07-18T11:32:00Z"
    },
    {
      id: "r_12",
      customerId: "cus_001",
      sender: "customer",
      type: "text",
      content: "destination pe service lift available hai. packing wale subah 9 baje aa jayenge?",
      timestamp: "2026-07-18T11:35:00Z"
    }
  ],
  "cus_003": [
    {
      id: "a_1",
      customerId: "cus_003",
      sender: "customer",
      type: "text",
      content: "Hi, I need a full premium packing for a 4BHK Villa from Delhi to Bangalore.",
      timestamp: "2026-07-15T09:15:00Z"
    },
    {
      id: "a_2",
      customerId: "cus_003",
      sender: "agent",
      type: "text",
      content: "Hi Amit, we can definitely handle that. For a 4BHK Villa, we recommend a dedicated 20ft container.",
      timestamp: "2026-07-15T09:30:00Z"
    },
    {
      id: "a_3",
      customerId: "cus_003",
      sender: "customer",
      type: "text",
      content: "My budget is strict at 1.2 Lakhs. Can we fit it in? Also, we have a pet Beagle.",
      timestamp: "2026-07-15T09:45:00Z"
    },
    {
      id: "a_4",
      customerId: "cus_003",
      sender: "system",
      type: "system-event",
      content: "Pet relocation added to requirements",
      timestamp: "2026-07-15T09:46:00Z"
    }
  ],
  "cus_004": [
    {
      id: "s_1",
      customerId: "cus_004",
      sender: "customer",
      type: "text",
      content: "Moving just a few boxes and my TV to Gurgaon. Extremely small move.",
      timestamp: "2026-06-25T11:45:00Z"
    },
    {
      id: "s_2",
      customerId: "cus_004",
      sender: "agent",
      type: "text",
      content: "Hi Sneha, we can do a part-load sharing truck for this to keep costs low.",
      timestamp: "2026-06-25T11:50:00Z"
    },
    {
      id: "s_3",
      customerId: "cus_004",
      sender: "customer",
      type: "location",
      content: "Drop off location in Gurgaon",
      timestamp: "2026-06-25T12:00:00Z",
      metadata: { address: "DLF Phase 3, Gurgaon", latitude: 28.49, longitude: 77.09 }
    }
  ]
};
