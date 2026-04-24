import {
  FACULTY_OPTIONS,
  SEMESTER_OPTIONS,
  YEAR_OPTIONS,
  getDepartmentsForFaculty,
} from "../constants/profileOptions";

function ProfileDetailsFields({ form, onChange }) {
  const maxDate = new Date().toISOString().split("T")[0];
  const departmentOptions = getDepartmentsForFaculty(form.faculty);

  return (
    <div className="form-columns">
      <label className="input-group" htmlFor="fullName">
        <span>Name with initials</span>
        <input
          id="fullName"
          className="input"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={onChange}
          placeholder="E.g. A.B. Perera"
          required
        />
      </label>

      <label className="input-group" htmlFor="phoneNumber">
        <span>Phone number</span>
        <input
          id="phoneNumber"
          className="input"
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={onChange}
          placeholder="07XXXXXXXX"
          pattern="\d{10}"
          title="Phone number must be exactly 10 digits"
          required
        />
      </label>

      <label className="input-group" htmlFor="studentId">
        <span>Student ID</span>
        <input
          id="studentId"
          className="input"
          name="studentId"
          type="text"
          value={form.studentId}
          onChange={onChange}
          placeholder="IT2026XXXX"
          pattern="(?i)^it.*"
          title="Student ID must start with IT"
          required
        />
      </label>

      <label className="input-group" htmlFor="dateOfBirth">
        <span>Date of birth</span>
        <input
          id="dateOfBirth"
          className="input"
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={onChange}
          max={maxDate}
          required
        />
      </label>

      <label className="input-group" htmlFor="faculty">
        <span>Faculty</span>
        <select
          id="faculty"
          className="input"
          name="faculty"
          value={form.faculty}
          onChange={onChange}
          required
        >
          <option value="">Select faculty</option>
          {FACULTY_OPTIONS.map((faculty) => (
            <option key={faculty} value={faculty}>
              {faculty}
            </option>
          ))}
        </select>
      </label>

      <label className="input-group" htmlFor="department">
        <span>Department</span>
        <select
          id="department"
          className="input"
          name="department"
          value={form.department}
          onChange={onChange}
          disabled={!form.faculty}
          required
        >
          <option value="">
            {form.faculty ? "Select department" : "Select faculty first"}
          </option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>

      <label className="input-group" htmlFor="academicYear">
        <span>Year</span>
        <select
          id="academicYear"
          className="input"
          name="academicYear"
          value={form.academicYear}
          onChange={onChange}
          required
        >
          <option value="">Select year</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              Year {year}
            </option>
          ))}
        </select>
      </label>

      <label className="input-group" htmlFor="semester">
        <span>Semester</span>
        <select
          id="semester"
          className="input"
          name="semester"
          value={form.semester}
          onChange={onChange}
          required
        >
          <option value="">Select semester</option>
          {SEMESTER_OPTIONS.map((semester) => (
            <option key={semester} value={semester}>
              Semester {semester}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default ProfileDetailsFields;
