import type { ResultSetHeader } from "mysql2/promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../../db/connection.js";
import * as leadsService from "../leads.service.js";

vi.mock("../../db/connection.js", () => ({
  pool: { execute: vi.fn() },
}));

describe("leads.service", () => {
  beforeEach(() => {
    vi.mocked(pool.execute).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createLead", () => {
    it("returns null if contact does not exist", async () => {
      vi.mocked(pool.execute).mockResolvedValueOnce([[], []] as Awaited<ReturnType<typeof pool.execute>>);

      const result = await leadsService.createLead({
        contactId: "non-existent-contact-id",
        name: "Lead",
        company: "Company",
        status: "novo",
      });

      expect(result).toBeNull();
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteLead", () => {
    it("returns false if not found", async () => {
      const mockResult = { affectedRows: 0 } as ResultSetHeader;
      vi.mocked(pool.execute).mockResolvedValueOnce([mockResult, []] as Awaited<ReturnType<typeof pool.execute>>);

      const result = await leadsService.deleteLead("non-existent-lead-id");

      expect(result).toBe(false);
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllLeads (pagination)", () => {
    it("returns correct structure with data and pagination", async () => {
      vi.mocked(pool.execute)
        .mockResolvedValueOnce([[{ total: 0 }], []] as Awaited<ReturnType<typeof pool.execute>>)
        .mockResolvedValueOnce([[], []] as Awaited<ReturnType<typeof pool.execute>>);

      const result = await leadsService.getAllLeads({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty("pagination");
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    });

    it("returns totalPages from count and limit", async () => {
      vi.mocked(pool.execute)
        .mockResolvedValueOnce([[{ total: 25 }], []] as Awaited<ReturnType<typeof pool.execute>>)
        .mockResolvedValueOnce([[], []] as Awaited<ReturnType<typeof pool.execute>>);

      const result = await leadsService.getAllLeads({
        page: 2,
        limit: 10,
      });

      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
    });
  });
});
