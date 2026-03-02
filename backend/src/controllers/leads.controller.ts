import type { Context } from "hono";
import { leadSchema } from "../schemas/lead.schema.js";
import * as leadsService from "../services/leads.service.js";
import { badRequest, created, notFound, ok } from "../utils/http.js";
import { validateBody } from "../utils/validation.js";

export async function getLeads(c: Context) {
  const search = c.req.query("search");
  const status = c.req.query("status");
  const leads = await leadsService.getAllLeads(search, status);
  return ok(c, leads);
}

export async function createLead(c: Context) {
  const body = await c.req.json();
  const result = validateBody(leadSchema, body);
  if (!result.success) {
    return badRequest(c, result.error);
  }
  const lead = await leadsService.createLead(result.data);
  if (!lead) return badRequest(c, "Contact does not exist");
  return created(c, lead);
}

export async function updateLead(c: Context) {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = validateBody(leadSchema, body);
  if (!result.success) {
    return badRequest(c, result.error);
  }
  const lead = await leadsService.updateLead(id, result.data);
  if (!lead) return notFound(c, "Lead not found");
  return ok(c, lead);
}

export async function getLeadsByContactId(c: Context) {
  const contactId = c.req.param("contactId");
  const leads = await leadsService.getLeadsByContactId(contactId);
  if (leads === null) return notFound(c, "Contact not found");
  return ok(c, leads);
}
