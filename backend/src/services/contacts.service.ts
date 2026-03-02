import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../db/connection.js";
import type { Contact } from "../types/contact.type.js";
import type { ContactInput } from "../schemas/contact.schema.js";

type ContactRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
};

function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllContacts(search?: string): Promise<Contact[]> {
  if (search) {
    const pattern = `%${search.toLowerCase()}%`;
    const [rows] = await pool.execute<ContactRow[]>(
      "SELECT id, name, email, phone, createdAt FROM contacts WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ?",
      [pattern, pattern]
    );
    return rows.map(rowToContact);
  }
  const [rows] = await pool.execute<ContactRow[]>(
    "SELECT id, name, email, phone, createdAt FROM contacts"
  );
  return rows.map(rowToContact);
}

export async function createContact(data: ContactInput): Promise<Contact> {
  const id = crypto.randomUUID();
  const createdAt = new Date();
  await pool.execute(
    "INSERT INTO contacts (id, name, email, phone, createdAt) VALUES (?, ?, ?, ?, ?)",
    [id, data.name, data.email, data.phone, createdAt]
  );
  return {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    createdAt: createdAt.toISOString(),
  };
}

export async function updateContact(
  id: string,
  data: ContactInput
): Promise<Contact | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?",
    [data.name, data.email, data.phone, id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.execute<ContactRow[]>(
    "SELECT id, name, email, phone, createdAt FROM contacts WHERE id = ?",
    [id]
  );
  const row = rows[0];
  return row ? rowToContact(row) : null;
}
