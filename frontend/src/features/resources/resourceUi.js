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

  const from = resource.availableFrom || "--:--";
  const to = resource.availableTo || "--:--";
  return `${from} - ${to}`;
}

export function getResourceDescriptionText(description) {
  const trimmed = description?.trim();
  return trimmed || "Managed through the campus operations hub for booking, monitoring, and availability control.";
}
