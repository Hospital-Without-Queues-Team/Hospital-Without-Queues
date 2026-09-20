import "./../styles/Home.css";

function Home({
  userData,
  onStartJourney,
  onLogout,
  onStaffDashboard,
}) {

  return (

    <div className="home-page">

      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="background-grid"></div>

      <div className="glow-orb glow-orb-one"></div>
      <div className="glow-orb glow-orb-two"></div>
      <div className="glow-orb glow-orb-three"></div>

      {/* Floating medical symbols */}

      <div className="floating-symbol symbol-one">✚</div>
      <div className="floating-symbol symbol-two">✦</div>
      <div className="floating-symbol symbol-three">⌁</div>
      <div className="floating-symbol symbol-four">♡</div>
      <div className="floating-symbol symbol-five">+</div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="home-header">

        <div className="home-brand">

          <div className="home-logo">
            <span>✚</span>
          </div>

          <div className="brand-text">

            <h2>
              Hospital Without Queues
            </h2>

            <span>
              AI-Powered Patient Flow
            </span>

          </div>

        </div>


        {/* AI SYSTEM INDICATOR */}

        <div className="header-ai-status">

          <span className="header-status-dot"></span>

          <span>
            AI SYSTEM ONLINE
          </span>

        </div>


        {/* USER */}

        <div className="home-user">

          <div className="user-avatar">
            {userData?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <div className="user-info">

            <strong>
              {userData?.name || "Patient"}
            </strong>

            <span>
              Patient
            </span>

          </div>
         <button
  className="staff-dashboard-button"
  onClick={onStaffDashboard}
>
  🏥 Staff Dashboard
</button>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="home-content">


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="hero-section">

          <div className="hero-left">

            <div className="hero-tag">

              <span className="tag-pulse"></span>

              SMART HOSPITAL • AI JOURNEY

            </div>


            <h1>

              Your hospital visit.

              <br />

              <span className="hero-highlight">
                Without the wait.
              </span>

            </h1>


            <div className="hero-line"></div>


            <p className="hero-description">

              Hospital Without Queues uses AI to understand
              your journey, predict department waiting times
              and guide you through the smartest route.

            </p>


            {/* HERO BUTTONS */}

            <div className="hero-actions">

              <button
                className="primary-journey-button"
                onClick={onStartJourney}
              >

                <span className="button-circle">
                  →
                </span>

                <span>
                  Start My Smart Journey
                </span>

                <span className="button-end-arrow">
                  ↗
                </span>

              </button>


              <button
                className="secondary-how-button"
                onClick={() =>
                  alert(
                    "Our AI analyses hospital flow, estimated queues and service times to create a smarter patient journey."
                  )
                }
              >

                <span className="play-icon">
                  ▷
                </span>

                See how it works

              </button>

            </div>


            {/* TRUST FEATURES */}

            <div className="hero-benefits">

              <div>
                <span>✓</span>
                No unnecessary queues
              </div>

              <div>
                <span>✓</span>
                Personalized routing
              </div>

              <div>
                <span>✓</span>
                AI-guided care
              </div>

            </div>

          </div>


          {/* =================================================
              AI STATUS CARD
          ================================================= */}

          <div className="hero-status-card">

            <div className="status-card-top">

              <span className="live-indicator">
                ● LIVE
              </span>

              <span>
                Hospital AI
              </span>

            </div>

            <div className="status-number">
              37%
            </div>

            <p>
              less unnecessary waiting
            </p>

            <div className="status-progress">

              <span></span>

            </div>

            <small>
              AI route optimization active
            </small>

          </div>

        </section>



        {/* =====================================================
            START JOURNEY + HOSPITAL MAP
        ===================================================== */}

        <section className="journey-section">


          {/* LEFT CONTENT */}

          <div className="journey-content">

            <div className="journey-label">
              ✦ PERSONALIZED CARE
            </div>


            <h2>
              One patient.
              <br />
              <span>One intelligent route.</span>
            </h2>


            <p>

              Tell us what you need today.
              Our AI creates a personalized path through
              the hospital so you spend less time standing
              in unnecessary queues.

            </p>


            <div className="journey-mini-stats">

              <div>

                <strong>
                  AI
                </strong>

                <span>
                  Powered
                </span>

              </div>

              <div>

                <strong>
                  LIVE
                </strong>

                <span>
                  Routing
                </span>

              </div>

              <div>

                <strong>
                  24/7
                </strong>

                <span>
                  Assistance
                </span>

              </div>

            </div>


            <button
              className="journey-main-button"
              onClick={onStartJourney}
            >

              <span>
                Start My Journey
              </span>

              <strong>
                →
              </strong>

            </button>


            <div className="journey-note">

              <span>✦</span>

              AI will optimize your route in seconds

            </div>

          </div>



          {/* =================================================
              HOSPITAL MAP
          ================================================= */}

          <div className="hospital-map-container">


            <div className="map-top-bar">

              <div>

                <span className="map-live-dot"></span>

                LIVE HOSPITAL FLOW

              </div>

              <span>
                AI route selected
              </span>

            </div>


            <div className="hospital-map">

              {/* ORBITS */}

              <div className="map-orbit map-orbit-one"></div>

              <div className="map-orbit map-orbit-two"></div>

              <div className="map-orbit map-orbit-three"></div>


              {/* CONNECTION LINES */}

              <div className="map-line map-line-one"></div>

              <div className="map-line map-line-two"></div>

              <div className="map-line map-line-three"></div>

              <div className="map-line map-line-four"></div>


              {/* YOU */}

              <div className="map-node map-you">

                <div className="node-icon">
                  ✦
                </div>

                <strong>
                  YOU
                </strong>

                <small>
                  Starting
                </small>

              </div>


              {/* REGISTRATION */}

              <div className="map-node map-registration">

                <div className="node-icon">
                  🪪
                </div>

                <strong>
                  Registration
                </strong>

                <small>
                  Ready
                </small>

              </div>


              {/* TEST */}

              <div className="map-node map-test">

                <div className="node-icon">
                  🧪
                </div>

                <strong>
                  Diagnostics
                </strong>

                <small>
                  4 min wait
                </small>

              </div>


              {/* DOCTOR */}

              <div className="map-node map-doctor">

                <div className="node-icon">
                  🩺
                </div>

                <strong>
                  Doctor
                </strong>

                <small>
                  11 min wait
                </small>

              </div>


              {/* PHARMACY */}

              <div className="map-node map-pharmacy">

                <div className="node-icon">
                  💊
                </div>

                <strong>
                  Pharmacy
                </strong>

                <small>
                  2 min wait
                </small>

              </div>


              {/* DONE */}

              <div className="map-node map-done">

                <div className="node-icon">
                  ✓
                </div>

                <strong>
                  DONE
                </strong>

                <small>
                  Journey complete
                </small>

              </div>


              {/* AI ROUTE BADGE */}

              <div className="map-ai-badge">

                <div className="ai-badge-icon">
                  ✦
                </div>

                <div>

                  <strong>
                    AI OPTIMIZED
                  </strong>

                  <small>
                    Fastest route selected
                  </small>

                </div>

              </div>


              {/* SCANNING EFFECT */}

              <div className="map-scan-line"></div>

            </div>

          </div>

        </section>



        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section className="features-section">

          <div className="section-heading">

            <div className="section-eyebrow">
              WHAT YOUR AI ASSISTANT CAN DO
            </div>

            <h2>
              A smarter hospital experience.
            </h2>

            <p>
              Everything designed around one goal:
              <strong> less unnecessary waiting.</strong>
            </p>

          </div>


          <div className="feature-grid">


            <div className="feature-card">

              <div className="feature-number">
                01
              </div>

              <div className="feature-icon">
                ⏱️
              </div>

              <h3>
                Queue Prediction
              </h3>

              <p>
                Know the expected waiting time before
                reaching each department.
              </p>

              <span>
                Predict smarter →
              </span>

            </div>



            <div className="feature-card">

              <div className="feature-number">
                02
              </div>

              <div className="feature-icon">
                🧭
              </div>

              <h3>
                Smart Routing
              </h3>

              <p>
                Dynamically find the most efficient path
                through the hospital.
              </p>

              <span>
                Find your route →
              </span>

            </div>



            <div className="feature-card">

              <div className="feature-number">
                03
              </div>

              <div className="feature-icon">
                🧠
              </div>

              <h3>
                AI Journey
              </h3>

              <p>
                Build a personalized care journey based
                on your requirements.
              </p>

              <span>
                Personalize care →
              </span>

            </div>



            <div className="feature-card">

              <div className="feature-number">
                04
              </div>

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Time Prediction
              </h3>

              <p>
                Estimate your complete hospital time
                before your journey begins.
              </p>

              <span>
                Save your time →
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>

  );
}

export default Home;