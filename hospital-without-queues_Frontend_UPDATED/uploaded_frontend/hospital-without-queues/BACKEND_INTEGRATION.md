# What actually changed in your frontend

I read every file before touching anything. This project already worked
end-to-end with zero backend — every "AI" calculation (wait times,
recommended department, time saved, congestion) is real math in
`src/data/HospitalEngine.jsx`, running on hardcoded department arrays.
`src/logic/optimizationEngine.jsx` is unused dead code (nothing imports it)
— I left it alone.

Given the numbers were fake (typed into a file, never changing), I made the
**smallest possible edit** to make them real, by adding one backend and
touching exactly 3 frontend files. Nothing else moved.

## New file

**`src/api.js`** — a small fetch client plus a `useLiveDepartments()` hook
that polls the backend and automatically falls back to whatever static
array you already had if the backend isn't running. This means: run the
frontend alone → works exactly as before. Run frontend + backend together →
numbers become real.

## Changed: `src/components/StaffDashboard.jsx`

- Was: `departments = liveHospitalData` (static import, frozen numbers).
- Now: `departments` comes from `useLiveDepartments(liveHospitalData, 3000)`
  — polls the backend every 3s, falls back to the original static array on
  failure.
- The "● Updating automatically" label now actually says "Live — real
  patient data" or "Offline demo data" depending on whether the backend
  responded. Everything else in this file — the AI summary, recommendation
  cards, department table — is untouched; it just receives real numbers now.

## Changed: `src/components/AIGeneratedJourney.jsx`

- Was: a `hospitalDepartments` array hardcoded inline in the component.
- Now: that array is renamed `FALLBACK_DEPARTMENTS` and moved outside the
  component (used only if the backend is unreachable). The
  `hospitalDepartments` variable used everywhere else in the file is now
  the live-polled result of `useLiveDepartments(FALLBACK_DEPARTMENTS, 5000)`.
  Every line below that in the file — the routing logic, the journey step
  builder, the JSX — is completely unchanged; it was already written to
  just consume whatever's in `hospitalDepartments`.

## Changed: `src/components/LiveSmartJourney.jsx`

This file is ~4,400 lines of animation and voice-guidance logic. I changed
three things and left the rest — including the entire movement/animation
`useEffect`, the SVG map rendering, and the voice guidance — completely
untouched:

1. **Import** the new hook + two new API functions + a name→id lookup table
   from `../api`.
2. **`aiDepartments`** (the array your AI predictions/summary are computed
   from) now sources from `useLiveDepartments(liveHospitalData, 4000)`
   instead of the static `liveHospitalData` import. The conversion logic
   inside that `useMemo` — which reshapes the data for `HospitalEngine` — is
   untouched, just fed live input now.
3. **Two brand-new `useEffect` blocks**, added right after your existing
   route-generation effect, doing nothing else in the file:
   - When a route is generated for a destination, call
     `checkInDepartment(id)` once — this patient really joins that
     department's queue.
   - When `journeyCompleted` becomes `true`, call `checkOutDepartment(id)`
     once — they really leave it.

   Both are guarded with refs so they fire exactly once per journey, even
   under React StrictMode's double-invoke in development. If the backend
   isn't running, the `.catch(() => {})` means the journey animation still
   works exactly as before — it just silently skips the real check-in.

## `src/data/hospitalData.jsx` — untouched, on purpose

This file's `hospitalDepartments` export is used only for matching a
department **name** to its x/y position on the animated map — it never
feeds into any wait-time math. Changing it would add risk for zero benefit,
so I left it exactly as it was.

## Department id/name mapping

Your three department datasets used three different id schemes
(`diagnostics`/`imaging` vs `laboratory`/`radiology` vs no `radiology` at
all). The backend standardizes on the `liveHospitalData` naming
(`registration`, `laboratory`, `doctor`, `radiology`, `pharmacy`,
`emergency`) since that's the set your actual AI-calculation screens
(`StaffDashboard`, `LiveSmartJourney`) already used. `AIGeneratedJourney`'s
ids were already a subset of this, so no renaming was needed there.
