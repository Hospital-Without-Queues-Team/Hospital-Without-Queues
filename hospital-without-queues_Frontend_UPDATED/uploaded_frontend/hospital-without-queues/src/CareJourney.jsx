import React, { useState } from "react";
import "./CareJourney.css";

function CareJourney({
  userData,
  onLogout,
  onBack,
  onJourneyGenerated,
}) {
  const [selectedVisit, setSelectedVisit] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const visitOptions = [
    {
      id: "doctor",
      icon: "🩺",
      title: "Doctor Consultation",
      description: "I need to consult a doctor.",
      tag: "CONSULTATION",
    },
    {
      id: "diagnostic",
      icon: "🧪",
      title: "Diagnostic Test",
      description: "I need a blood test, scan or other test.",
      tag: "DIAGNOSTICS",
    },
    {
      id: "pharmacy",
      icon: "💊",
      title: "Pharmacy",
      description: "I need to collect or purchase medicines.",
      tag: "MEDICINE",
    },
    {
      id: "followup",
      icon: "📋",
      title: "Follow-up Visit",
      description: "I am here for a previous treatment.",
      tag: "FOLLOW-UP",
    },
  ];

  const needOptions = [
    {
      id: "blood",
      icon: "🩸",
      title: "Blood Test",
      description: "Routine or diagnostic blood work",
    },
    {
      id: "scan",
      icon: "🔬",
      title: "Scan / Imaging",
      description: "X-ray, CT, MRI or ultrasound",
    },
    {
      id: "medicine",
      icon: "💊",
      title: "Medicines",
      description: "Prescription or pharmacy visit",
    },
    {
      id: "specialist",
      icon: "👨‍⚕️",
      title: "Specialist",
      description: "Consult a specific department",
    },
  ];

  const handleNeedToggle = (id) => {
    setSelectedNeeds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleContinue = () => {
    if (!selectedVisit) return;

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      if (onJourneyGenerated) {
        onJourneyGenerated({
          visit: selectedVisit,
          needs: selectedNeeds,
        });
      }
    }, 1200);
  };

  return (
    <div className="care-page">

      {/* =========================================
          ANIMATED BACKGROUND
      ========================================= */}

      <div className="care-background">
        <div className="care-grid"></div>

        <div className="floating-circle circle-one"></div>
        <div className="floating-circle circle-two"></div>
        <div className="floating-circle circle-three"></div>

        <div className="floating-medical medical-one">✚</div>
        <div className="floating-medical medical-two">＋</div>
        <div className="floating-medical medical-three">✦</div>
        <div className="floating-medical medical-four">♡</div>
      </div>


      {/* =========================================
          HEADER
      ========================================= */}

      <header className="care-header">

        <div className="care-brand">

          <div className="care-logo">
            +
          </div>

          <div>
            <h2>CareFlow AI</h2>
            <span>Hospital Without Queues</span>
          </div>

        </div>


        <div className="care-header-right">

          <div className="care-user">

            <strong>
              {userData?.name || "Patient"}
            </strong>

            <span>
              Patient
            </span>

          </div>


          <button
            className="care-logout"
            onClick={onLogout}
          >
            Logout
          </button>


          <button
            className="care-back"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>

      </header>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="care-main">


        {/* =========================================
            PROGRESS
        ========================================= */}

        <div className="journey-progress">

          <div className="progress-step active">

            <div className="progress-number">
              1
            </div>

            <span>Your Visit</span>

          </div>


          <div className="progress-line active-line"></div>


          <div className="progress-step">

            <div className="progress-number">
              2
            </div>

            <span>Your Needs</span>

          </div>


          <div className="progress-line"></div>


          <div className="progress-step">

            <div className="progress-number">
              3
            </div>

            <span>Your Journey</span>

          </div>

        </div>


        {/* =========================================
            HERO
        ========================================= */}

        <section className="care-intro">

          <div className="intro-badge">

            <span className="badge-pulse"></span>

            ✦ AI PERSONALIZED CARE

          </div>


          <h1>
            Let's understand{" "}
            <span>your visit.</span>
          </h1>


          <p>
            Hello{" "}
            <strong>
              {userData?.name || "Patient"}
            </strong>
            . Tell CareFlow AI why you're visiting today.
            <br />
            We'll use this information to create a smarter,
            faster hospital journey for you.
          </p>


          <div className="intro-trust">

            <span>🔐 Your information stays private</span>

            <span>⚡ AI-powered planning</span>

            <span>🏥 Patient-first design</span>

          </div>

        </section>


        {/* =========================================
            VISIT CARD
        ========================================= */}

        <section className="visit-card">

          <div className="card-heading">

            <div className="heading-number">
              01
            </div>

            <div>

              <h2>
                What brings you to the hospital today?
              </h2>

              <p>
                Choose the option that best describes your visit.
              </p>

            </div>

            <div className="heading-icon">
              🏥
            </div>

          </div>


          <div className="visit-grid">

            {visitOptions.map((option) => (

              <button
                key={option.id}
                className={`visit-option ${
                  selectedVisit === option.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedVisit(option.id)
                }
              >

                <div className="visit-icon">
                  {option.icon}
                </div>


                <div className="visit-information">

                  <div className="visit-title-row">

                    <h3>
                      {option.title}
                    </h3>

                    <span className="visit-tag">
                      {option.tag}
                    </span>

                  </div>

                  <p>
                    {option.description}
                  </p>

                </div>


                <div className="selection-circle">

                  {selectedVisit === option.id && (
                    <span>✓</span>
                  )}

                </div>

              </button>

            ))}

          </div>


          {/* =========================================
              NEEDS SECTION
          ========================================= */}

          <div className="needs-section">

            <div className="needs-heading">

              <div className="heading-number">
                02
              </div>

              <div>

                <h2>
                  Anything else you need today?
                </h2>

                <p>
                  Select all that apply. This helps AI
                  optimize your route.
                </p>

              </div>

              <span className="optional-badge">
                OPTIONAL
              </span>

            </div>


            <div className="needs-grid">

              {needOptions.map((option) => (

                <button
                  key={option.id}
                  className={`need-option ${
                    selectedNeeds.includes(option.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleNeedToggle(option.id)
                  }
                >

                  <span className="need-icon">
                    {option.icon}
                  </span>

                  <span className="need-text">

                    <strong>
                      {option.title}
                    </strong>

                    <small>
                      {option.description}
                    </small>

                  </span>

                  <span className="need-check">

                    {selectedNeeds.includes(option.id)
                      ? "✓"
                      : "+"}

                  </span>

                </button>

              ))}

            </div>

          </div>


          {/* =========================================
              AI PREVIEW
          ========================================= */}

          <div
            className={`ai-preview ${
              selectedVisit ? "visible" : ""
            }`}
          >

            <div className="ai-orb">
              ✦
            </div>

            <div>

              <strong>
                CareFlow AI is ready
              </strong>

              <p>
                {selectedVisit
                  ? "Your selection will help us find the most efficient path through the hospital."
                  : "Select your visit type and AI will begin planning your journey."}
              </p>

            </div>

            <div className="ai-status">
              <span></span>
              READY
            </div>

          </div>


          {/* =========================================
              ACTION AREA
          ========================================= */}

          <div className="care-actions">

            <div className="action-note">

              <span>💡</span>

              <p>
                Don't worry — you can change your
                answers anytime.
              </p>

            </div>


            <button
              className={`continue-button ${
                !selectedVisit ? "disabled" : ""
              }`}
              disabled={!selectedVisit || isGenerating}
              onClick={handleContinue}
            >

              {isGenerating ? (

                <>
                  <span className="loading-spinner"></span>
                  Creating your smart journey...
                </>

              ) : (

                <>
                  <span className="continue-icon">
                    →
                  </span>

                  <span>
                    Create My Smart Journey
                  </span>

                  <span className="continue-arrow">
                    ↗
                  </span>
                </>

              )}

            </button>

          </div>

        </section>


        {/* =========================================
            BOTTOM TRUST AREA
        ========================================= */}

        <div className="bottom-features">

          <div>
            <span>⏱</span>
            <strong>Less waiting</strong>
            <small>AI predicts queues</small>
          </div>

          <div>
            <span>🧭</span>
            <strong>Smart routing</strong>
            <small>Best route for you</small>
          </div>

          <div>
            <span>🧠</span>
            <strong>Personalized AI</strong>
            <small>Journey built around you</small>
          </div>

          <div>
            <span>💙</span>
            <strong>Patient first</strong>
            <small>Simple & accessible</small>
          </div>

        </div>

      </main>

    </div>
  );
}

export default CareJourney;