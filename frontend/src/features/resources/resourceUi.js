import {
  FiBookOpen,
  FiCamera,
  FiCpu,
  FiGrid,
  FiMonitor,
  FiUsers,
} from "react-icons/fi";

export const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

export const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
export const SUPPORTED_BUILDING_CODE_PREFIXES = "EN, BM, G, F, A, or B";
export const CAMPUS_BUILDINGS = [
  "New Building",
  "Main Building",
  "Engineering Building",
  "Business Management Building",
];

const BUILDING_CODE_RULES = [
  { prefixes: ["EN"], building: "Engineering Building" },
  { prefixes: ["BM"], building: "Business Management Building" },
  { prefixes: ["G", "F"], building: "New Building" },
  { prefixes: ["A", "B"], building: "Main Building" },
];

const RESOURCE_TYPE_META = {
  LECTURE_HALL: {
    icon: FiBookOpen,
    tone: "scholar",
    label: "Lecture Hall",
  },
  LAB: {
    icon: FiCpu,
    tone: "lab",
    label: "Lab",
  },
  MEETING_ROOM: {
    icon: FiUsers,
    tone: "team",
    label: "Meeting Room",
  },
  PROJECTOR: {
    icon: FiMonitor,
    tone: "media",
    label: "Projector",
  },
  CAMERA: {
    icon: FiCamera,
    tone: "optic",
    label: "Camera",
  },
};

export function formatLabel(value = "") {
  return value ? value.replaceAll("_", " ") : "Not available";
}

export function getExpectedBuildingForCode(code = "") {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return "";
  }

  const matchedRule = BUILDING_CODE_RULES.find((rule) =>
    rule.prefixes.some((prefix) => normalizedCode.startsWith(prefix)),
  );

  return matchedRule ? matchedRule.building : "";
}

export function usesAutomaticBuildingLocation(type = "") {
  return type === "LAB" || type === "LECTURE_HALL";
}

export function formatTimeLabel(value = "") {
  if (!value) {
    return "--:--";
  }

  return value.slice(0, 5);
}

export function formatDateLabel(value = "") {
  if (!value) {
    return "Date not set";
  }

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function getResourceTypeMeta(type) {
  if (RESOURCE_TYPE_META[type]) {
    return RESOURCE_TYPE_META[type];
  }

  return {
    icon: FiGrid,
    tone: "default",
    label: formatLabel(type || "RESOURCE"),
  };
}

export function getResourceStatusClass(status) {
  return status === "ACTIVE" ? "status-active" : "resource-status-out";
}

export function getAvailabilityRange(resource) {
  if (!resource) {
    return "Not scheduled";
  }

  const from = formatTimeLabel(resource.availableFrom);
  const to = formatTimeLabel(resource.availableTo);
  return `${from} - ${to}`;
}

export function getResourceDescriptionText(description) {
  const trimmed = description?.trim();
  return trimmed || "Managed through the campus operations hub for booking, monitoring, and availability control.";
}

export function formatBlockWindow(block) {
  if (!block) {
    return "No scheduled window";
  }

  if (block.allDay) {
    return `${formatDateLabel(block.blockDate)} • All day`;
  }

  return `${formatDateLabel(block.blockDate)} • ${formatTimeLabel(block.startTime)} - ${formatTimeLabel(block.endTime)}`;
}

export function timeToMinutes(value = "") {
  if (!value) {
    return null;
  }

  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function doesBlockOverlap(block, startTime, endTime) {
  if (!block || !startTime || !endTime) {
    return false;
  }

  if (block.allDay) {
    return true;
  }

  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = timeToMinutes(endTime);
  const blockStart = timeToMinutes(block.startTime);
  const blockEnd = timeToMinutes(block.endTime);

  if ([bookingStart, bookingEnd, blockStart, blockEnd].some((value) => value === null)) {
    return false;
  }

  return bookingStart < blockEnd && bookingEnd > blockStart;
}
