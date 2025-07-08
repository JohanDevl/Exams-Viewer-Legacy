// Global state
let currentExam = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = new Set();
let isValidated = false;
let isHighlightEnabled = false;
let questionStartTime = null; // Track when question was started
let settings = {
  showDiscussionDefault: false,
  highlightDefault: false,
  darkMode: false,
};

// Available exams mapping (will be populated dynamically)
let availableExams = {};

// Statistics system
let statistics = {
  sessions: [], // Array of session objects
  currentSession: null,
  totalStats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTime: 0,
    examStats: {}, // Per-exam statistics
  },
};

// Session data structure
class ExamSession {
  constructor(examCode, examName) {
    this.id = generateSessionId();
    this.examCode = examCode;
    this.examName = examName;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.questions = []; // Array of question attempts
    this.totalQuestions = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.totalTime = 0; // in seconds
    this.completed = false;
  }
}

// Question attempt data structure
class QuestionAttempt {
  constructor(questionNumber, questionText, correctAnswers, mostVoted) {
    this.questionNumber = questionNumber;
    this.questionText = questionText;
    this.correctAnswers = correctAnswers; // Array of correct answer letters
    this.mostVoted = mostVoted; // Most voted answer from community
    this.userAnswers = []; // Array of user selected answers
    this.attempts = []; // Array of attempt objects
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.timeSpent = 0; // in seconds
    this.isCorrect = false;
    this.finalScore = 0; // 0-100 percentage
  }

  addAttempt(selectedAnswers, isCorrect, timeSpent) {
    const attempt = {
      answers: Array.from(selectedAnswers),
      isCorrect: isCorrect,
      timestamp: new Date().toISOString(),
      timeSpent: timeSpent,
    };
    this.attempts.push(attempt);
    this.userAnswers = Array.from(selectedAnswers);
    this.isCorrect = isCorrect;
    this.timeSpent += timeSpent;
    this.endTime = new Date().toISOString();

    // Calculate final score based on correctness
    if (isCorrect) {
      this.finalScore = 100;
    } else {
      // Partial credit based on correct answers selected
      const correctSelected = selectedAnswers.filter((answer) =>
        this.correctAnswers.includes(answer)
      ).length;
      this.finalScore = Math.round(
        (correctSelected / this.correctAnswers.length) * 100
      );
    }
  }
}

// Generate unique session ID
function generateSessionId() {
  return (
    "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

// Statistics storage management
function loadStatistics() {
  try {
    const savedStats = localStorage.getItem("examViewerStatistics");
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      statistics = {
        sessions: parsed.sessions || [],
        currentSession: parsed.currentSession || null,
        totalStats: parsed.totalStats || {
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalTime: 0,
          examStats: {},
        },
      };

      // Recalculate total stats from sessions
      recalculateTotalStats();

      devLog("Statistics loaded from localStorage:", statistics);
    }
  } catch (error) {
    devError("Error loading statistics:", error);
    // Reset to default if corrupted
    statistics = {
      sessions: [],
      currentSession: null,
      totalStats: {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
        examStats: {},
      },
    };
  }
}

function saveStatistics() {
  try {
    localStorage.setItem("examViewerStatistics", JSON.stringify(statistics));
    devLog("Statistics saved to localStorage");
  } catch (error) {
    devError("Error saving statistics:", error);
  }
}

function recalculateTotalStats() {
  statistics.totalStats = {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTime: 0,
    examStats: {},
  };

  statistics.sessions.forEach((session) => {
    statistics.totalStats.totalQuestions += session.totalQuestions;
    statistics.totalStats.totalCorrect += session.correctAnswers;
    statistics.totalStats.totalIncorrect += session.incorrectAnswers;
    statistics.totalStats.totalTime += session.totalTime;

    // Per-exam stats
    if (!statistics.totalStats.examStats[session.examCode]) {
      statistics.totalStats.examStats[session.examCode] = {
        examName: session.examName,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
        sessions: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttempt: null,
      };
    }

    const examStats = statistics.totalStats.examStats[session.examCode];
    examStats.totalQuestions += session.totalQuestions;
    examStats.totalCorrect += session.correctAnswers;
    examStats.totalIncorrect += session.incorrectAnswers;
    examStats.totalTime += session.totalTime;
    examStats.sessions++;

    // Calculate scores
    const sessionScore =
      session.totalQuestions > 0
        ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
        : 0;

    examStats.averageScore =
      examStats.totalQuestions > 0
        ? Math.round((examStats.totalCorrect / examStats.totalQuestions) * 100)
        : 0;

    if (sessionScore > examStats.bestScore) {
      examStats.bestScore = sessionScore;
    }

    if (
      !examStats.lastAttempt ||
      new Date(session.startTime) > new Date(examStats.lastAttempt)
    ) {
      examStats.lastAttempt = session.startTime;
    }
  });
}

// Start a new exam session
function startExamSession(examCode, examName) {
  // End current session if exists
  if (statistics.currentSession) {
    endCurrentSession();
  }

  statistics.currentSession = new ExamSession(examCode, examName);
  statistics.currentSession.totalQuestions = currentQuestions.length;

  devLog("Started new exam session:", statistics.currentSession);
  saveStatistics();
}

// End current session
function endCurrentSession() {
  if (statistics.currentSession) {
    statistics.currentSession.endTime = new Date().toISOString();
    statistics.currentSession.completed = true;

    // Calculate total time
    const startTime = new Date(statistics.currentSession.startTime);
    const endTime = new Date(statistics.currentSession.endTime);
    statistics.currentSession.totalTime = Math.floor(
      (endTime - startTime) / 1000
    );

    // Add to sessions history
    statistics.sessions.push(statistics.currentSession);
    statistics.currentSession = null;

    // Recalculate total stats
    recalculateTotalStats();
    saveStatistics();

    devLog("Ended exam session");
  }
}

// Track question attempt
function trackQuestionAttempt(
  questionNumber,
  questionText,
  correctAnswers,
  mostVoted,
  selectedAnswers,
  isCorrect,
  timeSpent
) {
  if (!statistics.currentSession) return;

  // Find existing question attempt or create new one
  let questionAttempt = statistics.currentSession.questions.find(
    (q) => q.questionNumber === questionNumber
  );

  if (!questionAttempt) {
    questionAttempt = new QuestionAttempt(
      questionNumber,
      questionText,
      correctAnswers,
      mostVoted
    );
    statistics.currentSession.questions.push(questionAttempt);
  }

  // Add the attempt
  questionAttempt.addAttempt(selectedAnswers, isCorrect, timeSpent);

  // Update session stats
  updateSessionStats();
  saveStatistics();

  devLog("Tracked question attempt:", questionAttempt);
}

// Update session statistics
function updateSessionStats() {
  if (!statistics.currentSession) return;

  let correct = 0;
  let incorrect = 0;

  statistics.currentSession.questions.forEach((question) => {
    if (question.isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  });

  statistics.currentSession.correctAnswers = correct;
  statistics.currentSession.incorrectAnswers = incorrect;
}

// Reset all statistics
function resetAllStatistics() {
  if (
    confirm(
      "Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ? Cette action ne peut pas être annulée."
    )
  ) {
    statistics = {
      sessions: [],
      currentSession: null,
      totalStats: {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
        examStats: {},
      },
    };

    localStorage.removeItem("examViewerStatistics");
    showSuccess("Statistiques réinitialisées avec succès");

    // Refresh statistics display if open
    if (document.getElementById("statisticsModal").style.display === "flex") {
      displayStatistics();
    }
  }
}

// Display statistics modal
function displayStatistics() {
  const modal = document.getElementById("statisticsModal");
  modal.style.display = "flex";

  // Show overview tab by default
  showStatsTab("overview");

  // Update all statistics displays
  updateOverviewTab();
  updateExamsTab();
  updateSessionsTab();
  updateProgressTab();
}

// Show specific statistics tab
function showStatsTab(tabName) {
  // Update tab buttons
  const tabs = document.querySelectorAll(".stats-tab");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active");
    }
  });

  // Update tab content
  const contents = document.querySelectorAll(".stats-tab-content");
  contents.forEach((content) => {
    content.classList.remove("active");
  });

  document.getElementById(`${tabName}Tab`).classList.add("active");
}

