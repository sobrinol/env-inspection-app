const express = require("express");
const router = express.Router();
const {
  getInspections,
  getInspectionsById,
  createInspection,
  patchInspection,
} = require("../controllers/inspectionController");

router.get("/", getInspections);
router.get("/:id", getInspectionsById);
router.post("/", createInspection);
router.patch("/:id", patchInspection);

module.exports = router;
