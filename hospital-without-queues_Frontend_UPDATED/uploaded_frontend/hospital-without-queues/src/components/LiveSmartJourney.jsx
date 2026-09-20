import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./LiveSmartJourney.css";

import { hospitalDepartments } from "../data/hospitalData";

import {
  liveHospitalData,
  calculateWaitTime,
  detectCongestion,
  calculateTimeSaved,
  generateExplanation,
  predictHospitalQueues,
  generateQueueSummary,
  predictFutureQueues,
} from "../data/HospitalEngine";
import {
  useLiveDepartments,
  checkInDepartment,
  checkOutDepartment,
  DEPARTMENT_NAME_TO_ID,
} from "../api";


/* =========================================================
   DESTINATION RESOLVER
========================================================= */

function resolveDestination(journeyData) {
  if (!journeyData) {
    return "Registration";
  }

  console.log("🧠 LIVE JOURNEY DATA:", journeyData);

  const needs = journeyData.needs;
  const visit = journeyData.visit;

  const needValues = Array.isArray(needs)
    ? needs
    : needs
      ? [needs]
      : [];

  const visitValue = String(visit || "").toLowerCase();

  const normalizedNeeds = needValues.map((item) => {
    if (typeof item === "string") {
      return item.toLowerCase().trim();
    }

    if (item?.name) {
      return String(item.name).toLowerCase().trim();
    }

    if (item?.id) {
      return String(item.id).toLowerCase().trim();
    }

    if (item?.value) {
      return String(item.value).toLowerCase().trim();
    }

    return "";
  });

  const directValues = [
    journeyData.destination,
    journeyData.nextDepartment,
    journeyData.selectedDepartment,
    journeyData.department,
    journeyData.nextStep,
    journeyData.selectedNeed,
  ];

  for (const value of directValues) {
    if (!value) continue;

    let text = "";

    if (typeof value === "string") {
      text = value.toLowerCase().trim();
    } else if (value?.name) {
      text = String(value.name).toLowerCase().trim();
    } else if (value?.department) {
      if (typeof value.department === "string") {
        text = value.department.toLowerCase().trim();
      } else if (value.department?.name) {
        text = String(value.department.name)
          .toLowerCase()
          .trim();
      }
    }

    if (
      text.includes("pharmacy") ||
      text.includes("medicine") ||
      text.includes("medication")
    ) {
      return "Pharmacy";
    }

    if (
      text.includes("laboratory") ||
      text.includes("lab") ||
      text.includes("blood")
    ) {
      return "Laboratory";
    }

    if (
      text.includes("radiology") ||
      text.includes("scan") ||
      text.includes("x-ray") ||
      text.includes("xray")
    ) {
      return "Radiology";
    }

    if (
      text.includes("doctor") ||
      text.includes("consult") ||
      text.includes("physician") ||
      text.includes("specialist")
    ) {
      return "Doctor Consultation";
    }

    if (
      text.includes("emergency") ||
      text.includes("urgent")
    ) {
      return "Emergency";
    }

    if (
      text.includes("registration") ||
      text.includes("register")
    ) {
      return "Registration";
    }
  }

  for (const need of normalizedNeeds) {
    if (
      need.includes("medicine") ||
      need.includes("medication") ||
      need.includes("pharmacy") ||
      need.includes("drug")
    ) {
      return "Pharmacy";
    }

    if (
      need.includes("blood") ||
      need.includes("test") ||
      need.includes("laboratory") ||
      need === "lab"
    ) {
      return "Laboratory";
    }

    if (
      need.includes("scan") ||
      need.includes("x-ray") ||
      need.includes("xray") ||
      need.includes("radiology")
    ) {
      return "Radiology";
    }

    if (
      need.includes("specialist") ||
      need.includes("doctor") ||
      need.includes("consultation") ||
      need.includes("consult")
    ) {
      return "Doctor Consultation";
    }

    if (
      need.includes("emergency") ||
      need.includes("urgent")
    ) {
      return "Emergency";
    }
  }

  if (
    visitValue.includes("pharmacy") ||
    visitValue.includes("medicine")
  ) {
    return "Pharmacy";
  }

  if (
    visitValue.includes("doctor") ||
    visitValue.includes("consult")
  ) {
    return "Doctor Consultation";
  }

  if (
    visitValue.includes("diagnostic") ||
    visitValue.includes("test")
  ) {
    return "Laboratory";
  }

  if (
    visitValue.includes("emergency") ||
    visitValue.includes("urgent")
  ) {
    return "Emergency";
  }

  if (
    visitValue.includes("followup") ||
    visitValue.includes("follow-up")
  ) {
    return "Doctor Consultation";
  }

  return "Registration";
}


/* =========================================================
   COMPONENT
========================================================= */