// Update overview tab
function updateOverviewTab() {
  const totalStats = statistics.totalStats;

  // Update stat cards
  document.getElementById("totalQuestions").textContent =
    totalStats.totalQuestions;
  document.getElementById("totalCorrect").textContent = totalStats.totalCorrect;
  document.getElementById("totalIncorrect").textContent =
    totalStats.totalIncorrect;

  // Create overview chart
  createOverviewChart();
}

// Update exams tab
function updateExamsTab() {
  const examStatsList = document.getElementById("examStatsList");
  const examStats = statistics.totalStats.examStats;

  if (Object.keys(examStats).length === 0) {
    examStatsList.innerHTML = `
      <div class="stats-empty">
        <i class="fas fa-chart-bar"></i>
        <h3>Aucune statistique d'examen</h3>
        <p>Commencez à répondre aux questions pour voir vos statistiques par examen.</p>
      </div>
    `;
    return;
  }

  examStatsList.innerHTML = "";

  // Sort exams by average score (descending)
  const sortedExams = Object.entries(examStats).sort(
    ([, a], [, b]) => b.averageScore - a.averageScore
  );

  sortedExams.forEach(([examCode, stats]) => {
    const examItem = document.createElement("div");
    examItem.className = "exam-stat-item";

    const lastAttemptDate = stats.lastAttempt
      ? new Date(stats.lastAttempt).toLocaleDateString("fr-FR")
      : "Jamais";

    examItem.innerHTML = `
      <div class="exam-stat-info">
        <h4>${stats.examName || examCode}</h4>
        <div class="exam-stat-details">
          <span><i class="fas fa-question-circle"></i> ${
            stats.totalQuestions
          } questions</span>
          <span><i class="fas fa-check-circle"></i> ${
            stats.totalCorrect
          } correctes</span>
          <span><i class="fas fa-times-circle"></i> ${
            stats.totalIncorrect
          } incorrectes</span>
          <span><i class="fas fa-clock"></i> ${formatTime(
            stats.totalTime
          )}</span>
          <span><i class="fas fa-calendar"></i> ${lastAttemptDate}</span>
        </div>
        <div class="exam-stat-progress">
          <div class="exam-stat-progress-bar" style="width: ${
            stats.averageScore
          }%"></div>
        </div>
      </div>
      <div class="exam-stat-score">
        <div class="score-value">${stats.averageScore}%</div>
        <div class="score-label">Score moyen</div>
        <div style="margin-top: 0.5rem;">
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            Meilleur: ${stats.bestScore}%
          </div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            Sessions: ${stats.sessions}
          </div>
        </div>
      </div>
    `;

    examStatsList.appendChild(examItem);
  });
}

// Update sessions tab
function updateSessionsTab() {
  const sessionsList = document.getElementById("sessionsList");

  if (statistics.sessions.length === 0) {
    sessionsList.innerHTML = `
      <div class="stats-empty">
        <i class="fas fa-history"></i>
        <h3>Aucune session enregistrée</h3>
        <p>Vos sessions d'examen apparaîtront ici une fois que vous aurez commencé à répondre aux questions.</p>
      </div>
    `;
    return;
  }

  sessionsList.innerHTML = "";

  // Sort sessions by start time (most recent first)
  const sortedSessions = [...statistics.sessions].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  sortedSessions.forEach((session) => {
    const sessionItem = document.createElement("div");
    sessionItem.className = "session-item";

    const startDate = new Date(session.startTime);
    const score =
      session.totalQuestions > 0
        ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
        : 0;

    sessionItem.innerHTML = `
      <div class="session-header">
        <div class="session-title">${session.examName || session.examCode}</div>
        <div class="session-date">${startDate.toLocaleDateString(
          "fr-FR"
        )} ${startDate.toLocaleTimeString("fr-FR")}</div>
      </div>
      <div class="session-stats">
        <div class="session-stat">
          <div class="session-stat-value">${session.totalQuestions}</div>
          <div class="session-stat-label">Questions</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${session.correctAnswers}</div>
          <div class="session-stat-label">Correctes</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${session.incorrectAnswers}</div>
          <div class="session-stat-label">Incorrectes</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${formatTime(session.totalTime)}</div>
          <div class="session-stat-label">Temps</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${score}%</div>
          <div class="session-stat-label">Score</div>
        </div>
      </div>
      <div class="session-progress">
        <div class="session-progress-bar" style="width: ${score}%"></div>
      </div>
    `;

    sessionsList.appendChild(sessionItem);
  });
}

