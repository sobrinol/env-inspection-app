const connectDB = require("./connectDB");

(async () => {
  const db = await connectDB();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      inspector TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      violations TEXT DEFAULT '[]',
      coordinates_lat REAL,
      coordinates_lng REAL,
      notes TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);

  console.log("Database initialized");
})();
