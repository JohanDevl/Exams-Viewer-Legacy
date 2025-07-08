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
    this.resetCount = 0; // Number of times the question was reset
    this.highlightAnswers = []; // Array of answers given when highlight mode was active
    this.highlightButtonClicks = 0; // Number of times highlight button was clicked on this question
    this.highlightViewCount = 0; // Number of times question was viewed with highlight already active
  }

  addAttempt(
    selectedAnswers,
    isCorrect,
    timeSpent,
    wasHighlightEnabled = false
  ) {
    const attempt = {
      answers: Array.from(selectedAnswers),
      isCorrect: isCorrect,
      timestamp: new Date().toISOString(),
      timeSpent: timeSpent,
      highlightEnabled: wasHighlightEnabled,
    };
    this.attempts.push(attempt);
    this.userAnswers = Array.from(selectedAnswers);
    this.isCorrect = isCorrect;
    this.timeSpent += timeSpent;
    this.endTime = new Date().toISOString();

    // Track highlight answers separately
    if (wasHighlightEnabled) {
      this.highlightAnswers.push({
        answers: Array.from(selectedAnswers),
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate final score based on correctness (only if highlight was not enabled)
    if (!wasHighlightEnabled) {
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

  addReset() {
    this.resetCount++;
  }

  addHighlightButtonClick() {
    this.highlightButtonClicks++;
  }

  addHighlightView() {
    this.highlightViewCount++;
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

      // Migrate existing sessions to include new properties
      statistics.sessions.forEach((session) => {
        // Ensure session has the new properties
        if (session.totalResets === undefined) {
          session.totalResets = 0;
        }
        if (session.totalHighlightAttempts === undefined) {
          session.totalHighlightAttempts = 0;
        }

        // Calculate values from questions if they exist
        if (session.questions) {
          let totalResets = 0;
          let totalHighlightAttempts = 0;

          session.questions.forEach((question) => {
            // Migrate old questions to have new properties
            if (question.highlightButtonClicks === undefined) {
              question.highlightButtonClicks = 0;
            }
            if (question.highlightViewCount === undefined) {
              question.highlightViewCount = 0;
            }

            totalResets += question.resetCount || 0;
            // Merge all highlight interactions
            const highlightValidations = question.highlightAnswers
              ? question.highlightAnswers.length
              : 0;
            const highlightClicks = question.highlightButtonClicks || 0;
            const highlightViews = question.highlightViewCount || 0;
            totalHighlightAttempts +=
              highlightValidations + highlightClicks + highlightViews;
          });

          session.totalResets = totalResets;
          session.totalHighlightAttempts = totalHighlightAttempts;
        }
      });

      // Recalculate total stats from sessions
      recalculateTotalStats();

      // Clean any corrupted statistics data
      cleanCorruptedStatistics();

      // Save the migrated statistics
      saveStatistics();

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
    totalResets: 0,
    totalHighlightAttempts: 0,
    examStats: {},
  };

  statistics.sessions.forEach((session) => {
    statistics.totalStats.totalQuestions += session.totalQuestions;
    statistics.totalStats.totalCorrect += session.correctAnswers;
    statistics.totalStats.totalIncorrect += session.incorrectAnswers;
    statistics.totalStats.totalTime += session.totalTime;

    // Calculate resets and highlight attempts from session questions
    if (session.questions) {
      session.questions.forEach((question) => {
        statistics.totalStats.totalResets += question.resetCount || 0;
        // Merge all highlight interactions
        const highlightValidations = question.highlightAnswers
          ? question.highlightAnswers.length
          : 0;
        const highlightClicks = question.highlightButtonClicks || 0;
        const highlightViews = question.highlightViewCount || 0;
        statistics.totalStats.totalHighlightAttempts +=
          highlightValidations + highlightClicks + highlightViews;
      });
    }

    // Per-exam stats
    if (!statistics.totalStats.examStats[session.examCode]) {
      statistics.totalStats.examStats[session.examCode] = {
        examName: session.examName,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
        totalResets: 0,
        totalHighlightAttempts: 0,
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

    // Add resets and highlight attempts to exam stats
    if (session.questions) {
      session.questions.forEach((question) => {
        examStats.totalResets += question.resetCount || 0;
        // Merge all highlight interactions
        const highlightValidations = question.highlightAnswers
          ? question.highlightAnswers.length
          : 0;
        const highlightClicks = question.highlightButtonClicks || 0;
        const highlightViews = question.highlightViewCount || 0;
        examStats.totalHighlightAttempts +=
          highlightValidations + highlightClicks + highlightViews;
      });
    }

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
  // Don't set totalQuestions here - it will be calculated dynamically based on actual attempts

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
  timeSpent,
  wasHighlightEnabled = false
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
  questionAttempt.addAttempt(
    selectedAnswers,
    isCorrect,
    timeSpent,
    wasHighlightEnabled
  );

  // Update session stats (only count non-highlight attempts)
  updateSessionStats();
  saveStatistics();

  devLog(
    "Tracked question attempt:",
    questionAttempt,
    "Highlight enabled:",
    wasHighlightEnabled
  );
}

// Update session statistics
function updateSessionStats() {
  if (!statistics.currentSession) return;

  let correct = 0;
  let incorrect = 0;
  let totalQuestions = 0;
  let totalResets = 0;
  let totalHighlightAttempts = 0;

  devLog("🔍 DEBUG: updateSessionStats() called");
  devLog(
    "🔍 DEBUG: Current session questions:",
    statistics.currentSession.questions.length
  );

  statistics.currentSession.questions.forEach((question) => {
    // Only count questions that have non-highlight attempts
    const hasNonHighlightAttempts = question.attempts.some(
      (attempt) => !attempt.highlightEnabled
    );

    devLog(`🔍 DEBUG: Question ${question.questionNumber}:`, {
      hasNonHighlightAttempts,
      isCorrect: question.isCorrect,
      attempts: question.attempts.length,
      attemptsDetails: question.attempts.map((a) => ({
        isCorrect: a.isCorrect,
        highlightEnabled: a.highlightEnabled,
      })),
    });

    if (hasNonHighlightAttempts) {
      totalQuestions++;
      if (question.isCorrect) {
        correct++;
      } else {
        incorrect++;
      }
    }

    // Count resets and highlight attempts for all questions
    totalResets += question.resetCount || 0;
    // Merge all highlight interactions
    const highlightValidations = question.highlightAnswers
      ? question.highlightAnswers.length
      : 0;
    const highlightClicks = question.highlightButtonClicks || 0;
    const highlightViews = question.highlightViewCount || 0;
    totalHighlightAttempts +=
      highlightValidations + highlightClicks + highlightViews;
  });

  devLog("🔍 DEBUG: Final stats:", {
    totalQuestions,
    correct,
    incorrect,
    totalResets,
    totalHighlightAttempts,
  });

  statistics.currentSession.correctAnswers = correct;
  statistics.currentSession.incorrectAnswers = incorrect;
  statistics.currentSession.totalQuestions = totalQuestions;
  statistics.currentSession.totalResets = totalResets;
  statistics.currentSession.totalHighlightAttempts = totalHighlightAttempts;
}

// Reset all statistics
function resetAllStatistics() {
  if (
    confirm(
      "Are you sure you want to reset all statistics? This action cannot be undone."
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
    showSuccess("Statistics reset successfully");

    // Refresh statistics display if open
    if (document.getElementById("statisticsModal").style.display === "flex") {
      displayStatistics();
    }
  }
}

// Clean corrupted statistics data
function cleanCorruptedStatistics() {
  devLog("🧹 Cleaning corrupted statistics data...");

  // Check if there are sessions with incorrect totalQuestions
  let hasCorruptedData = false;

  statistics.sessions.forEach((session, index) => {
    // Check if totalQuestions is way higher than actual attempted questions
    const actualQuestions = session.questions
      ? session.questions.filter(
          (q) => q.attempts && q.attempts.some((a) => !a.highlightEnabled)
        ).length
      : 0;

    if (session.totalQuestions > actualQuestions * 10) {
      // Threshold for corruption
      devLog(
        `🧹 Found corrupted session ${index}: totalQuestions=${session.totalQuestions}, actualQuestions=${actualQuestions}`
      );
      hasCorruptedData = true;
    }
  });

  if (hasCorruptedData) {
    devLog("🧹 Recalculating all session statistics...");

    // Recalculate all session statistics
    statistics.sessions.forEach((session) => {
      if (session.questions) {
        let correct = 0;
        let incorrect = 0;
        let totalQuestions = 0;
        let totalResets = 0;
        let totalHighlightAttempts = 0;

        session.questions.forEach((question) => {
          // Only count questions that have non-highlight attempts
          const hasNonHighlightAttempts =
            question.attempts &&
            question.attempts.some((attempt) => !attempt.highlightEnabled);

          if (hasNonHighlightAttempts) {
            totalQuestions++;
            if (question.isCorrect) {
              correct++;
            } else {
              incorrect++;
            }
          }

          // Count resets and highlight attempts for all questions
          totalResets += question.resetCount || 0;
          // Merge all highlight interactions
          const highlightValidations = question.highlightAnswers
            ? question.highlightAnswers.length
            : 0;
          const highlightClicks = question.highlightButtonClicks || 0;
          const highlightViews = question.highlightViewCount || 0;
          totalHighlightAttempts +=
            highlightValidations + highlightClicks + highlightViews;
        });

        session.correctAnswers = correct;
        session.incorrectAnswers = incorrect;
        session.totalQuestions = totalQuestions;
        session.totalResets = totalResets;
        session.totalHighlightAttempts = totalHighlightAttempts;
      }
    });

    // Recalculate total stats
    recalculateTotalStats();
    saveStatistics();

    devLog("🧹 Statistics cleaning completed");
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
  document.getElementById("totalResets").textContent =
    totalStats.totalResets || 0;
  document.getElementById("totalHighlightAttempts").textContent =
    totalStats.totalHighlightAttempts || 0;

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
          <h3>No exam statistics</h3>
          <p>Start answering questions to see your exam statistics.</p>
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
      ? new Date(stats.lastAttempt).toLocaleDateString("en-US")
      : "Never";

    examItem.innerHTML = `
      <div class="exam-stat-info">
        <h4>${stats.examName || examCode}</h4>
        <div class="exam-stat-details">
          <span><i class="fas fa-question-circle"></i> ${
            stats.totalQuestions
          } questions</span>
          <span><i class="fas fa-check-circle"></i> ${
            stats.totalCorrect
          } correct</span>
          <span><i class="fas fa-times-circle"></i> ${
            stats.totalIncorrect
          } incorrect</span>
          <span><i class="fas fa-redo"></i> ${
            stats.totalResets || 0
          } resets</span>
          <span><i class="fas fa-lightbulb"></i> ${
            stats.totalHighlightAttempts || 0
          } previews</span>
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
        <div class="score-label">Average Score</div>
        <div style="margin-top: 0.5rem;">
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            Best: ${stats.bestScore}%
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
        <h3>No recorded sessions</h3>
        <p>Your exam sessions will appear here once you start answering questions.</p>
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
          "en-US"
        )} ${startDate.toLocaleTimeString("en-US")}</div>
      </div>
      <div class="session-stats">
        <div class="session-stat">
          <div class="session-stat-value">${session.totalQuestions}</div>
          <div class="session-stat-label">Questions</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${session.correctAnswers}</div>
          <div class="session-stat-label">Correct</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${session.incorrectAnswers}</div>
          <div class="session-stat-label">Incorrect</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${session.totalResets || 0}</div>
          <div class="session-stat-label">Resets</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${
            session.totalHighlightAttempts || 0
          }</div>
          <div class="session-stat-label">Previews</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${formatTime(session.totalTime)}</div>
          <div class="session-stat-label">Time</div>
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
    ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
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
  ctx.fillText(`Correct: ${totalStats.totalCorrect}`, 45, 32);

  ctx.fillStyle = "#dc3545";
  ctx.fillRect(20, 45, 15, 15);
  ctx.fillStyle = "#262730";
  ctx.fillText(`Incorrect: ${totalStats.totalIncorrect}`, 45, 57);
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
      "No progress data available",
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
  showSuccess("Statistics exported successfully");
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
function displayCurrentQuestion(fromToggleAction = false) {
  if (!currentQuestions.length) return;

  const question = currentQuestions[currentQuestionIndex];

  // Reset state
  selectedAnswers.clear();
  isValidated = false;
  questionStartTime = new Date(); // Start timing the question

  // Track highlight view if highlight is already enabled when viewing this question
  // But only if this is not from a toggle action (to avoid double counting)
  if (isHighlightEnabled && statistics.currentSession && !fromToggleAction) {
    const questionNumber = question.question_number;

    // Find existing question attempt or create new one
    let questionAttempt = statistics.currentSession.questions.find(
      (q) => q.questionNumber === questionNumber
    );

    if (!questionAttempt) {
      const mostVoted = question.most_voted || "";
      const correctAnswers = Array.from(new Set(mostVoted.split("")));
      questionAttempt = new QuestionAttempt(
        questionNumber,
        question.question,
        correctAnswers,
        question.most_voted
      );
      statistics.currentSession.questions.push(questionAttempt);
    }

    // Increment highlight view count
    questionAttempt.addHighlightView();
    saveStatistics();
    devLog("Question viewed with highlight active:", questionNumber);
  }

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

  // Update question statistics
  updateQuestionStatistics();

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

// Update question statistics display
function updateQuestionStatistics() {
  if (!statistics.currentSession || !currentQuestions.length) {
    document.getElementById("questionStats").style.display = "none";
    return;
  }

  const question = currentQuestions[currentQuestionIndex];
  const questionNumber = question.question_number;

  // Find the question attempt in statistics
  const questionAttempt = statistics.currentSession.questions.find(
    (q) => q.questionNumber === questionNumber
  );

  if (!questionAttempt) {
    document.getElementById("resetCount").textContent = "0";
    document.getElementById("highlightValidationsCount").textContent = "0";
    document.getElementById("questionStats").style.display = "none";
    return;
  }

  const resetCount = questionAttempt.resetCount || 0;
  const highlightValidationsCount = questionAttempt.highlightAnswers
    ? questionAttempt.highlightAnswers.length
    : 0;
  const highlightButtonClicksCount = questionAttempt.highlightButtonClicks || 0;
  const highlightViewsCount = questionAttempt.highlightViewCount || 0;

  // Merge all highlight interactions into one counter
  const totalHighlightInteractions =
    highlightValidationsCount +
    highlightButtonClicksCount +
    highlightViewsCount;

  document.getElementById("resetCount").textContent = resetCount;
  document.getElementById("highlightValidationsCount").textContent =
    totalHighlightInteractions;

  // Show stats only if there are any statistics to display
  if (resetCount > 0 || totalHighlightInteractions > 0) {
    document.getElementById("questionStats").style.display = "flex";
  } else {
    document.getElementById("questionStats").style.display = "none";
  }
}

// Update instructions
function updateInstructions() {
  const instructions = document.getElementById("answerInstructions");
  const selectedCount = selectedAnswers.size;
  const validateBtn = document.getElementById("validateBtn");

  if (isHighlightEnabled) {
    instructions.className = "answer-instructions warning";
    instructions.innerHTML =
      '<i class="fas fa-lightbulb"></i><span>Highlight mode is active - correct answers are shown. Disable highlight to validate your answers.</span>';
    // Hide reset button when highlight is active
    if (!isValidated) {
      document.getElementById("resetBtn").style.display = "none";
    }
  } else if (selectedCount === 0) {
    instructions.className = "answer-instructions";
    instructions.innerHTML =
      '<i class="fas fa-info-circle"></i><span>Click on the answers to select them</span>';
    // Hide reset button when no answers are selected and not validated
    if (!isValidated) {
      document.getElementById("resetBtn").style.display = "none";
    }
  } else {
    instructions.className = "answer-instructions success";
    const selectedLetters = Array.from(selectedAnswers).sort();
    instructions.innerHTML = `<i class="fas fa-check-circle"></i><span>Selected: ${selectedLetters.join(
      ", "
    )}</span>`;
    // Only show reset button after validation, not just when answers are selected
    if (!isValidated) {
      document.getElementById("resetBtn").style.display = "none";
    }
  }

  // Disable validate button when highlight is active
  if (isHighlightEnabled) {
    validateBtn.disabled = true;
    validateBtn.style.opacity = "0.5";
    validateBtn.style.cursor = "not-allowed";
    validateBtn.title = "Disable highlight mode to validate answers";
  } else {
    validateBtn.disabled = false;
    validateBtn.style.opacity = "1";
    validateBtn.style.cursor = "pointer";
    validateBtn.title = "";
  }
}

// Validate answers
function validateAnswers() {
  devLog("🔍 validateAnswers() called");

  if (isHighlightEnabled) {
    showError("Please disable highlight mode before validating answers");
    return;
  }

  if (selectedAnswers.size === 0) {
    showError("Please select at least one answer");
    return;
  }

  const question = currentQuestions[currentQuestionIndex];
  const mostVoted = question.most_voted || "";
  const correctAnswers = new Set(mostVoted.split(""));

  devLog(
    "📝 Question:",
    question.question_number,
    "Most voted:",
    mostVoted,
    "Correct answers:",
    Array.from(correctAnswers)
  );
  devLog("👤 Selected answers:", Array.from(selectedAnswers));

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

  devLog(
    "📊 Tracking question attempt - isCorrect:",
    isCorrect,
    "highlight enabled:",
    isHighlightEnabled
  );

  try {
    trackQuestionAttempt(
      question.question_number,
      question.question,
      Array.from(correctAnswers),
      question.most_voted,
      selectedAnswers,
      isCorrect,
      timeSpent,
      isHighlightEnabled
    );
    devLog("📊 Question attempt tracked successfully");
  } catch (error) {
    devError("❌ Error tracking question attempt:", error);
  }

  // Update controls
  devLog("🔘 Hiding validate button and showing reset button");
  document.getElementById("validateBtn").style.display = "none";
  document.getElementById("resetBtn").style.display = "inline-flex";

  // Update question statistics display
  updateQuestionStatistics();

  showValidationResults(correctAnswers);
  devLog("✅ validateAnswers() completed successfully");
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

  // Track reset count for the current question
  if (statistics.currentSession) {
    const question = currentQuestions[currentQuestionIndex];
    const questionNumber = question.question_number;

    // Find existing question attempt or create new one
    let questionAttempt = statistics.currentSession.questions.find(
      (q) => q.questionNumber === questionNumber
    );

    if (!questionAttempt) {
      const mostVoted = question.most_voted || "";
      const correctAnswers = Array.from(new Set(mostVoted.split("")));
      questionAttempt = new QuestionAttempt(
        questionNumber,
        question.question,
        correctAnswers,
        question.most_voted
      );
      statistics.currentSession.questions.push(questionAttempt);
    }

    // Increment reset count
    questionAttempt.addReset();

    // If the question was already validated, remove the validation attempt
    if (isValidated && questionAttempt.attempts.length > 0) {
      // Remove the last attempt (the validated one)
      questionAttempt.attempts.pop();

      // Recalculate question state based on remaining attempts
      if (questionAttempt.attempts.length > 0) {
        const lastAttempt =
          questionAttempt.attempts[questionAttempt.attempts.length - 1];
        questionAttempt.isCorrect = lastAttempt.isCorrect;
        questionAttempt.userAnswers = lastAttempt.answers;
      } else {
        questionAttempt.isCorrect = false;
        questionAttempt.userAnswers = [];
        questionAttempt.finalScore = 0;
      }

      updateSessionStats();
      saveStatistics();
      devLog(
        "Reset question - removed validation attempt and incremented reset count:",
        questionNumber
      );
    } else {
      // Just save the reset count
      saveStatistics();
      devLog("Reset question - incremented reset count:", questionNumber);
    }
  }

  isValidated = false;

  const answerElements = document.querySelectorAll(".answer-option");
  answerElements.forEach((element) => {
    element.className = "answer-option";
  });

  document.getElementById("validateBtn").style.display = "inline-flex";
  document.getElementById("resetBtn").style.display = "none";

  // Update question statistics display
  updateQuestionStatistics();

  updateInstructions();
}

// Toggle highlight
function toggleHighlight() {
  const wasHighlightEnabled = isHighlightEnabled;
  isHighlightEnabled = !isHighlightEnabled;

  // Track highlight button click only when ACTIVATING highlight (not when deactivating)
  if (
    currentQuestions.length > 0 &&
    statistics.currentSession &&
    isHighlightEnabled
  ) {
    const question = currentQuestions[currentQuestionIndex];
    const questionNumber = question.question_number;

    // Find existing question attempt or create new one
    let questionAttempt = statistics.currentSession.questions.find(
      (q) => q.questionNumber === questionNumber
    );

    if (!questionAttempt) {
      const mostVoted = question.most_voted || "";
      const correctAnswers = Array.from(new Set(mostVoted.split("")));
      questionAttempt = new QuestionAttempt(
        questionNumber,
        question.question,
        correctAnswers,
        question.most_voted
      );
      statistics.currentSession.questions.push(questionAttempt);
    }

    // Increment highlight button click count only when activating
    questionAttempt.addHighlightButtonClick();
    saveStatistics();
    devLog("Highlight activated on question:", questionNumber);
  }

  if (currentQuestions.length > 0) {
    // Pass a flag to indicate this is from a toggle action to avoid double counting
    displayCurrentQuestion(true);
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