// Update progress tab
function updateProgressTab() {
  createProgressChart();
}

// Create overview chart (simple canvas-based chart)
function createOverviewChart() {
  const canvas = document.getElementById("overviewChart");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const totalStats = statistics.totalStats;
  const total = totalStats.totalCorrect + totalStats.totalIncorrect;

  if (total === 0) {
    // Show empty state
    ctx.fillStyle = "#6c757d";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Aucune donnée disponible",
      canvas.width / 2,
      canvas.height / 2
    );
    return;
  }

  // Draw pie chart
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  const correctAngle = (totalStats.totalCorrect / total) * 2 * Math.PI;
  const incorrectAngle = (totalStats.totalIncorrect / total) * 2 * Math.PI;

  // Draw correct answers slice
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, correctAngle);
  ctx.closePath();
  ctx.fillStyle = "#28a745";
  ctx.fill();

  // Draw incorrect answers slice
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(
    centerX,
    centerY,
    radius,
    correctAngle,
    correctAngle + incorrectAngle
  );
  ctx.closePath();
  ctx.fillStyle = "#dc3545";
  ctx.fill();

  // Draw legend
  ctx.fillStyle = "#28a745";
  ctx.fillRect(20, 20, 15, 15);
  ctx.fillStyle = "#262730";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Correctes: ${totalStats.totalCorrect}`, 45, 32);

  ctx.fillStyle = "#dc3545";
  ctx.fillRect(20, 45, 15, 15);
  ctx.fillStyle = "#262730";
  ctx.fillText(`Incorrectes: ${totalStats.totalIncorrect}`, 45, 57);
}

// Create progress chart
function createProgressChart() {
  const canvas = document.getElementById("progressChart");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (statistics.sessions.length === 0) {
    // Show empty state
    ctx.fillStyle = "#6c757d";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Aucune donnée de progression disponible",
      canvas.width / 2,
      canvas.height / 2
    );
    return;
  }

  // Sort sessions by date
  const sortedSessions = [...statistics.sessions].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  // Calculate scores for each session
  const scores = sortedSessions.map((session) => {
    return session.totalQuestions > 0
      ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
      : 0;
  });

  // Draw line chart
  const padding = 40;
  const chartWidth = canvas.width - 2 * padding;
  const chartHeight = canvas.height - 2 * padding;

  // Draw axes
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartHeight);
  ctx.stroke();

  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding, padding + chartHeight);
  ctx.lineTo(padding + chartWidth, padding + chartHeight);
  ctx.stroke();

  // Draw grid lines and labels
  ctx.fillStyle = "#6c757d";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";

  // Y-axis labels (0-100%)
  for (let i = 0; i <= 100; i += 20) {
    const y = padding + chartHeight - (i / 100) * chartHeight;
    ctx.fillText(`${i}%`, padding - 10, y + 4);

    // Grid line
    ctx.strokeStyle = "#e9ecef";
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
  }

  // Draw progress line
  if (scores.length > 1) {
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    scores.forEach((score, index) => {
      const x = padding + (index / (scores.length - 1)) * chartWidth;
      const y = padding + chartHeight - (score / 100) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#007bff";
    scores.forEach((score, index) => {
      const x = padding + (index / (scores.length - 1)) * chartWidth;
      const y = padding + chartHeight - (score / 100) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}

// Format time in seconds to readable format
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Export statistics to JSON
function exportStatistics() {
  const dataStr = JSON.stringify(statistics, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `exam-statistics-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  showSuccess("Statistiques exportées avec succès");
}

// Development mode detection
const isDevelopmentMode = () => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:"
  );
};

// Console log wrapper for development mode only
const devLog = (...args) => {
  if (isDevelopmentMode()) {
    console.log(...args);
  }
};

// Console error wrapper (always show errors)
const devError = (...args) => {
  console.error(...args);
};

