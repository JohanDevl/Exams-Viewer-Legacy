/**
 * Statistics System Module
 * 
 * Handles exam sessions, performance calculations, and global statistics
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: statistics, currentQuestions, currentExam, currentQuestionIndex
 * - External functions: saveStatistics, startExamSession, endCurrentSession, 
 *   trackQuestionAttempt, trackQuestionVisit, devLog, devError
 */

// ===========================
// STATISTICS CALCULATIONS
// ===========================

/**
 * Recalculate total statistics from all sessions
 */
function recalculateTotalStats() {
  try {
    if (!window.statistics || !window.statistics.sessions) {
      return;
    }

    // Reset totals
    window.statistics.totalStats = {
      totalQuestions: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalPreview: 0,
      totalTime: 0,
      examStats: {},
    };

    const examStats = {};

    // Calculate from all sessions
    window.statistics.sessions.forEach(session => {
      const examCode = session.examCode || session.ec;
      const examName = session.examName || session.en;
      
      if (!examCode) return; // Skip invalid sessions

      // Initialize exam stats if not exists
      if (!examStats[examCode]) {
        examStats[examCode] = {
          examName: examName || examCode,
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalPreview: 0,
          totalTime: 0,
          sessionsCount: 0,
          lastSessionDate: 0,
        };
      }

      const examStat = examStats[examCode];
      
      // Add session data to exam stats
      examStat.totalQuestions += session.totalQuestions || session.tq || 0;
      examStat.totalCorrect += session.correctAnswers || session.ca || 0;
      examStat.totalIncorrect += session.incorrectAnswers || session.ia || 0;
      examStat.totalPreview += session.previewAnswers || session.pa || 0;
      examStat.totalTime += session.totalTime || session.tt || 0;
      examStat.sessionsCount++;
      
      // Update last session date
      const sessionDate = session.startTime || session.st || 0;
      if (sessionDate > examStat.lastSessionDate) {
        examStat.lastSessionDate = sessionDate;
      }

      // Add to global totals
      window.statistics.totalStats.totalQuestions += session.totalQuestions || session.tq || 0;
      window.statistics.totalStats.totalCorrect += session.correctAnswers || session.ca || 0;
      window.statistics.totalStats.totalIncorrect += session.incorrectAnswers || session.ia || 0;
      window.statistics.totalStats.totalPreview += session.previewAnswers || session.pa || 0;
      window.statistics.totalStats.totalTime += session.totalTime || session.tt || 0;
    });

    // Set exam stats
    window.statistics.totalStats.examStats = examStats;

    if (typeof window.devLog === 'function') {
      window.devLog(`📊 Recalculated stats: ${window.statistics.totalStats.totalQuestions} questions, ${Object.keys(examStats).length} exams`);
    }

  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error recalculating total stats:", error);
    }
  }
}

/**
 * Get performance statistics for current session
 */
function getCurrentSessionStats() {
  try {
    if (!window.statistics?.currentSession) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        previewAnswers: 0,
        accuracy: 0,
        timeSpent: 0,
        averageTimePerQuestion: 0,
      };
    }

    const session = window.statistics.currentSession;
    const totalQuestions = session.totalQuestions || session.tq || 0;
    const correctAnswers = session.correctAnswers || session.ca || 0;
    const incorrectAnswers = session.incorrectAnswers || session.ia || 0;
    const previewAnswers = session.previewAnswers || session.pa || 0;
    const totalTime = session.totalTime || session.tt || 0;

    const totalAnswered = correctAnswers + incorrectAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    const averageTimePerQuestion = totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      previewAnswers,
      accuracy,
      timeSpent: totalTime,
      averageTimePerQuestion,
      totalAnswered,
    };
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting current session stats:", error);
    }
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      previewAnswers: 0,
      accuracy: 0,
      timeSpent: 0,
      averageTimePerQuestion: 0,
      totalAnswered: 0,
    };
  }
}

/**
 * Get global performance statistics
 */
