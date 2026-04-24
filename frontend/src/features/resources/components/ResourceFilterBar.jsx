import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { RESOURCE_STATUSES, RESOURCE_TYPES, formatLabel } from "../resourceUi";

function ResourceFilterBar({ filters, setFilters, onSearch, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const activeFilterCount = Object.values(filters).filter((value) => value !== "").length;

  return (
    <form
      className="card resource-filter-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="resource-filter-top">
        <div>
          <p className="eyebrow">Smart Filters</p>
          <h2>Find the right space or asset</h2>
          <p className="page-subtitle">
            Filter the catalogue by type, location, capacity, or live operating status, then use the calendar beside it to pick a date.
          </p>
        </div>
        <div className="resource-filter-count">
          <FiFilter />
          {activeFilterCount} {activeFilterCount === 1 ? "filter active" : "filters active"}
        </div>
      </div>

      <div className="resource-filter-grid">
        <div className="resource-filter-field">
          <label htmlFor="resource-filter-type">Type</label>
          <select
            id="resource-filter-type"
            className="input"
            name="type"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">All resource types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="resource-filter-field">
          <label htmlFor="resource-filter-location">Location</label>
          <input
            id="resource-filter-location"
            type="text"
            className="input"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Search a building or area"
          />
        </div>

        <div className="resource-filter-field">
          <label htmlFor="resource-filter-capacity">Minimum Capacity</label>
          <input
            id="resource-filter-capacity"
            type="number"
            className="input"
            name="minCapacity"
            value={filters.minCapacity}
            onChange={handleChange}
            min="0"
            placeholder="e.g. 25"
          />
        </div>

        <div className="resource-filter-field">
          <label htmlFor="resource-filter-status">Status</label>
          <select
            id="resource-filter-status"
            className="input"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All statuses</option>
            {RESOURCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="resource-filter-actions">
          <button type="submit" className="btn">
            Search
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            <FiRefreshCw />
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}

export default ResourceFilterBar;