// Dynamically discover available exams from data folder
async function discoverAvailableExams() {
  try {
    const discoveredExams = {};

    // Method 1: Try to load manifest file first (most efficient, no 404 errors)
    devLog("Attempting to load manifest file...");
    try {
      const manifestResponse = await fetch("data/manifest.json");
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        if (manifest.exams && Array.isArray(manifest.exams)) {
          devLog("Found manifest file with exams:", manifest.exams);

          // Verify each exam file exists
          const verifyPromises = manifest.exams.map(async (examCode) => {
            try {
              const response = await fetch(`data/${examCode}.json`, {
                method: "HEAD",
              });
              if (response.ok) {
                discoveredExams[examCode] = examCode;
                devLog(`Confirmed exam file exists for: ${examCode}`);
              } else {
                devLog(
                  `Exam file not found for: ${examCode} (status: ${response.status})`
                );
              }
            } catch (error) {
              devLog(`Failed to verify exam file for: ${examCode}`, error);
            }
          });

          await Promise.all(verifyPromises);

          if (Object.keys(discoveredExams).length > 0) {
            availableExams = discoveredExams;
            devLog(
              "Successfully loaded exams from manifest:",
              Object.keys(availableExams)
            );
            return availableExams;
          }
        }
      }
    } catch (error) {
      devLog(
        "Manifest file not found or invalid, falling back to directory discovery"
      );
    }

    // Method 2: Try to get file listing from directory (if server supports it)
    try {
      const dirResponse = await fetch("data/");
      if (dirResponse.ok) {
        const dirText = await dirResponse.text();

        // Parse HTML directory listing to find .json files (excluding _links.json)
        const jsonFileRegex = /href="([^"]*\.json)"/g;
        let match;
        while ((match = jsonFileRegex.exec(dirText)) !== null) {
          const filename = match[1];
          // Skip _links.json files, only get main exam files
          if (
            !filename.includes("_links") &&
            filename.endsWith(".json") &&
            filename !== "manifest.json"
          ) {
            const examCode = filename.replace(".json", "");
            discoveredExams[examCode] = examCode;
          }
        }

        if (Object.keys(discoveredExams).length > 0) {
          devLog(
            "Discovered exams from directory listing:",
            Object.keys(discoveredExams)
          );
          availableExams = discoveredExams;
          return availableExams;
        }
      }
    } catch (error) {
      devLog("Directory listing not available, trying alternative methods");
    }

    // Method 3: Auto-discover by scanning for _links.json files (only if previous methods failed)
    devLog("Auto-discovering exams by scanning for _links.json files...");

    // Generate potential exam codes based on common patterns (only the ones that actually exist)
    const examPrefixes = ["CAD", "CSA", "CAS-PA"];
    const cisModules = [
      "APM",
      "CPG",
      "CSM",
      "Discovery",
      "EM",
      "FSM",
      "HAM",
      "HR",
      "ITSM",
      "PPM",
      "RC",
      "SAM",
      "SIR",
      "SM",
      "SPM",
      "VR",
      "VRM",
    ];

    // Add CIS- prefixed modules
    for (const module of cisModules) {
      examPrefixes.push(`CIS-${module}`);
    }

    const allPotentialCodes = [...examPrefixes];
    devLog("Checking potential codes:", allPotentialCodes);

    // Check for _links.json files to discover what exams are available
    const availableCodes = [];
    const checkPromises = allPotentialCodes.map(async (code) => {
      try {
        const linkResponse = await fetch(`data/${code}_links.json`, {
          method: "HEAD",
        });
        if (linkResponse.ok) {
          availableCodes.push(code);
          devLog(`Found _links.json for: ${code}`);
        }
      } catch (error) {
        // Ignore errors for non-existent files
      }
    });

    await Promise.all(checkPromises);
    devLog("Available codes with _links.json:", availableCodes);

    // Now check if corresponding .json files exist for discovered codes
    const examCheckPromises = availableCodes.map(async (examCode) => {
      try {
        const response = await fetch(`data/${examCode}.json`, {
          method: "HEAD",
        });
        if (response.ok) {
          discoveredExams[examCode] = examCode;
          devLog(`Confirmed exam file exists for: ${examCode}`);
        } else {
          devLog(
            `Exam file not found for: ${examCode} (status: ${response.status})`
          );
        }
      } catch (error) {
        devLog(`Failed to check exam file for: ${examCode}`, error);
      }
    });

    await Promise.all(examCheckPromises);

    availableExams = discoveredExams;
    devLog("Final discovered exams:", Object.keys(availableExams));

    return availableExams;
  } catch (error) {
    devError("Error discovering exams:", error);
    // Fallback: return empty object if discovery fails
    availableExams = {};
    return availableExams;
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", async function () {
  loadSettings();
  loadStatistics();
  setupEventListeners();

  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const savedSettings = localStorage.getItem("examViewerSettings");
      if (!savedSettings) {
        settings.darkMode = e.matches;
        document.getElementById("darkModeToggle").checked = e.matches;
        applyTheme(e.matches);
      }
    });
  }

  // Show loading message
  const examsList = document.getElementById("examsList");
  examsList.innerHTML =
    '<div class="loading-exams"><div class="spinner"></div><p>Discovering available exams...</p></div>';

  // Discover available exams first
  await discoverAvailableExams();
  await populateExamDropdown();
  await displayAvailableExams();

  // Auto-load exam if URL has hash
  const hash = window.location.hash.slice(1);
  if (hash && availableExams[hash.toUpperCase()]) {
    document.getElementById("examCode").value = hash.toUpperCase();
    loadExam(hash.toUpperCase());
  }
});

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem("examViewerSettings");
  if (savedSettings) {
    settings = { ...settings, ...JSON.parse(savedSettings) };
    document.getElementById("showDiscussionDefault").checked =
      settings.showDiscussionDefault;
    document.getElementById("highlightDefault").checked =
      settings.highlightDefault;
    document.getElementById("darkModeToggle").checked = settings.darkMode;
    isHighlightEnabled = settings.highlightDefault;
    applyTheme(settings.darkMode);
  } else {
    // If no saved settings, check system preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      settings.darkMode = true;
      document.getElementById("darkModeToggle").checked = true;
      applyTheme(true);
    }
  }
}

// Save settings to localStorage
function saveSettings() {
  settings.showDiscussionDefault = document.getElementById(
    "showDiscussionDefault"
  ).checked;
  settings.highlightDefault =
    document.getElementById("highlightDefault").checked;
  settings.darkMode = document.getElementById("darkModeToggle").checked;
  localStorage.setItem("examViewerSettings", JSON.stringify(settings));
  isHighlightEnabled = settings.highlightDefault;
  applyTheme(settings.darkMode);
}

// Apply dark/light theme
function applyTheme(isDark) {
  const body = document.body;
  const darkModeBtn = document.getElementById("darkModeBtn");
  const icon = darkModeBtn?.querySelector("i");

  if (isDark) {
    body.setAttribute("data-theme", "dark");
    if (icon) {
      icon.className = "fas fa-sun";
      darkModeBtn.title = "Switch to Light Mode";
    }
  } else {
    body.removeAttribute("data-theme");
    if (icon) {
      icon.className = "fas fa-moon";
      darkModeBtn.title = "Switch to Dark Mode";
    }
  }
}

