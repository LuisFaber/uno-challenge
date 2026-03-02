export type LeadStatus =
  | "novo"
  | "contactado"
  | "qualificado"
  | "convertido"
  | "perdido";

export type Lead = {
  id: string;
  contactId: string;
  name: string;
  company: string;
  status: LeadStatus;
  createdAt: string;
};
