import { Hono } from "hono";
import * as leadsController from "../controllers/leads.controller.js";

const leads = new Hono();

leads.get("/", leadsController.getLeads);
leads.post("/", leadsController.createLead);
leads.put("/:id", leadsController.updateLead);

export { leads };