function getGlobalStats() {
  try {
    if (!window.statistics?.totalStats) {
      return {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalAnswered: 0,
        overallAccuracy: 0,
        totalTime: 0,
        averageTimePerQuestion: 0,
        totalSessions: 0,
        examsCount: 0,
      };
    }

    const stats = window.statistics.totalStats;
    const totalAnswered = stats.totalCorrect + stats.totalIncorrect;
    const overallAccuracy = totalAnswered > 0 ? Math.round((stats.totalCorrect / totalAnswered) * 100) : 0;
    const averageTimePerQuestion = totalAnswered > 0 ? Math.round(stats.totalTime / totalAnswered) : 0;
    const totalSessions = window.statistics.sessions?.length || 0;
    const examsCount = Object.keys(stats.examStats || {}).length;

    return {
      totalQuestions: stats.totalQuestions,
      totalCorrect: stats.totalCorrect,
      totalIncorrect: stats.totalIncorrect,
      totalPreview: stats.totalPreview,
      totalAnswered,
      overallAccuracy,
      totalTime: stats.totalTime,
      averageTimePerQuestion,
      totalSessions,
      examsCount,
    };
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting global stats:", error);
    }
    return {
      totalQuestions: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalPreview: 0,
      totalAnswered: 0,
      overallAccuracy: 0,
      totalTime: 0,
      averageTimePerQuestion: 0,
      totalSessions: 0,
      examsCount: 0,
    };
  }
}

// ===========================
// SESSION STATISTICS UPDATES
// ===========================

/**
 * Update current session statistics
 */
function updateSessionStats() {
  try {
    const stats = getCurrentSessionStats();
    
    // Update session statistics display if elements exist
    const elements = {
      sessionQuestions: document.getElementById("sessionQuestions"),
      sessionCorrect: document.getElementById("sessionCorrect"),
      sessionIncorrect: document.getElementById("sessionIncorrect"),
      sessionAccuracy: document.getElementById("sessionAccuracy"),
      sessionTime: document.getElementById("sessionTime"),
      sessionProgress: document.getElementById("sessionProgress"),
    };

    if (elements.sessionQuestions) {
      elements.sessionQuestions.textContent = `${stats.totalAnswered}/${stats.totalQuestions}`;
    }
    if (elements.sessionCorrect) {
      elements.sessionCorrect.textContent = stats.correctAnswers;
    }
    if (elements.sessionIncorrect) {
      elements.sessionIncorrect.textContent = stats.incorrectAnswers;
    }
    if (elements.sessionAccuracy) {
      elements.sessionAccuracy.textContent = `${stats.accuracy}%`;
    }
    if (elements.sessionTime) {
      const minutes = Math.floor(stats.timeSpent / 60);
      const seconds = stats.timeSpent % 60;
      elements.sessionTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (elements.sessionProgress) {
      const progressPercent = stats.totalQuestions > 0 ? 
        Math.round((stats.totalAnswered / stats.totalQuestions) * 100) : 0;
      elements.sessionProgress.textContent = `${progressPercent}%`;
    }

  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating session stats:", error);
    }
  }
}

/**
 * Update global statistics display
 */
function updateGlobalStats() {
  try {
    const stats = getGlobalStats();
    
    // Update global statistics display if elements exist
    const elements = {
      totalQuestions: document.getElementById("totalQuestions"),
      totalCorrect: document.getElementById("totalCorrect"),
      totalIncorrect: document.getElementById("totalIncorrect"),
      overallAccuracy: document.getElementById("overallAccuracy"),
      totalTime: document.getElementById("totalTime"),
      totalSessions: document.getElementById("totalSessions"),
      examsCount: document.getElementById("examsCount"),
    };

    if (elements.totalQuestions) {
      elements.totalQuestions.textContent = stats.totalQuestions;
    }
    if (elements.totalCorrect) {
      elements.totalCorrect.textContent = stats.totalCorrect;
    }
    if (elements.totalIncorrect) {
      elements.totalIncorrect.textContent = stats.totalIncorrect;
    }
    if (elements.overallAccuracy) {
      elements.overallAccuracy.textContent = `${stats.overallAccuracy}%`;
    }
    if (elements.totalTime) {
      const hours = Math.floor(stats.totalTime / 3600);
      const minutes = Math.floor((stats.totalTime % 3600) / 60);
      if (hours > 0) {
        elements.totalTime.textContent = `${hours}h ${minutes}m`;
      } else {
        elements.totalTime.textContent = `${minutes}m`;
      }
    }
    if (elements.totalSessions) {
      elements.totalSessions.textContent = stats.totalSessions;
    }
    if (elements.examsCount) {
      elements.examsCount.textContent = stats.examsCount;
    }

  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating global stats:", error);
    }
  }
}

