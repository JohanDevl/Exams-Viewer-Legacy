/**
 * Resume Position System Module
 * 
 * Handles study position tracking, session persistence, and resume dialogs
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: currentQuestionIndex, currentExam, currentQuestions, statistics, settings
 * - External functions: saveResumePosition, getResumePosition, clearResumePosition,
 *   navigateToQuestionIndex, showSuccess, showError, devLog, devError
 */

// ===========================
// POSITION TRACKING
// ===========================

/**
 * Save current study position for the active exam
 */
function saveStudyPosition(examCode, questionIndex) {
  try {
    if (!window.settings?.enableResumePosition) {
      return false;
    }

    if (!examCode || typeof questionIndex !== 'number' || questionIndex < 0) {
      if (typeof window.devError === 'function') {
        window.devError("Invalid parameters for saveStudyPosition:", { examCode, questionIndex });
      }
      return false;
    }

    // Don't save position for very short sessions or at the beginning
    if (questionIndex === 0) {
      return false;
    }

    // Use storage module function if available
    if (typeof window.saveResumePosition === 'function') {
      window.saveResumePosition(examCode, questionIndex);
    } else {
      // Fallback implementation
      const positionData = {
        questionIndex: questionIndex,
        timestamp: Date.now(),
        questionNumber: questionIndex + 1, // Human-readable question number
        totalQuestions: window.currentQuestions?.length || 0,
        lastSessionId: window.statistics?.currentSession?.id || null,
        examTitle: window.currentExam?.exam_name || examCode
      };

      const resumePositions = JSON.parse(localStorage.getItem("examViewerResumePositions") || "{}");
      resumePositions[examCode] = positionData;
      localStorage.setItem("examViewerResumePositions", JSON.stringify(resumePositions));
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`📍 Saved position for ${examCode}: question ${questionIndex + 1}`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error saving study position:", error);
    }
    return false;
  }
}

/**
 * Get saved study position for an exam
 */
function getStudyPosition(examCode) {
  try {
    if (!examCode) {
      return null;
    }

    // Use storage module function if available
    if (typeof window.getResumePosition === 'function') {
      return window.getResumePosition(examCode);
    } else {
      // Fallback implementation
      const resumePositions = JSON.parse(localStorage.getItem("examViewerResumePositions") || "{}");
      return resumePositions[examCode] || null;
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting study position:", error);
    }
    return null;
  }
}

/**
 * Clear saved study position for an exam
 */
function clearStudyPosition(examCode) {
  try {
    if (!examCode) {
      return false;
    }

    // Use storage module function if available
    if (typeof window.clearResumePosition === 'function') {
      window.clearResumePosition(examCode);
    } else {
      // Fallback implementation
      const resumePositions = JSON.parse(localStorage.getItem("examViewerResumePositions") || "{}");
      if (resumePositions[examCode]) {
        delete resumePositions[examCode];
        localStorage.setItem("examViewerResumePositions", JSON.stringify(resumePositions));
      }
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`🗑️ Cleared resume position for ${examCode}`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error clearing study position:", error);
    }
    return false;
  }
}

// ===========================
// AUTO-SAVE FUNCTIONALITY
// ===========================

/**
 * Auto-save current position (if enabled)
 */
function autoSavePosition() {
  try {
    if (!window.settings?.autoSavePosition || !window.settings?.enableResumePosition) {
      return false;
    }

    if (!window.currentExam || typeof window.currentQuestionIndex !== 'number') {
      return false;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) {
      return false;
    }

    return saveStudyPosition(examCode, window.currentQuestionIndex);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error auto-saving position:", error);
    }
    return false;
  }
}

/**
 * Setup auto-save on navigation (call this when question changes)
 */
function setupAutoSave() {
  try {
    if (!window.settings?.autoSavePosition) {
      return;
    }

    // Save position when question changes
    autoSavePosition();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up auto-save:", error);
    }
  }
}

// ===========================
// RESUME DIALOG SYSTEM
// ===========================

/**
 * Show resume dialog to user
 */
