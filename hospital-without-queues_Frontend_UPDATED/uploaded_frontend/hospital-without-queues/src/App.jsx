import { useState } from "react";

import Login from "./Login";

import Verification from "./Verification";

import Home from "./pages/Home";

import CareJourney from "./CareJourney";
import AIGeneratedJourney from "./components/AIGeneratedJourney";
import LiveSmartJourney from "./components/LiveSmartJourney";
import StaffDashboard from "./components/StaffDashboard";
import FinalImpactDashboard from "./components/FinalImpactDashboard";

import "./App.css";

function App() {

  const [page, setPage] = useState("login");

  const [userData, setUserData] = useState({
    name: "",
    contact: "",
  });
  const [journeyData, setJourneyData] = useState(null);


  // ================================
  // LOGIN
  // ================================

  const handleLogin = (data) => {

    setUserData(data);

    setPage("verification");

  };


  // ================================
  // VERIFICATION
  // ================================

  const handleVerification = () => {

    setPage("home");

  };


  // ================================
  // START HOSPITAL JOURNEY
  // ================================

  const handleStartJourney = () => {

  setPage("careJourney");

};
// ================================
// AI GENERATED JOURNEY
// ================================

const handleJourneyGenerated = (data) => {

  setJourneyData(data);

  setPage("aiJourney");

};


  // ================================
  // BACK TO HOME
  // ================================

  const handleBackToHome = () => {

    setPage("home");

  };
  // ================================
// STAFF DASHBOARD
// ================================

const handleStaffDashboard = () => {

  setPage("staffDashboard");

};
// ================================
// FINAL IMPACT DASHBOARD
// ================================

const handleFinalImpact = () => {

  setPage("finalImpact");

};


  // ================================
  // LOGOUT
  // ================================

  const handleLogout = () => {

    setUserData({
      name: "",
      contact: "",
    });

    setPage("login");

  };


  return (

    <div className="app-container">


      {/* =====================================
          LOGIN PAGE
      ===================================== */}

      {page === "login" && (

        <Login
          onLogin={handleLogin}
        />

      )}


      {/* =====================================
          VERIFICATION PAGE
      ===================================== */}

      {page === "verification" && (

        <Verification
          userData={userData}
          onVerified={handleVerification}
        />

      )}


      {/* =====================================
          HOME PAGE
      ===================================== */}

      {page === "home" && (

        <Home
  userData={userData}
  onLogout={handleLogout}
  onStartJourney={handleStartJourney}
  onStaffDashboard={handleStaffDashboard}
/>
      )}


      {/* =====================================
          CARE JOURNEY
      ===================================== */}

      {page === "careJourney" && (

  <CareJourney
    userData={userData}
    onBack={handleBackToHome}
    onLogout={handleLogout}
    onJourneyGenerated={handleJourneyGenerated}
  />

)}
{/* =====================================
    AI GENERATED JOURNEY
===================================== */}

{page === "aiJourney" && (

  <AIGeneratedJourney
    userData={userData}
    journeyData={journeyData}

    onBack={() => setPage("careJourney")}

    onLogout={handleLogout}

    onStartJourney={(data) => {

  console.log(
    "AI JOURNEY DATA RECEIVED:",
    data
  );

  setJourneyData(data);

  setPage("liveJourney");

}}
  />

)}
{/* =====================================
    LIVE SMART JOURNEY
===================================== */}
{page === "liveJourney" && (

  <LiveSmartJourney
  userData={userData}
  journeyData={journeyData}

  onBack={() => setPage("aiJourney")}

  onLogout={handleLogout}

  onFinalImpact={() => {
    setPage("finalImpact");
  }}
/>

)}
{/* =====================================
    FINAL IMPACT DASHBOARD
===================================== */}

{page === "impactDashboard" && (

  <FinalImpactDashboard
    userData={userData}
    journeyData={journeyData}

    onBack={handleBackToHome}

    onLogout={handleLogout}
  />

)}
{/* =====================================
    STAFF DASHBOARD
===================================== */}

{page === "staffDashboard" && (

  <StaffDashboard
    userData={userData}
    onBack={handleBackToHome}
    onLogout={handleLogout}
  />

)}
{/* =====================================
    FINAL IMPACT DASHBOARD
===================================== */}

{page === "finalImpact" && (

  <FinalImpactDashboard
    userData={userData}
    journeyData={journeyData}

    onBack={() => setPage("liveJourney")}

    onLogout={handleLogout}
  />

)}

    </div>

  );

}

export default App;