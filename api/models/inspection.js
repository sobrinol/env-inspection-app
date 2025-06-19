const Joi = require("joi");

const inspectionSchema = Joi.object({
  location: Joi.string().required(),
  status: Joi.string().required(),
  inspector: Joi.string().required(),
  type: Joi.string().required(),
  priority: Joi.string().valid("Low", "Medium", "High").default("Medium"),
  violations: Joi.array().items(Joi.string()).default([]),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  })
    .optional()
    .allow(null),
  notes: Joi.string().required(),
});

const updateInspectionSchema = Joi.object({
  location: Joi.string(),
  status: Joi.string(),
  inspector: Joi.string(),
  type: Joi.string(),
  priority: Joi.string().valid("Low", "Medium", "High"),
  violations: Joi.array().items(Joi.string()),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).allow(null),
  notes: Joi.string(),
});

module.exports = { inspectionSchema, updateInspectionSchema };
