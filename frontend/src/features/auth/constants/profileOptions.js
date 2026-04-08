export const FACULTY_DEPARTMENT_OPTIONS = {
  "Faculty of Computing": [
    "Department of Information Technology",
    "Department of Computer Systems Engineering",
    "Department of Computer Science",
    "Department of Computer Science and Software Engineering",
  ],
  "Faculty of Engineering": [
    "Department of Civil Engineering",
    "Department of Electrical & Electronic Engineering",
    "Department of Mechanical Engineering",
    "Department of Materials Engineering",
    "Department of Quantity Surveying",
  ],
  "SLIIT Business School": ["Department of Business Management"],
  "Faculty of Humanities & Sciences": [
    "Department of Applied Sciences",
    "Department of Mathematics and Statistics",
    "Department of Education",
    "Department of Nursing",
    "School of Law",
    "School of Psychology",
    "School of Education",
    "English Language Teaching Unit",
  ],
};

export const FACULTY_OPTIONS = Object.keys(FACULTY_DEPARTMENT_OPTIONS);
export const YEAR_OPTIONS = ["1", "2", "3", "4"];
export const SEMESTER_OPTIONS = ["1", "2"];

export const getDepartmentsForFaculty = (faculty) =>
  FACULTY_DEPARTMENT_OPTIONS[faculty] ?? [];

export const applyProfileFormChange = (currentForm, name, value) => {
  if (name !== "faculty") {
    return { ...currentForm, [name]: value };
  }

  const nextDepartments = getDepartmentsForFaculty(value);

  return {
    ...currentForm,
    faculty: value,
    department: nextDepartments.includes(currentForm.department)
      ? currentForm.department
      : "",
  };
};
