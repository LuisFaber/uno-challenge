import type { ResultSetHeader } from "mysql2/promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../../db/connection.js";
import * as contactsService from "../contacts.service.js";

vi.mock("../../db/connection.js", () => ({
  pool: { execute: vi.fn() },
}));

describe("contacts.service", () => {
  beforeEach(() => {
    vi.mocked(pool.execute).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createContact", () => {
    it("returns object with id and createdAt", async () => {
      const mockResult = { affectedRows: 1 } as ResultSetHeader;
      vi.mocked(pool.execute).mockResolvedValue([mockResult, []] as Awaited<ReturnType<typeof pool.execute>>);

      const data = {
        name: "Maria",
        email: "maria@email.com",
        phone: "11999998888",
      };
      const result = await contactsService.createContact(data);

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(result).toHaveProperty("createdAt");
      expect(typeof result.createdAt).toBe("string");
      expect(result.name).toBe(data.name);
      expect(result.email).toBe(data.email);
      expect(result.phone).toBe(data.phone);
    });
  });

  describe("updateContact", () => {
    it("returns null if not found", async () => {
      const mockResult = { affectedRows: 0 } as ResultSetHeader;
      vi.mocked(pool.execute).mockResolvedValueOnce([mockResult, []] as Awaited<ReturnType<typeof pool.execute>>);

      const result = await contactsService.updateContact("non-existent-id", {
        name: "Maria",
        email: "maria@email.com",
        phone: "11999998888",
      });

      expect(result).toBeNull();
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });
  });
});
