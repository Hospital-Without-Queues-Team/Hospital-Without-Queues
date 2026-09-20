// ============================================================
// CAREFLOW AI — HOSPITAL OPTIMIZATION ENGINE
// ============================================================


// ============================================================
// 1. CALCULATE ESTIMATED WAITING TIME
// ============================================================

export function calculateWaitTime(department) {

  if (!department) return 0;

  const queue = department.queue || 0;
  const serviceTime = department.serviceTime || 5;
  const availableStaff = department.availableStaff || 1;

  return Math.ceil(
    (queue * serviceTime) /
    Math.max(availableStaff, 1)
  );
}


// ============================================================
// 2. CALCULATE WORKLOAD
// ============================================================

export function calculateWorkload(department) {

  if (!department) return 0;

  const queue = department.queue || 0;
  const capacity = department.capacity || 20;

  return Math.min(
    Math.round((queue / capacity) * 100),
    100
  );
}


// ============================================================
// 3. FIND DEPARTMENT WITH SHORTEST WAIT
// ============================================================

export function findBestDepartment(departments) {

  if (!departments || departments.length === 0) {
    return null;
  }

  let bestDepartment = departments[0];

  departments.forEach((department) => {

    const currentWait =
      calculateWaitTime(department);

    const bestWait =
      calculateWaitTime(bestDepartment);

    if (currentWait < bestWait) {
      bestDepartment = department;
    }

  });

  return bestDepartment;
}


// ============================================================
// 4. CALCULATE TOTAL JOURNEY TIME
// ============================================================

export function calculateTotalJourneyTime(route) {

  if (!route || route.length === 0) {
    return 0;
  }

  return route.reduce((total, department) => {

    const wait =
      calculateWaitTime(department);

    const service =
      department.serviceTime || 0;

    return total + wait + service;

  }, 0);
}


// ============================================================
// 5. CALCULATE TIME SAVED
// ============================================================

export function calculateTimeSaved(
  traditionalTime,
  optimizedTime
) {

  const saved =
    traditionalTime - optimizedTime;

  return Math.max(saved, 0);
}


// ============================================================
// 6. GENERATE AI EXPLANATION
// ============================================================

export function generateExplanation(
  currentDepartment,
  recommendedDepartment
) {

  if (!recommendedDepartment) {

    return (
      "CareFlow is still analysing hospital conditions."
    );

  }

  if (!currentDepartment) {

    return (
      `CareFlow recommends ${recommendedDepartment.name} ` +
      `because it currently has a shorter predicted wait.`
    );

  }

  const currentWait =
    calculateWaitTime(currentDepartment);

  const recommendedWait =
    calculateWaitTime(recommendedDepartment);

  if (recommendedWait < currentWait) {

    const difference =
      currentWait - recommendedWait;

    return (
      `CareFlow recommends ${recommendedDepartment.name} ` +
      `because its predicted wait is ${difference} ` +
      `minutes shorter.`
    );

  }

  return (
    `CareFlow recommends ${recommendedDepartment.name} ` +
    `based on the current hospital workload and ` +
    `available capacity.`
  );
}


// ============================================================
// 7. FIND USEFUL ACTIVITY WHILE WAITING
// ============================================================

export function findWaitingActivity(waitTime) {

  if (waitTime <= 5) {

    return {
      icon: "🚶",
      title: "Head to your next department",
      description:
        "Your wait is short, so you can prepare for your next step."
    };

  }

  if (waitTime <= 10) {

    return {
      icon: "💧",
      title: "Get some water",
      description:
        "You have a few minutes before your next step."
    };

  }

  if (waitTime <= 20) {

    return {
      icon: "📄",
      title: "Complete your documents",
      description:
        "Use this time to finish any pending paperwork."
    };

  }

  return {

    icon: "🪑",

    title: "Find a comfortable waiting area",

    description:
      "Your estimated wait is longer, so you don't need to stand in the queue."
  };
}


// ============================================================
// 8. HOSPITAL TRAFFIC LEVEL
// ============================================================

export function getTrafficLevel(totalPatients) {

  if (totalPatients < 20) {

    return {
      level: "Low traffic",
      status: "low"
    };

  }

  if (totalPatients < 50) {

    return {
      level: "Moderate traffic",
      status: "moderate"
    };

  }

  return {

    level: "High traffic",
    status: "high"

  };
}


// ============================================================
// 9. DOCTOR WORKLOAD
// ============================================================

