import { useState } from "react";

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

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

function ResourceForm({ initialValues, onSubmit, onCancel, submitLabel = "Save Resource" }) {
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
    <form onSubmit={handleSubmit} className="card shadow-sm border-0">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Code</label>
            <input
              type="text"
              className="form-control"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-control"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Available From</label>
            <input
              type="time"
              className="form-control"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Available To</label>
            <input
              type="time"
              className="form-control"
              name="availableTo"
              value={formData.availableTo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                {submitLabel}
              </button>
              {onCancel && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ResourceForm;
