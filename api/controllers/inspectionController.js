const connectDB = require("../database/connectDB");

exports.deleteInspectionById = async (req, res, next) => {
  try {
    const inspections = await readInspections();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID." });
    }

    const inspectionIndex = inspections.findIndex((insp) => insp.id === id);

    if (inspectionIndex === -1) {
      return res.status(404).json({ error: "Inspection not found." });
    }

    inspections.splice(inspectionIndex, 1);

    await writeInspections(inspections);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.patchInspection = async (req, res, next) => {
  try {
    const db = await connectDB();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID." });
    }

    const existingInspection = await db.get(
      "SELECT * FROM inspections WHERE id = ?",
      [id]
    );

    if (!existingInspection) {
      await db.close();
      return res.status(404).json({ error: "Inspection not found." });
    }

    const updateFields = [];
    const updateValues = [];

    Object.keys(req.body).forEach((key) => {
      if (key === "coordinates") {
        if (req.body.coordinates) {
          updateFields.push("coordinates_lat = ?");
          updateFields.push("coordinates_lng = ?");
          updateValues.push(req.body.coordinates.lat);
          updateValues.push(req.body.coordinates.lng);
        } else {
          updateFields.push("coordinates_lat = ?");
          updateFields.push("coordinates_lng = ?");
          updateValues.push(null);
          updateValues.push(null);
        }
      } else if (key === "violations") {
        updateFields.push("violations = ?");
        updateValues.push(JSON.stringify(req.body.violations));
      } else {
        updateFields.push(`${key} = ?`);
        updateValues.push(req.body[key]);
      }
    });

    updateFields.push("date = ?");
    updateValues.push(new Date().toISOString());

    updateValues.push(id);

    const updateQuery = `
        UPDATE inspections
        SET ${updateFields.join(", ")}
        WHERE id = ?
    `;

    await db.run(updateQuery, updateValues);

    const updatedInspection = await db.get(
      "SELECT * FROM inspections WHERE id = ?",
      [id]
    );

    const formattedInspection = formatInspectionForResponse(updatedInspection);

    await db.close();
    res.json(formattedInspection);
  } catch (err) {
    next(err);
  }
};

exports.getInspections = async (req, res, next) => {
  try {
    const db = await connectDB();
    const inspections = await db.all(
      "SELECT * FROM inspections ORDER BY date DESC"
    );

    const formattedInspections = inspections.map(formatInspectionForResponse);

    await db.close();
    res.json(formattedInspections);
  } catch (err) {
    next(err);
  }
};

exports.getInspectionsById = async (req, res, next) => {
  try {
    const db = await connectDB();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID." });
    }

    const inspection = await db.get("SELECT * FROM inspections WHERE id = ?", [
      id,
    ]);

    if (!inspection) {
      await db.close();
      return res.status(404).json({ error: "Inspection not found." });
    }

    const formattedInspections = formatInspectionForResponse(inspection);

    await db.close();

    res.json(formattedInspections);
  } catch (err) {
    next(err);
  }
};

exports.createInspection = async (req, res, next) => {
  try {
    const db = await connectDB();

    const {
      location,
      status,
      inspector,
      type,
      priority = "Medium",
      violations = [],
      coordinates,
      notes,
    } = req.body;

    const insertQuery = `
        INSERT INTO inspections
        (location, status, inspector, type, priority, violations, coordinates_lat, coordinates_lng, notes, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(insertQuery, [
      location,
      status,
      inspector,
      type,
      priority,
      JSON.stringify(violations),
      coordinates ? coordinates.lat : null,
      coordinates ? coordinates.lng : null,
      notes,
      new Date().toISOString(),
    ]);

    const newInspection = await db.get(
      "SELECT * FROM inspections WHERE id = ?",
      [result.lastID]
    );

    const formattedInspection = formatInspectionForResponse(newInspection);

    await db.close();

    res.status(201).json(formattedInspection);
  } catch (err) {
    next(err);
  }
};

function formatInspectionForResponse(inspection) {
  return {
    id: inspection.id,
    location: inspection.location,
    status: inspection.status,
    inspector: inspection.inspector,
    type: inspection.type,
    priority: inspection.priority,
    violations: JSON.parse(inspection.violations || "[]"),
    coordinates:
      inspection.coordinates_lat && inspection.coordinates_lng
        ? { lat: inspection.coordinates_lat, lng: inspection.coordinates_lng }
        : null,
    notes: inspection.notes,
    date: inspection.date,
  };
}