export function calculateDoctorWorkload(
  patients,
  availableDoctors
) {

  if (availableDoctors <= 0) {
    return 100;
  }

  const workload =
    patients / availableDoctors;

  return Math.min(
    Math.round(workload * 10),
    100
  );
}


// ============================================================
// 10. MAIN CAREFLOW AI DECISION
// ============================================================

export function optimizePatientJourney(
  departments
) {

  if (!departments || departments.length === 0) {
    return null;
  }

  const analysedDepartments =
    departments.map((department) => {

      const wait =
        calculateWaitTime(department);

      const workload =
        calculateWorkload(department);

      return {

        ...department,

        predictedWait: wait,

        workload: workload

      };

    });


  const recommended =
    findBestDepartment(
      analysedDepartments
    );


  const explanation =
    generateExplanation(
      null,
      recommended
    );


  return {

    departments:
      analysedDepartments,

    recommendedDepartment:
      recommended,

    explanation:
      explanation

  };

}


// ============================================================
// 11. AI QUEUE STATUS
// ============================================================

export function getQueueStatus(waitTime) {

  if (waitTime <= 5) {

    return {
      label: "LOW",
      status: "low",
      icon: "🟢"
    };

  }

  if (waitTime <= 15) {

    return {
      label: "MODERATE",
      status: "moderate",
      icon: "🟡"
    };

  }

  return {
    label: "HIGH",
    status: "high",
    icon: "🔴"
  };

}


// ============================================================
// 12. GENERATE QUEUE PREDICTION
// ============================================================

export function predictDepartmentQueue(department) {

  if (!department) {
    return null;
  }

  const currentQueue =
    department.queue || 0;

  const waitTime =
    calculateWaitTime(department);

  const workload =
    calculateWorkload(department);

  const queueStatus =
    getQueueStatus(waitTime);


  return {

    department:
      department.name,

    currentQueue:
      currentQueue,

    predictedWait:
      waitTime,

    workload:
      workload,

    status:
      queueStatus.status,

    statusLabel:
      queueStatus.label,

    statusIcon:
      queueStatus.icon

  };

}


// ============================================================
// 13. PREDICT ALL HOSPITAL QUEUES
// ============================================================

export function predictHospitalQueues(departments) {

  if (!departments || departments.length === 0) {
    return [];
  }

  return departments.map((department) => {

    return predictDepartmentQueue(
      department
    );

  });

}


// ============================================================
// 14. AI CONGESTION DETECTION
// ============================================================

export function detectCongestion(department) {

  if (!department) {
    return false;
  }

  const waitTime =
    calculateWaitTime(department);

  const workload =
    calculateWorkload(department);

  return (
    waitTime > 15 ||
    workload >= 80
  );

}


// ============================================================
// 15. AI QUEUE SUMMARY
// ============================================================

export function generateQueueSummary(departments) {

  const predictions =
    predictHospitalQueues(departments);

  if (predictions.length === 0) {

    return {
      message:
        "CareFlow is analysing hospital queues.",
      highTraffic: 0,
      moderateTraffic: 0,
      lowTraffic: 0
    };

  }


  const highTraffic =
    predictions.filter(
      (item) => item.status === "high"
    ).length;


  const moderateTraffic =
    predictions.filter(
      (item) => item.status === "moderate"
    ).length;


  const lowTraffic =
    predictions.filter(
      (item) => item.status === "low"
    ).length;


  let message =
    "Hospital queues are currently stable.";


  if (highTraffic > 0) {

    message =
      `${highTraffic} department${
        highTraffic > 1 ? "s" : ""
      } currently have high queue pressure. CareFlow may adjust patient routes.`;

  }
  else if (moderateTraffic > 0) {

    message =
      "Some departments have moderate queue pressure. CareFlow is monitoring them.";

  }


  return {

    message,

    highTraffic,

    moderateTraffic,

    lowTraffic

  };

}
// =========================================
// LIVE HOSPITAL SIMULATION
// =========================================

