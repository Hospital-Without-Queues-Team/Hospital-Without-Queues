import React, { useEffect, useState } from "react";
import "./FinalImpactDashboard.css";

import {
  calculateTimeSaved,
} from "../data/HospitalEngine";

function FinalImpactDashboard({
  userData,
  journeyData,
  onBack,
  onLogout,
}) {

  // ==========================================
  // JOURNEY IMPACT CALCULATION
  // ==========================================

  const traditionalTime = 67;

  const aiTime =
    journeyData?.optimizedTime ||
    journeyData?.estimatedTime ||
    42;

  const timeSaved = calculateTimeSaved(
    traditionalTime,
    aiTime
  );

  const waitingReduction = Math.round(
    (timeSaved / traditionalTime) * 100
  );


  // ==========================================
  // ANIMATED NUMBERS
  // ==========================================

  const [animatedTime, setAnimatedTime] = useState(0);
  const [animatedSaved, setAnimatedSaved] = useState(0);
  const [animatedReduction, setAnimatedReduction] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);


  useEffect(() => {

    let currentTime = 0;
    let currentSaved = 0;
    let currentReduction = 0;
    let currentScore = 0;

    const interval = setInterval(() => {

      currentTime += 2;
      currentSaved += 1;
      currentReduction += 2;
      currentScore += 2;


      if (currentTime >= aiTime) {
        currentTime = aiTime;
      }

      if (currentSaved >= timeSaved) {
        currentSaved = timeSaved;
      }

      if (currentReduction >= waitingReduction) {
        currentReduction = waitingReduction;
      }

      if (currentScore >= 92) {
        currentScore = 92;
      }


      setAnimatedTime(currentTime);
      setAnimatedSaved(currentSaved);
      setAnimatedReduction(currentReduction);
      setAnimatedScore(currentScore);


      if (
        currentTime >= aiTime &&
        currentSaved >= timeSaved &&
        currentReduction >= waitingReduction &&
        currentScore >= 92
      ) {
        clearInterval(interval);
      }

    }, 40);


    return () => clearInterval(interval);

  }, [
    aiTime,
    timeSaved,
    waitingReduction
  ]);


  return (

    <div className="impact-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="impact-header">

        <div className="impact-brand">

          <div className="impact-logo">
            🏥
          </div>

          <div>

            <h2>
              Hospital Without Queues
            </h2>

            <span>
              CAREFLOW AI
            </span>

          </div>

        </div>


        <div className="impact-header-actions">

          <div className="impact-user">

            <span>
              👤
            </span>

            <strong>
              {userData?.name || "Patient"}
            </strong>

          </div>


          <button
            className="impact-back"
            onClick={onBack}
          >
            ← Back
          </button>


          <button
            className="impact-logout"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>



      {/* =====================================
          MAIN
      ===================================== */}

      <main className="impact-main">


        {/* =====================================
            HERO
        ===================================== */}

        <section className="impact-hero">

          <div className="impact-complete-badge">

            <span>
              ✓
            </span>

            JOURNEY COMPLETED

          </div>


          <div className="hero-ai-orbit">

            <div className="hero-ai-circle">
              🤖
            </div>

            <span className="orbit orbit-one">
              +
            </span>

            <span className="orbit orbit-two">
              ✦
            </span>

          </div>


          <h1>

            Your Hospital Journey

            <span>
              {" "}Was Optimized.
            </span>

          </h1>


          <p>

            CareFlow AI continuously analysed
            hospital queues, congestion and
            patient flow to reduce unnecessary
            waiting during your visit.

          </p>


          {/* BIG IMPACT */}

          <div className="impact-big-number">

            <div className="impact-ring">

              <strong>
                {animatedReduction}%
              </strong>

              <span>
                LESS
                <br />
                WAITING
              </span>

            </div>

          </div>


          <div className="hero-success-message">

            <span>
              ✨
            </span>

            Your journey was successfully optimized
            by CareFlow AI.

          </div>

        </section>



        {/* =====================================
            TIME COMPARISON
        ===================================== */}

        <section className="impact-time-section">

          <div className="impact-section-title">

            <span>
              ⏱️ YOUR TIME SAVED
            </span>

            <h2>
              AI vs Traditional Hospital
            </h2>

            <p>
              See the difference intelligent
              patient-flow optimization made.
            </p>

          </div>


          <div className="impact-time-cards">


            {/* TRADITIONAL */}

            <div className="impact-time-card traditional">

              <div className="impact-card-top">

                <div className="impact-card-icon">
                  🏥
                </div>

                <span className="status-pill">
                  STANDARD
                </span>

              </div>


              <span>
                TRADITIONAL HOSPITAL
              </span>


              <strong>
                {traditionalTime}
              </strong>


              <small>
                minutes estimated
              </small>


              <div className="time-progress">

                <div
                  className="traditional-progress"
                  style={{
                    width: "100%"
                  }}
                />

              </div>

            </div>



            {/* ARROW */}

            <div className="impact-arrow">

              <span>
                AI
              </span>

              →

            </div>



            {/* AI */}

            <div className="impact-time-card ai">

              <div className="impact-card-top">

                <div className="impact-card-icon">
                  🤖
                </div>

                <span className="status-pill ai-pill">
                  OPTIMIZED
                </span>

              </div>


              <span>
                CAREFLOW AI
              </span>


              <strong>
                {animatedTime}
              </strong>


              <small>
                minutes estimated
              </small>


              <div className="time-progress">

                <div
                  className="ai-progress"
                  style={{
                    width: `${Math.max(
                      25,
                      (aiTime / traditionalTime) * 100
                    )}%`
                  }}
                />

              </div>

            </div>



            {/* SAVED */}

            <div className="impact-time-card saved">

              <div className="impact-card-icon">
                ⚡
              </div>


              <span>
                TIME SAVED
              </span>


              <strong>
                {animatedSaved}
              </strong>


              <small>
                minutes recovered
              </small>


              <div className="saved-message">
                🎉 More time for you
              </div>

            </div>

          </div>

        </section>



        {/* =====================================
            AI DECISIONS
        ===================================== */}

        <section className="ai-decisions-section">

          <div className="impact-section-title">

            <span>
              🤖 CAREFLOW INTELLIGENCE
            </span>

            <h2>
              What AI Did During Your Journey
            </h2>

            <p>
              CareFlow continuously evaluated your
              hospital journey instead of using a
              fixed patient flow.
            </p>

          </div>


          <div className="ai-decision-grid">


            <div className="ai-decision-card">

              <div className="decision-icon">
                🧠
              </div>

              <div className="decision-number">
                01
              </div>

              <strong>
                Queue Prediction
              </strong>

              <span>
                Predicted department waiting
                times before sending you there.
              </span>

              <small>
                ✓ AI ANALYSED
              </small>

            </div>



            <div className="ai-decision-card">

              <div className="decision-icon">
                🚦
              </div>

              <div className="decision-number">
                02
              </div>

              <strong>
                Congestion Detection
              </strong>

              <span>
                Identified busy hospital areas
                and potential bottlenecks.
              </span>

              <small>
                ✓ DETECTED
              </small>

            </div>



            <div className="ai-decision-card">

              <div className="decision-icon">
                🧭
              </div>

              <div className="decision-number">
                03
              </div>

              <strong>
                Dynamic Routing
              </strong>

              <span>
                Selected a more efficient route
                through the hospital.
              </span>

              <small>
                ✓ OPTIMIZED
              </small>

            </div>



            <div className="ai-decision-card">

              <div className="decision-icon">
                🔮
              </div>

              <div className="decision-number">
                04
              </div>

              <strong>
                Future Prediction
              </strong>

              <span>
                Forecast upcoming changes in
                department queues.
              </span>

              <small>
                ✓ FORECASTED
              </small>

            </div>



            <div className="ai-decision-card">

              <div className="decision-icon">
                🔄
              </div>

              <div className="decision-number">
                05
              </div>

              <strong>
                Auto Rerouting
              </strong>

              <span>
                Evaluated alternative paths when
                congestion changed.
              </span>

              <small>
                ✓ MONITORED
              </small>

            </div>



            <div className="ai-decision-card">

              <div className="decision-icon">
                🔊
              </div>

              <div className="decision-number">
                06
              </div>

              <strong>
                Voice Guidance
              </strong>

              <span>
                Supported accessible navigation
                throughout your journey.
              </span>

              <small>
                ✓ ACCESSIBLE
              </small>

            </div>

          </div>

        </section>



        {/* =====================================
            IMPACT SCORE
        ===================================== */}

        <section className="impact-score-section">


          <div className="score-glow"></div>


          <div className="impact-score-icon">
            🏆
          </div>


          <span>
            CAREFLOW IMPACT SCORE
          </span>


          <div className="score-number">

            <strong>
              {animatedScore}
            </strong>

            <small>
              /100
            </small>

          </div>


          <div className="score-bar">

            <div
              style={{
                width: `${animatedScore}%`
              }}
            />

          </div>


          <h2>
            Excellent Journey Optimization
          </h2>


          <p>
            CareFlow successfully reduced
            unnecessary waiting and continuously
            adapted your hospital journey.
          </p>


          <div className="score-tags">

            <span>
              ✓ Efficient
            </span>

            <span>
              ✓ Adaptive
            </span>

            <span>
              ✓ Patient-Centric
            </span>

          </div>

        </section>



        {/* =====================================
            FINAL MESSAGE
        ===================================== */}

        <section className="impact-final-message">


          <div className="message-floating-icon">
            💙
          </div>


          <div className="message-label">
            THE CAREFLOW IDEA
          </div>


          <h2>
            You didn't wait for the hospital.
          </h2>


          <h3>
            The hospital adapted to you.
          </h3>


          <p>

            That's the idea behind

            <strong>
              {" "}Hospital Without Queues.
            </strong>

          </p>


          <div className="message-line"></div>


          <div className="message-features">

            <span>
              🤖 AI Powered
            </span>

            <span>
              🧭 Dynamic
            </span>

            <span>
              ❤️ Patient First
            </span>

          </div>

        </section>



        {/* =====================================
            RETURN BUTTON
        ===================================== */}

        <button
          className="finish-journey-button"
          onClick={onBack}
        >

          <span>
            🏥
          </span>

          Return to Dashboard

          <b>
            →
          </b>

        </button>


      </main>

    </div>
  );
}


export default FinalImpactDashboard;