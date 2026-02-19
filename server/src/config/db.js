import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check server/.env");
}

export const pool = new Pool({
  connectionString,
  family: 4,
  ssl:
    process.env.NODE_ENV === "production" ||
    /sslmode=require|sslmode=verify-full/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : false,
});
