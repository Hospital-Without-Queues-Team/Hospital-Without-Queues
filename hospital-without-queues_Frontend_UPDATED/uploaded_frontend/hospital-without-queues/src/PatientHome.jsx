import React from "react";
import "./PatientHome.css";

function PatientHome({ onStartJourney, onLogout }) {
  return (
    <div className="patient-home">

      {/* Background decoration */}
      <div className="home-glow home-glow-one"></div>
      <div className="home-glow home-glow-two"></div>

      {/* HEADER */}
      <header className="patient-header">

        <div className="patient-brand">
          <div className="patient-brand-icon">✚</div>

          <div>
            <h1>CareFlow AI</h1>
            <p>HOSPITAL WITHOUT QUEUES</p>
          </div>
        </div>

        <div className="patient-header-right">
          <div className="patient-profile">
            <div className="profile-avatar">👤</div>

            <div className="profile-info">
              <strong>Patient</strong>
              <span>Welcome back</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

      </header>


      {/* MAIN CONTENT */}
      <main className="patient-home-container">

        {/* WELCOME SECTION */}
        <section className="welcome-section">

          <div className="welcome-badge">
            ✦ AI-POWERED PATIENT ASSISTANCE
          </div>

          <h2>
            Your hospital visit,
            <span> made simpler.</span>
          </h2>

          <p>
            CareFlow AI continuously analyzes hospital queues and resources
            to find the most efficient journey for you.
          </p>

        </section>


        {/* MAIN JOURNEY CARD */}
        <section className="start-journey-card">

          <div className="journey-card-decoration"></div>

          <div className="journey-main-icon">
            🏥
          </div>

          <div className="journey-card-content">

            <div className="journey-card-label">
              PERSONALIZED PATIENT JOURNEY
            </div>

            <h3>
              Ready to begin your hospital visit?
            </h3>

            <p>
              Tell us what you need today. Our AI will analyze the
              hospital situation and create the best route for you.
            </p>

            <button
              className="start-journey-button"
              onClick={onStartJourney}
            >
              <span>Start My Hospital Journey</span>
              <span className="button-arrow">→</span>
            </button>

          </div>

        </section>


        {/* QUICK FEATURES */}
        <section className="quick-section">

          <div className="section-heading">
            <div>
              <span>SMART HOSPITAL ASSISTANCE</span>
              <h3>Explore your options</h3>
            </div>
          </div>


          <div className="quick-feature-grid">

            {/* WAIT TIME */}
            <button className="quick-feature-card">

              <div className="feature-icon wait-icon">
                ⏱
              </div>

              <div className="feature-content">
                <strong>My Wait Time</strong>

                <span>
                  See predicted waiting times for your journey.
                </span>
              </div>

              <span className="feature-arrow">
                →
              </span>

            </button>


            {/* NAVIGATION */}
            <button className="quick-feature-card">

              <div className="feature-icon map-icon">
                🗺
              </div>

              <div className="feature-content">
                <strong>Navigate Hospital</strong>

                <span>
                  Find rooms, departments and facilities.
                </span>
              </div>

              <span className="feature-arrow">
                →
              </span>

            </button>


            {/* WHILE WAITING */}
            <button className="quick-feature-card">

              <div className="feature-icon waiting-icon">
                💡
              </div>

              <div className="feature-content">
                <strong>While I Wait</strong>

                <span>
                  Discover useful things you can do while waiting.
                </span>
              </div>

              <span className="feature-arrow">
                →
              </span>

            </button>


            {/* ACCESSIBILITY */}
            <button className="quick-feature-card">

              <div className="feature-icon accessibility-icon">
                ♿
              </div>

              <div className="feature-content">
                <strong>Accessibility</strong>

                <span>
                  Voice, language and easy-reading options.
                </span>
              </div>

              <span className="feature-arrow">
                →
              </span>

            </button>

          </div>

        </section>


        {/* AI STATUS */}
        <section className="ai-status-card">

          <div className="status-indicator">
            <span></span>
          </div>

          <div className="status-content">
            <strong>CareFlow AI is ready</strong>

            <p>
              Hospital queue monitoring and journey optimization
              will begin when you start your visit.
            </p>
          </div>

          <div className="status-badge">
            SYSTEM READY
          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="patient-footer">
        <span>CareFlow AI</span>
        <span>Intelligent Patient Flow Optimization</span>
      </footer>

    </div>
  );
}

export default PatientHome;