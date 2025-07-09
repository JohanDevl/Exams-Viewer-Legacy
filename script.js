// Global state
let currentExam = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = new Set();
let isValidated = false;
let isHighlightEnabled = false;
let isHighlightTemporaryOverride = false; // Track if user manually toggled highlight
let questionStartTime = null; // Track when question was started
let settings = {
  showDiscussionDefault: false,
  highlightDefault: false,
  darkMode: false,
};

// Available exams mapping (will be populated dynamically)
let availableExams = {};

// Favorites and Notes system
let favoritesData = {
  favorites: {}, // { examCode: { questionNumber: { isFavorite: true, category: 'important', note: 'text', timestamp: timestamp } } }
  categories: ["important", "review", "difficult", "custom"], // Default categories
  customCategories: [], // User-defined categories
  isRevisionMode: false, // Track if we're in revision mode
  revisionFilter: {
    showFavorites: true,
    showCategories: [], // Categories to show in revision mode
    showNotes: true, // Show only questions with notes
  },
};

// Statistics system
let statistics = {
  sessions: [], // Array of session objects
  currentSession: null,
  totalStats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPreview: 0, // New field for preview answers
    totalTime: 0,
    examStats: {}, // Per-exam statistics
  },
};

// Session data structure
class ExamSession {
  constructor(examCode, examName) {
    this.id = this.generateCompactId(); // Use shorter session ID
    this.ec = examCode; // Exam code - shortened
    this.en = examName; // Exam name - shortened
    this.st = Date.now(); // Start time as timestamp - shortened
    this.et = null; // End time - shortened
    this.q = []; // Array of question attempts - shortened
    this.tq = 0; // Total questions - shortened
    this.ca = 0; // Correct answers - shortened
    this.ia = 0; // Incorrect answers - shortened
    this.pa = 0; // Preview answers - shortened
    this.tt = 0; // Total time in seconds - shortened
    this.c = false; // Completed flag - shortened
  }

  generateCompactId() {
    // Generate a very compact session ID
    const now = Date.now();
    const random = Math.random().toString(36).substr(2, 3);
    return `${now.toString(36)}${random}`;
  }

  // Backward compatibility getters for old property names
  get examCode() {
    return this.ec;
  }
  get examName() {
    return this.en;
  }
  get startTime() {
    return this.st;
  }
  get endTime() {
    return this.et;
  }
  get questions() {
    return this.q;
  }
  get totalQuestions() {
    return this.tq;
  }
  get correctAnswers() {
    return this.ca;
  }
  get incorrectAnswers() {
    return this.ia;
  }
  get previewAnswers() {
    return this.pa;
  }
  get totalTime() {
    return this.tt;
  }
  get completed() {
    return this.c;
  }

  // Backward compatibility setters
  set examCode(value) {
    this.ec = value;
  }
  set examName(value) {
    this.en = value;
  }
  set startTime(value) {
    this.st = value;
  }
  set endTime(value) {
    this.et = value;
  }
  set questions(value) {
    this.q = value;
  }
  set totalQuestions(value) {
    this.tq = value;
  }
  set correctAnswers(value) {
    this.ca = value;
  }
  set incorrectAnswers(value) {
    this.ia = value;
  }
  set previewAnswers(value) {
    this.pa = value;
  }
  set totalTime(value) {
    this.tt = value;
  }
  set completed(value) {
    this.c = value;
  }
}

// Question attempt data structure
class QuestionAttempt {
  constructor(questionNumber, correctAnswers) {
    this.qn = questionNumber; // Shortened property name
    this.ca = correctAnswers; // Array of correct answer letters - shortened
    this.ua = []; // Array of user selected answers - shortened
    this.att = []; // Array of attempt objects - shortened
    this.st = Date.now(); // Start time as timestamp (seconds since epoch) - shortened
    this.et = null; // End time - shortened
    this.ts = 0; // Time spent in seconds - shortened
    this.ic = false; // Is correct - shortened
    this.fs = 0; // Final score 0-100 percentage - shortened
    this.rc = 0; // Reset count - shortened
    this.hbc = 0; // Highlight button clicks - shortened
    this.hvc = 0; // Highlight view count - shortened
    this.fat = null; // First action type: 'c', 'i', 'p' (correct, incorrect, preview) - shortened
    this.far = false; // First action recorded flag - shortened
  }

  addAttempt(
    selectedAnswers,
    isCorrect,
    timeSpent,
    wasHighlightEnabled = false
  ) {
    const attempt = {
      a: Array.from(selectedAnswers), // answers - shortened
      c: isCorrect, // is correct - shortened
      h: wasHighlightEnabled, // highlight enabled - shortened
    };
    this.att.push(attempt);
    this.ua = Array.from(selectedAnswers);
    this.ic = isCorrect;
    this.ts += timeSpent;
    this.et = Date.now();

    // Track first action only
    if (!this.far) {
      if (wasHighlightEnabled) {
        this.fat = "p"; // preview
      } else {
        this.fat = isCorrect ? "c" : "i"; // correct or incorrect
      }
      this.far = true;
    }

    // Calculate final score based on correctness (only if highlight was not enabled)
    if (!wasHighlightEnabled) {
      if (isCorrect) {
        this.fs = 100;
      } else {
        // Partial credit based on correct answers selected
        const correctSelected = Array.from(selectedAnswers).filter((answer) =>
          this.ca.includes(answer)
        ).length;
        this.fs = Math.round((correctSelected / this.ca.length) * 100);
      }
    }
  }

  addHighlightButtonClick() {
    this.hbc++;

    // Track first action if this is the first interaction
    if (!this.far) {
      this.fat = "p"; // preview
      this.far = true;
    }
  }

  addReset() {
    this.rc++;
  }

  addHighlightView() {
    this.hvc++;

    // Track first action if this is the first interaction
    if (!this.far) {
      this.fat = "p"; // preview
      this.far = true;
    }
  }

  // Helper method to get total highlight interactions
  getTotalHighlightInteractions() {
    return this.hbc + this.hvc;
  }

  // Backward compatibility getters for old property names
  get questionNumber() {
    return this.qn;
  }
  get correctAnswers() {
    return this.ca;
  }
  get userAnswers() {
    return this.ua;
  }
  get attempts() {
    return this.att;
  }
  get startTime() {
    return this.st;
  }
  get endTime() {
    return this.et;
  }
  get timeSpent() {
    return this.ts;
  }
  get isCorrect() {
    return this.ic;
  }
  get finalScore() {
    return this.fs;
  }
  get resetCount() {
    return this.rc;
  }
  get highlightButtonClicks() {
    return this.hbc;
  }
  get highlightViewCount() {
    return this.hvc;
  }
  get firstActionType() {
    return this.fat;
  }
  get firstActionRecorded() {
    return this.far;
  }

