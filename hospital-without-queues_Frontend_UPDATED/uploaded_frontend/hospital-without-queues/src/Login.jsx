import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  // Button becomes active only when both fields contain text
  const isFormValid =
    name.trim().length > 0 &&
    contact.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    onLogin({
      name: name.trim(),
      contact: contact.trim(),
    });
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LEFT HEALTHCARE PANEL
      ===================================================== */}

      <section className="login-visual">

        <div className="medical-glow glow-one"></div>
        <div className="medical-glow glow-two"></div>

        <div className="medical-pattern">
          <span>+</span>
          <span>+</span>
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>

        <div className="visual-content">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-logo">
              <span>+</span>
            </div>

            <div className="brand-name">
              <h2>Hospital Without Queues</h2>
              <p>Smart Healthcare • Better Journeys</p>
            </div>

          </div>


          {/* MAIN MESSAGE */}

          <div className="visual-message">

            <div className="eyebrow">
              <span className="live-dot"></span>
              AI-POWERED PATIENT CARE
            </div>

            <h1>
              Healthcare
              <br />
              <span>without the waiting.</span>
            </h1>

            <p>
              A smarter way to move through the hospital.
              Our intelligent system helps you spend less
              time waiting and more time receiving care.
            </p>

          </div>


          {/* SMART JOURNEY */}

          <div className="journey-preview">

            <div className="journey-title">
              <span>YOUR SMART JOURNEY</span>
              <small>AI Optimized</small>
            </div>

            <div className="journey-line">

              <div className="journey-step active">
                <div className="journey-icon">✓</div>
                <span>Check-in</span>
              </div>

              <div className="journey-connector"></div>

              <div className="journey-step">
                <div className="journey-icon">⌁</div>
                <span>Test</span>
              </div>

              <div className="journey-connector"></div>

              <div className="journey-step">
                <div className="journey-icon">+</div>
                <span>Doctor</span>
              </div>

              <div className="journey-connector"></div>

              <div className="journey-step">
                <div className="journey-icon">✓</div>
                <span>Pharmacy</span>
              </div>

            </div>

          </div>


          {/* TRUST INDICATORS */}

          <div className="trust-row">

            <div className="trust-item">

              <div className="trust-icon">
                ⏱
              </div>

              <div>
                <strong>Less Waiting</strong>
                <span>Smarter scheduling</span>
              </div>

            </div>


            <div className="trust-item">

              <div className="trust-icon">
                🧠
              </div>

              <div>
                <strong>AI Assisted</strong>
                <span>Personalized care</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT LOGIN PANEL
      ===================================================== */}

      <section className="login-form-section">

        <div className="login-card">


          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="mobile-logo">
              +
            </div>

            <strong>
              Hospital Without Queues
            </strong>

          </div>


          {/* HEADING */}

          <div className="login-heading">

            <div className="welcome-badge">
              <span>✦</span>
              WELCOME TO SMART CARE
            </div>

            <h2>
              Ready for a
              <br />
              <span>smoother visit?</span>
            </h2>

            <p>
              Let’s get you checked in —
              <strong>
                {" "}without the unnecessary waiting.
              </strong>
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* NAME */}

            <div className="form-field">

              <label htmlFor="patient-name">
                Patient Name
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ♙
                </span>

                <input
                  id="patient-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

              </div>

            </div>


            {/* MOBILE NUMBER */}

            <div className="form-field">

              <label htmlFor="patient-contact">
                Mobile Number
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ☎
                </span>

                <input
                  id="patient-contact"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  autoComplete="tel"
                />

              </div>

              <div className="field-note">

                <span>🔒</span>

                Your information is securely handled.

              </div>

            </div>


            {/* =================================================
                CONTINUE BUTTON
            ================================================= */}

            <button
              type="submit"
              className={`continue-button ${
                isFormValid ? "active" : "disabled"
              }`}
              disabled={!isFormValid}
            >

              <span>
                {isFormValid
                  ? "Continue to Verification"
                  : "Enter your details to continue"}
              </span>

              <span className="button-arrow">
                →
              </span>

            </button>


          </form>


          {/* FEATURES */}

          <div className="login-features">

            <div className="mini-feature">
              <span>✓</span>
              No unnecessary queues
            </div>

            <div className="mini-feature">
              <span>✓</span>
              AI-guided journey
            </div>

            <div className="mini-feature">
              <span>✓</span>
              Patient-first experience
            </div>

          </div>


          {/* FOOTER */}

          <div className="login-footer">

            <div className="footer-line"></div>

            <p>
              <span className="security-dot"></span>
              Secure Healthcare Experience
            </p>

            <span className="footer-version">
              Smart Care System
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;