function showResumeDialog(examCode, savedPosition) {
  return new Promise((resolve) => {
    try {
      if (!savedPosition) {
        resolve(null);
        return;
      }

      // Create dialog HTML
      const dialogHTML = `
        <div id="resumeDialog" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        ">
          <div style="
            background: var(--bg-color, white);
            color: var(--text-color, #333);
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-color, #ddd);
          ">
            <h3 style="
              margin: 0 0 16px 0;
              color: var(--text-color, #333);
              font-size: 1.2em;
              font-weight: 600;
            ">
              📍 Resume Study Session
            </h3>
            
            <p style="
              margin: 0 0 20px 0;
              color: var(--text-muted, #666);
              line-height: 1.5;
            ">
              You were previously studying <strong>${savedPosition.examTitle || examCode}</strong>.
              Would you like to continue from where you left off?
            </p>
            
            <div style="
              background: var(--info-bg, #f0f9ff);
              border: 1px solid var(--info-border, #0ea5e9);
              border-radius: 8px;
              padding: 12px;
              margin: 16px 0;
            ">
              <div style="font-size: 0.9em; color: var(--info-text, #0369a1);">
                <strong>📍 Saved Position:</strong> Question ${savedPosition.questionNumber}/${savedPosition.totalQuestions}<br>
                <strong>📅 Last Study:</strong> ${new Date(savedPosition.timestamp).toLocaleDateString()} at ${new Date(savedPosition.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <div style="
              display: flex;
              gap: 12px;
              justify-content: flex-end;
              margin-top: 24px;
            ">
              <button id="resumeDialogStartFresh" style="
                padding: 8px 16px;
                border: 1px solid var(--border-color, #ddd);
                background: var(--bg-color, white);
                color: var(--text-color, #333);
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9em;
                transition: all 0.2s;
              ">
                🔄 Start Fresh
              </button>
              <button id="resumeDialogContinue" style="
                padding: 8px 16px;
                border: none;
                background: var(--primary-color, #007bff);
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.9em;
                transition: all 0.2s;
              ">
                ▶️ Continue from Question ${savedPosition.questionNumber}
              </button>
            </div>
          </div>
        </div>
      `;

      // Add dialog to page
      document.body.insertAdjacentHTML('beforeend', dialogHTML);

      // Add button event listeners
      const continueBtn = document.getElementById('resumeDialogContinue');
      const startFreshBtn = document.getElementById('resumeDialogStartFresh');

      const closeDialog = () => {
        const dialog = document.getElementById('resumeDialog');
        if (dialog) {
          dialog.remove();
        }
      };

      continueBtn?.addEventListener('click', () => {
        closeDialog();
        resolve(savedPosition);
      });

      startFreshBtn?.addEventListener('click', () => {
        closeDialog();
        clearStudyPosition(examCode);
        resolve(null);
      });

      // Close on background click
      document.getElementById('resumeDialog')?.addEventListener('click', (e) => {
        if (e.target.id === 'resumeDialog') {
          closeDialog();
          resolve(null);
        }
      });

      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeDialog();
          document.removeEventListener('keydown', handleEscape);
          resolve(null);
        }
      };
      document.addEventListener('keydown', handleEscape);

    } catch (error) {
      if (typeof window.devError === 'function') {
        window.devError("Error showing resume dialog:", error);
      }
      resolve(null);
    }
  });
}

/**
 * Check for saved position and show resume dialog if needed
 */
async function checkAndShowResumeDialog(examCode) {
  try {
    if (!window.settings?.enableResumePosition) {
      return null;
    }

    if (!examCode) {
      return null;
    }

    const savedPosition = getStudyPosition(examCode);
    if (!savedPosition) {
      return null;
    }

    // Validate position is still valid
    const totalQuestions = window.currentQuestions?.length || 0;
    if (savedPosition.questionIndex >= totalQuestions) {
      // Position is invalid, clear it
      clearStudyPosition(examCode);
      return null;
    }

    // Show dialog and wait for user choice
    const resumeChoice = await showResumeDialog(examCode, savedPosition);
    
    if (resumeChoice) {
      if (typeof window.devLog === 'function') {
        window.devLog(`📍 Resuming from question ${resumeChoice.questionNumber}`);
      }
      return resumeChoice;
    }

    return null;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error checking resume dialog:", error);
    }
    return null;
  }
}

