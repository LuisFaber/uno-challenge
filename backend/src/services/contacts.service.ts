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

export class DuplicateContactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateContactError";
  }
}

export async function createContact(data: ContactInput): Promise<Contact> {
  const [byEmail] = await pool.execute<ContactRow[]>(
    "SELECT id FROM contacts WHERE LOWER(email) = LOWER(?)",
    [data.email]
  );
  if (byEmail.length > 0) {
    throw new DuplicateContactError("A contact with this email already exists.");
  }
  const [byPhone] = await pool.execute<ContactRow[]>(
    "SELECT id FROM contacts WHERE phone = ?",
    [data.phone]
  );
  if (byPhone.length > 0) {
    throw new DuplicateContactError("A contact with this phone already exists.");
  }

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
  const [byEmail] = await pool.execute<ContactRow[]>(
    "SELECT id FROM contacts WHERE LOWER(email) = LOWER(?) AND id != ?",
    [data.email, id]
  );
  if (byEmail.length > 0) {
    throw new DuplicateContactError("A contact with this email already exists.");
  }
  const [byPhone] = await pool.execute<ContactRow[]>(
    "SELECT id FROM contacts WHERE phone = ? AND id != ?",
    [data.phone, id]
  );
  if (byPhone.length > 0) {
    throw new DuplicateContactError("A contact with this phone already exists.");
  }

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

/** Deletes contact. Leads linked to this contact are removed by DB (FK ON DELETE CASCADE). */
export async function deleteContact(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM contacts WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
