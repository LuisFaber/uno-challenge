import { pool } from "./connection.js";

export async function initDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      createdAt DATETIME NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(36) PRIMARY KEY,
      contactId VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      status ENUM('novo','contactado','qualificado','convertido','perdido') NOT NULL,
      createdAt DATETIME NOT NULL,
      FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);
}
