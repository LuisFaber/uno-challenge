import { Hono } from "hono";
import * as contactsController from "../controllers/contacts.controller.js";
import * as leadsController from "../controllers/leads.controller.js";

const contacts = new Hono();

contacts.get("/", contactsController.getContacts);
contacts.post("/", contactsController.createContact);
contacts.put("/:id", contactsController.updateContact);
contacts.get("/:contactId/leads", leadsController.getLeadsByContactId);

export { contacts };
