import type { Context } from "hono";
import { contactSchema } from "../schemas/contact.schema.js";
import * as contactsService from "../services/contacts.service.js";
import { badRequest, created, notFound, ok } from "../utils/http.js";
import { validateBody } from "../utils/validation.js";

export async function getContacts(c: Context) {
  const search = c.req.query("search");
  const contacts = await contactsService.getAllContacts(search);
  return ok(c, contacts);
}

export async function createContact(c: Context) {
  const body = await c.req.json();
  const result = validateBody(contactSchema, body);
  if (!result.success) {
    return badRequest(c, result.error);
  }
  const contact = await contactsService.createContact(result.data);
  return created(c, contact);
}

export async function updateContact(c: Context) {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = validateBody(contactSchema, body);
  if (!result.success) {
    return badRequest(c, result.error);
  }
  const contact = await contactsService.updateContact(id, result.data);
  if (!contact) return notFound(c, "Contact not found");
  return ok(c, contact);
}

export async function deleteContact(c: Context) {
  const id = c.req.param("id");
  const deleted = await contactsService.deleteContact(id);
  if (!deleted) return notFound(c, "Contact not found");
  return ok(c, { message: "Contact deleted successfully" });
}
