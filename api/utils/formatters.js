exports.formatInspectionForResponse = (inspection) => {
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
};
