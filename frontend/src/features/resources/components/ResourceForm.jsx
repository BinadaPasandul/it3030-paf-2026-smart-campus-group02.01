import { useState } from "react";
import {
  CAMPUS_BUILDINGS,
  EQUIPMENT_TYPES,
  RESOURCE_TYPES,
  SPORTS_ENTERTAINMENT_VENUES,
  SUPPORTED_BUILDING_CODE_PREFIXES,
  formatLabel,
  getExpectedBuildingForCode,
  getLocationOptionsForType,
  isEquipmentResource,
  usesAutomaticBuildingLocation,
  usesSportsVenueLocations,
} from "../resourceUi";

const defaultFormData = {
  name: "",
  code: "",
  type: "",
  equipmentType: "",
  capacity: "",
  location: "",
  description: "",
  availableFrom: "",
  availableTo: "",
};

function buildInitialFormData(initialValues) {
  const baseFormData = {
    ...defaultFormData,
    ...(initialValues ?? {}),
    equipmentType: initialValues?.equipmentType ?? "",
    capacity: initialValues?.capacity ?? "",
  };

  if (usesAutomaticBuildingLocation(baseFormData.type)) {
    return {
      ...baseFormData,
      location: getExpectedBuildingForCode(baseFormData.code),
      equipmentType: "",
    };
  }

  if (usesSportsVenueLocations(baseFormData.type)) {
    return {
      ...baseFormData,
      location: SPORTS_ENTERTAINMENT_VENUES.includes(baseFormData.location)
        ? baseFormData.location
        : "",
      equipmentType: "",
    };
  }

  return {
    ...baseFormData,
    location: CAMPUS_BUILDINGS.includes(baseFormData.location) ? baseFormData.location : "",
    equipmentType: isEquipmentResource(baseFormData.type) ? baseFormData.equipmentType : "",
    capacity: isEquipmentResource(baseFormData.type) ? "" : baseFormData.capacity,
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
        [name]: name === "capacity" ? (value === "" ? "" : Number(value)) : value,
      };

      const nextType = name === "type" ? value : nextFormData.type;
      const nextCode = name === "code" ? value : nextFormData.code;

      if (usesAutomaticBuildingLocation(nextType)) {
        nextFormData.location = getExpectedBuildingForCode(nextCode);
        nextFormData.equipmentType = "";
      } else if (usesSportsVenueLocations(nextType)) {
        if (!SPORTS_ENTERTAINMENT_VENUES.includes(nextFormData.location)) {
          nextFormData.location = "";
        }
        nextFormData.equipmentType = "";
      } else {
        if (!CAMPUS_BUILDINGS.includes(nextFormData.location)) {
          nextFormData.location = "";
        }
      }

      if (isEquipmentResource(nextType)) {
        nextFormData.capacity = "";
      } else {
        nextFormData.equipmentType = "";
      }

      return nextFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: isEquipmentResource(formData.type)
        ? null
        : formData.capacity === ""
          ? null
          : Number(formData.capacity),
      equipmentType: isEquipmentResource(formData.type) ? formData.equipmentType || null : null,
    });
  };

  const isEquipment = isEquipmentResource(formData.type);
  const usesVenueLocations = usesSportsVenueLocations(formData.type);
  const usesBuildingCodeValidation = usesAutomaticBuildingLocation(formData.type);
  const normalizedCode = formData.code.trim().toUpperCase();
  const hasCodeInput = formData.code.trim().length > 0;
  const expectedBuilding = usesBuildingCodeValidation
    ? getExpectedBuildingForCode(formData.code)
    : "";
  const hasInvalidBuildingCode =
    usesBuildingCodeValidation && hasCodeInput && !expectedBuilding;
  const locationOptions = getLocationOptionsForType(formData.type);
  const locationPlaceholder = isEquipment
    ? "Select setup or delivery location"
    : usesVenueLocations
      ? "Select a venue"
      : "Select a building";

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

  const equipmentGuidanceMessage = "For equipment, choose the setup or delivery location and select the equipment subtype. Capacity is not required.";
  const sportsGuidanceMessage = "Sports and entertainment resources use venue-style locations. Capacity remains required so filtering and planning still work.";

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
            <label htmlFor="resource-name">Resource Name</label>
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
            <label htmlFor="resource-code">Resource Code</label>
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

          {isEquipment ? (
            <div className="resource-form-field">
              <label htmlFor="resource-equipment-type">Equipment Type</label>
              <select
                id="resource-equipment-type"
                className="input"
                name="equipmentType"
                value={formData.equipmentType}
                onChange={handleChange}
                required
              >
                <option value="">Select equipment type</option>
                {EQUIPMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
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
          )}

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
                <option value="">{locationPlaceholder}</option>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
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

        {isEquipment ? (
          <div className="resource-building-note resource-building-note-info">
            <strong>Equipment handling guidance</strong>
            <p>{equipmentGuidanceMessage}</p>
          </div>
        ) : null}

        {usesVenueLocations ? (
          <div className="resource-building-note resource-building-note-info">
            <strong>Venue selection guidance</strong>
            <p>{sportsGuidanceMessage}</p>
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
            placeholder="Describe the room, venue, or equipment setup expectations."
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
