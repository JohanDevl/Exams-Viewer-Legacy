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
    
    // Use actual question number if available
    const targetQuestionNumber = actualQuestionNumber || questionNumber;
    
    // Check ONLY current session - not previous sessions
    if (window.statistics?.currentSession?.questions) {
      const currentQuestionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      if (currentQuestionData && (currentQuestionData.userAnswers?.length > 0 || currentQuestionData.ua?.length > 0)) {
        if (typeof window.devLog === 'function') {
          window.devLog(`✅ Q${questionIndex} (${targetQuestionNumber}): answered in current session`);
        }
        return true;
      }
    }
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
    
    // Get the actual question data
    const actualQuestion = window.currentQuestions?.[questionIndex];
    const actualQuestionNumber = actualQuestion?.question_number;
    
    // Use actual question number if available, fallback to calculated
    const targetQuestionNumber = actualQuestionNumber || questionNumber;
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔍 isQuestionAnswered(${questionIndex}) - Q${targetQuestionNumber}`);
      window.devLog(`🔍 Current exam:`, window.currentExam?.exam_code);
      window.devLog(`🔍 Current session:`, window.statistics?.currentSession);
    }
    
    // Check current session first - search by questionNumber, not array index
    if (window.statistics?.currentSession?.questions) {
      const currentQuestionData = window.statistics.currentSession.questions.find(q => 
        (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
        (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
      );
      
      if (typeof window.devLog === 'function') {
        window.devLog(`🔍 Q${targetQuestionNumber} - Found session data:`, currentQuestionData);
      }
      
      if (currentQuestionData) {
        const hasUserAnswers = (currentQuestionData.userAnswers && currentQuestionData.userAnswers.length > 0) || 
                              (currentQuestionData.ua && currentQuestionData.ua.length > 0);
        
        if (typeof window.devLog === 'function') {
          window.devLog(`🔍 Q${targetQuestionNumber} - hasUserAnswers: ${hasUserAnswers}`);
          window.devLog(`🔍 Q${targetQuestionNumber} - userAnswers:`, currentQuestionData.userAnswers);
          window.devLog(`🔍 Q${targetQuestionNumber} - ua:`, currentQuestionData.ua);
          window.devLog(`🔍 Q${targetQuestionNumber} - fat (first action):`, currentQuestionData.fat);
          window.devLog(`🔍 Q${targetQuestionNumber} - hvc (highlight views):`, currentQuestionData.hvc);
        }
        
        if (hasUserAnswers) {
          if (typeof window.devLog === 'function') {
            window.devLog(`✅ Q${targetQuestionNumber} IS answered (has real user answers)`);
          }
          return true;
        } else {
          if (typeof window.devLog === 'function') {
            window.devLog(`❌ Q${targetQuestionNumber} is NOT answered (no real user answers)`);
          }
        }
      }
    }

    // Check previous sessions for same exam
    if (window.currentExam && window.statistics?.sessions) {
      const examCode = window.currentExam.exam_code || window.currentExam.code;
      if (!examCode) {
        if (typeof window.devLog === 'function') {
          window.devLog(`❌ Q${targetQuestionNumber} - No exam code found`);
        }
        return false;
      }

      const examSessions = window.statistics.sessions.filter(session => 
        (session.examCode || session.ec) === examCode
      );
      
      if (typeof window.devLog === 'function') {
        window.devLog(`🔍 Q${targetQuestionNumber} - Checking ${examSessions.length} previous sessions for exam ${examCode}`);
      }

      for (const session of examSessions) {
        if (session.questions) {
          // Search by questionNumber, not array index
          const questionData = session.questions.find(q => 
            (q.qn && q.qn.toString() === targetQuestionNumber.toString()) ||
            (q.questionNumber && q.questionNumber.toString() === targetQuestionNumber.toString())
          );
          
          if (questionData) {
            if (typeof window.devLog === 'function') {
              window.devLog(`🔍 Q${targetQuestionNumber} - Found in previous session:`, questionData);
            }
            
            // Only return true if there are actual user answers (not just previews)
            const hasRealAnswers = (questionData.userAnswers && questionData.userAnswers.length > 0) || 
                                   (questionData.ua && questionData.ua.length > 0);
            
            if (hasRealAnswers) {
              if (typeof window.devLog === 'function') {
                window.devLog(`✅ Q${targetQuestionNumber} - Found real answers in previous session!`);
              }
              return true;
            } else {
              if (typeof window.devLog === 'function') {
                window.devLog(`❌ Q${targetQuestionNumber} - Found in previous session but no real answers`);
              }
            }
          }
        }
      }
      
      if (typeof window.devLog === 'function') {
        window.devLog(`❌ Q${targetQuestionNumber} - Not found in any previous sessions`);
      }
    }

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
          const isCorrect = questionData.isCorrect !== undefined ? questionData.isCorrect : questionData.ic;
          if (typeof window.devLog === 'function') {
            window.devLog(`📝 Q${questionIndex}: Retrieved answer data - isCorrect: ${isCorrect}, userAnswers:`, userAnswers);
          }
          return {
            answers: userAnswers,
            isCorrect: isCorrect,
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
 * Clear status cache for a specific question only (performance optimized)
 */
function clearQuestionStatusCacheForQuestion(questionIndex) {
  if (questionStatusCache[questionIndex]) {
    if (typeof window.devLog === 'function') {
      window.devLog(`🧹 Clearing cache for question index ${questionIndex}`);
    }
    delete questionStatusCache[questionIndex];
  }
}

/**
 * Get cached question status or calculate it - SIMPLIFIED to use current session directly
 */
function getQuestionStatus(questionIndex) {
  if (questionStatusCache[questionIndex]) {
    return questionStatusCache[questionIndex];
  }

  // Get the actual question to get its question_number
  const actualQuestion = window.currentQuestions?.[questionIndex];
  if (!actualQuestion) {
    return { primaryStatus: 'new', isAnswered: false, isFavorite: false, hasNotes: false, isCategorized: false };
  }
  
  const questionNumber = parseInt(actualQuestion.question_number, 10);
  if (typeof window.devLog === 'function') {
    window.devLog(`🎯 Q${questionIndex} (${questionNumber}): checking status...`);
  }
  
  // Look directly in current session for this question
  let questionAttempt = null;
  if (window.statistics?.currentSession?.questions) {
    questionAttempt = window.statistics.currentSession.questions.find(q => 
      (q.qn === questionNumber) || (q.questionNumber === questionNumber)
    );
  }
  
  let primaryStatus = 'new';
  let isAnswered = false;
  
  if (questionAttempt) {
    // Question was visited/tracked
    isAnswered = false;
    
    // Check if has user answers
    const hasAnswers = (questionAttempt.ua && questionAttempt.ua.length > 0) || 
                      (questionAttempt.userAnswers && questionAttempt.userAnswers.length > 0);
    
    // Check for preview/highlight activity
    const highlightViews = questionAttempt.hvc || 0;
    const highlightClicks = questionAttempt.hbc || 0;
    const firstActionType = questionAttempt.fat || null;
    const hasHighlightAttempts = questionAttempt.att && questionAttempt.att.some(attempt => attempt.whe);
    
    const hasPreviewActivity = highlightViews > 0 || highlightClicks > 0 || 
                              firstActionType === 'p' || hasHighlightAttempts;
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 Q${questionIndex}: hasAnswers=${hasAnswers}, hasPreviewActivity=${hasPreviewActivity}`);
    }
    
    // PRIORITY: Always use first action type if it exists (regardless of current state)
    if (firstActionType) {
      if (typeof window.devLog === 'function') {
        window.devLog(`📊 Q${questionIndex}: using first action type: ${firstActionType}`);
      }
      
      switch (firstActionType) {
        case 'c':
          primaryStatus = 'correct';
          isAnswered = true;
          break;
        case 'i':
          primaryStatus = 'incorrect';
          isAnswered = true;
          break;
        case 'p':
          primaryStatus = 'preview';
          break;
        default:
          primaryStatus = 'viewed';
      }
    } else if (hasAnswers) {
      // No first action recorded, but has current answers
      isAnswered = true;
      const isCorrect = questionAttempt.ic !== undefined ? questionAttempt.ic : questionAttempt.isCorrect;
      
      if (typeof window.devLog === 'function') {
        window.devLog(`📊 Q${questionIndex}: no first action, using current isCorrect=${isCorrect}`);
      }
      
      if (isCorrect === true) {
        primaryStatus = 'correct';
      } else if (isCorrect === false) {
        primaryStatus = 'incorrect'; 
      } else {
        primaryStatus = 'viewed';
      }
    } else if (hasPreviewActivity) {
      // Question was previewed/highlighted but not answered
      primaryStatus = 'preview';
      if (typeof window.devLog === 'function') {
        window.devLog(`👁️ Q${questionIndex}: preview mode (hvc=${highlightViews}, hbc=${highlightClicks})`);
      }
    } else {
      // Question was visited but neither answered nor previewed
      primaryStatus = 'viewed';
      if (typeof window.devLog === 'function') {
        window.devLog(`👀 Q${questionIndex}: viewed but not answered or previewed`);
      }
    }
  }
  
  // Check favorites status
  const isFavorite = typeof window.isQuestionFavorite === 'function' 
    ? window.isQuestionFavorite(questionIndex) // Already 0-based index
    : false;
  
  // Check notes status  
  const questionNote = typeof window.getQuestionNote === 'function'
    ? window.getQuestionNote(questionIndex) // Already 0-based index
    : '';
  const hasNotes = questionNote && questionNote.trim().length > 0;
  
  // For now, assume not categorized (can be enhanced later)
  const isCategorized = false;

  questionStatusCache[questionIndex] = {
    // Legacy format for backward compatibility
    isAnswered,
    mostRecentAnswer: null, // Not used in simplified version
    lastUpdated: Date.now(),
    // New format for enhanced navigation
    primaryStatus,
    isFavorite,
    hasNotes,
    isCategorized
  };

  if (typeof window.devLog === 'function') {
    window.devLog(`✅ Q${questionIndex}: final status = ${primaryStatus}`);
  }
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
  clearQuestionStatusCacheForQuestion,
};