// ===========================
// QUESTION STATUS TRACKING
// ===========================

/**
 * Check if a question has been answered in current session only (for sidebar display)
 */
function isQuestionAnsweredInCurrentSession(questionIndex) {
  try {
    const questionNumber = questionIndex + 1; // Convert to 1-based
    
    // DEBUG: Check if we have the actual question data
    const actualQuestion = window.currentQuestions?.[questionIndex];
    const actualQuestionNumber = actualQuestion?.question_number;
    
    console.log(`🔍 isQuestionAnsweredInCurrentSession(index ${questionIndex})`);
    console.log(`🔍 Using question number: ${actualQuestionNumber || questionNumber}`);
    
    // Use actual question number if available
    const targetQuestionNumber = actualQuestionNumber || questionNumber;
    
    // Check ONLY current session - not previous sessions
    if (window.statistics?.currentSession?.questions) {
      const currentQuestionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      console.log(`🔍 Current session only - Q${targetQuestionNumber}:`, currentQuestionData);
      if (currentQuestionData && (currentQuestionData.userAnswers?.length > 0 || currentQuestionData.ua?.length > 0)) {
        console.log(`✅ Found answer in CURRENT session for question ${targetQuestionNumber}`);
        return true;
      }
    } else {
      console.log(`❌ No current session questions data`);
    }

    console.log(`❌ Question ${targetQuestionNumber} (index ${questionIndex}) is NOT answered in current session`);
    return false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error checking if question is answered in current session:", error);
    }
    return false;
  }
}

/**
 * Check if a question has been answered in current or previous sessions
 */
function isQuestionAnswered(questionIndex) {
  try {
    const questionNumber = questionIndex + 1; // Convert to 1-based
    
    // DEBUG: Check if we have the actual question data
    const actualQuestion = window.currentQuestions?.[questionIndex];
    const actualQuestionNumber = actualQuestion?.question_number;
    
    console.log(`🔍 isQuestionAnswered(index ${questionIndex})`);
    console.log(`🔍 Calculated questionNumber: ${questionNumber}`);
    console.log(`🔍 Actual question data:`, actualQuestion);
    console.log(`🔍 Actual question_number: ${actualQuestionNumber}`);
    
    // Use actual question number if available
    const targetQuestionNumber = actualQuestionNumber || questionNumber;
    console.log(`🔍 Using target question number: ${targetQuestionNumber}`);
    
    // Check current session first - search by questionNumber, not array index
    if (window.statistics?.currentSession?.questions) {
      const currentQuestionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      console.log(`🔍 Current session question data for Q${targetQuestionNumber}:`, currentQuestionData);
      if (currentQuestionData && (currentQuestionData.userAnswers?.length > 0 || currentQuestionData.ua?.length > 0)) {
        console.log(`✅ Found answer in current session for question ${targetQuestionNumber}`);
        return true;
      }
    } else {
      console.log(`❌ No current session or questions data`);
    }

    // Check previous sessions for same exam
    if (window.currentExam && window.statistics?.sessions) {
      console.log(`📄 Current exam object:`, window.currentExam);
      const examCode = window.currentExam.exam_code || window.currentExam.code;
      console.log(`📋 Checking previous sessions for exam: ${examCode}`);
      if (!examCode) {
        console.log(`❌ No exam code found in currentExam:`, window.currentExam);
        console.log(`❌ Available properties:`, Object.keys(window.currentExam || {}));
        return false;
      }

      const examSessions = window.statistics.sessions.filter(session => 
        (session.examCode || session.ec) === examCode
      );
      console.log(`📁 Found ${examSessions.length} previous sessions for this exam`);

      for (const session of examSessions) {
        if (session.questions) {
          // Search by questionNumber, not array index
          const questionData = session.questions.find(q => 
            (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
            (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
          );
          if (questionData) {
            console.log(`🔍 Found question data in previous session:`, questionData);
            if (questionData.userAnswers?.length > 0 || questionData.ua?.length > 0) {
              console.log(`✅ Found answer in previous session for question ${targetQuestionNumber}`);
              return true;
            }
          }
        }
      }
    } else {
      console.log(`❌ No current exam or statistics sessions`);
    }

    console.log(`❌ Question ${targetQuestionNumber} (index ${questionIndex}) is NOT answered`);
    return false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error checking if question is answered:", error);
    }
    return false;
  }
}

/**
 * Get the most recent answer for a question in current session only
 */
function getMostRecentAnswerCurrentSession(questionIndex) {
  try {
    const questionNumber = questionIndex + 1; // Convert to 1-based
    
    // DEBUG: Check if we have the actual question data
    const actualQuestion = window.currentQuestions?.[questionIndex];
    const actualQuestionNumber = actualQuestion?.question_number;
    
    // Use actual question number if available
    const targetQuestionNumber = actualQuestionNumber || questionNumber;

    // Check ONLY current session
    if (window.statistics?.currentSession?.questions) {
      const questionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      if (questionData) {
        const userAnswers = questionData.userAnswers || questionData.ua || [];
        const endTime = questionData.endTime || questionData.et || 0;
        
        if (userAnswers.length > 0 && endTime > 0) {
          return {
            answers: userAnswers,
            isCorrect: questionData.isCorrect || questionData.ic || null,
            isPreview: false, // Current session, so not preview
            endTime: endTime
          };
        }
      }
    }

    return null;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting most recent answer for current session:", error);
    }
    return null;
  }
}