  // Backward compatibility for highlightAnswers - now calculated from attempts
  get highlightAnswers() {
    return this.att
      .filter((a) => a.h)
      .map((a) => ({
        answers: a.a,
        timestamp: this.st, // Use question start time as fallback
      }));
  }
}

// Simple compression functions for localStorage
function compressData(data) {
  try {
    const jsonString = JSON.stringify(data);

    // Enhanced compression using character frequency replacement
    const compressionMap = {
      // Property names
      '"questionNumber"': '"qn"',
      '"correctAnswers"': '"ca"',
      '"userAnswers"': '"ua"',
      '"attempts"': '"att"',
      '"startTime"': '"st"',
      '"endTime"': '"et"',
      '"timeSpent"': '"ts"',
      '"isCorrect"': '"ic"',
      '"finalScore"': '"fs"',
      '"resetCount"': '"rc"',
      '"highlightButtonClicks"': '"hbc"',
      '"highlightViewCount"': '"hvc"',
      '"firstActionType"': '"fat"',
      '"firstActionRecorded"': '"far"',
      '"examCode"': '"ec"',
      '"examName"': '"en"',
      '"questions"': '"q"',
      '"totalQuestions"': '"tq"',
      '"incorrectAnswers"': '"ia"',
      '"previewAnswers"': '"pa"',
      '"totalTime"': '"tt"',
      '"completed"': '"c"',
      '"answers"': '"a"',
      '"timestamp"': '"t"',
      '"highlightEnabled"': '"h"',
      '"sessions"': '"s"',
      '"currentSession"': '"cs"',
      '"totalStats"': '"tst"',
      '"examStats"': '"es"',
      '"totalResets"': '"tr"',
      '"totalHighlightAttempts"': '"tha"',
      '"averageScore"': '"as"',
      '"bestScore"': '"bs"',
      '"lastAttempt"': '"la"',
      // Common values
      '"correct"': '"c"',
      '"incorrect"': '"i"',
      '"preview"': '"p"',
      // Common patterns
      ":true": ":1",
      ":false": ":0",
      ":null": ":n",
    };

    let compressed = jsonString;
    for (const [original, replacement] of Object.entries(compressionMap)) {
      compressed = compressed.replace(new RegExp(original, "g"), replacement);
    }

    return compressed;
  } catch (error) {
    devError("Error compressing data:", error);
    return JSON.stringify(data);
  }
}

function decompressData(compressedData) {
  try {
    // Reverse the compression mapping
    const decompressionMap = {
      // Property names
      '"qn"': '"questionNumber"',
      '"ca"': '"correctAnswers"',
      '"ua"': '"userAnswers"',
      '"att"': '"attempts"',
      '"st"': '"startTime"',
      '"et"': '"endTime"',
      '"ts"': '"timeSpent"',
      '"ic"': '"isCorrect"',
      '"fs"': '"finalScore"',
      '"rc"': '"resetCount"',
      '"hbc"': '"highlightButtonClicks"',
      '"hvc"': '"highlightViewCount"',
      '"fat"': '"firstActionType"',
      '"far"': '"firstActionRecorded"',
      '"ec"': '"examCode"',
      '"en"': '"examName"',
      '"q"': '"questions"',
      '"tq"': '"totalQuestions"',
      '"ia"': '"incorrectAnswers"',
      '"pa"': '"previewAnswers"',
      '"tt"': '"totalTime"',
      '"c"': '"completed"',
      '"a"': '"answers"',
      '"t"': '"timestamp"',
      '"h"': '"highlightEnabled"',
      '"s"': '"sessions"',
      '"cs"': '"currentSession"',
      '"tst"': '"totalStats"',
      '"es"': '"examStats"',
      '"tr"': '"totalResets"',
      '"tha"': '"totalHighlightAttempts"',
      '"as"': '"averageScore"',
      '"bs"': '"bestScore"',
      '"la"': '"lastAttempt"',
      // Common patterns
      ":1": ":true",
      ":0": ":false",
      ":n": ":null",
    };

    let decompressed = compressedData;
    for (const [compressed, original] of Object.entries(decompressionMap)) {
      decompressed = decompressed.replace(
        new RegExp(compressed, "g"),
        original
      );
    }

    return JSON.parse(decompressed);
  } catch (error) {
    devError("Error decompressing data:", error);
    // Try to parse as regular JSON if decompression fails
    return JSON.parse(compressedData);
  }
}

function saveStatistics() {
  try {
    const compressedData = compressData(statistics);
    localStorage.setItem("examViewerStatistics", compressedData);

    // Log compression ratio in development
    if (isDevelopmentMode()) {
      const originalSize = JSON.stringify(statistics).length;
      const compressedSize = compressedData.length;
      const ratio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(1);
      devLog(
        `Statistics saved - Original: ${originalSize} bytes, Compressed: ${compressedSize} bytes, Saved: ${ratio}%`
      );
    }
  } catch (error) {
    devError("Error saving statistics:", error);
  }
}

