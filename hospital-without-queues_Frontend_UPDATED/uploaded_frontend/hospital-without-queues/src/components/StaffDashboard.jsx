import React, { useMemo } from "react";
import "./StaffDashboard.css";

import {
  liveHospitalData,
  predictHospitalQueues,
  generateQueueSummary,
} from "../data/HospitalEngine";
import { useLiveDepartments } from "../api";


function StaffDashboard({
  userData,
  onBack,
  onLogout,
}) {

  /* =========================================================
     HOSPITAL DATA

     Was: a static liveHospitalData array (numbers never changed).
     Now: polls the real backend every 3s so this always reflects
     actual patients who have checked in/out. Falls back to the
     original static array if the backend isn't running, so this
     screen still works even with no backend at all.
  ========================================================= */

  const { departments: liveDepartments, connected } =
    useLiveDepartments(liveHospitalData, 3000);

  const departments = useMemo(() => {

    if (
      !liveDepartments ||
      !Array.isArray(liveDepartments)
    ) {
      return [];
    }

    return liveDepartments;

  }, [liveDepartments]);


  /* =========================================================
     AI QUEUE PREDICTIONS
  ========================================================= */

  const predictions = useMemo(() => {

    try {

      return predictHospitalQueues(
        departments
      );

    } catch (error) {

      console.error(
        "Staff dashboard prediction error:",
        error
      );

      return [];

    }

  }, [departments]);


  /* =========================================================
     AI SUMMARY
  ========================================================= */

  const summary = useMemo(() => {

    try {

      return generateQueueSummary(
        departments
      );

    } catch (error) {

      console.error(
        "Staff dashboard summary error:",
        error
      );

      return {
        message:
          "CareFlow is analysing hospital conditions.",
        highTraffic: 0,
        moderateTraffic: 0,
        lowTraffic: 0,
      };

    }

  }, [departments]);


  /* =========================================================
     TOTAL PATIENTS
  ========================================================= */

  const totalPatients = useMemo(() => {

    return departments.reduce(
      (total, department) =>
        total +
        (Number(department.queue) || 0),
      0
    );

  }, [departments]);


  /* =========================================================
     TOTAL STAFF
  ========================================================= */

  const totalStaff = useMemo(() => {

    return departments.reduce(
      (total, department) =>
        total +
        (
          Number(
            department.availableStaff ??
            department.staff
          ) || 0
        ),
      0
    );

  }, [departments]);


  /* =========================================================
     AI RECOMMENDATIONS
  ========================================================= */

  const recommendations = useMemo(() => {

    if (!predictions.length) {

      return [
        {
          icon: "🤖",
          title: "AI analysing hospital flow",
          message:
            "CareFlow is currently analysing department queues.",
          type: "info",
        },
      ];

    }

    const results = [];

    predictions.forEach((prediction) => {

      const department =
        String(
          prediction.department || ""
        ).toLowerCase();

      if (
        prediction.status === "high"
      ) {

        results.push({
          icon: "🔴",
          title:
            `${prediction.department} needs attention`,
          message:
            `Queue is expected to remain high with approximately ${prediction.predictedWait} minutes waiting time.`,
          type: "danger",
        });

      } else if (
        prediction.status === "moderate"
      ) {

        results.push({
          icon: "🟡",
          title:
            `${prediction.department} is moderately busy`,
          message:
            "CareFlow recommends monitoring patient flow closely.",
          type: "warning",
        });

      }

    });

    if (!results.length) {

      results.push({
        icon: "🟢",
        title: "Hospital flow is stable",
        message:
          "No major congestion detected. Current staffing appears sufficient.",
        type: "success",
      });

    }

    return results.slice(0, 4);

  }, [predictions]);


  /* =========================================================
     DEPARTMENT ICON
  ========================================================= */

  const getDepartmentIcon = (
    name
  ) => {

    const value =
      String(name || "")
        .toLowerCase();

    if (
      value.includes("laboratory") ||
      value.includes("lab")
    ) {
      return "🧪";
    }

    if (
      value.includes("doctor") ||
      value.includes("consult")
    ) {
      return "🩺";
    }

    if (
      value.includes("radiology") ||
      value.includes("scan")
    ) {
      return "🩻";
    }

    if (
      value.includes("pharmacy") ||
      value.includes("medicine")
    ) {
      return "💊";
    }

    if (
      value.includes("emergency")
    ) {
      return "🚑";
    }

    return "🧾";

  };


  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = (
    prediction
  ) => {

    if (!prediction) {

      return {
        label: "Unknown",
        className: "staff-status-unknown",
        icon: "⚪",
      };

    }

    if (
      prediction.status === "high"
    ) {

      return {
        label: "High",
        className: "staff-status-high",
        icon: "🔴",
      };

    }

    if (
      prediction.status === "moderate"
    ) {

      return {
        label: "Moderate",
        className: "staff-status-moderate",
        icon: "🟡",
      };

    }

    return {
      label: "Low",
      className: "staff-status-low",
      icon: "🟢",
    };

  };


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="staff-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="staff-header">

        <div className="staff-brand">

          <div className="staff-logo">
            🏥
          </div>

          <div>

            <h2>
              Hospital Without Queues
            </h2>

            <span>
              CareFlow AI • Staff Dashboard
            </span>

          </div>

        </div>


        <div className="staff-header-right">

          <div className="staff-user">

            <strong>
              {userData?.name || "Hospital Staff"}
            </strong>

            <span>
              Administrator
            </span>

          </div>


          <button
            className="staff-back-button"
            onClick={onBack}
          >
            ← Patient View
          </button>


          <button
            className="staff-logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="staff-main">

        {/* HERO */}

        <section className="staff-hero">

          <div>

            <div className="staff-live-badge">

              <span></span>

              LIVE HOSPITAL MONITORING

            </div>


            <h1>
              Hospital Flow,
              <span> Under Control.</span>
            </h1>


            <p>
              CareFlow AI is continuously analysing
              queues, waiting times and department
              pressure to help staff manage patient flow.
            </p>

          </div>


          <div className="staff-ai-orb">
            🤖
          </div>

        </section>


        {/* ===================================================
            OVERVIEW CARDS
        =================================================== */}

        <section className="staff-overview-grid">

          <div className="staff-overview-card">

            <div className="overview-icon">
              👥
            </div>

            <div>

              <span>
                PATIENTS WAITING
              </span>

              <strong>
                {totalPatients}
              </strong>

              <small>
                Across monitored departments
              </small>

            </div>

          </div>


          <div className="staff-overview-card">

            <div className="overview-icon">
              👩‍⚕️
            </div>

            <div>

              <span>
                AVAILABLE STAFF
              </span>

              <strong>
                {totalStaff}
              </strong>

              <small>
                Currently available
              </small>

            </div>

          </div>


          <div className="staff-overview-card">

            <div className="overview-icon">
              🔴
            </div>

            <div>

              <span>
                HIGH TRAFFIC
              </span>

              <strong>
                {summary.highTraffic}
              </strong>

              <small>
                Need attention
              </small>

            </div>

          </div>


          <div className="staff-overview-card">

            <div className="overview-icon">
              🤖
            </div>

            <div>

              <span>
                AI STATUS
              </span>

              <strong>
                ACTIVE
              </strong>

              <small>
                Monitoring in real time
              </small>

            </div>

          </div>

        </section>


        {/* ===================================================
            AI HOSPITAL ANALYSIS
        =================================================== */}

        <section className="staff-ai-summary">

          <div className="staff-ai-summary-icon">
            🧠
          </div>

          <div>

            <span>
              CAREFLOW AI ANALYSIS
            </span>

            <h2>
              {summary.message}
            </h2>

            <p>
              AI is using current queue pressure,
              available staff and predicted waiting
              times to evaluate hospital flow.
            </p>

          </div>

          <div className="staff-ai-live">
            <span></span>
            LIVE
          </div>

        </section>


        {/* ===================================================
            DEPARTMENT MONITORING
        =================================================== */}

        <section className="staff-departments">

          <div className="staff-section-header">

            <div>

              <span>
                DEPARTMENT MONITORING
              </span>

              <h2>
                Live Patient Flow
              </h2>

            </div>

            <div className="staff-refresh">
              ● {connected ? "Live — real patient data" : "Offline demo data"}
            </div>

          </div>


          <div className="staff-department-list">

            {predictions.length > 0 ? (

              predictions.map(
                (prediction) => {

                  const status =
                    getStatus(
                      prediction
                    );

                  const departmentData =
                    departments.find(
                      (department) =>
                        String(
                          department.name
                        )
                          .toLowerCase()
                          .trim() ===
                        String(
                          prediction.department
                        )
                          .toLowerCase()
                          .trim()
                    );

                  const staff =
                    Number(
                      departmentData?.availableStaff ??
                      departmentData?.staff
                    ) || 0;

                  return (

                    <div
                      className="staff-department-row"
                      key={
                        prediction.department
                      }
                    >

                      <div className="staff-department-name">

                        <div className="staff-department-icon">

                          {
                            getDepartmentIcon(
                              prediction.department
                            )
                          }

                        </div>

                        <div>

                          <strong>
                            {prediction.department}
                          </strong>

                          <small>
                            👩‍⚕️ {staff} staff available
                          </small>

                        </div>

                      </div>


                      <div className="staff-queue-value">

                        <strong>
                          {prediction.currentQueue}
                        </strong>

                        <span>
                          patients
                        </span>

                      </div>


                      <div className="staff-wait-value">

                        <strong>
                          {prediction.predictedWait}
                        </strong>

                        <span>
                          min wait
                        </span>

                      </div>


                      <div
                        className={
                          `staff-status ${status.className}`
                        }
                      >

                        <span>
                          {status.icon}
                        </span>

                        {status.label}

                      </div>

                    </div>

                  );

                }

              )

            ) : (

              <div className="staff-empty">
                🤖 CareFlow is analysing department data...
              </div>

            )}

          </div>

        </section>


        {/* ===================================================
            AI RECOMMENDATIONS
        =================================================== */}

        <section className="staff-recommendations">

          <div className="staff-section-header">

            <div>

              <span>
                AI ACTION CENTRE
              </span>

              <h2>
                Recommended Actions
              </h2>

            </div>

            <div className="recommendation-badge">
              🤖 AI POWERED
            </div>

          </div>


          <div className="recommendation-grid">

            {recommendations.map(
              (recommendation, index) => (

                <div
                  className={
                    `recommendation-card ${
                      recommendation.type
                    }`
                  }

                  key={index}
                >

                  <div className="recommendation-icon">
                    {recommendation.icon}
                  </div>

                  <div>

                    <strong>
                      {recommendation.title}
                    </strong>

                    <p>
                      {recommendation.message}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* ===================================================
            FOOTER MESSAGE
        =================================================== */}

        <section className="staff-footer-message">

          <div>
            🤖
          </div>

          <div>

            <strong>
              CareFlow AI is watching the hospital for you.
            </strong>

            <p>
              When congestion changes, staff can respond
              before queues become overwhelming.
            </p>

          </div>

          <span>
            ● SYSTEM ACTIVE
          </span>

        </section>

      </main>

    </div>

  );

}


export default StaffDashboard;