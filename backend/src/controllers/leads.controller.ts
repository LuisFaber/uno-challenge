import type { Context } from "hono";
import { leadSchema } from "../schemas/lead.schema.js";
import * as leadsService from "../services/leads.service.js";
import { badRequest, created, notFound, ok } from "../utils/http.js";
import { validateBody } from "../utils/validation.js";

function parsePage(s: string | undefined): number {
  const n = parseInt(s ?? "1", 10);
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

function parseLimit(s: string | undefined): number {
  const n = parseInt(s ?? "10", 10);
  if (Number.isNaN(n) || n < 1) return 10;
  return Math.min(n, 50);
}

export async function getLeads(c: Context) {
  const search = c.req.query("search");
  const status = c.req.query("status");
  const page = parsePage(c.req.query("page"));
  const limit = parseLimit(c.req.query("limit"));
  const orderBy = c.req.query("orderBy");
  const order = c.req.query("order");
  const validOrderBy = orderBy === "name" || orderBy === "createdAt" ? orderBy : "createdAt";
  const validOrder = order === "asc" || order === "desc" ? order : "desc";
  const result = await leadsService.getAllLeads({
    search,
    status,
    page,
    limit,
    orderBy: validOrderBy,
    order: validOrder,
  });
  return ok(c, result);
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

export async function deleteLead(c: Context) {
  const id = c.req.param("id");
  const deleted = await leadsService.deleteLead(id);
  if (!deleted) return notFound(c, "Lead not found");
  return ok(c, { message: "Lead deleted successfully" });
}