// Populate exam dropdown with available exams
async function populateExamDropdown() {
  const examSelect = document.getElementById("examCode");

  // Clear existing options except the first one
  examSelect.innerHTML = '<option value="">Select an exam...</option>';

  // Get exam data with question counts
  const examOptions = [];

  const sortedExamCodes = Object.keys(availableExams).sort();
  for (const examCode of sortedExamCodes) {
    try {
      const response = await fetch(`data/${examCode}.json`);
      if (response.ok) {
        const data = await response.json();
        const questionCount = data.questions ? data.questions.length : 0;
        examOptions.push({
          code: examCode,
          questionCount: questionCount,
        });
      }
    } catch (error) {
      // If we can't load the file, still add it but without question count
      examOptions.push({
        code: examCode,
        questionCount: 0,
      });
    }
  }

  // Sort exams alphabetically by code
  examOptions.sort((a, b) => a.code.localeCompare(b.code));

  // Add options to select
  examOptions.forEach((exam) => {
    const option = document.createElement("option");
    option.value = exam.code;
    option.textContent =
      exam.questionCount > 0
        ? `${exam.code} (${exam.questionCount} questions)`
        : exam.code;
    examSelect.appendChild(option);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Exam selection
  document.getElementById("examCode").addEventListener("change", function (e) {
    const examCode = this.value.trim().toUpperCase();
    if (examCode) {
      loadExam(examCode);
    }
  });

  // Statistics
  document.getElementById("statisticsBtn").addEventListener("click", () => {
    displayStatistics();
  });

  document.getElementById("closeStatsModal").addEventListener("click", () => {
    document.getElementById("statisticsModal").style.display = "none";
  });

  // Statistics tabs
  document.querySelectorAll(".stats-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      showStatsTab(tab.dataset.tab);
    });
  });

  // Statistics actions
  document.getElementById("exportStatsBtn").addEventListener("click", () => {
    exportStatistics();
  });

  document.getElementById("resetStatsBtn").addEventListener("click", () => {
    resetAllStatistics();
  });

  // Settings
  document.getElementById("settingsBtn").addEventListener("click", () => {
    document.getElementById("settingsModal").style.display = "flex";
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("settingsModal").style.display = "none";
    saveSettings();
  });

  // Dark mode toggle
  document.getElementById("darkModeToggle").addEventListener("change", () => {
    saveSettings();
  });

  // Quick dark mode toggle button
  document.getElementById("darkModeBtn").addEventListener("click", () => {
    const currentMode = document.getElementById("darkModeToggle").checked;
    document.getElementById("darkModeToggle").checked = !currentMode;
    saveSettings();
  });

  // Navigation
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => navigateQuestion(-1));
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => navigateQuestion(1));
  document
    .getElementById("homeBtn")
    .addEventListener("click", () => goToHome());
  document
    .getElementById("randomBtn")
    .addEventListener("click", () => navigateToRandomQuestion());
  document
    .getElementById("jumpBtn")
    .addEventListener("click", () => jumpToQuestion());

  // Answer controls
  document
    .getElementById("validateBtn")
    .addEventListener("click", validateAnswers);
  document.getElementById("resetBtn").addEventListener("click", resetAnswers);
  document
    .getElementById("highlightBtn")
    .addEventListener("click", toggleHighlight);

  // Discussion
  document
    .getElementById("discussionToggle")
    .addEventListener("click", toggleDiscussion);

  // Export
  document.getElementById("exportBtn").addEventListener("click", exportToPDF);
}

// Display available exams
async function displayAvailableExams() {
  const examsList = document.getElementById("examsList");
  examsList.innerHTML = "";

  if (Object.keys(availableExams).length === 0) {
    examsList.innerHTML = "<p>No exams found in data folder</p>";
    return;
  }

  // Create cards for each available exam (sorted alphabetically)
  const sortedExamCodes = Object.keys(availableExams).sort();
  for (const code of sortedExamCodes) {
    const examCard = document.createElement("div");
    examCard.className = "exam-card";

    // Try to get question count
    let questionCount = "Loading...";
    try {
      const response = await fetch(`data/${code}.json`);
      if (response.ok) {
        const data = await response.json();
        questionCount = `${data.questions?.length || 0} questions`;
      } else {
        questionCount = "Click to load";
      }
    } catch (error) {
      questionCount = "Click to load";
    }

    examCard.innerHTML = `
            <div class="exam-code">${code}</div>
            <div class="exam-count">${questionCount}</div>
        `;

    examCard.addEventListener("click", () => {
      document.getElementById("examCode").value = code;
      loadExam(code);
    });

    examsList.appendChild(examCard);
  }
}

