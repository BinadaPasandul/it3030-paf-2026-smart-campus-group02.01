const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

function ResourceFilterBar({ filters, setFilters, onSearch, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              name="type"
              value={filters.type}
              onChange={handleChange}
            >
              <option value="">All</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Enter location"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Min Capacity</label>
            <input
              type="number"
              className="form-control"
              name="minCapacity"
              value={filters.minCapacity}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">All</option>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end gap-2">
            <button type="button" className="btn btn-primary w-100" onClick={onSearch}>
              Search
            </button>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceFilterBar;