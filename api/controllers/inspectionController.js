const fs = require("fs").promises;
const path = require("path");
const { inspectionSchema } = require("../models/inspection");

const inspectionsFile = path.join(__dirname, "../data/inspections.json");

async function readInspections() {
  const data = await fs.readFile(inspectionsFile, "utf8");
  return JSON.parse(data);
}

async function writeInspections(data) {
  await fs.writeFile(inspectionsFile, JSON.stringify(data, null, 2));
}

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
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID." });
    }

    const inspections = await readInspections();
    const inspectionIndex = inspections.findIndex((insp) => insp.id === id);

    if (inspectionIndex === -1) {
      return res.status(404).json({ error: "Inspection not found." });
    }

    inspections[inspectionIndex] = {
      ...inspections[inspectionIndex],
      ...req.body,
      date: new Date().toISOString(),
    };

    await writeInspections(inspections);

    res.json(inspections[inspectionIndex]);
  } catch (err) {
    next(err);
  }
};

exports.getInspections = async (req, res, next) => {
  try {
    const inspections = await readInspections();
    res.json(inspections);
  } catch (err) {
    next(err);
  }
};

exports.getInspectionsById = async (req, res, next) => {
  try {
    const inspections = await readInspections();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID." });
    }

    const inspection = inspections.find((insp) => insp.id === id);

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found." });
    }

    res.json(inspection);
  } catch (err) {
    next(err);
  }
};

exports.createInspection = async (req, res, next) => {
  try {
    const inspections = await readInspections();

    const newInspection = {
      id: inspections.length + 1,
      ...req.body,
      date: new Date().toISOString(),
    };

    inspections.push(newInspection);
    await writeInspections(inspections);

    res.status(201).json(newInspection);
  } catch (err) {
    next(err);
  }
};