// Load exam data
async function loadExam(examCode) {
  if (!availableExams[examCode]) {
    showError(
      `Exam code "${examCode}" not found. Available exams: ${Object.keys(
        availableExams
      ).join(", ")}`
    );
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`data/${examCode}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load exam data: ${response.status}`);
    }

    const data = await response.json();
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid exam data format");
    }

    // Store the complete exam data object
    currentExam = {
      exam_name: data.exam_name || examCode,
      questions: data.questions,
    };
    // Sort questions by question_number numerically with robust comparison
    currentQuestions = data.questions.sort((a, b) => {
      const numA = parseInt(a.question_number, 10);
      const numB = parseInt(b.question_number, 10);

      // Handle invalid numbers
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;

      return numA - numB;
    });
    currentQuestionIndex = 0;

    // Debug: Log first few questions to verify sorting
    devLog(
      "First 10 questions after sorting:",
      currentQuestions.slice(0, 10).map((q) => q.question_number)
    );
    devLog("Total questions loaded:", currentQuestions.length);

    // Start exam session for statistics
    startExamSession(examCode, currentExam.exam_name);

    // Update UI
    document.getElementById("availableExams").style.display = "none";
    document.getElementById("navigationSection").style.display = "block";
    document.getElementById("questionSection").style.display = "block";
    document.getElementById("exportBtn").style.display = "flex";
    document.getElementById("homeBtn").style.display = "inline-block";

    displayCurrentQuestion();

    // Update question jump field max value immediately and with delay
    updateQuestionJumpMaxValue();

    // Also try with a delay to ensure DOM is ready
    setTimeout(() => {
      updateQuestionJumpMaxValue();
      // Also make the test function available in console
      if (isDevelopmentMode()) {
        window.testQuestionJumpField = testQuestionJumpField;
        devLog(
          "💡 You can run 'testQuestionJumpField()' in console to check field state"
        );
      }
    }, 100);

    // And one more time with a longer delay
    setTimeout(() => {
      updateQuestionJumpMaxValue();
      devLog("🔄 Final attempt to update max value");
    }, 500);
    showSuccess(`Loaded ${currentQuestions.length} questions for ${examCode}`);
  } catch (error) {
    showError(`Error loading exam: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Show/hide loading
function showLoading(show) {
  document.getElementById("loadingSection").style.display = show
    ? "block"
    : "none";
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.style.display = "block";
  document.getElementById("successMessage").style.display = "none";
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById("successMessage");
  successEl.textContent = message;
  successEl.style.display = "block";
  document.getElementById("errorMessage").style.display = "none";

  setTimeout(() => {
    successEl.style.display = "none";
  }, 3000);
}

// Navigate to question
function navigateQuestion(direction) {
  if (!currentQuestions.length) return;

  const newIndex = currentQuestionIndex + direction;
  if (newIndex >= 0 && newIndex < currentQuestions.length) {
    currentQuestionIndex = newIndex;
    displayCurrentQuestion();
  }
}

// Navigate to random question
function navigateToRandomQuestion() {
  if (!currentQuestions.length) return;

  const randomIndex = Math.floor(Math.random() * currentQuestions.length);
  currentQuestionIndex = randomIndex;
  displayCurrentQuestion();
}

// Go to home page
function goToHome() {
  // End current session if exists
  endCurrentSession();

  // Reset exam state
  currentExam = null;
  currentQuestions = [];
  currentQuestionIndex = 0;
  selectedAnswers.clear();
  isValidated = false;
  questionStartTime = null;

  // Reset UI
  document.getElementById("examCode").value = "";
  document.getElementById("availableExams").style.display = "block";
  document.getElementById("navigationSection").style.display = "none";
  document.getElementById("questionSection").style.display = "none";
  document.getElementById("exportBtn").style.display = "none";
  document.getElementById("homeBtn").style.display = "none";

  // Reset question jump field max value
  updateQuestionJumpMaxValue();

  // Hide any messages
  document.getElementById("errorMessage").style.display = "none";
  document.getElementById("successMessage").style.display = "none";

  // Show success message
  showSuccess("Returned to home page");
}

// Jump to specific question
function jumpToQuestion() {
  const questionNumber = parseInt(
    document.getElementById("questionJump").value
  );

  // Find the question by its question_number field
  const questionIndex = currentQuestions.findIndex(
    (q) => parseInt(q.question_number) === questionNumber
  );

  if (questionIndex !== -1) {
    currentQuestionIndex = questionIndex;
    displayCurrentQuestion();
    document.getElementById("questionJump").value = "";
  } else {
    showError(`Question ${questionNumber} not found`);
  }
}

// Update question jump field max value
function updateQuestionJumpMaxValue() {
  const questionJumpField = document.getElementById("questionJump");
  if (currentQuestions.length > 0) {
    // Find the highest question number in the current exam
    const maxQuestionNumber = Math.max(
      ...currentQuestions.map((q) => parseInt(q.question_number) || 0)
    );

    devLog(`🔍 DEBUG: About to update max value to: ${maxQuestionNumber}`);
    devLog(`🔍 DEBUG: Current questions count: ${currentQuestions.length}`);
    devLog(
      `🔍 DEBUG: Question numbers: ${currentQuestions
        .slice(0, 5)
        .map((q) => q.question_number)
        .join(", ")}...`
    );

    // Force update with multiple methods to ensure it works
    questionJumpField.setAttribute("max", maxQuestionNumber);
    questionJumpField.max = maxQuestionNumber;

    // Also update the step attribute to ensure proper spinner behavior
    questionJumpField.setAttribute("step", "1");

    // Force a refresh of the element
    questionJumpField.style.display = "none";
    questionJumpField.offsetHeight; // trigger reflow
    questionJumpField.style.display = "";

    devLog(`✅ Updated question jump max value to: ${maxQuestionNumber}`);
    devLog(
      `✅ Current max attribute: ${questionJumpField.getAttribute("max")}`
    );
    devLog(`✅ Current max property: ${questionJumpField.max}`);
    devLog(
      `✅ Current min attribute: ${questionJumpField.getAttribute("min")}`
    );
    devLog(
      `✅ Current step attribute: ${questionJumpField.getAttribute("step")}`
    );
  } else {
    // Reset to default when no questions are loaded
    questionJumpField.setAttribute("max", "1");
    questionJumpField.max = "1";
    devLog("🔄 Reset question jump max value to: 1");
  }
}

// Test function to check field state (for debugging)
function testQuestionJumpField() {
  const field = document.getElementById("questionJump");
  devLog("=== QUESTION JUMP FIELD TEST ===");
  devLog(`Max attribute: ${field.getAttribute("max")}`);
  devLog(`Max property: ${field.max}`);
  devLog(`Min attribute: ${field.getAttribute("min")}`);
  devLog(`Min property: ${field.min}`);
  devLog(`Step attribute: ${field.getAttribute("step")}`);
  devLog(`Step property: ${field.step}`);
  devLog(`Value: ${field.value}`);
  devLog(`Type: ${field.type}`);
  devLog("============================");
}

// Display current question
function displayCurrentQuestion() {
  if (!currentQuestions.length) return;

  const question = currentQuestions[currentQuestionIndex];

  // Reset state
  selectedAnswers.clear();
  isValidated = false;
  questionStartTime = new Date(); // Start timing the question

  // Update navigation
  const currentQuestionNumber =
    question.question_number || currentQuestionIndex + 1;
  document.getElementById("questionCounter").textContent = `${
    currentQuestionIndex + 1
  } of ${currentQuestions.length} questions`;
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;
  document.getElementById("nextBtn").disabled =
    currentQuestionIndex === currentQuestions.length - 1;

  // Update question
  document.getElementById("questionTitle").textContent = `Question ${
    question.question_number || currentQuestionIndex + 1
  }`;
  document.getElementById("examTopicsLink").href = question.link || "#";

  // Fix image paths to point to ExamTopics.com
  let questionText = question.question || "";
  const originalText = questionText;
  questionText = questionText.replace(
    /src="\/assets\/media\/exam-media\//g,
    'src="https://www.examtopics.com/assets/media/exam-media/'
  );

  // Debug log to confirm the fix is working
  if (originalText !== questionText) {
    devLog(
      "🔧 Image path fixed:",
      originalText.length,
      "→",
      questionText.length
    );
  }

  document.getElementById("questionText").innerHTML = questionText;

  // Display answers
  displayAnswers(question);

  // Reset controls
  document.getElementById("validateBtn").style.display = "inline-flex";
  document.getElementById("resetBtn").style.display = "none";

  // Update discussion
  const showDiscussion = settings.showDiscussionDefault;
  const discussionContent = document.getElementById("discussionContent");
  const discussionToggle = document.getElementById("discussionToggle");

  discussionContent.style.display = showDiscussion ? "block" : "none";
  discussionToggle.innerHTML = `<i class="fas fa-comments"></i> ${
    showDiscussion ? "Hide" : "Show"
  } Discussion`;

  if (showDiscussion) {
    displayDiscussion(question);
  }

  updateInstructions();

  // Ensure question jump field max value is always up to date
  updateQuestionJumpMaxValue();
}

// Display answers
function displayAnswers(question) {
  const answers = question.answers || [];
  const mostVoted = question.most_voted || "";
  const correctAnswers = new Set(mostVoted.split(""));

  const answersList = document.getElementById("answersList");
  answersList.innerHTML = "";

  answers.forEach((answer) => {
    const answerLetter = answer.charAt(0);
    let answerText = answer.substring(3);

    // Fix image paths in answers too (just in case)
    answerText = answerText.replace(
      /src="\/assets\/media\/exam-media\//g,
      'src="https://www.examtopics.com/assets/media/exam-media/'
    );

    const answerElement = document.createElement("div");
    answerElement.className = "answer-option";
    answerElement.innerHTML = `<span class="answer-letter">${answerLetter}.</span> ${answerText}`;

    answerElement.addEventListener("click", () => {
      if (!isValidated) {
        toggleAnswerSelection(answerLetter, answerElement);
      }
    });

    if (isHighlightEnabled && correctAnswers.has(answerLetter)) {
      answerElement.classList.add("correct-not-selected");
    }

    answersList.appendChild(answerElement);
  });
}

// Toggle answer selection
function toggleAnswerSelection(letter, element) {
  if (selectedAnswers.has(letter)) {
    selectedAnswers.delete(letter);
    element.classList.remove("selected");
  } else {
    selectedAnswers.add(letter);
    element.classList.add("selected");
  }
  updateInstructions();
}

// Update instructions
function updateInstructions() {
  const instructions = document.getElementById("answerInstructions");
  const selectedCount = selectedAnswers.size;

  if (selectedCount === 0) {
    instructions.className = "answer-instructions";
    instructions.innerHTML =
      '<i class="fas fa-info-circle"></i><span>Click on the answers to select them</span>';
  } else {
    instructions.className = "answer-instructions success";
    const selectedLetters = Array.from(selectedAnswers).sort();
    instructions.innerHTML = `<i class="fas fa-check-circle"></i><span>Selected: ${selectedLetters.join(
      ", "
    )}</span>`;
  }
}

// Validate answers
function validateAnswers() {
  if (selectedAnswers.size === 0) {
    showError("Please select at least one answer");
    return;
  }

  const question = currentQuestions[currentQuestionIndex];
  const mostVoted = question.most_voted || "";
  const correctAnswers = new Set(mostVoted.split(""));

  isValidated = true;

  // Update answer elements
  const answerElements = document.querySelectorAll(".answer-option");
  answerElements.forEach((element) => {
    const letter = element
      .querySelector(".answer-letter")
      .textContent.charAt(0);
    const isSelected = selectedAnswers.has(letter);
    const isCorrect = correctAnswers.has(letter);

    element.classList.add("disabled");
    element.classList.remove("selected", "correct-not-selected");

    if (isSelected && isCorrect) {
      element.classList.add("correct");
    } else if (isSelected && !isCorrect) {
      element.classList.add("incorrect");
    } else if (!isSelected && isCorrect) {
      element.classList.add("correct-not-selected");
    }
  });

  // Calculate time spent on question
  const timeSpent = questionStartTime
    ? Math.floor((new Date() - questionStartTime) / 1000)
    : 0;

  // Calculate correct and incorrect selections for statistics
  const correctSelected = new Set(
    [...selectedAnswers].filter((x) => correctAnswers.has(x))
  );
  const incorrectSelected = new Set(
    [...selectedAnswers].filter((x) => !correctAnswers.has(x))
  );

  // Track the question attempt for statistics
  const isCorrect =
    correctSelected.size === correctAnswers.size &&
    incorrectSelected.size === 0;
  trackQuestionAttempt(
    question.question_number,
    question.question,
    Array.from(correctAnswers),
    question.most_voted,
    selectedAnswers,
    isCorrect,
    timeSpent
  );

  // Update controls
  document.getElementById("validateBtn").style.display = "none";
  document.getElementById("resetBtn").style.display = "inline-flex";

  showValidationResults(correctAnswers);
}

// Show validation results
function showValidationResults(correctAnswers) {
  const instructions = document.getElementById("answerInstructions");
  const correctSelected = new Set(
    [...selectedAnswers].filter((x) => correctAnswers.has(x))
  );
  const incorrectSelected = new Set(
    [...selectedAnswers].filter((x) => !correctAnswers.has(x))
  );

  if (
    correctSelected.size === correctAnswers.size &&
    incorrectSelected.size === 0
  ) {
    instructions.className = "answer-instructions success";
    instructions.innerHTML =
      '<i class="fas fa-check-circle"></i><span>Perfect! All correct answers selected.</span>';
  } else if (correctSelected.size > 0) {
    instructions.className = "answer-instructions warning";
    instructions.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Partially correct: ${correctSelected.size}/${correctAnswers.size}</span>`;
  } else {
    instructions.className = "answer-instructions error";
    instructions.innerHTML =
      '<i class="fas fa-times-circle"></i><span>Incorrect answers selected.</span>';
  }
}

