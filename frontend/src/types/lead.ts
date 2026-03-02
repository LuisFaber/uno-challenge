export type LeadStatus =
  | "novo"
  | "contactado"
  | "qualificado"
  | "convertido"
  | "perdido";

export interface Lead {
  id: string;
  contactId: string;
  name: string;
  company: string;
  status: LeadStatus;
  createdAt: string;
}

export type CreateLeadData = Pick<Lead, "contactId" | "name" | "company" | "status">;

export type UpdateLeadData = Pick<Lead, "name" | "company" | "status"> & { contactId?: string };