export const liveHospitalData = [
  {
    id: "registration",
    name: "Registration",
    queue: 3,
    wait: 5,
    staff: 2,
    status: "NORMAL",
  },

  {
    id: "laboratory",
    name: "Laboratory",
    queue: 4,
    wait: 8,
    staff: 2,
    status: "LOW",
  },

  {
    id: "doctor",
    name: "Doctor Consultation",
    queue: 8,
    wait: 18,
    staff: 3,
    status: "BUSY",
  },

  {
    id: "radiology",
    name: "Radiology",
    queue: 5,
    wait: 12,
    staff: 2,
    status: "MODERATE",
  },

  {
    id: "pharmacy",
    name: "Pharmacy",
    queue: 3,
    wait: 5,
    staff: 2,
    status: "LOW",
  },

  {
    id: "emergency",
    name: "Emergency",
    queue: 12,
    wait: 25,
    staff: 4,
    status: "HIGH",
  },
];
// ==========================================
// DYNAMIC AI REROUTING
// ==========================================

export function getDynamicRoute(departments, currentDepartment) {
  if (!departments || departments.length === 0) {
    return null;
  }

  // Calculate estimated waiting time
  const departmentScores = departments.map((department) => {
    const staff = Math.max(department.availableStaff || 1, 1);
    const queue = department.queue || 0;
    const serviceTime = department.serviceTime || 5;

    const estimatedWait = Math.ceil(
      (queue * serviceTime) / staff
    );

    return {
      ...department,
      estimatedWait,
    };
  });

  // Remove the department the patient is currently visiting
  const alternatives = departmentScores.filter(
    (department) => department.id !== currentDepartment
  );

  if (alternatives.length === 0) {
    return null;
  }

  // Find the department with the lowest estimated wait
  const bestDepartment = alternatives.reduce(
    (best, department) =>
      department.estimatedWait < best.estimatedWait
        ? department
        : best
  );

  return bestDepartment;
}
/* =========================================================
   🔮 FUTURE QUEUE PREDICTION
   Predicts queue pressure for the next 15 and 30 minutes
========================================================= */

export function predictFutureQueues(departments = []) {

  if (!Array.isArray(departments)) {
    return [];
  }

  return departments.map((department) => {

    const queue =
      Number(department.queue) || 0;

    const staff =
      Number(
        department.availableStaff ??
        department.staff
      ) || 1;

    const capacity =
      Number(department.capacity) || 20;

    const serviceTime =
      Number(department.serviceTime) || 5;


    /*
      Estimate how many patients can be served
      during each future period.
    */

    const patientsPer15Minutes =
      Math.max(
        1,
        Math.floor(
          (15 * staff) /
          serviceTime
        )
      );


    /*
      Simulated incoming patients.

      This creates a realistic prediction rather
      than simply copying the current queue.
    */

    const incoming15 =
      Math.max(
        1,
        Math.ceil(
          queue * 0.18
        )
      );


    const incoming30 =
      Math.max(
        1,
        Math.ceil(
          queue * 0.35
        )
      );


    const queue15 = Math.max(
      0,
      queue +
      incoming15 -
      patientsPer15Minutes
    );


    const queue30 = Math.max(
      0,
      queue +
      incoming30 -
      patientsPer15Minutes * 2
    );


    /*
      Convert predicted queue into
      estimated waiting time.
    */

    const waitNow =
      Math.max(
        1,
        Math.ceil(
          (queue * serviceTime) /
          staff
        )
      );


    const wait15 =
      Math.max(
        1,
        Math.ceil(
          (queue15 * serviceTime) /
          staff
        )
      );


    const wait30 =
      Math.max(
        1,
        Math.ceil(
          (queue30 * serviceTime) /
          staff
        )
      );


    /*
      Determine traffic status.
    */

    const getStatus = (wait) => {

      if (wait >= 20) {
        return "high";
      }

      if (wait >= 10) {
        return "moderate";
      }

      return "low";

    };


    /*
      Determine trend.
    */

    let trend = "stable";

    if (wait15 > waitNow + 3) {
      trend = "increasing";
    }
    else if (wait15 < waitNow - 3) {
      trend = "decreasing";
    }


    /*
      Confidence is based on the amount
      of available hospital information.
    */

    let confidence = 78;

    if (queue === 0) {
      confidence = 72;
    }

    if (staff >= 3) {
      confidence += 5;
    }

    confidence = Math.min(
      95,
      confidence
    );


    return {

      department:
        department.name,

      currentQueue:
        queue,

      currentWait:
        waitNow,

      queue15,

      queue30,

      predictedWait15:
        wait15,

      predictedWait30:
        wait30,

      statusNow:
        getStatus(waitNow),

      status15:
        getStatus(wait15),

      status30:
        getStatus(wait30),

      trend,

      confidence,

      capacity,

    };

  });

}