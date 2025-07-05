const connectDB = require("./connectDB");

(async () => {
  const db = await connectDB();

  try {
    await db.run("DELETE FROM inspections");
    await db.run("VACUUM");

    console.log("Database cleared successfully.");

    require("./seed");
  } catch (err) {
    console.error("Error resetting database:", err.message);
  } finally {
    await db.close();
  }
})();
