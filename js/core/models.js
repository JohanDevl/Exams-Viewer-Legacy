/**
 * Data Models Module
 * 
 * Contains all data model classes and related utilities for Exams-Viewer application.
 * Includes compression/decompression utilities for localStorage optimization.
 * 
 * Dependencies: 
 * - Global variables: statistics, currentQuestions, currentQuestionIndex, currentExam,
 *   favoritesData, settings, lazyLoadingConfig
 * - External functions: devLog, devError, saveStatistics, recalculateTotalStats,
 *   showError, showSuccess
 */

// ===========================
// SESSION DATA STRUCTURE
// ===========================

/**
 * Session data structure for exam attempts
 * Uses compressed property names to reduce localStorage usage
 */
class ExamSession {
  constructor(examCode, examName) {
    this.id = this.generateCompactId(); // Use shorter session ID
    this.ec = examCode; // Exam code - shortened
    this.en = examName; // Exam name - shortened
    this.st = Date.now(); // Start time as timestamp - shortened
    this.et = null; // End time - shortened
    this.q = []; // Array of question attempts - shortened
    this.vq = []; // Array of visited question numbers - shortened
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
  get visitedQuestions() {
    return this.vq;
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

// ===========================
// QUESTION ATTEMPT DATA STRUCTURE
// ===========================

/**
 * Question attempt data structure
 * Uses compressed property names for localStorage optimization
 */
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
    // Track first action type if not recorded yet
    if (!this.far) {
      if (isCorrect) {
        this.fat = "c"; // correct
      } else {
        this.fat = "i"; // incorrect
      }
      this.far = true;
    }

    const attempt = {
      a: selectedAnswers, // Selected answers - shortened
      c: isCorrect, // Is correct - shortened
      t: timeSpent, // Time spent - shortened
      ts: Date.now(), // Timestamp - shortened
      whe: wasHighlightEnabled, // Was highlight enabled - shortened
    };

    this.att.push(attempt);
    this.ua = selectedAnswers; // Update current user answers
    this.ic = isCorrect; // Update current correctness
    this.et = Date.now(); // Update end time
    this.ts += timeSpent; // Add to total time spent

    // Calculate final score as percentage
    if (this.att.length > 0) {
      const correctAttempts = this.att.filter((a) => a.c).length;
      this.fs = Math.round((correctAttempts / this.att.length) * 100);
    }
  }

  addReset() {
    this.rc++;
    this.ua = []; // Clear user answers
    this.ic = false; // Reset correctness
    this.et = null; // Reset end time
    // Keep attempt history but reset current state
  }

  addHighlightButtonClick() {
    this.hbc++;
  }

  addHighlightView() {
    this.hvc++;
  }

  getTotalHighlightInteractions() {
    return this.hbc + this.hvc;
  }

  // Backward compatibility getter for old property name
  get highlightAnswers() {
    // This was used in older versions, return empty array if not present
    return this.ha || [];
  }

  // Backward compatibility getters
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
}

// ===========================
// DATA COMPRESSION UTILITIES
// ===========================

/**
 * Compress data using custom property name mapping to reduce localStorage size
 */
function compressData(data) {
  try {
    const propertyMap = {
      // Statistics mappings
      sessions: "s",
      currentSession: "cs",
      totalStats: "ts",
      examCode: "ec",
      examName: "en",
      startTime: "st",
      endTime: "et",
      questions: "q",
      visitedQuestions: "vq",
      totalQuestions: "tq",
      correctAnswers: "ca",
      incorrectAnswers: "ia",
      previewAnswers: "pa",
      totalTime: "tt",
      completed: "c",
      questionNumber: "qn",
      userAnswers: "ua",
      attempts: "att",
      timeSpent: "tsp",
      isCorrect: "ic",
      finalScore: "fs",
      resetCount: "rc",
      highlightButtonClicks: "hbc",
      highlightViewCount: "hvc",
      firstActionType: "fat",
      firstActionRecorded: "far",
      selectedAnswers: "a",
      timestamp: "tms",
      wasHighlightEnabled: "whe",
      totalCorrect: "tc",
      totalIncorrect: "ti",
      totalPreview: "tp",
      examStats: "es",
    };

    const valueMap = {
      true: "_T",
      false: "_F",
      null: "_N",
    };

    function compress(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== "object") {
        // Only compress boolean and null values, not numbers
        if (typeof obj === "boolean" || obj === null) {
          return valueMap.hasOwnProperty(obj) ? valueMap[obj] : obj;
        }
        return obj;
      }
      if (Array.isArray(obj)) return obj.map(compress);

      const compressed = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = propertyMap[key] || key;
        compressed[newKey] = compress(value);
      }
      return compressed;
    }

    const compressed = compress(data);
    return JSON.stringify(compressed);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error compressing data:", error);
    }
    return JSON.stringify(data); // Fallback to uncompressed
  }
}

/**
 * Decompress data with reverse property mapping, with fallback to regular JSON parsing
 */
