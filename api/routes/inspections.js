const express = require("express");
const router = express.Router();
const {
  getInspections,
  getInspectionsById,
  createInspection,
  patchInspection,
  deleteInspectionById,
} = require("../controllers/inspectionController");

const validate = require("../middleware/validate");
const {
  inspectionSchema,
  updateInspectionSchema,
} = require("../models/inspection");

router.get("/", getInspections);
router.get("/:id", getInspectionsById);
router.post("/", validate(inspectionSchema), createInspection);
router.patch("/:id", validate(updateInspectionSchema), patchInspection);
router.delete("/:id", deleteInspectionById);

module.exports = router;
