export type ChatMessage = { id: string; sender: "self" | "contact"; text: string; time: string; attachmentName?: string; attachmentPath?: string };
export type ChatContact = { name: string; role: string; portrait?: string; phone?: string };
export const customerQuickMessages = ["Please call when you arrive", "Where is my order?", "I'm at the delivery address"];

