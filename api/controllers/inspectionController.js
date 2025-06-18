const fs = require("fs");
const path = require("path");

const inspectionsFile = path.join(__dirname, "../data/inspections.json");

function readInspections() {
  const data = fs.readFileSync(inspectionsFile, "utf8");
  return JSON.parse(data);
}

function writeInspections(data) {
  fs.writeFileSync(inspectionsFile, JSON.stringify(data, null, 2));
}

exports.patchInspection = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid inspection ID." });
  }

  const inspections = readInspections();
  const inspectionIndex = inspections.findIndex((insp) => insp.id === id);

  if (inspectionIndex === -1) {
    return res.status(404).json({ error: "Inspection not found." });
  }

  const allowedFields = [
    "location",
    "status",
    "notes",
    "inspector",
    "type",
    "priority",
    "violations",
    "coordinates",
  ];

  const updates = {};
  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  }

  if (updates.violations && !Array.isArray(updates.violations)) {
    return res.status(400).json({ error: "Violations must be an array." });
  }

  if (
    updates.coordinates &&
    (typeof updates.coordinates.lat !== "number" ||
      typeof updates.coordinates.lng !== "number")
  ) {
    return res
      .status(400)
      .json({ error: "Coordinates must be an object with numberic lat/lng." });
  }

  inspections[inspectionIndex] = {
    ...inspections[inspectionIndex],
    ...updates,
    date: new Date().toISOString,
  };

  writeInspections(inspections);

  res.json(inspections[inspectionIndex]);
};

exports.getInspections = (req, res) => {
  const inspections = readInspections();
  res.json(inspections);
};

exports.getInspectionsById = (req, res) => {
  const inspections = readInspections();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid inspection ID." });
  }

  const inspection = inspections.find((insp) => insp.id === id);

  if (!inspection) {
    return res.status(404).json({ error: "Inspection not found." });
  }

  res.json(inspection);
};

exports.createInspection = (req, res) => {
  const {
    location,
    status,
    inspector,
    type,
    priority,
    violations,
    coordinates,
    notes,
  } = req.body;

  if (!location || !status || !notes || !inspector || !type) {
    return res.status(400).json({
      error:
        "Missing required fields: location, status, notes, inspector, and type.",
    });
  }

  if (
    coordinates &&
    (typeof coordinates.lat !== "number" || typeof coordinates.lng !== "number")
  ) {
    return res
      .status(400)
      .json({ error: "Coordinates must be an object with numeric lat/lng." });
  }

  const inspections = readInspections();

  const newInspection = {
    id: inspections.length + 1,
    location,
    status,
    inspector,
    type,
    priority: priority || "Medium",
    violations: violations || [],
    coordinates: coordinates || null,
    date: new Date().toISOString,
  };

  inspections.push(newInspection);
  writeInspections(inspections);
  //201 code signifies successful creation
  res.status(201).json(newInspection);
};
