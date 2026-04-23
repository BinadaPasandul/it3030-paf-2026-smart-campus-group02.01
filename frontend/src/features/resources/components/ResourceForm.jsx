import { useState } from "react";
import { RESOURCE_TYPES, formatLabel } from "../resourceUi";

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

function ResourceForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Resource",
  title = "Create a new resource",
  subtitle = "Add a campus space or equipment item with availability and booking details.",
}) {
  const [formData, setFormData] = useState(() =>
    initialValues
      ? {
          ...defaultFormData,
          ...initialValues,
        }
      : defaultFormData
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
        <div className="resource-form-columns">
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
              className="input"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="LAB-302"
              required
            />
          </div>
        </div>

        <div className="resource-form-columns resource-form-columns-3">
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
            <input
              id="resource-location"
              type="text"
              className="input"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Tech Building - Floor 3"
              required
            />
          </div>
        </div>

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
