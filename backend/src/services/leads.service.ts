import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../db/connection.js";
import type { Lead } from "../types/lead.type.js";
import type { LeadInput } from "../schemas/lead.schema.js";

type LeadRow = RowDataPacket & {
  id: string;
  contactId: string;
  name: string;
  company: string;
  status: string;
  createdAt: Date;
};

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    contactId: row.contactId,
    name: row.name,
    company: row.company,
    status: row.status as Lead["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllLeads(
  search?: string,
  status?: string
): Promise<Lead[]> {
  const conditions: string[] = [];
  const params: string[] = [];

  if (search) {
    const pattern = `%${search.toLowerCase()}%`;
    conditions.push("(LOWER(name) LIKE ? OR LOWER(company) LIKE ?)");
    params.push(pattern, pattern);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const [rows] = await pool.execute<LeadRow[]>(
    `SELECT id, contactId, name, company, status, createdAt FROM leads${where}`,
    params
  );
  return rows.map(rowToLead);
}

export async function createLead(data: LeadInput): Promise<Lead | null> {
  const [contactRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM contacts WHERE id = ?",
    [data.contactId]
  );
  if (contactRows.length === 0) return null;

  const id = crypto.randomUUID();
  const createdAt = new Date();
  await pool.execute(
    "INSERT INTO leads (id, contactId, name, company, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [id, data.contactId, data.name, data.company, data.status, createdAt]
  );
  return {
    id,
    contactId: data.contactId,
    name: data.name,
    company: data.company,
    status: data.status,
    createdAt: createdAt.toISOString(),
  };
}

export async function updateLead(
  id: string,
  data: LeadInput
): Promise<Lead | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE leads SET name = ?, company = ?, status = ? WHERE id = ?",
    [data.name, data.company, data.status, id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.execute<LeadRow[]>(
    "SELECT id, contactId, name, company, status, createdAt FROM leads WHERE id = ?",
    [id]
  );
  const row = rows[0];
  return row ? rowToLead(row) : null;
}

export async function getLeadsByContactId(
  contactId: string
): Promise<Lead[] | null> {
  const [contactRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM contacts WHERE id = ?",
    [contactId]
  );
  if (contactRows.length === 0) return null;

  const [rows] = await pool.execute<LeadRow[]>(
    "SELECT id, contactId, name, company, status, createdAt FROM leads WHERE contactId = ?",
    [contactId]
  );
  return rows.map(rowToLead);
}
