const connectDB = require("./connectDB");

const sampleInspections = [
  {
    location: "Newark Bay Chemical Complex",
    status: "Pending",
    inspector: "Sarah Johnson",
    type: "Water Quality",
    priority: "High",
    violations: JSON.stringify([
      "pH levels exceed state standards",
      "Discharge permit expired",
    ]),
    coordinates_lat: 40.7282,
    coordinates_lng: -74.1776,
    notes:
      "Follow-up inspection required within 30 days. Potential groundwater contamination detected.",
    date: new Date("2024-06-20").toISOString(),
  },
  {
    location: "Paterson Industrial Park - Building 7",
    status: "Completed",
    inspector: "Michael Chen",
    type: "Air Quality",
    priority: "Medium",
    violations: JSON.stringify([]),
    coordinates_lat: 40.9168,
    coordinates_lng: -74.1707,
    notes: "Routine inspection completed. All equipment within compliance.",
    date: new Date("2024-06-18").toISOString(),
  },
  {
    location: "Camden Waterfront Facility",
    status: "In Progress",
    inspector: "Lisa Rodriguez",
    type: "Soil Contamination",
    priority: "High",
    violations: JSON.stringify([
      "Heavy metals above remediation standards",
      "Inadequate containment barriers",
    ]),
    coordinates_lat: 39.9526,
    coordinates_lng: -75.1652,
    notes:
      "Superfund site assessment ongoing. Immediate remediation action required.",
    date: new Date("2024-06-15").toISOString(),
  },
  {
    location: "Trenton Manufacturing Center",
    status: "Completed",
    inspector: "David Kim",
    type: "Waste Management",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: 40.2206,
    coordinates_lng: -74.7563,
    notes:
      "Annual compliance check. All waste disposal procedures properly documented.",
    date: new Date("2024-06-12").toISOString(),
  },
  {
    location: "Atlantic City Refinery Complex",
    status: "Pending",
    inspector: "Jennifer Walsh",
    type: "Air Quality",
    priority: "High",
    violations: JSON.stringify([
      "Emission levels exceeded during testing",
      "Missing air quality monitoring data",
    ]),
    coordinates_lat: 39.3643,
    coordinates_lng: -74.4229,
    notes:
      "Elevated sulfur dioxide readings detected. Requesting immediate corrective action plan.",
    date: new Date("2024-06-10").toISOString(),
  },
  {
    location: "Jersey City Port Authority",
    status: "Completed",
    inspector: "Robert Torres",
    type: "Water Quality",
    priority: "Medium",
    violations: JSON.stringify(["Minor oil sheen observed in drainage area"]),
    coordinates_lat: 40.7178,
    coordinates_lng: -74.0431,
    notes:
      "Small containment issue resolved on-site. Follow-up scheduled for next quarter.",
    date: new Date("2024-06-08").toISOString(),
  },
  {
    location: "Elizabeth Chemical Storage Facility",
    status: "Pending",
    inspector: "Amanda Foster",
    type: "Hazardous Materials",
    priority: "High",
    violations: JSON.stringify([
      "Improper chemical storage containers",
      "Missing safety documentation",
      "Inadequate spill containment",
    ]),
    coordinates_lat: 40.6639,
    coordinates_lng: -74.2107,
    notes:
      "Multiple violations identified. Site poses potential environmental risk. Urgent compliance required.",
    date: new Date("2024-06-05").toISOString(),
  },
  {
    location: "Princeton Research Laboratory",
    status: "Completed",
    inspector: "Thomas Lee",
    type: "Laboratory Waste",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: 40.3573,
    coordinates_lng: -74.6672,
    notes:
      "University laboratory inspection. All procedures compliant with state regulations.",
    date: new Date("2024-06-03").toISOString(),
  },
  {
    location: "Bayonne Energy Plant",
    status: "In Progress",
    inspector: "Maria Gonzalez",
    type: "Air Quality",
    priority: "Medium",
    violations: JSON.stringify(["Particulate matter slightly above threshold"]),
    coordinates_lat: 40.6687,
    coordinates_lng: -74.1143,
    notes:
      "Monitoring equipment calibration in progress. Preliminary readings show minor elevation.",
    date: new Date("2024-06-01").toISOString(),
  },
  {
    location: "Hoboken Waste Treatment Plant",
    status: "Completed",
    inspector: "Kevin O'Brien",
    type: "Water Quality",
    priority: "Medium",
    violations: JSON.stringify([]),
    coordinates_lat: 40.7439,
    coordinates_lng: -74.0323,
    notes:
      "Municipal facility operating within all parameters. Effluent quality excellent.",
    date: new Date("2024-05-30").toISOString(),
  },
  // 10 more records...
  {
    location: "Fort Lee Construction Site",
    status: "Pending",
    inspector: "Sarah Johnson",
    type: "Soil Contamination",
    priority: "Medium",
    violations: JSON.stringify(["Excavation without proper soil testing"]),
    coordinates_lat: 40.8501,
    coordinates_lng: -73.9701,
    notes: "Construction halted pending soil analysis results.",
    date: new Date("2024-05-28").toISOString(),
  },
  {
    location: "Passaic River Monitoring Station 3",
    status: "Completed",
    inspector: "Michael Chen",
    type: "Water Quality",
    priority: "High",
    violations: JSON.stringify(["Elevated mercury levels detected"]),
    coordinates_lat: 40.8676,
    coordinates_lng: -74.1943,
    notes:
      "Monthly monitoring shows concerning mercury trend. Investigating upstream sources.",
    date: new Date("2024-05-25").toISOString(),
  },
  {
    location: "Newark Airport Fuel Storage",
    status: "In Progress",
    inspector: "Lisa Rodriguez",
    type: "Hazardous Materials",
    priority: "High",
    violations: JSON.stringify(["Fuel leak detected in secondary containment"]),
    coordinates_lat: 40.6895,
    coordinates_lng: -74.1745,
    notes:
      "Airport authority notified. Containment measures activated. Cleanup contractor engaged.",
    date: new Date("2024-05-22").toISOString(),
  },
  {
    location: "Morristown Industrial Complex",
    status: "Completed",
    inspector: "David Kim",
    type: "Air Quality",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: 40.7968,
    coordinates_lng: -74.4815,
    notes:
      "Quarterly inspection completed without issues. All emissions within limits.",
    date: new Date("2024-05-20").toISOString(),
  },
  {
    location: "Hackensack Landfill Site",
    status: "Pending",
    inspector: "Jennifer Walsh",
    type: "Waste Management",
    priority: "Medium",
    violations: JSON.stringify([
      "Improper waste segregation",
      "Missing methane monitoring data",
    ]),
    coordinates_lat: 40.8859,
    coordinates_lng: -74.0434,
    notes: "Landfill operator has 30 days to submit corrective action plan.",
    date: new Date("2024-05-18").toISOString(),
  },
  {
    location: "Asbury Park Marina",
    status: "Completed",
    inspector: "Robert Torres",
    type: "Water Quality",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: 40.2204,
    coordinates_lng: -74.0121,
    notes:
      "Seasonal marina inspection. All fuel handling procedures compliant.",
    date: new Date("2024-05-15").toISOString(),
  },
  {
    location: "Hamilton Township Solar Farm",
    status: "Completed",
    inspector: "Amanda Foster",
    type: "Environmental Impact",
    priority: "Low",
    violations: JSON.stringify([]),
    coordinates_lat: 40.2298,
    coordinates_lng: -74.6896,
    notes:
      "Post-construction environmental assessment. Minimal ecological impact observed.",
    date: new Date("2024-05-12").toISOString(),
  },
  {
    location: "Red Bank Chemical Distribution",
    status: "Pending",
    inspector: "Thomas Lee",
    type: "Hazardous Materials",
    priority: "High",
    violations: JSON.stringify([
      "Expired chemical inventory documentation",
      "Inadequate employee training records",
    ]),
    coordinates_lat: 40.3471,
    coordinates_lng: -74.0776,
    notes:
      "Distribution facility requires immediate compliance update. Safety concerns noted.",
    date: new Date("2024-05-10").toISOString(),
  },
  {
    location: "Vineland Agricultural Processing",
    status: "In Progress",
    inspector: "Maria Gonzalez",
    type: "Water Quality",
    priority: "Medium",
    violations: JSON.stringify(["Elevated nitrogen in runoff water"]),
    coordinates_lat: 39.4864,
    coordinates_lng: -75.026,
    notes:
      "Agricultural runoff assessment ongoing. Working with facility on best management practices.",
    date: new Date("2024-05-08").toISOString(),
  },
  {
    location: "Lakewood Medical Waste Facility",
    status: "Completed",
    inspector: "Kevin O'Brien",
    type: "Waste Management",
    priority: "High",
    violations: JSON.stringify([]),
    coordinates_lat: 40.0978,
    coordinates_lng: -74.2179,
    notes:
      "Medical waste handling inspection passed. All sterilization and disposal protocols followed.",
    date: new Date("2024-05-05").toISOString(),
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