/**
 * Resume to saved position
 */
function resumeToPosition(resumeChoice) {
  try {
    if (!resumeChoice || typeof resumeChoice.questionIndex !== 'number') {
      return false;
    }

    // Navigate to the saved position
    if (typeof window.navigateToQuestionIndex === 'function') {
      window.navigateToQuestionIndex(resumeChoice.questionIndex, false); // Don't add to history
    } else {
      // Fallback: set current question index
      window.currentQuestionIndex = resumeChoice.questionIndex;
    }

    if (typeof window.showSuccess === 'function') {
      window.showSuccess(`Resumed from Question ${resumeChoice.questionNumber}`);
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`✅ Successfully resumed to question ${resumeChoice.questionNumber}`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resuming to position:", error);
    }
    return false;
  }
}

// ===========================
// POSITION VALIDATION
// ===========================

/**
 * Validate saved position against current exam
 */
function validateSavedPosition(savedPosition, currentExam) {
  try {
    if (!savedPosition || !currentExam) {
      return false;
    }

    // Check if position index is valid
    const totalQuestions = window.currentQuestions?.length || 0;
    if (savedPosition.questionIndex < 0 || savedPosition.questionIndex >= totalQuestions) {
      return false;
    }

    // Check if position is not too old (optional - 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (savedPosition.timestamp < thirtyDaysAgo) {
      return false;
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error validating saved position:", error);
    }
    return false;
  }
}

/**
 * Clean invalid positions
 */
function cleanInvalidPositions() {
  try {
    const resumePositions = JSON.parse(localStorage.getItem("examViewerResumePositions") || "{}");
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    Object.keys(resumePositions).forEach(examCode => {
      const position = resumePositions[examCode];
      
      // Remove old positions
      if (!position.timestamp || position.timestamp < thirtyDaysAgo) {
        delete resumePositions[examCode];
        cleanedCount++;
      }
      
      // Remove invalid positions
      if (typeof position.questionIndex !== 'number' || position.questionIndex < 0) {
        delete resumePositions[examCode];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      localStorage.setItem("examViewerResumePositions", JSON.stringify(resumePositions));
      
      if (typeof window.devLog === 'function') {
        window.devLog(`🧹 Cleaned ${cleanedCount} invalid resume positions`);
      }
    }

    return cleanedCount;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error cleaning invalid positions:", error);
    }
    return 0;
  }
}

// ===========================
// INTEGRATION HELPERS
// ===========================

/**
 * Initialize resume position system for an exam
 */
async function initializeResumePosition(examCode) {
  try {
    if (!window.settings?.enableResumePosition) {
      return null;
    }

    // Clean invalid positions first
    cleanInvalidPositions();

    // Check for saved position and show dialog
    const resumeChoice = await checkAndShowResumeDialog(examCode);
    
    if (resumeChoice) {
      // Resume to saved position
      resumeToPosition(resumeChoice);
      return resumeChoice;
    }

    return null;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error initializing resume position:", error);
    }
    return null;
  }
}

/**
 * Handle navigation change (call this when user navigates)
 */
function handleNavigationChange(newQuestionIndex) {
  try {
    // Auto-save if enabled
    if (window.settings?.autoSavePosition) {
      setupAutoSave();
    }

    // Manual save if user has made meaningful progress
    if (newQuestionIndex > 0 && window.currentExam) {
      const examCode = window.currentExam.exam_code || window.currentExam.code;
      if (examCode) {
        saveStudyPosition(examCode, newQuestionIndex);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling navigation change:", error);
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all resume position functions for use in other modules
export {
  // Position tracking
  saveStudyPosition,
  getStudyPosition,
  clearStudyPosition,
  
  // Auto-save functionality
  autoSavePosition,
  setupAutoSave,
  
  // Resume dialog system
  showResumeDialog,
  checkAndShowResumeDialog,
  resumeToPosition,
  
  // Position validation
  validateSavedPosition,
  cleanInvalidPositions,
  
  // Integration helpers
  initializeResumePosition,
  handleNavigationChange,
};