// Statistics storage management
function loadStatistics() {
  try {
    const savedStats = localStorage.getItem("examViewerStatistics");
    if (savedStats) {
      // Try to decompress first, fall back to regular JSON parsing
      let parsed;
      try {
        parsed = decompressData(savedStats);
      } catch (error) {
        devLog("Decompression failed, trying regular JSON parse:", error);
        parsed = JSON.parse(savedStats);
      }

      statistics = {
        sessions: parsed.sessions || [],
        currentSession: parsed.currentSession || null,
        totalStats: parsed.totalStats || {
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalPreview: 0,
          totalTime: 0,
          examStats: {},
        },
      };

      // Migrate existing sessions to new optimized format
      statistics.sessions.forEach((session) => {
        // Migrate session properties to new format
        if (session.examCode !== undefined && session.ec === undefined) {
          session.ec = session.examCode;
          session.en = session.examName;
          session.st = session.startTime
            ? typeof session.startTime === "string"
              ? new Date(session.startTime).getTime()
              : session.startTime
            : Date.now();
          session.et = session.endTime
            ? typeof session.endTime === "string"
              ? new Date(session.endTime).getTime()
              : session.endTime
            : null;
          session.q = session.questions || [];
          session.tq = session.totalQuestions || 0;
          session.ca = session.correctAnswers || 0;
          session.ia = session.incorrectAnswers || 0;
          session.pa = session.previewAnswers || 0;
          session.tt = session.totalTime || 0;
          session.c = session.completed || false;

          // Clean up old properties
          delete session.examCode;
          delete session.examName;
          delete session.startTime;
          delete session.endTime;
          delete session.questions;
          delete session.totalQuestions;
          delete session.correctAnswers;
          delete session.incorrectAnswers;
          delete session.previewAnswers;
          delete session.totalTime;
          delete session.completed;
        }

        // Ensure session has the new properties
        if (session.totalResets === undefined) {
          session.totalResets = 0;
        }
        if (session.totalHighlightAttempts === undefined) {
          session.totalHighlightAttempts = 0;
        }
        if (session.pa === undefined) {
          session.pa = 0;
        }

        // Migrate questions to new format
        if (session.q) {
          session.q.forEach((question) => {
            // Migrate question properties to new format
            if (
              question.questionNumber !== undefined &&
              question.qn === undefined
            ) {
              question.qn = question.questionNumber;
              question.ca = question.correctAnswers || [];
              question.ua = question.userAnswers || [];
              question.att = question.attempts || [];
              question.st = question.startTime
                ? typeof question.startTime === "string"
                  ? new Date(question.startTime).getTime()
                  : question.startTime
                : Date.now();
              question.et = question.endTime
                ? typeof question.endTime === "string"
                  ? new Date(question.endTime).getTime()
                  : question.endTime
                : null;
              question.ts = question.timeSpent || 0;
              question.ic = question.isCorrect || false;
              question.fs = question.finalScore || 0;
              question.rc = question.resetCount || 0;
              question.hbc = question.highlightButtonClicks || 0;
              question.hvc = question.highlightViewCount || 0;

              // Migrate first action type to new format
              if (question.firstActionType === "correct") question.fat = "c";
              else if (question.firstActionType === "incorrect")
                question.fat = "i";
              else if (question.firstActionType === "preview")
                question.fat = "p";
              else question.fat = null;

              question.far = question.firstActionRecorded || false;

              // Clean up old properties
              delete question.questionNumber;
              delete question.questionText;
              delete question.correctAnswers;
              delete question.mostVoted;
              delete question.userAnswers;
              delete question.attempts;
              delete question.startTime;
              delete question.endTime;
              delete question.timeSpent;
              delete question.isCorrect;
              delete question.finalScore;
              delete question.resetCount;
              delete question.highlightAnswers;
              delete question.highlightButtonClicks;
              delete question.highlightViewCount;
              delete question.firstActionType;
              delete question.firstActionRecorded;
            }

            // Migrate old questions to have new properties
            if (question.hbc === undefined) {
              question.hbc = 0;
            }
            if (question.hvc === undefined) {
              question.hvc = 0;
            }
            if (question.fat === undefined) {
              question.fat = null;
            }
            if (question.far === undefined) {
              question.far = false;

              // Try to determine first action from existing attempts
              if (question.att && question.att.length > 0) {
                const firstAttempt = question.att[0];
                if (firstAttempt.h || firstAttempt.highlightEnabled) {
                  question.fat = "p";
                } else {
                  question.fat =
                    firstAttempt.c || firstAttempt.isCorrect ? "c" : "i";
                }
                question.far = true;
              }
            }

            // Migrate attempts to new format
            if (question.att) {
              question.att.forEach((attempt) => {
                if (attempt.answers !== undefined && attempt.a === undefined) {
                  attempt.a = attempt.answers;
                  attempt.c = attempt.isCorrect;
                  attempt.h = attempt.highlightEnabled || false;

                  // Clean up old properties (including redundant timestamp and timeSpent)
                  delete attempt.answers;
                  delete attempt.isCorrect;
                  delete attempt.timestamp;
                  delete attempt.timeSpent;
                  delete attempt.highlightEnabled;
                }

                // Clean up redundant timestamp and timeSpent from optimized attempts
                if (attempt.t !== undefined) {
                  delete attempt.t;
                }
                if (attempt.ts !== undefined) {
                  delete attempt.ts;
                }
              });
            }
          });
        }
      });

      // Recalculate total stats from sessions
      recalculateTotalStats();

      // Clean any corrupted statistics data
      cleanCorruptedStatistics();

      // Save the migrated statistics
      saveStatistics();

      devLog("Statistics loaded and migrated from localStorage:", statistics);
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

function recalculateTotalStats() {
  statistics.totalStats = {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPreview: 0,
    totalTime: 0,
    totalResets: 0,
    totalHighlightAttempts: 0,
    examStats: {},
  };

  statistics.sessions.forEach((session) => {
    statistics.totalStats.totalQuestions +=
      session.tq || session.totalQuestions || 0;
    statistics.totalStats.totalCorrect +=
      session.ca || session.correctAnswers || 0;
    statistics.totalStats.totalIncorrect +=
      session.ia || session.incorrectAnswers || 0;
    statistics.totalStats.totalPreview +=
      session.pa || session.previewAnswers || 0;
    statistics.totalStats.totalTime += session.tt || session.totalTime || 0;

    // Calculate resets and highlight attempts from session questions
    const questions = session.q || session.questions || [];
    if (questions.length > 0) {
      questions.forEach((question) => {
        statistics.totalStats.totalResets +=
          question.rc || question.resetCount || 0;
        // Calculate total highlight interactions using new method or old way
        const highlightInteractions = question.getTotalHighlightInteractions
          ? question.getTotalHighlightInteractions()
          : (question.hbc || question.highlightButtonClicks || 0) +
            (question.hvc || question.highlightViewCount || 0) +
            (question.highlightAnswers ? question.highlightAnswers.length : 0);
        statistics.totalStats.totalHighlightAttempts += highlightInteractions;
      });
    }

    // Per-exam stats
    const examCode = session.ec || session.examCode;
    const examName = session.en || session.examName;
    if (!statistics.totalStats.examStats[examCode]) {
      statistics.totalStats.examStats[examCode] = {
        examName: examName,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalTime: 0,
        totalResets: 0,
        totalHighlightAttempts: 0,
        sessions: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttempt: null,
      };
    }

    const examStats = statistics.totalStats.examStats[examCode];
    examStats.totalQuestions += session.tq || session.totalQuestions || 0;
    examStats.totalCorrect += session.ca || session.correctAnswers || 0;
    examStats.totalIncorrect += session.ia || session.incorrectAnswers || 0;
    examStats.totalPreview += session.pa || session.previewAnswers || 0;
    examStats.totalTime += session.tt || session.totalTime || 0;
    examStats.sessions++;

    // Add resets and highlight attempts to exam stats
    if (questions.length > 0) {
      questions.forEach((question) => {
        examStats.totalResets += question.rc || question.resetCount || 0;
        // Calculate total highlight interactions using new method or old way
        const highlightInteractions = question.getTotalHighlightInteractions
          ? question.getTotalHighlightInteractions()
          : (question.hbc || question.highlightButtonClicks || 0) +
            (question.hvc || question.highlightViewCount || 0) +
            (question.highlightAnswers ? question.highlightAnswers.length : 0);
        examStats.totalHighlightAttempts += highlightInteractions;
      });
    }

    // Calculate scores (including all attempted questions: correct + incorrect + preview)
    const sessionCorrect = session.ca || session.correctAnswers || 0;
    const sessionIncorrect = session.ia || session.incorrectAnswers || 0;
    const sessionPreview = session.pa || session.previewAnswers || 0;
    const totalAttemptedQuestions =
      sessionCorrect + sessionIncorrect + sessionPreview;
    const sessionScore =
      totalAttemptedQuestions > 0
        ? Math.round((sessionCorrect / totalAttemptedQuestions) * 100)
        : 0;

    const examTotalAttempted =
      examStats.totalCorrect +
      examStats.totalIncorrect +
      examStats.totalPreview;
    examStats.averageScore =
      examTotalAttempted > 0
        ? Math.round((examStats.totalCorrect / examTotalAttempted) * 100)
        : 0;

    if (sessionScore > examStats.bestScore) {
      examStats.bestScore = sessionScore;
    }

    const sessionStartTime = session.st || session.startTime;
    const sessionStartTimeMs =
      typeof sessionStartTime === "string"
        ? new Date(sessionStartTime).getTime()
        : sessionStartTime;
    if (
      !examStats.lastAttempt ||
      sessionStartTimeMs >
        (typeof examStats.lastAttempt === "string"
          ? new Date(examStats.lastAttempt).getTime()
          : examStats.lastAttempt)
    ) {
      examStats.lastAttempt = sessionStartTime;
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
    statistics.currentSession.et = Date.now();
    statistics.currentSession.c = true;

    // Calculate total time
    statistics.currentSession.tt = Math.floor(
      (statistics.currentSession.et - statistics.currentSession.st) / 1000
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
  correctAnswers,
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
    questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
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
  let preview = 0;
  let totalQuestions = 0;
  let totalResets = 0;
  let totalHighlightAttempts = 0;

  devLog("🔍 DEBUG: updateSessionStats() called");
  devLog(
    "🔍 DEBUG: Current session questions:",
    (statistics.currentSession.q || statistics.currentSession.questions || [])
      .length
  );

  const questions =
    statistics.currentSession.q || statistics.currentSession.questions || [];
  questions.forEach((question) => {
    // Only count questions that have any first action recorded
    const firstActionRecorded =
      question.far !== undefined ? question.far : question.firstActionRecorded;

    // Declare firstActionType outside the if block so it's accessible in devLog
    const firstActionType = question.fat || question.firstActionType;

    if (firstActionRecorded) {
      totalQuestions++;

      // Count based on first action type only
      switch (firstActionType) {
        case "c":
        case "correct":
          correct++;
          break;
        case "i":
        case "incorrect":
          incorrect++;
          break;
        case "p":
        case "preview":
          preview++;
          break;
      }
    }

    const questionNumber = question.qn || question.questionNumber;
    const attempts = question.att || question.attempts || [];
    devLog(`🔍 DEBUG: Question ${questionNumber}:`, {
      firstActionRecorded: firstActionRecorded,
      firstActionType: firstActionType,
      attempts: attempts.length,
    });

    // Count resets and highlight attempts for all questions
    totalResets += question.rc || question.resetCount || 0;

    // Calculate total highlight interactions using new method or old way
    const highlightInteractions = question.getTotalHighlightInteractions
      ? question.getTotalHighlightInteractions()
      : (question.hbc || question.highlightButtonClicks || 0) +
        (question.hvc || question.highlightViewCount || 0) +
        (question.highlightAnswers ? question.highlightAnswers.length : 0);
    totalHighlightAttempts += highlightInteractions;
  });

  devLog("🔍 DEBUG: Final stats:", {
    totalQuestions,
    correct,
    incorrect,
    preview,
    totalResets,
    totalHighlightAttempts,
  });

  statistics.currentSession.ca = correct;
  statistics.currentSession.ia = incorrect;
  statistics.currentSession.pa = preview;
  statistics.currentSession.tq = totalQuestions;

  devLog("🔍 DEBUG: Session stats updated:", {
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    previewAnswers: preview,
    totalQuestions: totalQuestions,
  });
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
        totalPreview: 0,
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
    const questions = session.q || session.questions || [];
    const actualQuestions = questions.filter((q) => {
      const attempts = q.att || q.attempts || [];
      return attempts.some((a) => !(a.h || a.highlightEnabled));
    }).length;

    const totalQuestions = session.tq || session.totalQuestions || 0;
    if (totalQuestions > actualQuestions * 10) {
      // Threshold for corruption
      devLog(
        `🧹 Found corrupted session ${index}: totalQuestions=${totalQuestions}, actualQuestions=${actualQuestions}`
      );
      hasCorruptedData = true;
    }
  });

  if (hasCorruptedData) {
    devLog("🧹 Recalculating all session statistics...");

    // Recalculate all session statistics
    statistics.sessions.forEach((session) => {
      const questions = session.q || session.questions || [];
      if (questions.length > 0) {
        let correct = 0;
        let incorrect = 0;
        let preview = 0;
        let totalQuestions = 0;
        let totalResets = 0;
        let totalHighlightAttempts = 0;

        questions.forEach((question) => {
          // Only count questions that have any first action recorded
          const firstActionRecorded =
            question.far !== undefined
              ? question.far
              : question.firstActionRecorded;

          // Declare firstActionType outside the if block for consistency
          const firstActionType = question.fat || question.firstActionType;

          if (firstActionRecorded) {
            totalQuestions++;

            // Count based on first action type only
            switch (firstActionType) {
              case "c":
              case "correct":
                correct++;
                break;
              case "i":
              case "incorrect":
                incorrect++;
                break;
              case "p":
              case "preview":
                preview++;
                break;
            }
          }

          // Count resets and highlight attempts for all questions
          totalResets += question.rc || question.resetCount || 0;

          // Calculate total highlight interactions using new method or old way
          const highlightInteractions = question.getTotalHighlightInteractions
            ? question.getTotalHighlightInteractions()
            : (question.hbc || question.highlightButtonClicks || 0) +
              (question.hvc || question.highlightViewCount || 0) +
              (question.highlightAnswers
                ? question.highlightAnswers.length
                : 0);
          totalHighlightAttempts += highlightInteractions;
        });

        session.ca = correct;
        session.ia = incorrect;
        session.pa = preview;
        session.tq = totalQuestions;
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
  // Recalculate total stats to ensure they're up to date
  recalculateTotalStats();

  const totalStats = statistics.totalStats;

  devLog("🔍 DEBUG: updateOverviewTab() - totalStats:", totalStats);

  // Update stat cards
  document.getElementById("totalQuestions").textContent =
    totalStats.totalQuestions;
  document.getElementById("totalCorrect").textContent = totalStats.totalCorrect;
  document.getElementById("totalIncorrect").textContent =
    totalStats.totalIncorrect;
  document.getElementById("totalPreview").textContent =
    totalStats.totalPreview || 0;
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
          <span><i class="fas fa-eye"></i> ${
            stats.totalPreview || 0
          } preview</span>
          <span><i class="fas fa-redo"></i> ${
            stats.totalResets || 0
          } resets</span>
          <span><i class="fas fa-clock"></i> ${formatTime(
            stats.totalTime
          )}</span>
          <span><i class="fas fa-calendar"></i> ${lastAttemptDate}</span>
        </div>
        <div class="exam-stat-progress">
          ${createProgressBar(
            stats.totalCorrect,
            stats.totalIncorrect,
            stats.totalPreview || 0
          )}
        </div>
      </div>
      <div class="exam-stat-score">
        <div class="score-value">${stats.averageScore}%</div>
        <div class="score-label">Average Score</div>
        <div style="margin-top: 0.5rem;">
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
    (a, b) => (b.st || b.startTime) - (a.st || a.startTime)
  );

  sortedSessions.forEach((session) => {
    const sessionItem = document.createElement("div");
    sessionItem.className = "session-item";

    // Handle both old and new property names
    const startTime = session.st || session.startTime;
    const examName = session.en || session.examName;
    const examCode = session.ec || session.examCode;
    const totalQuestions = session.tq || session.totalQuestions || 0;
    const correctAnswers = session.ca || session.correctAnswers || 0;
    const incorrectAnswers = session.ia || session.incorrectAnswers || 0;
    const previewAnswers = session.pa || session.previewAnswers || 0;
    const totalTime = session.tt || session.totalTime || 0;
    const totalResets = session.totalResets || 0;

    const startDate = new Date(startTime);
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    sessionItem.innerHTML = `
      <div class="session-header">
        <div class="session-title">${examName || examCode}</div>
        <div class="session-date">${startDate.toLocaleDateString(
          "en-US"
        )} ${startDate.toLocaleTimeString("en-US")}</div>
      </div>
      <div class="session-stats">
        <div class="session-stat">
          <div class="session-stat-value">${totalQuestions}</div>
          <div class="session-stat-label">Questions</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${correctAnswers}</div>
          <div class="session-stat-label">Correct</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${incorrectAnswers}</div>
          <div class="session-stat-label">Incorrect</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${previewAnswers}</div>
          <div class="session-stat-label">Preview</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${totalResets}</div>
          <div class="session-stat-label">Resets</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${formatTime(totalTime)}</div>
          <div class="session-stat-label">Time</div>
        </div>
        <div class="session-stat">
          <div class="session-stat-value">${score}%</div>
          <div class="session-stat-label">Score</div>
        </div>
      </div>
      <div class="session-progress">
        ${createProgressBar(correctAnswers, incorrectAnswers, previewAnswers)}
      </div>
    `;

    sessionsList.appendChild(sessionItem);
  });
}

// Update progress tab
function updateProgressTab() {
  createProgressChart();
}

// Create progress bar with correct/incorrect/preview segments
function createProgressBar(correct, incorrect, preview) {
  const total = correct + incorrect + preview;

  if (total === 0) {
    return '<div class="exam-stat-progress-bar" style="width: 0%"></div>';
  }

  const correctPercent = (correct / total) * 100;
  const incorrectPercent = (incorrect / total) * 100;
  const previewPercent = (preview / total) * 100;

  return `
    <div class="multi-progress-bar">
      ${
        correct > 0
          ? `<div class="progress-segment correct" style="width: ${correctPercent}%" title="Correct: ${correct}"></div>`
          : ""
      }
      ${
        incorrect > 0
          ? `<div class="progress-segment incorrect" style="width: ${incorrectPercent}%" title="Incorrect: ${incorrect}"></div>`
          : ""
      }
      ${
        preview > 0
          ? `<div class="progress-segment preview" style="width: ${previewPercent}%" title="Preview: ${preview}"></div>`
          : ""
      }
    </div>
  `;
}

// Create overview chart (simple canvas-based chart)
function createOverviewChart() {
  const canvas = document.getElementById("overviewChart");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const totalStats = statistics.totalStats;
  const total =
    totalStats.totalCorrect +
    totalStats.totalIncorrect +
    totalStats.totalPreview;

  if (total === 0) {
    // Show empty state
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDarkMode ? "#ffffff" : "#6c757d";
    ctx.fillStyle = textColor;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
    return;
  }

  // Draw pie chart
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 60; // More space for legend

  const correctAngle = (totalStats.totalCorrect / total) * 2 * Math.PI;
  const incorrectAngle = (totalStats.totalIncorrect / total) * 2 * Math.PI;
  const previewAngle = (totalStats.totalPreview / total) * 2 * Math.PI;

  let currentAngle = 0;

  // Draw correct answers slice
  if (totalStats.totalCorrect > 0) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      currentAngle,
      currentAngle + correctAngle
    );
    ctx.closePath();
    ctx.fillStyle = "#28a745";
    ctx.fill();
    currentAngle += correctAngle;
  }

  // Draw incorrect answers slice
  if (totalStats.totalIncorrect > 0) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      currentAngle,
      currentAngle + incorrectAngle
    );
    ctx.closePath();
    ctx.fillStyle = "#dc3545";
    ctx.fill();
    currentAngle += incorrectAngle;
  }

  // Draw preview answers slice
  if (totalStats.totalPreview > 0) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      currentAngle,
      currentAngle + previewAngle
    );
    ctx.closePath();
    ctx.fillStyle = "#ffc107";
    ctx.fill();
  }

  // Draw legend positioned below the chart
  let legendX = centerX - 60;
  let legendY = centerY + radius + 40;
  ctx.font = "14px Arial";
  ctx.textAlign = "left";

  // Get text color based on current theme
  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#262730";

  // Draw legend items horizontally
  let currentX = legendX;

  if (totalStats.totalCorrect > 0) {
    ctx.fillStyle = "#28a745";
    ctx.fillRect(currentX, legendY, 15, 15);
    ctx.fillStyle = textColor;
    ctx.fillText(
      `Correct: ${totalStats.totalCorrect}`,
      currentX + 20,
      legendY + 12
    );
    currentX += 120;
  }

  if (totalStats.totalIncorrect > 0) {
    ctx.fillStyle = "#dc3545";
    ctx.fillRect(currentX, legendY, 15, 15);
    ctx.fillStyle = textColor;
    ctx.fillText(
      `Incorrect: ${totalStats.totalIncorrect}`,
      currentX + 20,
      legendY + 12
    );
    currentX += 120;
  }

  if (totalStats.totalPreview > 0) {
    ctx.fillStyle = "#ffc107";
    ctx.fillRect(currentX, legendY, 15, 15);
    ctx.fillStyle = textColor;
    ctx.fillText(
      `Preview: ${totalStats.totalPreview}`,
      currentX + 20,
      legendY + 12
    );
  }
}

// Create progress chart
function createProgressChart() {
  const canvas = document.getElementById("progressChart");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (statistics.sessions.length === 0) {
    // Show empty state
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDarkMode ? "#ffffff" : "#6c757d";
    ctx.fillStyle = textColor;
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
    (a, b) => (a.st || a.startTime) - (b.st || b.startTime)
  );

  // Calculate scores for each session
  const scores = sortedSessions.map((session) => {
    const totalQuestions = session.tq || session.totalQuestions || 0;
    const correctAnswers = session.ca || session.correctAnswers || 0;
    return totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
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
  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#6c757d";
  ctx.fillStyle = textColor;
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

// Favorites and Notes system functions
function saveFavorites() {
  try {
    localStorage.setItem("examViewerFavorites", JSON.stringify(favoritesData));
    devLog("Favorites saved to localStorage");
  } catch (error) {
    devError("Error saving favorites:", error);
  }
}

function loadFavorites() {
  try {
    const savedFavorites = localStorage.getItem("examViewerFavorites");
    if (savedFavorites) {
      const parsed = JSON.parse(savedFavorites);
      favoritesData = {
        favorites: parsed.favorites || {},
        categories: parsed.categories || [
          "important",
          "review",
          "difficult",
          "custom",
        ],
        customCategories: parsed.customCategories || [],
        isRevisionMode: parsed.isRevisionMode || false,
        revisionFilter: parsed.revisionFilter || {
          showFavorites: true,
          showCategories: [],
          showNotes: true,
        },
      };
      devLog("Favorites loaded from localStorage:", favoritesData);
    }
  } catch (error) {
    devError("Error loading favorites:", error);
    // Reset to default if corrupted
    favoritesData = {
      favorites: {},
      categories: ["important", "review", "difficult", "custom"],
      customCategories: [],
      isRevisionMode: false,
      revisionFilter: {
        showFavorites: true,
        showCategories: [],
        showNotes: true,
      },
    };
  }
}

function toggleQuestionFavorite(examCode, questionNumber) {
  if (!favoritesData.favorites[examCode]) {
    favoritesData.favorites[examCode] = {};
  }

  if (!favoritesData.favorites[examCode][questionNumber]) {
    favoritesData.favorites[examCode][questionNumber] = {
      isFavorite: true,
      category: null,
      note: "",
      timestamp: Date.now(),
    };
  } else {
    favoritesData.favorites[examCode][questionNumber].isFavorite =
      !favoritesData.favorites[examCode][questionNumber].isFavorite;
    favoritesData.favorites[examCode][questionNumber].timestamp = Date.now();
  }

  saveFavorites();
  updateFavoriteButton();
  devLog(`Toggled favorite for ${examCode} question ${questionNumber}`);
}

function setQuestionNote(examCode, questionNumber, note) {
  if (!favoritesData.favorites[examCode]) {
    favoritesData.favorites[examCode] = {};
  }

  if (!favoritesData.favorites[examCode][questionNumber]) {
    favoritesData.favorites[examCode][questionNumber] = {
      isFavorite: false,
      category: null,
      note: note,
      timestamp: Date.now(),
    };
  } else {
    favoritesData.favorites[examCode][questionNumber].note = note;
    favoritesData.favorites[examCode][questionNumber].timestamp = Date.now();
  }

  saveFavorites();
  devLog(`Set note for ${examCode} question ${questionNumber}: ${note}`);
}

function setQuestionCategory(examCode, questionNumber, category) {
  if (!favoritesData.favorites[examCode]) {
    favoritesData.favorites[examCode] = {};
  }

  if (!favoritesData.favorites[examCode][questionNumber]) {
    favoritesData.favorites[examCode][questionNumber] = {
      isFavorite: false,
      category: category,
      note: "",
      timestamp: Date.now(),
    };
  } else {
    favoritesData.favorites[examCode][questionNumber].category = category;
    favoritesData.favorites[examCode][questionNumber].timestamp = Date.now();
  }

  saveFavorites();
  devLog(
    `Set category for ${examCode} question ${questionNumber}: ${category}`
  );
}

function getQuestionData(examCode, questionNumber) {
  if (
    favoritesData.favorites[examCode] &&
    favoritesData.favorites[examCode][questionNumber]
  ) {
    return favoritesData.favorites[examCode][questionNumber];
  }
  return {
    isFavorite: false,
    category: null,
    note: "",
    timestamp: null,
  };
}

function addCustomCategory(categoryName) {
  if (categoryName && !favoritesData.customCategories.includes(categoryName)) {
    favoritesData.customCategories.push(categoryName);
    saveFavorites();
    devLog(`Added custom category: ${categoryName}`);
    return true;
  }
  return false;
}

function removeCustomCategory(categoryName) {
  const index = favoritesData.customCategories.indexOf(categoryName);
  if (index > -1) {
    favoritesData.customCategories.splice(index, 1);

    // Remove this category from all questions
    Object.keys(favoritesData.favorites).forEach((examCode) => {
      Object.keys(favoritesData.favorites[examCode]).forEach(
        (questionNumber) => {
          if (
            favoritesData.favorites[examCode][questionNumber].category ===
            categoryName
          ) {
            favoritesData.favorites[examCode][questionNumber].category = null;
          }
        }
      );
    });

    saveFavorites();
    devLog(`Removed custom category: ${categoryName}`);
    return true;
  }
  return false;
}

function getAllCategories() {
  return [...favoritesData.categories, ...favoritesData.customCategories];
}

function getFavoriteQuestions(examCode) {
  if (!favoritesData.favorites[examCode]) return [];

  return Object.keys(favoritesData.favorites[examCode])
    .filter(
      (questionNumber) =>
        favoritesData.favorites[examCode][questionNumber].isFavorite
    )
    .map((questionNumber) => parseInt(questionNumber))
    .sort((a, b) => a - b);
}

function getQuestionsWithNotes(examCode) {
  if (!favoritesData.favorites[examCode]) return [];

  return Object.keys(favoritesData.favorites[examCode])
    .filter(
      (questionNumber) =>
        favoritesData.favorites[examCode][questionNumber].note.trim() !== ""
    )
    .map((questionNumber) => parseInt(questionNumber))
    .sort((a, b) => a - b);
}

function getQuestionsByCategory(examCode, category) {
  if (!favoritesData.favorites[examCode]) return [];

  return Object.keys(favoritesData.favorites[examCode])
    .filter(
      (questionNumber) =>
        favoritesData.favorites[examCode][questionNumber].category === category
    )
    .map((questionNumber) => parseInt(questionNumber))
    .sort((a, b) => a - b);
}

function toggleRevisionMode() {
  favoritesData.isRevisionMode = !favoritesData.isRevisionMode;
  saveFavorites();

  if (currentExam && currentQuestions.length > 0) {
    if (favoritesData.isRevisionMode) {
      filterQuestionsForRevision();
    } else {
      // Reload the full exam - get exam code from current exam
      const examCode = Object.keys(availableExams).find(
        (code) =>
          availableExams[code] === currentExam.exam_name ||
          code === currentExam.exam_name
      );
      if (examCode) {
        loadExam(examCode);
      }
    }
  }

  updateFavoritesUI();
  devLog(
    `Revision mode ${favoritesData.isRevisionMode ? "enabled" : "disabled"}`
  );
}

function filterQuestionsForRevision() {
  if (!currentExam || !currentQuestions.length) return;

  const examCode = currentExam.exam_name || "UNKNOWN";
  const filteredQuestions = currentQuestions.filter((question) => {
    const questionData = getQuestionData(examCode, question.question_number);

    // Check if question matches revision filter criteria
    const matchesFavorites =
      favoritesData.revisionFilter.showFavorites && questionData.isFavorite;
    const matchesNotes =
      favoritesData.revisionFilter.showNotes && questionData.note.trim() !== "";
    const matchesCategory =
      favoritesData.revisionFilter.showCategories.length === 0 ||
      favoritesData.revisionFilter.showCategories.includes(
        questionData.category
      );

    return (matchesFavorites || matchesNotes) && matchesCategory;
  });

  if (filteredQuestions.length > 0) {
    currentQuestions = filteredQuestions;
    currentQuestionIndex = 0;
    displayCurrentQuestion();
    updateQuestionJumpMaxValue();
    showSuccess(`Revision mode: ${filteredQuestions.length} questions found`);
  } else {
    showError("No questions found matching revision criteria");
    favoritesData.isRevisionMode = false;
    saveFavorites();
    updateFavoritesUI();
  }
}

function exportFavorites() {
  const dataStr = JSON.stringify(favoritesData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `exam-favorites-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  showSuccess("Favorites exported successfully!");
}

// UI update functions for favorites system
function updateFavoritesUI() {
  if (!currentExam || !currentQuestions.length) return;

  const question = currentQuestions[currentQuestionIndex];
  const questionNumber = question.question_number;
  const examCode = currentExam.exam_name || "UNKNOWN";

  const questionData = getQuestionData(examCode, questionNumber);

  // Update favorite button
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    favoriteBtn.classList.toggle("active", questionData.isFavorite);
    favoriteBtn.innerHTML = questionData.isFavorite
      ? '<i class="fas fa-star"></i>'
      : '<i class="far fa-star"></i>';
  }

  // Update category select
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.value = questionData.category || "";
  }

  // Update note display
  const noteText = document.getElementById("noteTextarea");
  const noteBtn = document.getElementById("noteBtn");
  if (noteText && noteBtn) {
    noteText.value = questionData.note || "";
    noteBtn.classList.toggle("active", !!questionData.note);
  }

  // Update revision mode button
  const revisionModeBtn = document.getElementById("revisionModeBtn");
  if (revisionModeBtn) {
    revisionModeBtn.classList.toggle("active", favoritesData.isRevisionMode);
    revisionModeBtn.innerHTML = favoritesData.isRevisionMode
      ? '<i class="fas fa-book-open"></i> Exit Revision'
      : '<i class="fas fa-book"></i> Revision Mode';
  }
}

function updateCategoryModal() {
  const categoryList = document.getElementById("customCategoriesList");
  if (!categoryList) return;

  categoryList.innerHTML = "";

  favoritesData.customCategories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";
    categoryItem.innerHTML = `
      <span>${category}</span>
      <button class="delete-category-btn" data-category="${category}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    // Add delete event listener
    const deleteBtn = categoryItem.querySelector(".delete-category-btn");
    deleteBtn.addEventListener("click", () => {
      if (
        confirm(`Are you sure you want to delete the category "${category}"?`)
      ) {
        removeCustomCategory(category);
        updateCategoryModal();
        updateCategoryDropdown();
        showSuccess(`Category "${category}" deleted successfully`);
      }
    });

    categoryList.appendChild(categoryItem);
  });
}

function updateCategoryDropdown() {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  const currentValue = categorySelect.value;
  const categories = getAllCategories();

  categorySelect.innerHTML = '<option value="">Select category...</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Restore previous value if it still exists
  if (categories.includes(currentValue)) {
    categorySelect.value = currentValue;
  }
}

function setupFavoritesEventListeners() {
  // Favorite button
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
      if (!currentExam || !currentQuestions.length) return;

      const question = currentQuestions[currentQuestionIndex];
      const questionNumber = question.question_number;
      const examCode = currentExam.exam_name || "UNKNOWN";

      const wasToggled = toggleQuestionFavorite(examCode, questionNumber);
      updateFavoritesUI();

      if (wasToggled.isFavorite) {
        showSuccess("Question added to favorites");
      } else {
        showSuccess("Question removed from favorites");
      }
    });
  }

  // Category select
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      if (!currentExam || !currentQuestions.length) return;

      const question = currentQuestions[currentQuestionIndex];
      const questionNumber = question.question_number;
      const examCode = currentExam.exam_name || "UNKNOWN";
      const category = categorySelect.value;

      setQuestionCategory(examCode, questionNumber, category);
      updateFavoritesUI();

      if (category) {
        showSuccess(`Question categorized as "${category}"`);
      } else {
        showSuccess("Question category removed");
      }
    });
  }

  // Add custom category button
  const addCustomCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCustomCategoryBtn) {
    addCustomCategoryBtn.addEventListener("click", () => {
      document.getElementById("categoryModal").style.display = "flex";
      updateCategoryModal();
    });
  }

  // Note button
  const noteBtn = document.getElementById("noteBtn");
  if (noteBtn) {
    noteBtn.addEventListener("click", () => {
      const noteSection = document.getElementById("questionNote");
      if (noteSection) {
        const isVisible = noteSection.style.display !== "none";
        noteSection.style.display = isVisible ? "none" : "block";

        if (!isVisible) {
          document.getElementById("noteTextarea").focus();
        }
      }
    });
  }

  // Note save button
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener("click", () => {
      if (!currentExam || !currentQuestions.length) return;

      const question = currentQuestions[currentQuestionIndex];
      const questionNumber = question.question_number;
      const examCode = currentExam.exam_name || "UNKNOWN";
      const noteText = document.getElementById("noteTextarea").value.trim();

      setQuestionNote(examCode, questionNumber, noteText);
      document.getElementById("questionNote").style.display = "none";
      updateFavoritesUI();

      if (noteText) {
        showSuccess("Note saved successfully");
      } else {
        showSuccess("Note removed");
      }
    });
  }

  // Note cancel button
  const cancelNoteBtn = document.getElementById("cancelNoteBtn");
  if (cancelNoteBtn) {
    cancelNoteBtn.addEventListener("click", () => {
      document.getElementById("questionNote").style.display = "none";
      updateFavoritesUI(); // Restore original note text
    });
  }
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

  // Favorites and revision mode
  document
    .getElementById("revisionModeBtn")
    .addEventListener("click", toggleRevisionMode);

  // Category modal
  document
    .getElementById("closeCategoryModal")
    .addEventListener("click", () => {
      document.getElementById("categoryModal").style.display = "none";
    });

  document.getElementById("addNewCategoryBtn").addEventListener("click", () => {
    const input = document.getElementById("newCategoryInput");
    const categoryName = input.value.trim();
    if (categoryName) {
      if (addCustomCategory(categoryName)) {
        input.value = "";
        updateCategoryModal();
        showSuccess(`Category "${categoryName}" added successfully`);
      } else {
        showError(`Category "${categoryName}" already exists`);
      }
    }
  });

  document
    .getElementById("newCategoryInput")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("addNewCategoryBtn").click();
      }
    });
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

    // Initialize highlight state from settings
    isHighlightEnabled = settings.highlightDefault;
    isHighlightTemporaryOverride = false; // Reset override flag for new exam

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

    // Reset highlight override when navigating to a new question
    isHighlightTemporaryOverride = false;

    displayCurrentQuestion();
  }
}

