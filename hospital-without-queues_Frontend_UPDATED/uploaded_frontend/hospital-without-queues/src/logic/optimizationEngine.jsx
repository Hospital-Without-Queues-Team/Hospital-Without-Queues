// ============================================================
// CAREFLOW AI — HOSPITAL OPTIMIZATION ENGINE
// ============================================================


// ------------------------------------------------------------
// Calculate estimated waiting time
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// Calculate workload percentage
// ------------------------------------------------------------

export function calculateWorkload(department) {

  if (!department) return 0;

  const queue = department.queue || 0;
  const capacity = department.capacity || 20;

  return Math.min(
    Math.round((queue / capacity) * 100),
    100
  );
}


// ------------------------------------------------------------
// Find department by ID
// ------------------------------------------------------------

export function getDepartment(
  departments,
  id
) {

  if (!departments) return null;

  return departments.find(
    department => department.id === id
  ) || null;

}


// ------------------------------------------------------------
// Find shortest queue
// ------------------------------------------------------------

export function findBestDepartment(
  departments
) {

  if (
    !departments ||
    departments.length === 0
  ) {
    return null;
  }


  let bestDepartment =
    departments[0];


  departments.forEach(
    department => {

      const currentWait =
        calculateWaitTime(
          department
        );


      const bestWait =
        calculateWaitTime(
          bestDepartment
        );


      if (
        currentWait <
        bestWait
      ) {

        bestDepartment =
          department;

      }

    }
  );


  return bestDepartment;

}


// ------------------------------------------------------------
// Find best department for patient
// ------------------------------------------------------------

export function findBestNextStep(
  departments,
  visitType
) {

  if (
    !departments ||
    departments.length === 0
  ) {
    return null;
  }


  /*
   Different visits can have different
   starting points.
  */

  const preferredRoutes = {

    consultation: [
      "doctor",
      "diagnostics",
      "pharmacy"
    ],

    diagnostic: [
      "diagnostics",
      "doctor",
      "pharmacy"
    ],

    followup: [
      "doctor",
      "diagnostics",
      "pharmacy"
    ],

    pharmacy: [
      "pharmacy",
      "doctor"
    ]

  };


  const preferred =
    preferredRoutes[visitType]
    || preferredRoutes.consultation;


  const availableDepartments =
    preferred
      .map(id =>
        getDepartment(
          departments,
          id
        )
      )
      .filter(Boolean);


  if (
    availableDepartments.length === 0
  ) {

    return findBestDepartment(
      departments
    );

  }


  return findBestDepartment(
    availableDepartments
  );

}


// ------------------------------------------------------------
// Calculate total journey time
// ------------------------------------------------------------

export function calculateTotalJourneyTime(
  route
) {

  if (
    !route ||
    route.length === 0
  ) {
    return 0;
  }


  return route.reduce(
    (total, department) => {

      const wait =
        calculateWaitTime(
          department
        );


      const service =
        department.serviceTime || 0;


      return (
        total +
        wait +
        service
      );

    },
    0
  );

}


// ------------------------------------------------------------
// Calculate traditional hospital time
// ------------------------------------------------------------

export function calculateTraditionalTime(
  route
) {

  if (
    !route ||
    route.length === 0
  ) {
    return 0;
  }


  /*
   Traditional routing assumes
   the patient follows the fixed
   sequence without optimization.
  */

  return route.reduce(
    (total, department) => {

      const queue =
        department.queue || 0;

      const service =
        department.serviceTime || 0;


      return (
        total +
        queue +
        service
      );

    },
    0
  );

}


// ------------------------------------------------------------
// Calculate time saved
// ------------------------------------------------------------

export function calculateTimeSaved(
  traditionalTime,
  optimizedTime
) {

  const saved =
    traditionalTime -
    optimizedTime;


  return Math.max(
    Math.round(saved),
    0
  );

}


// ------------------------------------------------------------
// Calculate percentage reduction
// ------------------------------------------------------------

