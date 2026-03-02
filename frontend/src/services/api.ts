const API_URL = "http://localhost:3000";

export async function getContacts(): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function createContact(_body: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_body),
  });
  if (!res.ok) throw new Error("Failed to create contact");
  return res.json();
}

export async function updateContact(_id: string, _body: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts/${_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_body),
  });
  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
}

export async function deleteContact(_id: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/contacts/${_id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete contact");
  return res.json();
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