function LiveSmartJourney({
  userData,
  journeyData,
  onBack,
  onLogout,
  onFinalImpact,
}) {

  const START_POSITION = {
    x: 18,
    y: 78,
  };


  /* =========================================================
     DESTINATION
  ========================================================= */

  const selectedDestination = useMemo(() => {
    const destination =
      resolveDestination(journeyData);

    console.log(
      "🎯 FINAL SELECTED DESTINATION:",
      destination
    );

    return destination;
  }, [journeyData]);


  /* =========================================================
     STATE
  ========================================================= */

  const [currentLocation, setCurrentLocation] =
    useState(START_POSITION);

  const [route, setRoute] = useState([]);

  const [currentRouteIndex, setCurrentRouteIndex] =
    useState(0);

  const [isFollowingRoute, setIsFollowingRoute] =
    useState(false);

  const [journeyCompleted, setJourneyCompleted] =
    useState(false);

  const [isRerouting, setIsRerouting] =
    useState(false);

  const [routeUpdated, setRouteUpdated] =
    useState(false);

  const [congestionLevel, setCongestionLevel] =
    useState("Low");

  const [waitTime, setWaitTime] =
    useState(5);

  const [timeSaved, setTimeSaved] =
    useState(10);

  const [zoom, setZoom] =
    useState(1);

  const [showRouteDetails, setShowRouteDetails] =
    useState(false);
    /* =========================================================
   ♿ ACCESSIBILITY + VOICE GUIDANCE
========================================================= */

const [voiceEnabled, setVoiceEnabled] =
  useState(true);

const [largeTextMode, setLargeTextMode] =
  useState(false);

const [highContrastMode, setHighContrastMode] =
  useState(false);

const [reducedMotionMode, setReducedMotionMode] =
  useState(false);

const [voiceLanguage, setVoiceLanguage] =
  useState("en-IN");

const lastSpokenInstruction =
  useRef("");

  const [notification, setNotification] =
    useState(
      "Your smart hospital journey is active."
    );
    const [smartNotification, setSmartNotification] =
  useState({
    type: "info",
    icon: "🤖",
    title: "CareFlow is monitoring your journey",
    message:
      "AI is continuously analysing queues, congestion and your route.",
  });

  const rerouteLock = useRef(false);
  const rerouteTimeout = useRef(null);
 /* =========================================================
   🔊 VOICE GUIDANCE ENGINE
========================================================= */

const speakInstruction = (message) => {

  if (!voiceEnabled) {
    return;
  }

  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  if (!message) {
    return;
  }

  // Prevent the same instruction from being spoken repeatedly
  if (lastSpokenInstruction.current === message) {
    return;
  }

  lastSpokenInstruction.current = message;

  window.speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(message);

  speech.lang = voiceLanguage;
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
};


/* =========================================================
   🔊 READ CURRENT NAVIGATION INSTRUCTION
========================================================= */

const readCurrentInstruction = () => {

  if (journeyCompleted) {

    speakInstruction(
      `You have reached ${selectedDestination}. Your hospital journey is complete.`
    );

    return;
  }

  const nextStop =
    currentDestination?.name ||
    selectedDestination;

  const message =
    `You are currently at ${
      route[currentRouteIndex]?.name ||
      "Main Entrance"
    }. Your next stop is ${nextStop}. Please follow the highlighted AI route.`;

  // Allow manual replay
  lastSpokenInstruction.current = "";

  speakInstruction(message);
};


  /* =========================================================
     HOSPITAL DEPARTMENTS
     
     EXISTING MAP DATA — LEFT UNTOUCHED
  ========================================================= */

  const departments = useMemo(() => {

    if (!hospitalDepartments) {
      return [];
    }

    if (Array.isArray(hospitalDepartments)) {
      return hospitalDepartments;
    }

    if (
      typeof hospitalDepartments === "object"
    ) {
      return Object.values(hospitalDepartments);
    }

    return [];

  }, []);


  /* =========================================================
     LIVE AI DATA

     Was: always read the static liveHospitalData array.
     Now: polls the real backend every 4s (falls back to the
     original static liveHospitalData if the backend isn't
     running, so this still works standalone).

     Converts the live data into the format expected by
     HospitalEngine. MAP DATA IS NOT MODIFIED.
  ========================================================= */

  const { departments: liveDepartmentData } =
    useLiveDepartments(liveHospitalData, 4000);

  const aiDepartments = useMemo(() => {

    if (
      !liveDepartmentData ||
      !Array.isArray(liveDepartmentData)
    ) {
      return [];
    }

    return liveDepartmentData.map((department) => {

      const queue =
        Number(department.queue) || 0;

      const staff =
        Number(
          department.availableStaff ??
          department.staff
        ) || 1;

      const existingWait =
        Number(department.wait) || 0;

      /*
        Estimate service time from the simulated
        wait/staff/queue values when possible.
      */

      const calculatedServiceTime =
        queue > 0 && existingWait > 0
          ? Math.max(
              1,
              Math.ceil(
                (existingWait * staff) /
                queue
              )
            )
          : 5;

      return {
        ...department,

        availableStaff: staff,

        serviceTime:
          Number(
            department.serviceTime
          ) ||
          calculatedServiceTime,

        capacity:
          Number(
            department.capacity
          ) ||
          Math.max(queue * 2, 20),
      };

    });

  }, [liveDepartmentData]);


  /* =========================================================
     AI QUEUE PREDICTIONS
  ========================================================= */

  const queuePredictions = useMemo(() => {

    try {

      return predictHospitalQueues(
        aiDepartments
      );

    } catch (error) {

      console.error(
        "Queue prediction error:",
        error
      );

      return [];

    }

  }, [aiDepartments]);


  /* =========================================================
     AI QUEUE SUMMARY
  ========================================================= */

  const queueSummary = useMemo(() => {

    try {

      return generateQueueSummary(
        aiDepartments
      );

    } catch (error) {

      console.error(
        "Queue summary error:",
        error
      );

      return {
        message:
          "CareFlow is analysing hospital queues.",
        highTraffic: 0,
        moderateTraffic: 0,
        lowTraffic: 0,
      };

    }

  }, [aiDepartments]);
  /* =========================================================
   🔮 FUTURE QUEUE PREDICTIONS
========================================================= */

const futureQueuePredictions = useMemo(() => {

  try {

    return predictFutureQueues(
      aiDepartments
    );

  } catch (error) {

    console.error(
      "Future queue prediction error:",
      error
    );

    return [];

  }

}, [aiDepartments]);


  /* =========================================================
     FIND CURRENT AI DEPARTMENT
  ========================================================= */

  const currentAIDepartment = useMemo(() => {

    if (!aiDepartments.length) {
      return null;
    }

    return (
      aiDepartments.find(
        (department) =>
          String(department.name)
            .toLowerCase()
            .trim() ===
          String(selectedDestination)
            .toLowerCase()
            .trim()
      ) ||
      aiDepartments.find(
        (department) => {

          const name =
            String(
              department.name || ""
            ).toLowerCase();

          const destination =
            String(
              selectedDestination || ""
            ).toLowerCase();

          return (
            name.includes(destination) ||
            destination.includes(name)
          );

        }
      ) ||
      null
    );

  }, [
    aiDepartments,
    selectedDestination,
  ]);


  /* =========================================================
     FIND DESTINATION DEPARTMENT
     
     EXISTING MAP DATA
  ========================================================= */

  const destinationDepartment = useMemo(() => {

    return (
      departments.find(
        (department) => {

          const name =
            String(
              department?.name || ""
            ).toLowerCase();

          const selected =
            selectedDestination.toLowerCase();

          return (
            name === selected ||
            name.includes(selected) ||
            selected.includes(name)
          );

        }
      ) || null
    );

  }, [
    departments,
    selectedDestination,
  ]);


  /* =========================================================
     DESTINATION POSITIONS
     
     UNCHANGED
  ========================================================= */

  const destinationPositions = {
    Registration: {
      x: 18,
      y: 78,
    },

    Laboratory: {
      x: 42,
      y: 55,
    },

    "Doctor Consultation": {
      x: 67,
      y: 30,
    },

    Pharmacy: {
      x: 78,
      y: 72,
    },

    Radiology: {
      x: 16,
      y: 30,
    },

    Emergency: {
      x: 82,
      y: 30,
    },
  };


  /* =========================================================
     CREATE ROUTE
     
     UNCHANGED
  ========================================================= */

  const createRouteForDestination = (
    destination
  ) => {

    const start = {
      name: "Main Entrance",
      x: START_POSITION.x,
      y: START_POSITION.y,
    };


    if (destination === "Pharmacy") {

      return [
        start,

        {
          name: "Lower Corridor",
          x: 35,
          y: 78,
        },

        {
          name: "East Corridor",
          x: 60,
          y: 75,
        },

        {
          name: "Pharmacy",
          x: 78,
          y: 72,
        },
      ];

    }


    if (destination === "Laboratory") {

      return [
        start,

        {
          name: "Central Corridor",
          x: 32,
          y: 70,
        },

        {
          name: "Laboratory Entrance",
          x: 42,
          y: 62,
        },

        {
          name: "Laboratory",
          x: 42,
          y: 55,
        },
      ];

    }


    if (
      destination ===
      "Doctor Consultation"
    ) {

      return [
        start,

        {
          name: "Central Corridor",
          x: 35,
          y: 65,
        },

        {
          name: "Main Consultation Corridor",
          x: 50,
          y: 48,
        },

        {
          name: "Doctor Consultation",
          x: 67,
          y: 30,
        },
      ];

    }


    if (destination === "Radiology") {

      return [
        start,

        {
          name: "West Corridor",
          x: 28,
          y: 60,
        },

        {
          name: "Imaging Corridor",
          x: 20,
          y: 45,
        },

        {
          name: "Radiology",
          x: 16,
          y: 30,
        },
      ];

    }


    if (destination === "Emergency") {

      return [
        start,

        {
          name: "Emergency Corridor",
          x: 45,
          y: 55,
        },

        {
          name: "Emergency Access",
          x: 65,
          y: 40,
        },

        {
          name: "Emergency",
          x: 82,
          y: 30,
        },
      ];

    }


    if (destination === "Registration") {

      return [
        start,

        {
          name: "Registration",
          x: 18,
          y: 78,
        },
      ];

    }


    const position =
      destinationPositions[destination] ||
      {
        x: 67,
        y: 30,
      };

    return [
      start,

      {
        name: "Central Corridor",
        x: 38,
        y: 62,
      },

      {
        name: destination,
        x: position.x,
        y: position.y,
      },
    ];

  };


  /* =========================================================
     GENERATE ROUTE
     
     UNCHANGED
  ========================================================= */

  useEffect(() => {

    const newRoute =
      createRouteForDestination(
        selectedDestination
      );

    console.log(
      "🗺️ NEW ROUTE:",
      newRoute
    );

    setRoute(newRoute);

    setCurrentRouteIndex(0);

    setCurrentLocation(
      START_POSITION
    );

    setJourneyCompleted(false);

    setIsFollowingRoute(true);

    setNotification(
      `🧭 AI route created for ${selectedDestination}.`
    );

  }, [selectedDestination]);


  /* =========================================================
     REAL BACKEND CHECK-IN / CHECK-OUT (NEW)

     This is the only place this patient's journey actually
     touches the backend. When their route is generated above,
     they really join that department's queue (queue +1 on the
     server, visible to the Staff Dashboard and to anyone else's
     journey screen). When they arrive, they really leave it
     (queue -1). Refs guard against double-firing from React
     StrictMode's double-invoke in development.
  ========================================================= */

  const checkedInDestinationRef = useRef(null);
  const hasCheckedOutRef = useRef(false);

  useEffect(() => {

    const departmentId =
      DEPARTMENT_NAME_TO_ID[selectedDestination];

    if (!departmentId) {
      return;
    }

    if (checkedInDestinationRef.current === departmentId) {
      return;
    }

    checkedInDestinationRef.current = departmentId;
    hasCheckedOutRef.current = false;

    checkInDepartment(departmentId).catch(() => {
      // Backend not running — journey still works on fallback data.
    });

  }, [selectedDestination]);

  useEffect(() => {

    if (!journeyCompleted || hasCheckedOutRef.current) {
      return;
    }

    const departmentId =
      DEPARTMENT_NAME_TO_ID[selectedDestination];

    if (!departmentId) {
      return;
    }

    hasCheckedOutRef.current = true;

    checkOutDepartment(departmentId).catch(() => {
      // Backend not running — nothing to reconcile.
    });

  }, [journeyCompleted, selectedDestination]);


  /* =========================================================
     CURRENT DESTINATION
  ========================================================= */

  const currentDestination = useMemo(() => {

    if (!route.length) {
      return null;
    }

    const nextIndex =
      Math.min(
        currentRouteIndex + 1,
        route.length - 1
      );

    return route[nextIndex];

  }, [
    route,
    currentRouteIndex,
  ]);


  /* =========================================================
     PATIENT MOVEMENT
     
     UNCHANGED
  ========================================================= */

  useEffect(() => {

    if (
      !route.length ||
      !isFollowingRoute ||
      journeyCompleted ||
      isRerouting
    ) {
      return;
    }

    const interval =
      setInterval(() => {

        setCurrentLocation(
          (previous) => {

            const target =
              route[
                Math.min(
                  currentRouteIndex + 1,
                  route.length - 1
                )
              ];

            if (!target) {
              return previous;
            }

            const dx =
              target.x - previous.x;

            const dy =
              target.y - previous.y;

            const distance =
              Math.sqrt(
                dx * dx +
                dy * dy
              );

            if (distance <= 2) {

              setCurrentRouteIndex(
                (previousIndex) => {

                  const nextIndex =
                    Math.min(
                      previousIndex + 1,
                      route.length - 1
                    );

                  if (
                    nextIndex ===
                    route.length - 1
                  ) {

                    setJourneyCompleted(
                      true
                    );

                    setIsFollowingRoute(
                      false
                    );

                    setNotification(
                      `🎉 You have reached ${selectedDestination}!`
                    );
                    speakInstruction(
  `You have reached ${selectedDestination}. Your destination has been reached.`
);

                  }

                  return nextIndex;

                }
              );

              return {
                x: target.x,
                y: target.y,
              };

            }

            const speed = 2.2;

            return {
              x:
                previous.x +
                (dx / distance) *
                  speed,

              y:
                previous.y +
                (dy / distance) *
                  speed,
            };

          }
        );

      }, 700);

    return () => {
      clearInterval(interval);
    };

  }, [
    route,
    currentRouteIndex,
    isFollowingRoute,
    journeyCompleted,
    isRerouting,
    selectedDestination,
  ]);

/* =========================================================
   🗣️ AUTOMATIC VOICE NAVIGATION
========================================================= */

useEffect(() => {

  if (!voiceEnabled) {
    return;
  }

  if (!route.length) {
    return;
  }

  if (journeyCompleted) {

    speakInstruction(
      `You have reached ${selectedDestination}. Your hospital journey is complete.`
    );

    return;
  }

  const currentPoint =
    route[currentRouteIndex];

  const nextPoint =
    route[currentRouteIndex + 1];

  if (!currentPoint || !nextPoint) {
    return;
  }

  const message =
    `You are at ${currentPoint.name}. Next, proceed to ${nextPoint.name}.`;

  speakInstruction(message);

}, [
  currentRouteIndex,
  route,
  journeyCompleted,
  selectedDestination,
  voiceEnabled,
]);
  /* =========================================================
     CORRECT AI CONGESTION DETECTION
  ========================================================= */

  useEffect(() => {

    if (!currentAIDepartment) {
      setCongestionLevel("Low");
      return;
    }

    try {

      const isCongested =
        detectCongestion(
          currentAIDepartment
        );

      if (isCongested) {

        const wait =
          calculateWaitTime(
            currentAIDepartment
          );

        if (wait > 15) {
          setCongestionLevel("High");
        } else {
          setCongestionLevel("Moderate");
        }

      } else {

        setCongestionLevel("Low");

      }

    } catch (error) {

      console.error(
        "Congestion error:",
        error
      );

      setCongestionLevel("Low");

    }

  }, [
    currentAIDepartment,
  ]);


  /* =========================================================
     AI WAIT TIME
  ========================================================= */

  useEffect(() => {

    if (!currentAIDepartment) {

      setWaitTime(5);

      return;
    }

    try {

      const result =
        calculateWaitTime(
          currentAIDepartment
        );

      setWaitTime(
        Math.max(
          1,
          Math.round(result)
        )
      );

    } catch (error) {

      console.error(
        "Wait time error:",
        error
      );

      setWaitTime(5);

    }

  }, [
    currentAIDepartment,
  ]);


  /* =========================================================
     TIME SAVED
  ========================================================= */

  useEffect(() => {

    try {

      const traditionalTime =
        Math.max(
          waitTime + 15,
          20
        );

      const optimizedTime =
        Math.max(
          waitTime,
          5
        );

      const result =
        calculateTimeSaved(
          traditionalTime,
          optimizedTime
        );

      setTimeSaved(
        Math.max(
          1,
          Math.round(result)
        )
      );

    } catch (error) {

      console.error(
        "Time saved error:",
        error
      );

      setTimeSaved(10);

    }

  }, [
    waitTime,
    selectedDestination,
  ]);
/* =========================================================
   AI VS TRADITIONAL HOSPITAL COMPARISON
========================================================= */

const traditionalHospitalTime = useMemo(() => {
  return Math.max(
    60,
    waitTime + 45
  );
}, [waitTime]);

const aiHospitalTime = useMemo(() => {
  return Math.max(
    20,
    waitTime + 15
  );
}, [waitTime]);

const hospitalTimeSaved = Math.max(
  1,
  traditionalHospitalTime - aiHospitalTime
);

const waitingReduction = Math.round(
  (hospitalTimeSaved / traditionalHospitalTime) * 100
);

  /* =========================================================
     AI EXPLANATION
  ========================================================= */

  const aiExplanation =
    useMemo(() => {

      try {

        if (!currentAIDepartment) {

          return (
            `CareFlow selected the best available route to ${selectedDestination} while monitoring current hospital conditions.`
          );

        }

        return generateExplanation(
          null,
          currentAIDepartment
        );

      } catch {

        return (
          `CareFlow selected the best available route to ${selectedDestination} while monitoring congestion and waiting time.`
        );

      }

    }, [
      selectedDestination,
      currentAIDepartment,
    ]);


  /* =========================================================
     MANUAL FOLLOW
  ========================================================= */

  const handleFollowOptimizedRoute =
    () => {

      if (!route.length) {

        setNotification(
          "⚠️ Route is still being calculated..."
        );

        return;

      }

      setCurrentLocation(
        START_POSITION
      );

      setCurrentRouteIndex(0);

      setJourneyCompleted(false);

      setIsFollowingRoute(true);

      setRouteUpdated(true);

      setNotification(
        `🧭 AI-optimized route to ${selectedDestination} is now active.`
      );

      setTimeout(() => {
        setRouteUpdated(false);
      }, 3000);

    };


  /* =========================================================
     MANUAL REROUTE
     
     EXISTING LOGIC PRESERVED
  ========================================================= */

  const performReroute = () => {

    if (rerouteLock.current) {
      return;
    }

    rerouteLock.current = true;

    setIsRerouting(true);

    setNotification(
      "🤖 AI is finding a faster route..."
    );
    speakInstruction(
  `Attention. Congestion has been detected. CareFlow is finding a faster route to ${selectedDestination}.`
);

    setTimeout(() => {

      const normalRoute =
        createRouteForDestination(
          selectedDestination
        );

      const reroutedRoute = [
        {
          name: "Current Location",
          x: currentLocation.x,
          y: currentLocation.y,
        },

        {
          name: "AI Low-Traffic Corridor",
          x: 40,
          y: 40,
        },

        ...normalRoute.slice(1),
      ];

      setRoute(
        reroutedRoute
      );

      setCurrentRouteIndex(0);

      setJourneyCompleted(false);

      setIsFollowingRoute(true);

      setRouteUpdated(true);

      setNotification(
        `✅ AI found a faster route to ${selectedDestination}.`
      );
      speakInstruction(
  `Route updated. CareFlow found a faster route to ${selectedDestination}. Please follow the new route.`
);

      setIsRerouting(false);

      setTimeout(() => {

        setRouteUpdated(false);

        rerouteLock.current =
          false;

      }, 4000);

    }, 1200);

  };


  /* =========================================================
     AUTO REROUTE
  ========================================================= */

  useEffect(() => {

    if (
      congestionLevel
        .toLowerCase()
        .includes("high") &&
      !rerouteLock.current &&
      !journeyCompleted
    ) {

      performReroute();

    }

  }, [
    congestionLevel,
  ]);
  {/* ===================================================
    ♿ ACCESSIBILITY & VOICE GUIDANCE
=================================================== */}

<section
  className={`accessibility-card ${
    highContrastMode
      ? "accessibility-high-contrast"
      : ""
  } ${
    largeTextMode
      ? "accessibility-large-text"
      : ""
  } ${
    reducedMotionMode
      ? "accessibility-reduced-motion"
      : ""
  }`}
>

  <div className="accessibility-header">

    <div className="accessibility-icon">
      ♿
    </div>

    <div>

      <span>
        PATIENT ACCESSIBILITY
      </span>

      <h2>
        Easy Navigation for Everyone
      </h2>

      <p>
        Customize CareFlow to make your hospital
        journey easier, clearer and more comfortable.
      </p>

    </div>

    <div className="accessibility-live">
      ● ACCESSIBLE
    </div>

  </div>


  <div className="accessibility-controls">


    {/* VOICE */}

    <button
      className={`accessibility-option ${
        voiceEnabled
          ? "accessibility-active"
          : ""
      }`}
      onClick={() => {

        setVoiceEnabled(
          previous => !previous
        );

        if (!voiceEnabled) {

          lastSpokenInstruction.current =
            "";

          setTimeout(() => {

            speakInstruction(
              `Voice guidance is now enabled.`
            );

          }, 100);

        } else {

          window.speechSynthesis?.cancel();

        }

      }}
    >

      <div className="accessibility-option-icon">
        {voiceEnabled ? "🔊" : "🔇"}
      </div>

      <div>

        <strong>
          Voice Guidance
        </strong>

        <span>
          {voiceEnabled
            ? "Voice instructions ON"
            : "Voice instructions OFF"}
        </span>

      </div>

      <div className="accessibility-toggle">
        {voiceEnabled ? "ON" : "OFF"}
      </div>

    </button>


    {/* READ INSTRUCTION */}

    <button
      className="accessibility-option"
      onClick={readCurrentInstruction}
    >

      <div className="accessibility-option-icon">
        🗣️
      </div>

      <div>

        <strong>
          Read Instruction
        </strong>

        <span>
          Hear your current navigation instruction
        </span>

      </div>

      <div className="accessibility-action">
        ▶
      </div>

    </button>


    {/* LARGE TEXT */}

    <button
      className={`accessibility-option ${
        largeTextMode
          ? "accessibility-active"
          : ""
      }`}
      onClick={() =>
        setLargeTextMode(
          previous => !previous
        )
      }
    >

      <div className="accessibility-option-icon">
        🔠
      </div>

      <div>

        <strong>
          Large Text
        </strong>

        <span>
          Make important information easier to read
        </span>

      </div>

      <div className="accessibility-toggle">
        {largeTextMode ? "ON" : "OFF"}
      </div>

    </button>


    {/* HIGH CONTRAST */}

    <button
      className={`accessibility-option ${
        highContrastMode
          ? "accessibility-active"
          : ""
      }`}
      onClick={() =>
        setHighContrastMode(
          previous => !previous
        )
      }
    >

      <div className="accessibility-option-icon">
        👁️
      </div>

      <div>

        <strong>
          High Contrast
        </strong>

        <span>
          Improve visibility of important information
        </span>

      </div>

      <div className="accessibility-toggle">
        {highContrastMode ? "ON" : "OFF"}
      </div>

    </button>


    {/* REDUCED MOTION */}

    <button
      className={`accessibility-option ${
        reducedMotionMode
          ? "accessibility-active"
          : ""
      }`}
      onClick={() =>
        setReducedMotionMode(
          previous => !previous
        )
      }
    >

      <div className="accessibility-option-icon">
        🎞️
      </div>

      <div>

        <strong>
          Reduce Motion
        </strong>

        <span>
          Minimize animations and movement
        </span>

      </div>

      <div className="accessibility-toggle">
        {reducedMotionMode ? "ON" : "OFF"}
      </div>

    </button>


  </div>


  {/* LANGUAGE */}

  <div className="voice-language-row">

    <div>

      <strong>
        🗣️ Voice Language
      </strong>

      <span>
        Choose the language used for navigation
      </span>

    </div>


    <select
      value={voiceLanguage}
      onChange={(event) => {

        setVoiceLanguage(
          event.target.value
        );

        lastSpokenInstruction.current =
          "";

      }}
    >

      <option value="en-IN">
        English (India)
      </option>

      <option value="hi-IN">
        Hindi
      </option>

      <option value="bn-IN">
        Bengali
      </option>

    </select>

  </div>


</section>
/* =========================================================
   SMART NOTIFICATIONS
========================================================= */

useEffect(() => {

  if (journeyCompleted) {

    setSmartNotification({
      type: "success",
      icon: "🎉",
      title: "Destination Reached",
      message:
        `You have successfully reached ${selectedDestination}.`,
    });

    return;
  }

  if (
    congestionLevel
      .toLowerCase()
      .includes("high")
  ) {

    setSmartNotification({
      type: "warning",
      icon: "⚠️",
      title: "High Congestion Detected",
      message:
        `${selectedDestination} is currently busy. CareFlow is checking for a faster route.`,
    });

    return;
  }

  if (waitTime >= 15) {

    setSmartNotification({
      type: "warning",
      icon: "⏳",
      title: "Long Wait Predicted",
      message:
        `Estimated waiting time at ${selectedDestination} is ${waitTime} minutes.`,
    });

    return;
  }

  if (routeUpdated) {

    setSmartNotification({
      type: "route",
      icon: "🔄",
      title: "Route Updated",
      message:
        `CareFlow found an optimized route to ${selectedDestination}.`,
    });

    return;
  }

  setSmartNotification({
    type: "info",
    icon: "🧭",
    title: "Journey On Track",
    message:
      `AI is monitoring your route to ${selectedDestination}.`,
  });

}, [
  journeyCompleted,
  congestionLevel,
  waitTime,
  routeUpdated,
  selectedDestination,
]);

  /* =========================================================
     ROUTE PATH
  ========================================================= */

  const getRoutePath = () => {

    if (route.length < 2) {
      return "";
    }

    return route
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");

  };


  /* =========================================================
     PROGRESS
  ========================================================= */

  const progressPercentage =
    useMemo(() => {

      if (route.length <= 1) {

        return journeyCompleted
          ? 100
          : 0;

      }

      return Math.min(
        100,
        Math.round(
          (
            currentRouteIndex /
            (route.length - 1)
          ) * 100
        )
      );

    }, [
      currentRouteIndex,
      route,
      journeyCompleted,
    ]);


  /* =========================================================
     DESTINATION CHECK
  ========================================================= */

  const isDestination = (
    name
  ) => {

    return (
      String(name)
        .toLowerCase()
        .trim() ===
      String(selectedDestination)
        .toLowerCase()
        .trim()
    );

  };


  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {

    return () => {

      if (rerouteTimeout.current) {

        clearTimeout(
          rerouteTimeout.current
        );

      }

    };

  }, []);


  /* =========================================================
     QUEUE STATUS HELPER
  ========================================================= */

  const getPredictionStatus = (
    prediction
  ) => {

    if (!prediction) {
      return {
        icon: "⚪",
        label: "Unknown",
        className: "queue-unknown",
      };
    }

    if (
      prediction.status === "high"
    ) {
      return {
        icon: "🔴",
        label: "High",
        className: "queue-high",
      };
    }

    if (
      prediction.status === "moderate"
    ) {
      return {
        icon: "🟡",
        label: "Moderate",
        className: "queue-medium",
      };
    }
    return {
      icon: "🟢",
      label: "Low",
      className: "queue-good",
    };

  };
  /* =========================================================
   🔮 FUTURE STATUS HELPER
========================================================= */