/**
 * Get the most recent answer for a question across all sessions
 */
function getMostRecentAnswer(questionIndex) {
  try {
    const questionNumber = questionIndex + 1; // Convert to 1-based
    
    // DEBUG: Check if we have the actual question data
    const actualQuestion = window.currentQuestions?.[questionIndex];
    const actualQuestionNumber = actualQuestion?.question_number;
    
    // Use actual question number if available
    const targetQuestionNumber = actualQuestionNumber || questionNumber;
    let mostRecentAnswer = null;
    let mostRecentTime = 0;

    // Check current session first - search by questionNumber
    if (window.statistics?.currentSession?.questions) {
      const questionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      if (questionData) {
        const userAnswers = questionData.userAnswers || questionData.ua || [];
        const endTime = questionData.endTime || questionData.et || 0;
        
        if (userAnswers.length > 0 && endTime > mostRecentTime) {
          mostRecentAnswer = userAnswers;
          mostRecentTime = endTime;
        }
      }
    }

    // Check previous sessions - search by questionNumber
    if (window.currentExam && window.statistics?.sessions) {
      const examCode = window.currentExam.exam_code || window.currentExam.code;
      if (examCode) {
        const examSessions = window.statistics.sessions.filter(session => 
          (session.examCode || session.ec) === examCode
        );

        for (const session of examSessions) {
          if (session.questions) {
            const questionData = session.questions.find(q => 
              (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
              (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
            );
            if (questionData) {
              const userAnswers = questionData.userAnswers || questionData.ua || [];
              const endTime = questionData.endTime || questionData.et || 0;
              
              if (userAnswers.length > 0 && endTime > mostRecentTime) {
                mostRecentAnswer = userAnswers;
                mostRecentTime = endTime;
              }
            }
          }
        }
      }
    }

    return mostRecentAnswer;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting most recent answer:", error);
    }
    return null;
  }
}

// ===========================
// CORRUPTED DATA CLEANUP
// ===========================

/**
 * Clean corrupted statistics data
 */
function cleanCorruptedStatistics() {
  try {
    if (!window.statistics) {
      window.statistics = {
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
      return;
    }

    // Clean sessions array
    if (window.statistics.sessions && Array.isArray(window.statistics.sessions)) {
      window.statistics.sessions = window.statistics.sessions.filter(session => {
        // Remove sessions without required properties
        const hasRequiredProps = session && 
          (session.examCode || session.ec) && 
          (session.examName || session.en);
        
        if (!hasRequiredProps) {
          if (typeof window.devLog === 'function') {
            window.devLog("🧹 Removing corrupted session:", session);
          }
          return false;
        }

        // Clean session questions if they exist
        if (session.questions && Array.isArray(session.questions)) {
          session.questions = session.questions.filter(q => q && typeof q === 'object');
        }

        return true;
      });
    } else {
      window.statistics.sessions = [];
    }

    // Ensure totalStats exists with all required properties
    if (!window.statistics.totalStats || typeof window.statistics.totalStats !== 'object') {
      window.statistics.totalStats = {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalTime: 0,
        examStats: {},
      };
    }

    // Ensure all required properties exist
    const requiredProps = {
      totalQuestions: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalPreview: 0,
      totalTime: 0,
      examStats: {},
    };

    Object.entries(requiredProps).forEach(([key, defaultValue]) => {
      if (typeof window.statistics.totalStats[key] === 'undefined') {
        window.statistics.totalStats[key] = defaultValue;
      }
    });

    // Recalculate stats after cleanup
    recalculateTotalStats();

    if (typeof window.devLog === 'function') {
      window.devLog("🧹 Statistics cleaned and recalculated");
    }

  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error cleaning corrupted statistics:", error);
    }
    
    // Reset to default if cleanup fails
    window.statistics = {
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
// QUESTION STATUS CACHE
// ===========================

let questionStatusCache = {};

/**
 * Clear question status cache (useful when answers change)
 */
function clearQuestionStatusCache() {
  questionStatusCache = {};
}

/**
 * Get cached question status or calculate it
 */
function getQuestionStatus(questionIndex) {
  if (questionStatusCache[questionIndex]) {
    return questionStatusCache[questionIndex];
  }

  const isAnswered = isQuestionAnsweredInCurrentSession(questionIndex);
  const mostRecentAnswer = isAnswered ? getMostRecentAnswerCurrentSession(questionIndex) : null;
  
  // Calculate primary status based on answer history
  let primaryStatus = 'new';
  if (isAnswered && mostRecentAnswer) {
    if (mostRecentAnswer.isCorrect === true) {
      primaryStatus = 'correct';
    } else if (mostRecentAnswer.isCorrect === false) {
      primaryStatus = 'incorrect';
    } else if (mostRecentAnswer.isPreview) {
      primaryStatus = 'preview';
    } else {
      primaryStatus = 'viewed';
    }
  }
  
  // Check favorites status
  const isFavorite = typeof window.isQuestionFavorite === 'function' 
    ? window.isQuestionFavorite(questionIndex - 1) // Convert to 0-based index
    : false;
  
  // Check notes status  
  const questionNote = typeof window.getQuestionNote === 'function'
    ? window.getQuestionNote(questionIndex - 1) // Convert to 0-based index
    : '';
  const hasNotes = questionNote && questionNote.trim().length > 0;
  
  // For now, assume not categorized (can be enhanced later)
  const isCategorized = false;

  questionStatusCache[questionIndex] = {
    // Legacy format for backward compatibility
    isAnswered,
    mostRecentAnswer,
    lastUpdated: Date.now(),
    // New format for enhanced navigation
    primaryStatus,
    isFavorite,
    hasNotes,
    isCategorized
  };

  return questionStatusCache[questionIndex];
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all statistics functions for use in other modules
export {
  // Statistics calculations
  recalculateTotalStats,
  getCurrentSessionStats,
  getGlobalStats,
  
  // Session statistics updates
  updateSessionStats,
  updateGlobalStats,
  
  // Question status tracking
  isQuestionAnswered,
  isQuestionAnsweredInCurrentSession,
  getMostRecentAnswer,
  getMostRecentAnswerCurrentSession,
  getQuestionStatus,
  
  // Data cleanup
  cleanCorruptedStatistics,
  clearQuestionStatusCache,
};