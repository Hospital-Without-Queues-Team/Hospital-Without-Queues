// ============================================================
// CAREFLOW AI — LIVE HOSPITAL DATA
// ============================================================

export const hospitalDepartments = [
  {
    id: "registration",
    name: "Registration",
    icon: "📝",
    queue: 8,
    serviceTime: 4,
    availableStaff: 2,
    capacity: 25,
  },

  {
    id: "diagnostics",
    name: "Diagnostics",
    icon: "🧪",
    queue: 5,
    serviceTime: 8,
    availableStaff: 2,
    capacity: 20,
  },

  {
    id: "doctor",
    name: "Doctor Consultation",
    icon: "👨‍⚕️",
    queue: 12,
    serviceTime: 10,
    availableStaff: 4,
    capacity: 30,
  },

  {
    id: "pharmacy",
    name: "Pharmacy",
    icon: "💊",
    queue: 7,
    serviceTime: 5,
    availableStaff: 2,
    capacity: 25,
  },

  {
    id: "billing",
    name: "Billing",
    icon: "💳",
    queue: 6,
    serviceTime: 4,
    availableStaff: 2,
    capacity: 20,
  },

  {
    id: "imaging",
    name: "Imaging / Scans",
    icon: "🩻",
    queue: 4,
    serviceTime: 12,
    availableStaff: 2,
    capacity: 15,
  },
];


// ============================================================
// HOSPITAL INFORMATION
// ============================================================

export const hospitalInfo = {
  name: "CareFlow AI Hospital",

  totalBeds: 250,

  emergencyLevel: "Normal",

  operatingHours: "24 × 7",

  location: "Main Hospital",

  lastUpdated: "Live",
};


// ============================================================
// DOCTOR INFORMATION
// ============================================================

export const doctorData = [
  {
    id: 1,
    name: "General Medicine",
    doctors: 4,
    patients: 12,
  },

  {
    id: 2,
    name: "Cardiology",
    doctors: 2,
    patients: 5,
  },

  {
    id: 3,
    name: "Orthopaedics",
    doctors: 3,
    patients: 9,
  },

  {
    id: 4,
    name: "Paediatrics",
    doctors: 2,
    patients: 4,
  },
];


// ============================================================
// HOSPITAL TRAFFIC
// ============================================================

export const hospitalTraffic = {
  currentPatients: 38,

  incomingPatients: 7,

  dischargedPatients: 12,

  trafficLevel: "Moderate",

  trend: "stable",
};


// ============================================================
// WAITING ACTIVITIES
// ============================================================

export const waitingActivities = [
  {
    icon: "📄",
    title: "Complete documents",
    description: "Finish any pending hospital paperwork.",
  },

  {
    icon: "💧",
    title: "Get some water",
    description: "Take a short break and stay hydrated.",
  },

  {
    icon: "🪑",
    title: "Find a comfortable area",
    description: "You don't need to stand in the queue.",
  },

  {
    icon: "🗺️",
    title: "Explore the hospital",
    description: "Find nearby facilities while you wait.",
  },
];