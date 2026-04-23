import { useState } from "react";
import {
  CAMPUS_BUILDINGS,
  RESOURCE_TYPES,
  SUPPORTED_BUILDING_CODE_PREFIXES,
  formatLabel,
  getExpectedBuildingForCode,
  usesAutomaticBuildingLocation,
} from "../resourceUi";

const defaultFormData = {
  name: "",
  code: "",
  type: "",
  capacity: 0,
  location: "",
  description: "",
  availableFrom: "",
  availableTo: "",
};

function buildInitialFormData(initialValues) {
  const baseFormData = {
    ...defaultFormData,
    ...(initialValues ?? {}),
  };

  if (usesAutomaticBuildingLocation(baseFormData.type)) {
    return {
      ...baseFormData,
      location: getExpectedBuildingForCode(baseFormData.code),
    };
  }

  return {
    ...baseFormData,
    location: CAMPUS_BUILDINGS.includes(baseFormData.location) ? baseFormData.location : "",
  };
}

function ResourceForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Resource",
  title = "Create a new resource",
  subtitle = "Add a campus space or equipment item with availability and booking details.",
}) {
  const [formData, setFormData] = useState(() => buildInitialFormData(initialValues));

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [name]: name === "capacity" ? Number(value) : value,
      };

      const nextType = name === "type" ? value : nextFormData.type;
      const nextCode = name === "code" ? value : nextFormData.code;

      if (usesAutomaticBuildingLocation(nextType)) {
        nextFormData.location = getExpectedBuildingForCode(nextCode);
      } else if (name === "type" && !CAMPUS_BUILDINGS.includes(nextFormData.location)) {
        nextFormData.location = "";
      }

      return nextFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const usesBuildingCodeValidation = usesAutomaticBuildingLocation(formData.type);
  const normalizedCode = formData.code.trim().toUpperCase();
  const hasCodeInput = formData.code.trim().length > 0;
  const expectedBuilding = usesBuildingCodeValidation
    ? getExpectedBuildingForCode(formData.code)
    : "";
  const hasInvalidBuildingCode =
    usesBuildingCodeValidation && hasCodeInput && !expectedBuilding;

  let buildingGuidanceTone = "info";
  let buildingGuidanceTitle = "Building code guidance";
  let buildingGuidanceMessage = `For labs and lecture halls, use a resource code starting with ${SUPPORTED_BUILDING_CODE_PREFIXES}. The location will fill automatically.`;

  if (hasInvalidBuildingCode) {
    buildingGuidanceTone = "error";
    buildingGuidanceTitle = "Invalid resource code";
    buildingGuidanceMessage = `Use a code starting with ${SUPPORTED_BUILDING_CODE_PREFIXES}.`;
  } else if (expectedBuilding) {
    buildingGuidanceTone = "success";
    buildingGuidanceTitle = "Location auto-filled";
    buildingGuidanceMessage = `${normalizedCode} maps to ${expectedBuilding}.`;
  }

  return (
    <form onSubmit={handleSubmit} className="card resource-form-card">
      <div className="resource-form-top">
        <div>
          <p className="eyebrow">{initialValues ? "Update Inventory" : "Add Inventory"}</p>
          <h2>{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="resource-code-chip">
          {initialValues ? "Editing live entry" : "New resource draft"}
        </div>
      </div>

      <div className="resource-form-grid">
        <div className="resource-form-columns resource-form-columns-balanced">
          <div className="resource-form-field">
            <label htmlFor="resource-name">Name</label>
            <input
              id="resource-name"
              type="text"
              className="input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Engineering Design Lab"
              required
            />
          </div>

          <div className="resource-form-field">
            <label htmlFor="resource-code">Code</label>
            <input
              id="resource-code"
              type="text"
              className={`input ${hasInvalidBuildingCode ? "input-invalid" : ""}`.trim()}
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="EN1023 / BM1205"
              required
            />
          </div>
        </div>

        <div className="resource-form-columns resource-form-columns-3 resource-form-columns-resource-meta">
          <div className="resource-form-field">
            <label htmlFor="resource-type">Type</label>
            <select
              id="resource-type"
              className="input"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select a resource type</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="resource-form-field">
            <label htmlFor="resource-capacity">Capacity</label>
            <input
              id="resource-capacity"
              type="number"
              className="input"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="resource-form-field">
            <label htmlFor="resource-location">Location</label>
            {usesBuildingCodeValidation ? (
              <input
                id="resource-location"
                type="text"
                className="input input-readonly"
                name="location"
                value={formData.location}
                placeholder="Location will auto-fill from code"
                readOnly
              />
            ) : (
              <select
                id="resource-location"
                className="input"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Select a building</option>
                {CAMPUS_BUILDINGS.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {usesBuildingCodeValidation ? (
          <div className={`resource-building-note resource-building-note-${buildingGuidanceTone}`}>
            <strong>{buildingGuidanceTitle}</strong>
            <p>{buildingGuidanceMessage}</p>
          </div>
        ) : null}

        <div className="resource-form-columns">
          <div className="resource-form-field">
            <label htmlFor="resource-available-from">Available From</label>
            <input
              id="resource-available-from"
              type="time"
              className="input"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="resource-form-field">
            <label htmlFor="resource-available-to">Available To</label>
            <input
              id="resource-available-to"
              type="time"
              className="input"
              name="availableTo"
              value={formData.availableTo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="resource-form-field">
          <label htmlFor="resource-description">Description</label>
          <textarea
            id="resource-description"
            className="input resource-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe equipment, room setup, or any booking restrictions."
          />
        </div>

        <div className="resource-form-actions">
          <button type="submit" className="btn">
            {submitLabel}
          </button>
          {onCancel ? (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export default ResourceForm;
