const connectDB = require("./connectDB");

const sampleInspections = [
  {
    location: "Facility A",
    status: "Pending",
    inspector: "Jane Doe",
    type: "Air",
    priority: "High",
    violations: JSON.stringify(["Emission exceeded"]),
    coordinates_lat: 40.7128,
    coordinates_lng: -74.006,
    notes: "Requires follow-up",
    date: new Date().toISOString(),
  },
  {
    location: "Facility B",
    status: "Completed",
    inspector: "John Smith",
    type: "Water",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: null,
    coordinates_lng: null,
    notes: "No issues",
    date: new Date().toISOString(),
  },
];

(async () => {
  const db = await connectDB();

  const insertQuery = `
    INSERT INTO inspections
    (location, status, inspector, type, priority, violations, coordinates_lat, coordinates_lng, notes, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  for (const insp of sampleInspections) {
    await db.run(insertQuery, [
      insp.location,
      insp.status,
      insp.inspector,
      insp.type,
      insp.priority,
      insp.violations,
      insp.coordinates_lat,
      insp.coordinates_lng,
      insp.notes,
      insp.date,
    ]);
  }
})();
