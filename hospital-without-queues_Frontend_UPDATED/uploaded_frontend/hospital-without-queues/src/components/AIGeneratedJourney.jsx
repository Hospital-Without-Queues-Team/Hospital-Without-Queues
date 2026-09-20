import React from "react";
import "./AIGeneratedJourney.css";

import {
  calculateTotalJourneyTime,
  calculateTimeSaved,
  calculateWaitTime,
  optimizePatientJourney,
  getTrafficLevel,
  calculateDoctorWorkload,
} from "../data/HospitalEngine";
import { useLiveDepartments } from "../api";

// Original hardcoded numbers, kept only as an offline fallback.
const FALLBACK_DEPARTMENTS = [
  {
    id: "registration",
    name: "Registration",
    queue: 3,
    serviceTime: 5,
    availableStaff: 2,
    capacity: 20,
  },
  {
    id: "laboratory",
    name: "Laboratory",
    queue: 4,
    serviceTime: 8,
    availableStaff: 2,
    capacity: 20,
  },
  {
    id: "doctor",
    name: "Doctor Consultation",
    queue: 8,
    serviceTime: 12,
    availableStaff: 3,
    capacity: 20,
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    queue: 3,
    serviceTime: 5,
    availableStaff: 2,
    capacity: 20,
  },
  {
    id: "radiology",
    name: "Radiology",
    queue: 5,
    serviceTime: 10,
    availableStaff: 2,
    capacity: 20,
  },
];

