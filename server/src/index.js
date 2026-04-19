import app from "./app.js";
import { pool } from "./config/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Supabase Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to Supabase", error);
    process.exit(1);
  }
};

startServer();
