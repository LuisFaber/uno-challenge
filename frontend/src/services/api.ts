import type { Contact } from "../types/contact";

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

export async function getLeads(_params?: Record<string, string>): Promise<unknown> {
  const q = _params ? new URLSearchParams(_params).toString() : "";
  const url = q ? `${API_URL}/leads?${q}` : `${API_URL}/leads`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function createLead(_body: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_body),
  });
  if (!res.ok) throw new Error("Failed to create lead");
  return res.json();
}

export async function updateLead(_id: string, _body: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}/leads/${_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_body),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function deleteLead(_id: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/leads/${_id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete lead");
  return res.json();
}

export async function getLeadsByContact(contactId: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts/${contactId}/leads`);
  if (!res.ok) throw new Error("Failed to fetch leads by contact");
  return res.json();
}