function AIGeneratedJourney({
  userData,
  journeyData,
  onStartJourney,
  onBack,
  onLogout,
}) {
  /* =========================================
     GET PATIENT SELECTIONS
  ========================================= */

  const visit = journeyData?.visit || "doctor";
  const needs = journeyData?.needs || [];

  /* =========================================
     HOSPITAL DATA

     Was: a hardcoded array baked into this component, so every
     patient saw the exact same fake numbers.

     Now: polled live from the real backend every 5s. FALLBACK_DEPARTMENTS
     below is the original hardcoded array, used only if the backend
     isn't running, so this screen still works with zero setup.
  ========================================= */

  const { departments: hospitalDepartments } =
    useLiveDepartments(FALLBACK_DEPARTMENTS, 5000);

  /* =========================================
     AI ANALYSIS
  ========================================= */

  const aiAnalysis =
    optimizePatientJourney(hospitalDepartments);

  const recommendedDepartment =
    aiAnalysis?.recommendedDepartment || null;

  /* =========================================
     FIND DEPARTMENT
  ========================================= */

  const getDepartment = (id) => {
    return hospitalDepartments.find(
      (department) => department.id === id
    );
  };

  /* =========================================
     BUILD JOURNEY
  ========================================= */

  const journeySteps = [];

  /* =========================================
     REGISTRATION
  ========================================= */

  journeySteps.push({
    id: "registration",
    icon: "📝",
    title: "Registration",
    description:
      "Patient registration and verification.",
    status: "COMPLETED",
    statusClass: "completed-status",
    wait: "Ready",
    type: "completed",
  });

  /* =========================================
     DETERMINE PRIMARY DEPARTMENT
  ========================================= */

  let primaryId = "doctor";

  if (needs.includes("blood")) {
    primaryId = "laboratory";
  } else if (needs.includes("scan")) {
    primaryId = "radiology";
  } else if (needs.includes("specialist")) {
    primaryId = "doctor";
  } else if (
    visit === "pharmacy" ||
    needs.includes("medicine")
  ) {
    primaryId = "pharmacy";
  } else if (
    visit === "doctor" ||
    visit === "followup"
  ) {
    primaryId = "doctor";
  }

  /* =========================================
     PRIMARY DEPARTMENT
  ========================================= */

  const primaryDepartment =
    getDepartment(primaryId);

  if (primaryDepartment) {
    const predictedWait =
      calculateWaitTime(primaryDepartment);

    let primaryIcon = "👨‍⚕️";
    let description =
      "Consultation with your doctor.";

    if (primaryDepartment.id === "laboratory") {
      primaryIcon = "🩸";
      description = "Diagnostic blood work.";
    }

    if (primaryDepartment.id === "radiology") {
      primaryIcon = "🔬";
      description =
        "X-ray, CT, MRI or ultrasound.";
    }

    if (primaryDepartment.id === "pharmacy") {
      primaryIcon = "💊";
      description =
        "Collect your prescribed medicines.";
    }

    journeySteps.push({
      id: primaryDepartment.id,
      icon: primaryIcon,
      title: primaryDepartment.name,
      description,
      status: "GO NOW",
      statusClass: "go-status",
      wait: `${predictedWait} min`,
      type: "active",
    });
  }

  /* =========================================
     LABORATORY
  ========================================= */

  if (
    (needs.includes("blood") ||
      visit === "diagnostic") &&
    primaryId !== "laboratory"
  ) {
    const department =
      getDepartment("laboratory");

    if (department) {
      const wait =
        calculateWaitTime(department);

      journeySteps.push({
        id: "laboratory",
        icon: "🩸",
        title: "Laboratory",
        description:
          "Diagnostic blood work.",
        status: "AI SCHEDULED",
        statusClass: "wait-status",
        wait: `${wait} min`,
        type: "normal",
      });
    }
  }

  /* =========================================
     RADIOLOGY
  ========================================= */

  if (
    needs.includes("scan") &&
    primaryId !== "radiology"
  ) {
    const department =
      getDepartment("radiology");

    if (department) {
      const wait =
        calculateWaitTime(department);

      journeySteps.push({
        id: "radiology",
        icon: "🔬",
        title: "Radiology",
        description:
          "Required medical imaging.",
        status: "AI SCHEDULED",
        statusClass: "wait-status",
        wait: `${wait} min`,
        type: "normal",
      });
    }
  }

  /* =========================================
     DOCTOR
  ========================================= */

  if (
    (
      visit === "doctor" ||
      visit === "followup" ||
      needs.includes("blood") ||
      needs.includes("scan") ||
      needs.includes("specialist")
    ) &&
    primaryId !== "doctor"
  ) {
    const department =
      getDepartment("doctor");

    if (department) {
      const wait =
        calculateWaitTime(department);

      journeySteps.push({
        id: "doctor",
        icon: "👨‍⚕️",
        title: "Doctor Consultation",
        description:
          "Consultation with your doctor.",
        status: "AI SCHEDULED",
        statusClass: "wait-status",
        wait: `${wait} min`,
        type: "normal",
      });
    }
  }

  /* =========================================
     PHARMACY
  ========================================= */

  if (
    (
      visit === "pharmacy" ||
      needs.includes("medicine")
    ) &&
    primaryId !== "pharmacy"
  ) {
    const department =
      getDepartment("pharmacy");

    if (department) {
      const wait =
        calculateWaitTime(department);

      journeySteps.push({
        id: "pharmacy",
        icon: "💊",
        title: "Pharmacy",
        description:
          "Collect your prescribed medicines.",
        status: "LOW QUEUE",
        statusClass: "pharmacy-status",
        wait: `${wait} min`,
        type: "normal",
      });
    }
  }

  /* =========================================
     REMOVE DUPLICATES
  ========================================= */

  const uniqueJourney =
    journeySteps.filter(
      (step, index, array) =>
        array.findIndex(
          (item) => item.id === step.id
        ) === index
    );

  /* =========================================
     HOSPITAL TRAFFIC
  ========================================= */

  const totalPatients =
    hospitalDepartments.reduce(
      (total, department) =>
        total + department.queue,
      0
    );

  const traffic =
    getTrafficLevel(totalPatients);

  /* =========================================
     DOCTOR WORKLOAD
  ========================================= */

  const doctorDepartment =
    getDepartment("doctor");

  const doctorWorkload =
    doctorDepartment
      ? calculateDoctorWorkload(
          doctorDepartment.queue,
          doctorDepartment.availableStaff
        )
      : 0;

  /* =========================================
     JOURNEY METRICS
  ========================================= */

  const hospitalStops =
    uniqueJourney.length;

  const departmentData =
    uniqueJourney.map((step) => ({
      name: step.title,

      queue:
        step.type === "completed"
          ? 0
          : step.id === "laboratory"
          ? 2
          : step.id === "radiology"
          ? 3
          : step.id === "doctor"
          ? 6
          : step.id === "pharmacy"
          ? 2
          : 3,

      serviceTime:
        step.id === "doctor"
          ? 15
          : step.id === "laboratory"
          ? 8
          : step.id === "radiology"
          ? 12
          : step.id === "pharmacy"
          ? 5
          : 5,

      availableStaff:
        step.id === "doctor"
          ? 3
          : 2,

      capacity: 20,
    }));

  const optimizedTime =
    calculateTotalJourneyTime(
      departmentData
    );

  /* =========================================
     TRADITIONAL TIME
  ========================================= */

  const traditionalTime =
    departmentData.reduce(
      (total, department) => {
        const traditionalWait =
          (department.queue + 4) *
          department.serviceTime;

        return (
          total +
          traditionalWait +
          department.serviceTime
        );
      },
      0
    );

  /* =========================================
     TIME SAVED
  ========================================= */

  const timeSaved =
    calculateTimeSaved(
      traditionalTime,
      optimizedTime
    );

  const estimatedTime =
    Math.max(optimizedTime, 20);

  /* =========================================
     AI EXPLANATION
  ========================================= */

  let aiExplanation =
    "CareFlow analyzed your selections and arranged the departments to reduce unnecessary movement and waiting.";

  if (needs.includes("blood")) {
    aiExplanation =
      "CareFlow placed the blood test early because your results may be required before your doctor consultation.";
  } else if (needs.includes("scan")) {
    aiExplanation =
      "CareFlow prioritized imaging so your doctor can review the results without creating unnecessary waiting later.";
  } else if (needs.includes("specialist")) {
    aiExplanation =
      "CareFlow identified the specialist consultation as an important step and placed it early in your journey.";
  } else if (
    needs.includes("medicine") ||
    visit === "pharmacy"
  ) {
    aiExplanation =
      "CareFlow placed the pharmacy at the most efficient point in your journey while considering the expected queue.";
  }

  /* =========================================
     START LIVE JOURNEY
     
     IMPORTANT:
     This function calls the function received
     from App.jsx.
  ========================================= */

const handleFollowOptimizedRoute = () => {

  console.log(
    "Starting AI Optimized Live Journey..."
  );

  if (typeof onStartJourney === "function") {

    onStartJourney({
      ...journeyData,

      optimizedTime,
      traditionalTime,
      timeSaved,

      hospitalStops,

      traffic,
      doctorWorkload,

      journeySteps: uniqueJourney,

      aiExplanation,

    });

  } else {

    console.error(
      "onStartJourney was not provided by App.jsx"
    );

  }

};
  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="ai-journey-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="ai-journey-header">

        <div className="ai-brand">

          <div className="ai-logo">
            +
          </div>

          <div>
            <h2>CareFlow AI</h2>

            <span>
              Hospital Without Queues
            </span>
          </div>

        </div>


        <div className="ai-header-right">

          <div className="ai-user">

            <strong>
              {userData?.name || "Patient"}
            </strong>

            <span>
              Patient
            </span>

          </div>


          <button
            className="ai-back-button"
            onClick={onBack}
          >
            ← Back
          </button>


          <button
            className="ai-logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="ai-journey-main">

        {/* AI BADGE */}

        <div className="ai-badge">

          <span className="ai-pulse"></span>

          ✦ CAREFLOW AI

        </div>


        {/* HERO */}

        <h1>
          Your Smart Journey is
          <span> Ready.</span>
        </h1>


        <p className="ai-subtitle">
          We've analyzed your needs and created
          the most efficient route through the
          hospital.
        </p>


        {/* =====================================
            AI SUMMARY
        ===================================== */}

        <section className="ai-summary">

          <div className="ai-summary-icon">
            ✦
          </div>

          <div>

            <strong>
              AI has optimized your hospital visit
            </strong>

            <p>
              Your journey is designed to reduce
              unnecessary waiting and movement.
            </p>

          </div>

          <div className="ai-ready">

            <span></span>

            READY

          </div>

        </section>


        {/* =====================================
            TIME CARDS
        ===================================== */}

        <div className="time-cards">

          <div className="time-card">

            <span>⏱️</span>

            <div>

              <small>
                ESTIMATED HOSPITAL TIME
              </small>

              <strong>
                {Math.floor(
                  estimatedTime / 60
                )}h{" "}
                {estimatedTime % 60}m
              </strong>

            </div>

          </div>


          <div className="time-card saved">

            <span>⚡</span>

            <div>

              <small>
                TIME SAVED
              </small>

              <strong>
                {timeSaved} min
              </strong>

            </div>

          </div>


          <div className="time-card">

            <span>🏥</span>

            <div>

              <small>
                HOSPITAL STOPS
              </small>

              <strong>
                {hospitalStops}
              </strong>

            </div>

          </div>

        </div>


        {/* =====================================
            HOSPITAL STATUS
        ===================================== */}

        <div className="hospital-status-strip">

          <div>
            <span>🏥</span>

            <strong>
              Hospital Traffic
            </strong>

            <small>
              {traffic?.level ||
                traffic?.status ||
                "Normal"}
            </small>
          </div>


          <div>

            <span>👨‍⚕️</span>

            <strong>
              Doctor Workload
            </strong>

            <small>
              {doctorWorkload}
            </small>

          </div>


          <div>

            <span>🤖</span>

            <strong>
              AI Status
            </strong>

            <small>
              Optimized
            </small>

          </div>

        </div>


        {/* =====================================
            JOURNEY CARD
        ===================================== */}

        <section className="journey-card">

          <div className="journey-card-header">

            <div>

              <span className="section-label">
                AI OPTIMIZED ROUTE
              </span>

              <h2>
                Your Hospital Journey
              </h2>

              <p>
                CareFlow AI will guide you
                through each step.
              </p>

            </div>

            <div className="journey-ai-icon">
              🧭
            </div>

          </div>


          {/* ===================================
              JOURNEY STEPS
          =================================== */}

          {uniqueJourney.map(
            (step, index) => (

              <React.Fragment
                key={step.id}
              >

                <div
                  className={`journey-step ${
                    step.type === "completed"
                      ? "completed"
                      : step.type === "active"
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="step-number">

                    {step.type === "completed"
                      ? "✓"
                      : index + 1}

                  </div>


                  <div className="step-content">

                    <div className="step-top">

                      <h3>

                        {step.icon}{" "}
                        {step.title}

                      </h3>


                      <span
                        className={`status ${step.statusClass}`}
                      >
                        {step.status}
                      </span>

                    </div>


                    <p>
                      {step.description}
                    </p>


                    <div className="step-info">

                      {step.type === "completed"
                        ? "✓ "
                        : step.type === "active"
                        ? "🟢 Estimated wait: "
                        : "🕐 Estimated wait: "}

                      <strong>
                        {step.wait}
                      </strong>

                    </div>

                  </div>

                </div>


                {index <
                  uniqueJourney.length - 1 && (

                  <div className="journey-connector"></div>

                )}

              </React.Fragment>

            )
          )}


          {/* =====================================
              WHY AI
          ===================================== */}

          <div className="why-ai">

            <div className="why-ai-icon">
              🤖
            </div>


            <div>

              <strong>
                Why did CareFlow choose
                this order?
              </strong>

              <p>
                {aiExplanation}
              </p>


              {recommendedDepartment && (

                <p className="routing-explanation">

                  🧭{" "}

                  <strong>
                    AI Recommendation:
                  </strong>{" "}

                  Go to{" "}

                  <strong>
                    {recommendedDepartment.name}
                  </strong>{" "}

                  because it currently has an
                  estimated waiting time of{" "}

                  <strong>

                    {calculateWaitTime(
                      recommendedDepartment
                    )}{" "}
                    minutes

                  </strong>.

                </p>

              )}

            </div>


            <div className="ai-routing-status">

              <span></span>

              AI OPTIMIZED

            </div>

          </div>


          {/* =====================================
              FOLLOW AI OPTIMIZED ROUTE
          ===================================== */}

          <button
            type="button"
            className="start-journey-button"
            onClick={handleFollowOptimizedRoute}
          >

            <span>
              🧭
            </span>

            Follow AI-Optimized Route

            <strong>
              →
            </strong>

          </button>

        </section>

      </main>

    </div>
  );
}

export default AIGeneratedJourney;