// Reset answers
function resetAnswers() {
  selectedAnswers.clear();
  isValidated = false;

  const answerElements = document.querySelectorAll(".answer-option");
  answerElements.forEach((element) => {
    element.className = "answer-option";
  });

  document.getElementById("validateBtn").style.display = "inline-flex";
  document.getElementById("resetBtn").style.display = "none";

  updateInstructions();
}

// Toggle highlight
function toggleHighlight() {
  isHighlightEnabled = !isHighlightEnabled;
  if (currentQuestions.length > 0) {
    displayCurrentQuestion();
  }
}

// Toggle discussion
function toggleDiscussion() {
  const content = document.getElementById("discussionContent");
  const toggle = document.getElementById("discussionToggle");
  const isVisible = content.style.display === "block";

  if (isVisible) {
    content.style.display = "none";
    toggle.innerHTML = '<i class="fas fa-comments"></i> Show Discussion';
  } else {
    content.style.display = "block";
    toggle.innerHTML = '<i class="fas fa-comments"></i> Hide Discussion';
    displayDiscussion(currentQuestions[currentQuestionIndex]);
  }
}

// Convert URLs to clickable links
function convertUrlsToLinks(text) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// Convert text to HTML with line breaks and links
function formatCommentText(text) {
  if (!text) return "";

  // Convert line breaks to <br> tags
  let formattedText = text.replace(/\n/g, "<br>");

  // Convert URLs to clickable links
  formattedText = convertUrlsToLinks(formattedText);

  return formattedText;
}

