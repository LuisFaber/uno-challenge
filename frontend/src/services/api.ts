import type { Contact } from "../types/contact";
import type { Lead, CreateLeadData, UpdateLeadData } from "../types/lead";

const API_URL = "http://localhost:3000";

export async function getContacts(search?: string): Promise<Contact[]> {
  const url = search ? `${API_URL}/contacts?search=${encodeURIComponent(search)}` : `${API_URL}/contacts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export type CreateContactData = Pick<Contact, "name" | "email" | "phone">;

const ERROR_MESSAGES_PT: Record<string, string> = {
  "A contact with this email already exists.": "Já existe um contato com este e-mail.",
  "A contact with this phone already exists.": "Já existe um contato com este telefone.",
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  const msg = typeof data?.error === "string" ? data.error : fallback;
  return ERROR_MESSAGES_PT[msg] ?? msg;
}

export async function createContact(data: CreateContactData): Promise<Contact> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao criar contato"));
  return res.json();
}

export async function updateContact(id: string, data: CreateContactData): Promise<Contact> {
  const res = await fetch(`${API_URL}/contacts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao atualizar contato"));
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/contacts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete contact");
}

export interface GetLeadsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  orderBy?: "name" | "createdAt";
  order?: "asc" | "desc";
}

export interface GetLeadsResult {
  data: Lead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getLeads(params?: GetLeadsParams): Promise<GetLeadsResult> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
  if (params?.order) searchParams.set("order", params.order);
  const q = searchParams.toString();
  const url = q ? `${API_URL}/leads?${q}` : `${API_URL}/leads`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await parseError(res, "Falha ao carregar leads"));
  return res.json();
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  const res = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao criar lead"));
  return res.json();
}

export async function updateLead(id: string, data: UpdateLeadData): Promise<Lead> {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao atualizar lead"));
  return res.json();
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/leads/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao excluir lead"));
}

export async function getLeadsByContact(contactId: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts/${contactId}/leads`);
  if (!res.ok) throw new Error("Failed to fetch leads by contact");
  return res.json();
}
