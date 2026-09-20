# CareFlow backend

Manages real department queue counts for your existing
`hospital-without-queues` frontend. This is new — it didn't exist before.

## Run it

```bash
npm install
npm start          # http://localhost:4000
```

## Why this exists

Your frontend already computes everything (wait times, recommended
department, time saved) using real math in `src/data/HospitalEngine.jsx` —
that part was never fake. What *was* fake: the input numbers. `queue: 8` for
the doctor was a number typed into a file, and it never changed no matter
what a patient did.

This backend replaces that fixed number with a real counter. Nothing about
your calculation logic changed — same functions, same formulas. Only the
*source* of the numbers going into them changed.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/departments` | Live list of all 6 departments (registration, laboratory, doctor, radiology, pharmacy, emergency), same shape your code already used |
| POST | `/api/departments/:id/checkin` | Queue at that department +1 |
| POST | `/api/departments/:id/checkout` | Queue at that department -1 |
| POST | `/api/reset` | Puts every department back to its original starting numbers |

Each department object includes both the old field names your code already
reads (`wait`, `staff`) and the ones `calculateWaitTime()` actually uses
(`serviceTime`, `availableStaff`) — so it's a drop-in replacement for the
old `liveHospitalData` array regardless of which of your existing functions
touches it.

## Try it without the frontend

```bash
curl http://localhost:4000/api/departments
curl -X POST http://localhost:4000/api/departments/doctor/checkin
curl http://localhost:4000/api/departments   # doctor's queue is now +1, wait time recalculated
curl -X POST http://localhost:4000/api/departments/doctor/checkout
curl -X POST http://localhost:4000/api/reset
```
