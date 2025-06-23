const connectDB = require("../database/connectDB");
const { formatInspectionForResponse } = require("../utils/formatters");

exports.deleteInspectionById = async (req, res, next) => {
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

    await db.run("DELETE FROM inspections WHERE id = ?", [id]);

    await db.close();
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

    const inspection = await db.get("SELECT * FROM inspections WHERE id = ?", [
      id,
    ]);

    if (!inspection) {
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
      await db.close();
      return res
        .status(400)
        .json({ error: `Invalid inspection ID input: ${id}` });
    }

    const inspection = await db.get("SELECT * FROM inspections WHERE id = ?", [
      id,
    ]);

    if (!inspection) {
      await db.close();
      return res
        .status(404)
        .json({ error: `Inspection with ID: ${id} does not exist` });
    }

    const formattedInspection = formatInspectionForResponse(inspection);

    await db.close();
    res.json(formattedInspection);
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

exports.getInspectionStats = async (req, res, next) => {
  try {
    const db = await connectDB();

    const totalResult = await db.get(
      "SELECT  COUNT(*) as total FROM inspections"
    );
    const total = totalResult.total;

    const statusStats = await db.all(`
      SELECT status, COUNT(*) as count
      FROM inspections
      GROUP BY status
    `);

    const typeStats = await db.all(`
      SELECT type, COUNT(*) as count
      FROM inspections
      GROUP BY type  
    `);

    const priorityStats = await db.all(`
      SELECT priority, COUNT(*) as count
      FROM inspections
      GROUP BY priority  
    `);

    const violationsResult = await db.get(`
      SELECT
        COUNT(*) as total_with_violations
      FROM inspections
      WHERE violations != '[]' AND violations IS NOT null
    `);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentResult = await db.get(
      `
      SELECT COUNT(*) as recent_count 
      FROM inspections 
      WHERE date >= ?
    `,
      [thirtyDaysAgo.toISOString()]
    );

    await db.close();

    const stats = {
      total: total,
      byStatus: statusStats.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {}),
      withViolations: violationsResult.total_with_violations,
      recentInspections: recentResult.recent_count,
      generatedAt: new Date().toISOString(),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

exports.searchInspections = async (req, res, next) => {
  try {
    const db = await connectDB();
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchPattern = `%${searchTerm}%`;
    const inspections = await db.all(
      `SELECT * FROM inspections 
   WHERE location LIKE ? 
      OR notes LIKE ? 
      OR inspector LIKE ?
      OR status LIKE ?
      OR type LIKE ?
      OR priority LIKE ?
   ORDER BY date DESC`,
      [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
      ]
    );

    const formattedInspections = inspections.map(formatInspectionForResponse);
    await db.close();
    res.json({
      results: formattedInspections,
      count: formattedInspections.length,
      searchTerm: searchTerm,
    });
  } catch (err) {
    next(err);
  }
};