const getFutureStatus = (status) => {

  if (status === "high") {

    return {
      icon: "🔴",
      label: "High",
      className: "future-high",
    };

  }

  if (status === "moderate") {

    return {
      icon: "🟡",
      label: "Moderate",
      className: "future-moderate",
    };

  }

  return {
    icon: "🟢",
    label: "Low",
    className: "future-low",
  };

};


  /* =========================================================
     UI
  ========================================================= */

  return (

   <div
  className={`live-page ${
    largeTextMode
      ? "accessibility-page-large-text"
      : ""
  } ${
    highContrastMode
      ? "accessibility-page-high-contrast"
      : ""
  } ${
    reducedMotionMode
      ? "accessibility-page-reduced-motion"
      : ""
  }`}
>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="live-header">

        <div className="live-brand">

          <div className="live-logo">
            🏥
          </div>

          <div>

            <h2>
              Hospital Without Queues
            </h2>

            <span>
              AI-Powered Patient Flow
            </span>

          </div>

        </div>


        <div className="live-header-right">

          <div className="live-user">

            <strong>
              {userData?.name ||
                "Patient"}
            </strong>

            <span>
              Live Smart Journey
            </span>

          </div>


          <button
            className="live-back"
            onClick={onBack}
          >
            ← Back
          </button>


          <button
            className="live-logout"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="live-main">

        {/* ===================================================
            INTRO
        =================================================== */}

        <section className="live-intro">

          <div className="live-badge">

            <span className="live-pulse"></span>

            LIVE AI NAVIGATION

          </div>


          <h1>
            Your Hospital Journey,
            <span> Optimized.</span>
          </h1>


          <p>
            AI is continuously monitoring your
            location, hospital congestion and
            waiting times to guide you through
            the fastest route.
          </p>

        </section>


        {/* ===================================================
            CURRENT LOCATION
        =================================================== */}

        <section className="location-card">

          <div className="location-icon">
            📍
          </div>


          <div className="location-text">

            <span>
              CURRENT LOCATION
            </span>

            <strong>
              {
                route[
                  currentRouteIndex
                ]?.name ||
                "Main Entrance"
              }
            </strong>

            <small>
              Your location is being updated
              in real time
            </small>

          </div>


          <div className="location-status">

            <span></span>

            LIVE TRACKING

          </div>

        </section>


        {/* ===================================================
            SELECTED DESTINATION
        =================================================== */}

        <section className="next-stop-card">

          <div className="next-icon">
            🧭
          </div>


          <div className="next-information">

            <span>
              AI DESTINATION
            </span>

            <h2>
              {selectedDestination}
            </h2>

            <p>
              Your route has been personalized
              according to your requirement.
            </p>

          </div>


          <div className="walking-info">

            <span>
              🚶
            </span>

            <strong>
              ~5 min
            </strong>

            <small>
              walking
            </small>

          </div>

        </section>


        {/* ===================================================
            HOSPITAL MAP
            IMPORTANT: EXISTING MAP PRESERVED
        =================================================== */}

        <section className="hospital-map-card">

          <div className="map-header">

            <div>

              <span>
                INDOOR NAVIGATION
              </span>

              <h2>
                🗺️ Live Hospital Map
              </h2>

            </div>


            <select
              className="floor-selector"
              defaultValue="Ground Floor"
            >

              <option>
                Ground Floor
              </option>

              <option>
                First Floor
              </option>

              <option>
                Second Floor
              </option>

            </select>

          </div>


          <div
            className="hospital-map"
            style={{
              transform:
                `scale(${zoom})`,
              transformOrigin:
                "center",
            }}
          >

            <div className="map-grid"></div>

            <div className="corridor corridor-one"></div>
            <div className="corridor corridor-two"></div>
            <div className="corridor corridor-three"></div>
            <div className="corridor corridor-four"></div>


            {/* REGISTRATION */}

            <div
              className={
                `map-room registration-room ${
                  isDestination(
                    "Registration"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              🧾

              <span>
                Registration
              </span>

              <small className="queue-good">
                ✓ Low queue
              </small>

              {isDestination(
                "Registration"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* LABORATORY */}

            <div
              className={
                `map-room lab-room ${
                  isDestination(
                    "Laboratory"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              🧪

              <span>
                Laboratory
              </span>

              <small className="queue-medium">
                ● Medium
              </small>

              {isDestination(
                "Laboratory"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* DOCTOR */}

            <div
              className={
                `map-room doctor-room ${
                  isDestination(
                    "Doctor Consultation"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              🩺

              <span>
                Doctor Consultation
              </span>

              <small
                className={
                  congestionLevel
                    .toLowerCase()
                    .includes("high")
                    ? "queue-high"
                    : "queue-medium"
                }
              >
                ● {congestionLevel}
              </small>

              {isDestination(
                "Doctor Consultation"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* PHARMACY */}

            <div
              className={
                `map-room pharmacy-room ${
                  isDestination(
                    "Pharmacy"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              💊

              <span>
                Pharmacy
              </span>

              <small className="queue-good">
                ✓ Low queue
              </small>

              {isDestination(
                "Pharmacy"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* RADIOLOGY */}

            <div
              className={
                `map-room radiology-room ${
                  isDestination(
                    "Radiology"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              🩻

              <span>
                Radiology
              </span>

              <small className="queue-good">
                ✓ Available
              </small>

              {isDestination(
                "Radiology"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* EMERGENCY */}

            <div
              className={
                `map-room emergency-room ${
                  isDestination(
                    "Emergency"
                  )
                    ? "selected-destination"
                    : ""
                }`
              }
            >

              🚑

              <span>
                Emergency
              </span>

              <small className="queue-high">
                ● Priority
              </small>

              {isDestination(
                "Emergency"
              ) && (
                <b className="destination-label">
                  AI DESTINATION
                </b>
              )}

            </div>


            {/* AI ROUTE */}

            <svg
              className="route-layer"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >

              {route.length > 1 && (

                <polyline
                  points={
                    getRoutePath()
                  }
                  className={
                    routeUpdated
                      ? "dynamic-route rerouted"
                      : "dynamic-route"
                  }
                />

              )}

            </svg>


            {/* ROUTE NODES */}

            {route.map(
              (point, index) => (

                <div
                  key={
                    `${point.name}-${index}`
                  }

                  className={
                    `route-node ${
                      index <=
                      currentRouteIndex
                        ? "completed"
                        : index ===
                          currentRouteIndex + 1
                        ? "next"
                        : ""
                    }`
                  }

                  style={{
                    left:
                      `${point.x}%`,
                    top:
                      `${point.y}%`,
                  }}
                >

                  {
                    index ===
                    currentRouteIndex + 1
                      ? "📍"
                      : "•"
                  }

                </div>

              )
            )}


            {/* PATIENT */}

            <div
              className="patient-location"

              style={{
                left:
                  `${currentLocation.x}%`,
                top:
                  `${currentLocation.y}%`,
              }}
            >

              <div className="location-pulse"></div>

              <div className="patient-marker">
                🧑‍🦽
              </div>

              <span>
                YOU
              </span>

            </div>


            {/* COMPASS */}

            <div className="map-compass">
              N
            </div>


            {/* LEGEND */}

            <div className="map-legend">

              <div>
                <span className="legend-dot patient-dot"></span>
                You
              </div>

              <div>
                <span className="legend-line"></span>
                AI Route
              </div>

              <div>
                <span className="legend-dot department-dot"></span>
                Department
              </div>

            </div>


            {/* CONTROLS */}

            <div className="map-controls">

              <button
                onClick={() =>
                  setZoom(
                    Math.min(
                      1.15,
                      zoom + 0.05
                    )
                  )
                }
              >
                +
              </button>


              <button
                onClick={() =>
                  setZoom(
                    Math.max(
                      0.9,
                      zoom - 0.05
                    )
                  )
                }
              >
                −
              </button>

            </div>


            {/* REROUTING */}

            {isRerouting && (

              <div className="rerouting-overlay">

                <div className="rerouting-spinner">
                  🤖
                </div>

                <strong>
                  AI Rerouting...
                </strong>

                <span>
                  Finding the fastest path around
                  congestion
                </span>

              </div>

            )}

          </div>


          {/* PROGRESS */}

          <div className="live-progress-card">

            <div className="progress-header">

              <div>

                <span>
                  JOURNEY PROGRESS
                </span>

                <h2>
                  {journeyCompleted
                    ? "Journey Complete"
                    : `Heading to ${selectedDestination}`}
                </h2>

              </div>


              <strong>
                {progressPercentage}%
              </strong>

            </div>


            <div className="journey-progress-bar">

              <div
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              ></div>

            </div>


            <div className="route-timeline">

              {route.map(
                (point, index) => (

                  <div
                    className={
                      `timeline-step ${
                        index <
                        currentRouteIndex
                          ? "visited"
                          : index ===
                            currentRouteIndex
                          ? "current"
                          : "upcoming"
                      }`
                    }

                    key={
                      `timeline-${point.name}-${index}`
                    }
                  >

                    <div className="timeline-icon">

                      {
                        index <
                        currentRouteIndex
                          ? "✓"
                          : index ===
                            currentRouteIndex
                          ? "📍"
                          : "○"
                      }

                    </div>


                    <strong>
                      {point.name}
                    </strong>


                    <small>

                      {
                        index <
                        currentRouteIndex
                          ? "Completed"
                          : index ===
                            currentRouteIndex
                          ? "You are here"
                          : "Upcoming"
                      }

                    </small>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            NEXT STOP
        =================================================== */}

        <section className="next-stop-card">

          <div className="next-icon">
            🧭
          </div>


          <div className="next-information">

            <span>
              NEXT STOP
            </span>


            <h2>
              {
                journeyCompleted
                  ? "Destination Reached"
                  : currentDestination?.name ||
                    selectedDestination
              }
            </h2>


            <p>
              {
                journeyCompleted
                  ? `You have reached ${selectedDestination}.`
                  : `AI has selected the best available path to ${selectedDestination} based on your requirement and current hospital traffic.`
              }
            </p>

          </div>


          <div className="walking-info">

            <span>
              🚶
            </span>

            <strong>
              ~5 min
            </strong>

            <small>
              walking
            </small>

          </div>

        </section>


        {/* ===================================================
            AI WAIT CARD
        =================================================== */}

        <section className="live-wait-card">

          <div className="wait-icon">
            ⏱️
          </div>


          <div className="wait-information">

            <span>
              AI ESTIMATED WAIT
            </span>


            <h2>
              {waitTime} minutes
            </h2>


            <p>
              Estimated waiting time at
              {` ${selectedDestination}`}
            </p>

          </div>


          <div className="wait-live">

            <span></span>

            LIVE PREDICTION

          </div>

        </section>


        {/* ===================================================
            NEW FEATURE
            LIVE AI QUEUE INTELLIGENCE
        =================================================== */}

        <section className="ai-queue-intelligence">

          <div className="queue-intelligence-header">

            <div className="queue-intelligence-icon">
              🤖
            </div>

            <div>

              <span>
                CAREFLOW AI
              </span>

              <h2>
                Live Queue Intelligence
              </h2>

              <p>
                AI is analysing queue pressure,
                available staff and predicted
                waiting times across the hospital.
              </p>

            </div>

            <div className="queue-live-indicator">

              <span></span>

              LIVE

            </div>

          </div>


          {/* SUMMARY */}

          <div className="queue-summary-box">

            <div className="queue-summary-icon">
              🧠
            </div>

            <div>

              <strong>
                AI Hospital Analysis
              </strong>

              <p>
                {queueSummary.message}
              </p>

            </div>

          </div>


          {/* SUMMARY STATS */}

          <div className="queue-summary-stats">

            <div className="queue-stat low">

              <strong>
                {queueSummary.lowTraffic}
              </strong>

              <span>
                🟢 Low
              </span>

            </div>


            <div className="queue-stat moderate">

              <strong>
                {queueSummary.moderateTraffic}
              </strong>

              <span>
                🟡 Moderate
              </span>

            </div>


            <div className="queue-stat high">

              <strong>
                {queueSummary.highTraffic}
              </strong>

              <span>
                🔴 High
              </span>

            </div>

          </div>


          {/* DEPARTMENT PREDICTIONS */}

          <div className="queue-prediction-list">

            <div className="queue-list-title">

              <span>
                DEPARTMENT PREDICTIONS
              </span>

              <small>
                AI estimated
              </small>

            </div>


            {queuePredictions.length > 0 ? (

              queuePredictions.map(
                (prediction) => {

                  const status =
                    getPredictionStatus(
                      prediction
                    );

                  const isCurrent =
                    String(
                      prediction.department
                    )
                      .toLowerCase()
                      .trim() ===
                    String(
                      selectedDestination
                    )
                      .toLowerCase()
                      .trim();


                  return (

                    <div
                      className={
                        `queue-prediction-row ${
                          isCurrent
                            ? "current-ai-department"
                            : ""
                        }`
                      }

                      key={
                        prediction.department
                      }
                    >

                      <div className="queue-department-name">

                        <div className="queue-department-icon">

                          {
                            prediction.department
                              .toLowerCase()
                              .includes("laboratory")
                              ? "🧪"
                              : prediction.department
                                  .toLowerCase()
                                  .includes("doctor")
                              ? "🩺"
                              : prediction.department
                                  .toLowerCase()
                                  .includes("radiology")
                              ? "🩻"
                              : prediction.department
                                  .toLowerCase()
                                  .includes("pharmacy")
                              ? "💊"
                              : prediction.department
                                  .toLowerCase()
                                  .includes("emergency")
                              ? "🚑"
                              : "🧾"
                          }

                        </div>


                        <div>

                          <strong>
                            {prediction.department}
                          </strong>

                          {isCurrent && (
                            <small>
                              YOUR DESTINATION
                            </small>
                          )}

                        </div>

                      </div>


                      <div className="queue-patients">

                        <span>
                          👥
                        </span>

                        <strong>
                          {prediction.currentQueue}
                        </strong>

                        <small>
                          waiting
                        </small>

                      </div>


                      <div className="queue-wait">

                        <strong>
                          {prediction.predictedWait}
                        </strong>

                        <small>
                          min
                        </small>

                      </div>


                      <div
                        className={
                          `queue-status ${
                            status.className
                          }`
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

              <div className="queue-empty-state">

                🤖 CareFlow is analysing
                hospital conditions...

              </div>

            )}

          </div>
          
            {/* ===================================================
    🔮 FUTURE QUEUE PREDICTION
=================================================== */}

<section className="future-queue-card">

  <div className="future-queue-header">

    <div className="future-ai-icon">
      🔮
    </div>

    <div>

      <span>
        CAREFLOW PREDICTIVE AI
      </span>

      <h2>
        Future Queue Forecast
      </h2>

      <p>
        AI predicts how hospital queues may
        change over the next 30 minutes.
      </p>

    </div>

    <div className="prediction-badge">
      ✨ AI PREDICTED
    </div>

  </div>
  {/* ===================================================
    AI VS TRADITIONAL HOSPITAL
=================================================== */}

<section className="hospital-comparison-card">

  <div className="comparison-header">

    <div className="comparison-icon">
      ⚡
    </div>

    <div>

      <span>
        CAREFLOW AI IMPACT
      </span>

      <h2>
        AI Hospital vs Traditional Hospital
      </h2>

      <p>
        See how intelligent patient-flow optimization
        can reduce unnecessary waiting.
      </p>

    </div>

  </div>


  {/* COMPARISON */}

  <div className="comparison-columns">

    {/* TRADITIONAL */}

    <div className="comparison-column traditional">

      <div className="comparison-column-header">

        <span className="comparison-column-icon">
          🏥
        </span>

        <div>

          <span>
            TRADITIONAL HOSPITAL
          </span>

          <strong>
            Fixed Patient Flow
          </strong>

        </div>

      </div>


      <div className="comparison-journey">

        <div className="comparison-step">
          🧾
          <span>
            Registration
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step waiting">
          ⏳
          <span>
            Wait
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step">
          🧪
          <span>
            Test / Department
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step waiting">
          ⏳
          <span>
            Wait
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step">
          🩺
          <span>
            Doctor
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step waiting">
          ⏳
          <span>
            Wait
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step">
          💊
          <span>
            Pharmacy
          </span>
        </div>

      </div>


      <div className="comparison-total traditional-total">

        <span>
          ESTIMATED TOTAL TIME
        </span>

        <strong>
          {traditionalHospitalTime} min
        </strong>

      </div>

    </div>


    {/* AI */}

    <div className="comparison-column ai">

      <div className="comparison-column-header">

        <span className="comparison-column-icon">
          🤖
        </span>

        <div>

          <span>
            CAREFLOW AI
          </span>

          <strong>
            Intelligent Patient Flow
          </strong>

        </div>

      </div>


      <div className="comparison-journey">

        <div className="comparison-step optimized">
          🧾
          <span>
            Registration
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step optimized">
          🧠
          <span>
            AI checks queues
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step optimized">
          🧪
          <span>
            Best time for test
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step optimized">
          🩺
          <span>
            Doctor
          </span>
        </div>

        <div className="comparison-arrow">
          ↓
        </div>

        <div className="comparison-step optimized">
          💊
          <span>
            Pharmacy
          </span>
        </div>

      </div>


      <div className="comparison-total ai-total">

        <span>
          ESTIMATED TOTAL TIME
        </span>

        <strong>
          {aiHospitalTime} min
        </strong>

      </div>

    </div>

  </div>


  {/* IMPACT */}

  <div className="comparison-impact">

    <div className="impact-icon">
      🚀
    </div>

    <div>

      <span>
        AI ADVANTAGE
      </span>

      <strong>
        {hospitalTimeSaved} minutes saved
      </strong>

      <p>
        CareFlow can reduce estimated
        hospital waiting by
        <b> {waitingReduction}%</b>.
      </p>

    </div>

    <div className="impact-percentage">

      <strong>
        {waitingReduction}%
      </strong>

      <span>
        LESS WAITING
      </span>

    </div>

  </div>


  <div className="comparison-message">

    🤖 CareFlow continuously monitors hospital
    conditions and adjusts the patient's journey
    instead of making them wait unnecessarily.

  </div>

</section>


  {/* FORECAST TIMELINE */}

  <div className="forecast-timeline">

    <div className="forecast-time active">
      <span>NOW</span>
      <strong>Current</strong>
    </div>

    <div className="forecast-line"></div>

    <div className="forecast-time">
      <span>+15 MIN</span>
      <strong>Near Future</strong>
    </div>

    <div className="forecast-line"></div>

    <div className="forecast-time">
      <span>+30 MIN</span>
      <strong>Future</strong>
    </div>

  </div>


  {/* DEPARTMENT FORECASTS */}

  <div className="future-department-list">

    {futureQueuePredictions.length > 0 ? (

      futureQueuePredictions.map(
        (prediction) => {

          const nowStatus =
            getFutureStatus(
              prediction.statusNow
            );

          const status15 =
            getFutureStatus(
              prediction.status15
            );

          const status30 =
            getFutureStatus(
              prediction.status30
            );

          const isDestination =
            String(
              prediction.department
            )
              .toLowerCase()
              .trim() ===
            String(
              selectedDestination
            )
              .toLowerCase()
              .trim();


          return (

            <div
              key={
                `future-${prediction.department}`
              }
              className={
                `future-department ${
                  isDestination
                    ? "future-destination"
                    : ""
                }`
              }
            >

              <div className="future-department-name">

                <div className="future-department-icon">

                  {
                    prediction.department
                      .toLowerCase()
                      .includes("laboratory")
                      ? "🧪"
                      : prediction.department
                          .toLowerCase()
                          .includes("doctor")
                      ? "🩺"
                      : prediction.department
                          .toLowerCase()
                          .includes("radiology")
                      ? "🩻"
                      : prediction.department
                          .toLowerCase()
                          .includes("pharmacy")
                      ? "💊"
                      : prediction.department
                          .toLowerCase()
                          .includes("emergency")
                      ? "🚑"
                      : "🧾"
                  }

                </div>

                <div>

                  <strong>
                    {prediction.department}
                  </strong>

                  {isDestination && (

                    <small>
                      YOUR DESTINATION
                    </small>

                  )}

                </div>

              </div>


              {/* NOW */}

              <div className="future-column">

                <span>
                  NOW
                </span>

                <strong>
                  {nowStatus.icon}
                </strong>

                <small>
                  {prediction.currentWait} min
                </small>

              </div>


              {/* 15 MIN */}

              <div className="future-column">

                <span>
                  +15 MIN
                </span>

                <strong>
                  {status15.icon}
                </strong>

                <small>
                  {prediction.predictedWait15} min
                </small>

              </div>


              {/* 30 MIN */}

              <div className="future-column">

                <span>
                  +30 MIN
                </span>

                <strong>
                  {status30.icon}
                </strong>

                <small>
                  {prediction.predictedWait30} min
                </small>

              </div>


              {/* TREND */}

              <div
                className={
                  `future-trend ${
                    prediction.trend
                  }`
                }
              >

                {
                  prediction.trend ===
                  "increasing"
                    ? "↗"
                    : prediction.trend ===
                      "decreasing"
                    ? "↘"
                    : "→"
                }

                <span>
                  {
                    prediction.trend ===
                    "increasing"
                      ? "Rising"
                      : prediction.trend ===
                        "decreasing"
                      ? "Improving"
                      : "Stable"
                  }
                </span>

              </div>

            </div>

          );

        }
      )

    ) : (

      <div className="future-empty">

        🔮 CareFlow is generating future
        queue predictions...

      </div>

    )}

  </div>


  {/* AI RECOMMENDATION */}

  {futureQueuePredictions.length > 0 && (

    <div className="future-ai-recommendation">

      <div className="recommendation-icon">
        🤖
      </div>

      <div>

        <span>
          AI RECOMMENDATION
        </span>

        <strong>

          {
            (() => {

              const destinationPrediction =
                futureQueuePredictions.find(
                  (item) =>
                    String(
                      item.department
                    )
                      .toLowerCase()
                      .trim() ===
                    String(
                      selectedDestination
                    )
                      .toLowerCase()
                      .trim()
                );


              if (
                destinationPrediction?.trend ===
                "increasing"
              ) {

                return `${selectedDestination} is expected to become busier soon.`;

              }

              if (
                destinationPrediction?.trend ===
                "decreasing"
              ) {

                return `${selectedDestination} is expected to become less crowded.`;

              }

              return `Your route to ${selectedDestination} currently looks stable.`;

            })()

          }

        </strong>

        <p>

          Prediction confidence:

          {" "}

          <b>

            {
              futureQueuePredictions.find(
                (item) =>
                  String(
                    item.department
                  )
                    .toLowerCase()
                    .trim() ===
                  String(
                    selectedDestination
                  )
                    .toLowerCase()
                    .trim()
              )?.confidence || 78
            }%

          </b>

        </p>

      </div>

    </div>

  )}

</section>

          {/* CURRENT DESTINATION ANALYSIS */}

          {currentAIDepartment && (

            <div className="current-ai-analysis">

              <div className="analysis-icon">
                🎯
              </div>

              <div>

                <span>
                  YOUR DESTINATION ANALYSIS
                </span>

                <strong>
                  {selectedDestination}
                </strong>

                <p>
                  Current queue:{" "}
                  <b>
                    {currentAIDepartment.queue}
                  </b>
                  {" patients • "}
                  Predicted wait:{" "}
                  <b>
                    {waitTime} minutes
                  </b>
                </p>

              </div>

            </div>

          )}

        </section>


        {/* ===================================================
            AI ROUTE UPDATE
        =================================================== */}

        <section
          className={
            `ai-route-update-card ${
              routeUpdated
                ? "route-updated"
                : ""
            }`
          }
        >

          <div className="route-update-header">

            <div className="route-update-icon">
              🔄
            </div>


            <div>

              <span>
                AI ROUTE UPDATE
              </span>

              <h2>
                {routeUpdated
                  ? "Faster route found!"
                  : `Route to ${selectedDestination}`}
              </h2>

            </div>


            <div className="route-update-live">

              <span>
                ●
              </span>{" "}
              LIVE

            </div>

          </div>


          <div className="congestion-warning">

            <div>

              {
                congestionLevel
                  .toLowerCase()
                  .includes("high")
                  ? "⚠️"
                  : congestionLevel
                      .toLowerCase()
                      .includes("medium")
                  ? "🟠"
                  : "🟢"
              }

            </div>


            <div>

              <strong>
                {congestionLevel}
                {" congestion at "}
                {selectedDestination}
              </strong>


              <p>
                AI is monitoring the department
                and nearby corridors for changes
                in traffic.
              </p>

            </div>

          </div>


          <div className="route-comparison">

            <div className="route-old">

              <span>
                PREVIOUS ROUTE
              </span>

              <strong>
                Current path
              </strong>

              <small>
                Continuously monitored
              </small>

            </div>


            <div className="route-arrow">
              →
            </div>


            <div className="route-new">

              <span>
                AI ROUTE
              </span>

              <strong>
                Optimized path
              </strong>

              <small>
                Less unnecessary waiting
              </small>

            </div>

          </div>


          <div className="time-saved">

            <div>
              ⚡
            </div>

            <div>

              <span>
                ESTIMATED TIME SAVED
              </span>

              <strong>
                {timeSaved} minutes
              </strong>

            </div>

          </div>


          <div className="ai-explanation">

            <span>
              ✨ WHY DID AI CHOOSE THIS ROUTE?
            </span>

            <p>
              {aiExplanation}
            </p>

          </div>


          <button
            className={
              `follow-route-button ${
                isFollowingRoute
                  ? "route-following"
                  : ""
              }`
            }

            onClick={
              handleFollowOptimizedRoute
            }
          >

            {journeyCompleted
              ? "🔄 Start Journey Again"
              : isFollowingRoute
              ? `🧭 Going to ${selectedDestination}`
              : "🧭 Follow AI-Optimized Route"}

          </button>

        </section>


        {/* ===================================================
            ACTIVE NAVIGATION
        =================================================== */}

        {isFollowingRoute && (

          <section className="navigation-active-card">

            <div className="navigation-active-icon">
              🧭
            </div>


            <div>

              <span>
                AI NAVIGATION ACTIVE
              </span>


              <h2>
                {journeyCompleted
                  ? "Destination reached"
                  : `Heading to ${selectedDestination}`}
              </h2>


              <p>
                {journeyCompleted
                  ? `You have reached ${selectedDestination}.`
                  : `Next stop: ${
                      currentDestination?.name ||
                      selectedDestination
                    }`
                }
              </p>

            </div>


            <div className="navigation-active-status">
              ● LIVE
            </div>

          </section>

        )}
    {/* ===================================================
    SMART NOTIFICATION
=================================================== */}

<section
  className={`smart-notification-card ${smartNotification.type}`}
>

  <div className="smart-notification-icon">
    {smartNotification.icon}
  </div>

  <div className="smart-notification-content">

    <span>
      CAREFLOW SMART ALERT
    </span>

    <h2>
      {smartNotification.title}
    </h2>

    <p>
      {smartNotification.message}
    </p>

  </div>

  <div className="smart-notification-live">

    <span></span>

    LIVE

  </div>

</section>

        {/* ===================================================
            AI MONITORING
        =================================================== */}

        <section className="ai-navigation-message">

          <div className="ai-message-icon">
            🤖
          </div>


          <div>

            <strong>
              AI is continuously monitoring
              your journey
            </strong>


            <p>
              If congestion increases ahead,
              the system automatically evaluates
              alternative corridors and updates
              your route to minimize unnecessary
              waiting.
            </p>

          </div>


          <div className="monitoring-status">

            <span></span>

            MONITORING

          </div>

        </section>


        {/* ===================================================
            ROUTE DETAILS
        =================================================== */}

        <section className="route-details-section">

          <button
            className="details-toggle"

            onClick={() =>
              setShowRouteDetails(
                (previous) =>
                  !previous
              )
            }
          >

            {showRouteDetails
              ? "Hide Route Details ↑"
              : "View Route Details ↓"}

          </button>


          {showRouteDetails && (

            <div className="route-details">

              {route.map(
                (point, index) => (

                  <div
                    className={
                      `route-step ${
                        index <
                        currentRouteIndex
                          ? "done"
                          : index ===
                            currentRouteIndex
                          ? "active"
                          : ""
                      }`
                    }

                    key={
                      `detail-${point.name}-${index}`
                    }
                  >

                    <div className="step-number">

                      {
                        index <
                        currentRouteIndex
                          ? "✓"
                          : index + 1
                      }

                    </div>


                    <div>

                      <strong>
                        {point.name}
                      </strong>

                      <span>

                        {
                          index <
                          currentRouteIndex
                            ? "Completed"
                            : index ===
                              currentRouteIndex
                            ? "You are here"
                            : "Upcoming"
                        }

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>
        {/* ===================================================
    FINAL IMPACT DASHBOARD
=================================================== */}

<section className="final-impact-cta">

  <div className="final-impact-cta-icon">
    📊
  </div>

  <div className="final-impact-cta-content">

    <span>
      JOURNEY INSIGHTS
    </span>

    <h2>
      See Your Hospital Journey Impact
    </h2>

    <p>
      See how CareFlow AI optimized your journey,
      reduced waiting time and improved your
      hospital experience.
    </p>

  </div>

  <button
    className="final-impact-button"
    onClick={onFinalImpact}
  >
    View Impact →
  </button>

</section>

      </main>


      {/* =====================================================
          SMART ROUTE BANNER
      ===================================================== */}

      <div className="smart-route-banner">

        <div className="banner-icon">
          🤖
        </div>


        <div>

          <strong>
            AI is continuously monitoring
            your journey
          </strong>

          <p>
            {notification}
          </p>

        </div>


        <div className="banner-status">

          <span></span>

          Auto-rerouting ON

        </div>

      </div>

    </div>
  );
}


export default LiveSmartJourney;