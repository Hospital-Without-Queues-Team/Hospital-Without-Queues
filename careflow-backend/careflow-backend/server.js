import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Seeded from the exact numbers your frontend already had hardcoded in
 * src/data/HospitalEngine.jsx (liveHospitalData). Same ids, same names —
 * this is a drop-in replacement for that array, except the numbers now
 * actually move as patients check in and out.
 *
 * We keep BOTH the old field names (wait, staff) and the field names your
 * calculateWaitTime()/calculateWorkload() functions actually read
 * (serviceTime, availableStaff), so whichever part of your existing code
 * reads a department object, it finds what it expects.
 */
const departments = new Map([
  ["registration", { id: "registration", name: "Registration", icon: "📝", queue: 3, serviceTime: 5, availableStaff: 2, capacity: 25 }],
  ["laboratory",   { id: "laboratory",   name: "Laboratory",    icon: "🩸", queue: 4, serviceTime: 8, availableStaff: 2, capacity: 20 }],
  ["doctor",       { id: "doctor",       name: "Doctor Consultation", icon: "👨‍⚕️", queue: 8, serviceTime: 10, availableStaff: 3, capacity: 30 }],
  ["radiology",    { id: "radiology",    name: "Radiology",     icon: "🔬", queue: 5, serviceTime: 10, availableStaff: 2, capacity: 20 }],
  ["pharmacy",     { id: "pharmacy",     name: "Pharmacy",      icon: "💊", queue: 3, serviceTime: 5, availableStaff: 2, capacity: 25 }],
  ["emergency",    { id: "emergency",    name: "Emergency",     icon: "🚑", queue: 12, serviceTime: 8, availableStaff: 4, capacity: 15 }],
]);

// Same formula as calculateWaitTime() in your HospitalEngine.jsx, so the
// "wait" alias field always agrees with what your own code would compute.
function waitTimeFor(dept) {
  return Math.ceil((dept.queue * dept.serviceTime) / Math.max(dept.availableStaff, 1));
}

function serialize(dept) {
  return {
    ...dept,
    staff: dept.availableStaff, // legacy alias, matches old liveHospitalData shape
    wait: waitTimeFor(dept),    // legacy alias
  };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// GET /api/departments -> live array, same shape your frontend already expects
app.get("/api/departments", (_req, res) => {
  res.json(Array.from(departments.values()).map(serialize));
});

// POST /api/departments/:id/checkin -> a real patient joins this queue
app.post("/api/departments/:id/checkin", (req, res) => {
  const dept = departments.get(req.params.id);
  if (!dept) return res.status(404).json({ error: `Unknown department: ${req.params.id}` });
  dept.queue += 1;
  res.json(serialize(dept));
});

// POST /api/departments/:id/checkout -> a real patient has been served and left
app.post("/api/departments/:id/checkout", (req, res) => {
  const dept = departments.get(req.params.id);
  if (!dept) return res.status(404).json({ error: `Unknown department: ${req.params.id}` });
  dept.queue = Math.max(0, dept.queue - 1);
  res.json(serialize(dept));
});

// POST /api/reset -> put every department back to its starting numbers (handy for demos)
const SEED_QUEUES = { registration: 3, laboratory: 4, doctor: 8, radiology: 5, pharmacy: 3, emergency: 12 };
app.post("/api/reset", (_req, res) => {
  for (const [id, dept] of departments) dept.queue = SEED_QUEUES[id];
  res.json(Array.from(departments.values()).map(serialize));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`CareFlow backend listening on http://localhost:${PORT}`);
});