export function calculateReductionPercentage(
  traditionalTime,
  optimizedTime
) {

  if (
    traditionalTime <= 0
  ) {
    return 0;
  }


  const reduction =
    (
      (traditionalTime -
        optimizedTime) /
      traditionalTime
    ) * 100;


  return Math.max(
    Math.round(reduction * 10) / 10,
    0
  );

}


// ------------------------------------------------------------
// Generate AI explanation
// ------------------------------------------------------------

export function generateExplanation(
  currentDepartment,
  recommendedDepartment
) {

  if (
    !recommendedDepartment
  ) {

    return (
      "CareFlow is still analysing " +
      "hospital conditions."
    );

  }


  if (
    !currentDepartment
  ) {

    return (
      `CareFlow recommends ` +
      `${recommendedDepartment.name} ` +
      `because it currently has a ` +
      `shorter predicted wait.`
    );

  }


  const currentWait =
    calculateWaitTime(
      currentDepartment
    );


  const recommendedWait =
    calculateWaitTime(
      recommendedDepartment
    );


  if (
    recommendedWait <
    currentWait
  ) {

    const difference =
      currentWait -
      recommendedWait;


    return (
      `CareFlow recommends ` +
      `${recommendedDepartment.name} ` +
      `because its predicted wait ` +
      `is ${difference} minutes shorter.`
    );

  }


  return (
    `CareFlow recommends ` +
    `${recommendedDepartment.name} ` +
    `based on the current hospital ` +
    `workload and available capacity.`
  );

}


// ------------------------------------------------------------
// What should patient do while waiting?
// ------------------------------------------------------------

export function findWaitingActivity(
  waitTime
) {

  if (waitTime <= 5) {

    return {

      icon: "🚶",

      title:
        "Head to your next department",

      description:
        "Your wait is short, so prepare " +
        "for your next step."

    };

  }


  if (waitTime <= 10) {

    return {

      icon: "💧",

      title:
        "Get some water",

      description:
        "You have a few minutes before " +
        "your next step."

    };

  }


  if (waitTime <= 20) {

    return {

      icon: "📄",

      title:
        "Complete your documents",

      description:
        "Use this time to finish any " +
        "pending paperwork."

    };

  }


  return {

    icon: "🪑",

    title:
      "Find a comfortable waiting area",

    description:
      "Your estimated wait is longer, " +
      "so you don't need to stand in the queue."

  };

}


// ------------------------------------------------------------
// Hospital traffic level
// ------------------------------------------------------------

export function getTrafficLevel(
  totalPatients
) {

  if (
    totalPatients < 20
  ) {

    return {

      level: "Low traffic",
      status: "low"

    };

  }


  if (
    totalPatients < 50
  ) {

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


// ------------------------------------------------------------
// Doctor workload
// ------------------------------------------------------------

export function calculateDoctorWorkload(
  patients,
  availableDoctors
) {

  if (
    availableDoctors <= 0
  ) {

    return 100;

  }


  const workload =
    patients /
    availableDoctors;


  return Math.min(
    Math.round(
      workload * 10
    ),
    100
  );

}


// ------------------------------------------------------------
// Main CareFlow AI decision
// ------------------------------------------------------------

export function optimizePatientJourney(
  departments,
  visitType
) {

  if (
    !departments ||
    departments.length === 0
  ) {

    return null;

  }


  const analysedDepartments =
    departments.map(
      department => {

        const wait =
          calculateWaitTime(
            department
          );


        const workload =
          calculateWorkload(
            department
          );


        return {

          ...department,

          predictedWait:
            wait,

          workload:
            workload

        };

      }
    );


  const recommended =
    findBestNextStep(
      analysedDepartments,
      visitType
    );


  const explanation =
    generateExplanation(
      null,
      recommended
    );


  const waitingActivity =
    findWaitingActivity(
      recommended
        ? calculateWaitTime(
            recommended
          )
        : 0
    );


  return {

    departments:
      analysedDepartments,

    recommendedDepartment:
      recommended,

    explanation:
      explanation,

    waitingActivity:
      waitingActivity

  };

}