function decompressData(compressedData) {
  try {
    const reversePropertyMap = {
      // Reverse statistics mappings
      s: "sessions",
      cs: "currentSession",
      ts: "totalStats",
      ec: "examCode",
      en: "examName",
      st: "startTime",
      et: "endTime",
      q: "questions",
      vq: "visitedQuestions",
      tq: "totalQuestions",
      ca: "correctAnswers",
      ia: "incorrectAnswers",
      pa: "previewAnswers",
      tt: "totalTime",
      c: "completed",
      qn: "questionNumber",
      ua: "userAnswers",
      att: "attempts",
      tsp: "timeSpent",
      ic: "isCorrect",
      fs: "finalScore",
      rc: "resetCount",
      hbc: "highlightButtonClicks",
      hvc: "highlightViewCount",
      fat: "firstActionType",
      far: "firstActionRecorded",
      a: "selectedAnswers",
      tms: "timestamp",
      whe: "wasHighlightEnabled",
      tc: "totalCorrect",
      ti: "totalIncorrect",
      tp: "totalPreview",
      es: "examStats",
    };

    const reverseValueMap = {
      "_T": true,
      "_F": false,
      "_N": null,
    };

    function decompress(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== "object") {
        // Only decompress values that are actually in our reverse map
        // Don't convert numbers to booleans
        if (reverseValueMap.hasOwnProperty(obj)) {
          return reverseValueMap[obj];
        }
        return obj;
      }
      if (Array.isArray(obj)) return obj.map(decompress);

      const decompressed = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = reversePropertyMap[key] || key;
        decompressed[newKey] = decompress(value);
      }
      return decompressed;
    }

    const parsed = JSON.parse(compressedData);
    return decompress(parsed);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error decompressing data:", error);
    }
    // Return default statistics structure if decompression fails
    return {
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
  }
}

// ===========================
// SESSION MANAGEMENT FUNCTIONS
// ===========================

/**
 * Start a new exam session
 */
function startExamSession(examCode, examName) {
  try {
    // End current session if exists
    if (window.statistics && window.statistics.currentSession) {
      endCurrentSession();
    }

    // Create new session
    const session = new ExamSession(examCode, examName);
    if (window.currentQuestions) {
      session.totalQuestions = window.currentQuestions.length;
    }
    
    if (window.statistics) {
      window.statistics.currentSession = session;
    }
    
    if (typeof window.saveStatistics === 'function') {
      window.saveStatistics();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📝 Started new session for ${examName} (${examCode})`);
    }
    
    return session;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error starting exam session:", error);
    }
  }
}

/**
 * End the current exam session
 */
function endCurrentSession() {
  try {
    if (!window.statistics || !window.statistics.currentSession) {
      return;
    }

    const session = window.statistics.currentSession;
    
    // Set end time and mark as completed
    session.endTime = Date.now();
    session.completed = true;
    
    // Calculate total time spent
    if (session.startTime) {
      session.totalTime = Math.round((session.endTime - session.startTime) / 1000);
    }
    
    // Add to sessions history
    if (!window.statistics.sessions) {
      window.statistics.sessions = [];
    }
    window.statistics.sessions.push(session);
    
    // Clear current session
    window.statistics.currentSession = null;
    
    // Recalculate total statistics
    if (typeof window.recalculateTotalStats === 'function') {
      window.recalculateTotalStats();
    }
    
    if (typeof window.saveStatistics === 'function') {
      window.saveStatistics();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog(`✅ Ended session for ${session.examName}`);
    }
    
    return session;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error ending current session:", error);
    }
  }
}

/**
 * Track a question attempt in the current session
 */
function trackQuestionAttempt(questionNumber, selectedAnswers, correctAnswers, isCorrect, timeSpent, wasHighlightEnabled = false) {
  try {
    if (!window.statistics || !window.statistics.currentSession) {
      if (typeof window.devError === 'function') {
        window.devError("No current session to track question attempt");
      }
      return;
    }

    const session = window.statistics.currentSession;
    
    // Find existing QuestionAttempt or create new one
    let questionAttempt = session.questions.find(q => 
      (q.qn && q.qn.toString() === questionNumber.toString()) ||
      (q.questionNumber && q.questionNumber.toString() === questionNumber.toString())
    );
    
    if (!questionAttempt) {
      questionAttempt = new QuestionAttempt(questionNumber, correctAnswers);
      session.questions.push(questionAttempt);
    }
    
    // Add the attempt
    questionAttempt.addAttempt(selectedAnswers, isCorrect, timeSpent, wasHighlightEnabled);
    
    // Update session statistics
    if (isCorrect) {
      session.correctAnswers++;
    } else {
      session.incorrectAnswers++;
    }
    
    // Track visited question
    const questionNum = parseInt(questionNumber);
    if (!session.visitedQuestions.includes(questionNum)) {
      session.visitedQuestions.push(questionNum);
    }
    
    if (typeof window.saveStatistics === 'function') {
      window.saveStatistics();
    }
    
    return questionAttempt;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error tracking question attempt:", error);
    }
  }
}

/**
 * Track question visit for navigation analytics
 */
function trackQuestionVisit(questionNumber) {
  try {
    if (!window.statistics || !window.statistics.currentSession) {
      return;
    }

    const session = window.statistics.currentSession;
    const questionNum = parseInt(questionNumber);
    
    if (!session.visitedQuestions.includes(questionNum)) {
      session.visitedQuestions.push(questionNum);
      
      if (typeof window.saveStatistics === 'function') {
        window.saveStatistics();
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error tracking question visit:", error);
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all model classes and utilities
export {
  // Data model classes
  ExamSession,
  QuestionAttempt,
  
  // Compression utilities
  compressData,
  decompressData,
  
  // Session management
  startExamSession,
  endCurrentSession,
  trackQuestionAttempt,
  trackQuestionVisit,
};