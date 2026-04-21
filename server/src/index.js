import app from "./app.js";
import { pool } from "./config/db.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database Connected");

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database", error);
    process.exit(1);
  }
};

startServer();