// Display discussion
function displayDiscussion(question) {
  const comments = question.comments || [];
  const discussionList = document.getElementById("discussionList");

  discussionList.innerHTML = "";

  if (comments.length === 0) {
    discussionList.innerHTML = "<p>No discussion available.</p>";
    return;
  }

  comments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.className = "discussion-comment";
    commentElement.innerHTML = `
            <div class="comment-header">
                <span>Selected: ${comment.selected_answer || "N/A"}</span>
            </div>
            <div class="comment-text">${formatCommentText(
              comment.content || comment.comment || ""
            )}</div>
        `;
    discussionList.appendChild(commentElement);
  });
}

// Export questions to PDF
function exportToPDF() {
  if (!currentQuestions.length) {
    showError("No questions loaded to export");
    return;
  }

  // Create a printable version
  const printWindow = window.open("", "_blank");
  const printDocument = printWindow.document;

  printDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentExam.exam_name} - Questions Export</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .question { margin-bottom: 30px; page-break-inside: avoid; }
                .question-header { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
                .question-text { margin-bottom: 15px; }
                .question-text img { max-width: 100%; height: auto; margin: 10px 0; border: 1px solid #ddd; }
                .answers { margin-left: 20px; }
                .answer { margin-bottom: 5px; }
                .answer img { max-width: 100%; height: auto; margin: 5px 0; }
                .correct-answer { background-color: #d4edda; padding: 2px 5px; border-radius: 3px; }
                .discussion { margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
                .comment { margin-bottom: 10px; padding: 8px; background-color: white; border-radius: 3px; }
                .comment-header { font-weight: bold; font-size: 12px; color: #666; }
                .comment a { color: #007bff; text-decoration: none; word-break: break-all; }
                .comment a:hover { text-decoration: underline; }
                @media print {
                    body { margin: 0; }
                    .question { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <h1>Exam Questions - ${currentExam.exam_name}</h1>
            <p>Total Questions: ${currentQuestions.length}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <hr>
    `);

  currentQuestions.forEach((question, index) => {
    const questionNumber = question.question_number || index + 1;

    // Fix image paths for PDF export too
    let questionText = question.question || "";
    questionText = questionText.replace(
      /src="\/assets\/media\/exam-media\//g,
      'src="https://www.examtopics.com/assets/media/exam-media/'
    );

    const answers = question.answers || [];
    const mostVoted = question.most_voted || "";
    const correctAnswers = new Set(mostVoted.split(""));
    const comments = question.comments || [];

    printDocument.write(`
            <div class="question">
                <div class="question-header">Question ${questionNumber}</div>
                <div class="question-text">${questionText}</div>
                <div class="answers">
        `);

    answers.forEach((answer) => {
      const answerLetter = answer.charAt(0);
      let answerText = answer.substring(3);

      // Fix image paths in answers for PDF export too
      answerText = answerText.replace(
        /src="\/assets\/media\/exam-media\//g,
        'src="https://www.examtopics.com/assets/media/exam-media/'
      );

      const isCorrect = correctAnswers.has(answerLetter);
      const fullAnswer = answerLetter + ". " + answerText;

      printDocument.write(`
                <div class="answer ${isCorrect ? "correct-answer" : ""}">
                    ${fullAnswer} ${isCorrect ? "✓" : ""}
                </div>
            `);
    });

    printDocument.write("</div>");

    if (mostVoted) {
      printDocument.write(`
                <div style="margin-top: 10px; font-weight: bold; color: #28a745;">
                    Most Voted Answer(s): ${mostVoted}
                </div>
            `);
    }

    if (comments.length > 0) {
      printDocument.write(`
                <div class="discussion">
                    <strong>Discussion:</strong>
            `);

      comments.slice(0, 5).forEach((comment) => {
        printDocument.write(`
                     <div class="comment">
                         <div class="comment-header">Selected: ${
                           comment.selected_answer || "N/A"
                         }</div>
                         <div>${formatCommentText(
                           comment.content || comment.comment || ""
                         )}</div>
                     </div>
                 `);
      });

      printDocument.write("</div>");
    }

    printDocument.write("</div>");
  });

  printDocument.write(`
        </body>
        </html>
    `);

  printDocument.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 1000);

  showSuccess('Print dialog opened. Choose "Save as PDF" to export.');
}

// Toggle legal information display
function toggleLegalInfo() {
  devLog("toggleLegalInfo called"); // Debug log
  const legalInfo = document.getElementById("legal-info");
  if (!legalInfo) {
    devError("Legal info element not found");
    return;
  }

  if (legalInfo.style.display === "none" || legalInfo.style.display === "") {
    legalInfo.style.display = "block";
    devLog("Legal info shown");
  } else {
    legalInfo.style.display = "none";
    devLog("Legal info hidden");
  }
}

// Make function globally accessible
window.toggleLegalInfo = toggleLegalInfo;

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (currentQuestions.length === 0 || e.target.tagName === "INPUT") return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      navigateQuestion(-1);
      break;
    case "ArrowRight":
      e.preventDefault();
      navigateQuestion(1);
      break;
    case "r":
      e.preventDefault();
      navigateToRandomQuestion();
      break;
  }
});
