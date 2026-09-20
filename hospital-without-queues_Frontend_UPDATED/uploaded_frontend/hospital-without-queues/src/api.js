import { useEffect, useRef, useState } from "react";

// Points at your local backend by default. Override with a .env file:
// VITE_API_URL=https://your-backend.example.com/api
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Backend request failed: ${res.status}`);
  return res.json();
}

export const fetchDepartments = () => request("/departments");
export const checkInDepartment = (id) => request(`/departments/${id}/checkin`, { method: "POST" });
export const checkOutDepartment = (id) => request(`/departments/${id}/checkout`, { method: "POST" });

/**
 * Live department data with automatic polling. Falls back to whatever
 * static array you pass in (e.g. the existing liveHospitalData) if the
 * backend isn't reachable, so the app keeps working exactly as before
 * even when the backend terminal isn't running.
 */
export function useLiveDepartments(fallback, pollMs = 4000) {
  const [departments, setDepartments] = useState(fallback);
  const [connected, setConnected] = useState(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        const data = await fetchDepartments();
        if (!cancelled) {
          setDepartments(data);
          setConnected(true);
        }
      } catch {
        if (!cancelled) {
          setDepartments(fallbackRef.current);
          setConnected(false);
        }
      }
      timer = setTimeout(poll, pollMs);
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pollMs]);

  return { departments, connected };
}

/** Maps the department NAMES already used in LiveSmartJourney's
 * destinationPositions / selectedDestination to the backend's department ids. */
export const DEPARTMENT_NAME_TO_ID = {
  Registration: "registration",
  Laboratory: "laboratory",
  "Doctor Consultation": "doctor",
  Radiology: "radiology",
  Pharmacy: "pharmacy",
  Emergency: "emergency",
};
