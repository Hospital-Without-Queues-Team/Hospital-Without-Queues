import { useState } from "react";
import "./Verification.css";

function Verification({ userData, onVerified }) {
  const [code, setCode] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();

    if (code === "1234") {
      onVerified();
    } else {
      alert("Incorrect verification code. Use 1234 for this demo.");
    }
  };

  return (
    <div className="verification-page">

      <div className="verification-card">

        <div className="verification-icon">
          ✓
        </div>

        <span className="verification-label">
          SECURE VERIFICATION
        </span>

        <h1>Verify Your Identity</h1>

        <p>
          Hello <strong>{userData.name}</strong>,
          <br />
          enter the verification code to continue.
        </p>

        <form onSubmit={handleVerify}>

          <label>Verification Code</label>

          <input
            type="text"
            maxLength="4"
            placeholder="Enter 4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button type="submit">
            Verify & Continue →
          </button>

        </form>

        <div className="demo-code">
          Demo verification code: <strong>1234</strong>
        </div>

        <div className="verification-security">
          🔒 Your information is protected
        </div>

      </div>

    </div>
  );
}

export default Verification;