// Navigate to random question
function navigateToRandomQuestion() {
  if (!currentQuestions.length) return;

  const randomIndex = Math.floor(Math.random() * currentQuestions.length);
  currentQuestionIndex = randomIndex;

  // Reset highlight override when navigating to a new question
  isHighlightTemporaryOverride = false;

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
  isHighlightEnabled = false;
  isHighlightTemporaryOverride = false; // Reset override flag
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

    // Reset highlight override when jumping to a new question
    isHighlightTemporaryOverride = false;

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

  // Reset highlight to default setting unless user has manually overridden it
  if (!isHighlightTemporaryOverride && !fromToggleAction) {
    isHighlightEnabled = settings.highlightDefault;
  }

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
      questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
      statistics.currentSession.questions.push(questionAttempt);
    }

    // Increment highlight view count
    questionAttempt.addHighlightView();
    updateSessionStats();
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

  // Update highlight button appearance
  updateHighlightButton();

  // Update favorites UI
  updateFavoritesUI();

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
  const questions =
    statistics.currentSession.q || statistics.currentSession.questions || [];
  const questionAttempt = questions.find(
    (q) => (q.qn || q.questionNumber) === questionNumber
  );

  if (!questionAttempt) {
    document.getElementById("resetCount").textContent = "0";
    document.getElementById("highlightValidationsCount").textContent = "0";
    document.getElementById("questionStats").style.display = "none";
    return;
  }

  const resetCount = questionAttempt.rc || questionAttempt.resetCount || 0;

  // Calculate total highlight interactions using new method or old way
  const totalHighlightInteractions =
    questionAttempt.getTotalHighlightInteractions
      ? questionAttempt.getTotalHighlightInteractions()
      : (questionAttempt.hbc || questionAttempt.highlightButtonClicks || 0) +
        (questionAttempt.hvc || questionAttempt.highlightViewCount || 0) +
        (questionAttempt.highlightAnswers
          ? questionAttempt.highlightAnswers.length
          : 0);

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

  // If highlight is enabled, track this as a preview action and disable highlight
  const wasHighlightEnabled = isHighlightEnabled;
  devLog("🔍 DEBUG: isHighlightEnabled at start:", isHighlightEnabled);
  devLog("🔍 DEBUG: selectedAnswers:", Array.from(selectedAnswers));
  devLog(
    "🔍 DEBUG: statistics.currentSession exists:",
    !!statistics.currentSession
  );

  if (isHighlightEnabled) {
    devLog("🔍 DEBUG: Processing highlight validation");
    isHighlightEnabled = false;
    updateHighlightButton();

    // Track highlight answers separately for statistics
    if (statistics.currentSession) {
      const question = currentQuestions[currentQuestionIndex];
      const questionNumber = question.question_number;

      devLog("🔍 DEBUG: Question number:", questionNumber);

      // Find existing question attempt or create new one
      let questionAttempt = statistics.currentSession.questions.find(
        (q) => q.questionNumber === questionNumber
      );

      devLog("🔍 DEBUG: Existing question attempt:", !!questionAttempt);

      if (!questionAttempt) {
        const mostVoted = question.most_voted || "";
        const correctAnswers = Array.from(new Set(mostVoted.split("")));
        questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
        statistics.currentSession.questions.push(questionAttempt);
        devLog("🔍 DEBUG: Created new question attempt");
      }

      // Track highlight view (no need to store the actual answers)
      questionAttempt.addHighlightView();

      devLog(
        "🔍 DEBUG: Before tracking first action - firstActionRecorded:",
        questionAttempt.firstActionRecorded
      );

      // Track first action if this is the first interaction
      if (!questionAttempt.firstActionRecorded) {
        questionAttempt.firstActionType = "preview";
        questionAttempt.firstActionRecorded = true;
        devLog("🔍 DEBUG: Set first action to preview");
      }

      devLog("🔍 DEBUG: About to call updateSessionStats");
      updateSessionStats();
      saveStatistics();
      devLog("✅ Highlight validation tracked as preview action");
    } else {
      devLog("❌ No current session found!");
    }
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
    "highlight was enabled:",
    wasHighlightEnabled
  );

  try {
    trackQuestionAttempt(
      question.question_number,
      Array.from(correctAnswers),
      selectedAnswers,
      isCorrect,
      timeSpent,
      wasHighlightEnabled
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
      questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
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

  // Mark that user has manually overridden the default setting
  isHighlightTemporaryOverride = true;

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
      questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
      statistics.currentSession.questions.push(questionAttempt);
    }

    // Increment highlight button click count only when activating
    questionAttempt.addHighlightButtonClick();
    updateSessionStats();
    saveStatistics();
    devLog("Highlight activated on question:", questionNumber);
  }

  // Update highlight button appearance
  updateHighlightButton();

  if (currentQuestions.length > 0) {
    // Pass a flag to indicate this is from a toggle action to avoid double counting
    displayCurrentQuestion(true);
  }
}

// Update highlight button appearance
function updateHighlightButton() {
  const highlightBtn = document.getElementById("highlightBtn");

  if (isHighlightEnabled) {
    highlightBtn.classList.add("active");
    highlightBtn.innerHTML =
      '<i class="fas fa-lightbulb"></i> Disable Highlight';
    highlightBtn.style.backgroundColor = "#e0a800";
    highlightBtn.style.color = "#212529";
  } else {
    highlightBtn.classList.remove("active");
    highlightBtn.innerHTML =
      '<i class="fas fa-lightbulb"></i> Enable Highlight';
    highlightBtn.style.backgroundColor = "var(--warning-color)";
    highlightBtn.style.color = "#212529";
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

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  devLog("DOM loaded, initializing application...");

  // Load saved data
  loadSettings();
  loadStatistics();
  loadFavorites();

  // Apply theme
  applyTheme(settings.darkMode);

  // Setup event listeners
  setupEventListeners();
  setupFavoritesEventListeners();

  // Initialize category dropdown
  updateCategoryDropdown();

  // Discover and populate available exams
  await discoverAvailableExams();
  await populateExamDropdown();
  await displayAvailableExams();

  devLog("Application initialized successfully");
});
