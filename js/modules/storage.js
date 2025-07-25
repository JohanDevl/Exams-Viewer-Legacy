/**
 * Storage Management Module
 * 
 * Handles localStorage operations, data compression/decompression, and data validation
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: settings, favoritesData, statistics, resumePositions, currentQuestions, currentExam
 * - External functions: showError, showSuccess, applyTheme, updateToolbarVisibility, updateTooltipVisibility,
 *   recalculateTotalStats, cleanCorruptedStatistics, cleanupObsoleteData
 */

// ===========================
// DEVELOPMENT MODE & UTILITIES
// ===========================

/**
 * Check if we're running in development mode
 */
function isDevelopmentMode() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:"
  );
}

/**
 * Console log wrapper for development mode only
 */
const devLog = (...args) => {
  if (isDevelopmentMode()) {
    console.log(...args);
  }
};

/**
 * Console error wrapper (always show errors)
 */
const devError = (...args) => {
  console.error(...args);
};

// ===========================
// NOTE: Data compression functions moved to js/core/models.js
// This ensures compression logic stays with the data models
// ===========================

// ===========================
// CORRUPTED DATA CLEANUP
// ===========================

/**
 * Clear corrupted data from localStorage and validate data integrity
 */
function clearCorruptedData() {
  try {
    const keys = [
      "examViewerStatistics",
      "examViewerSettings", 
      "examViewerFavorites",
      "examViewerResumePositions"
    ];
    
    for (const key of keys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Test if data is valid JSON
        }
      } catch (parseError) {
        devError(`Corrupted data found for key ${key}, removing:`, parseError);
        localStorage.removeItem(key);
        showError(
          `Corrupted data detected and cleared for ${key.replace('examViewer', '')}. ` +
          "Your data will be reset to defaults."
        );
      }
    }
  } catch (error) {
    devError("Error during corrupted data cleanup:", error);
  }
}

// ===========================
// STATISTICS STORAGE
// ===========================

/**
 * Save statistics to localStorage with compression and size management
 */
function saveStatistics() {
  try {
    // Use compression from models module
    const compressedData = window.compressData ? window.compressData(statistics) : JSON.stringify(statistics);
    
    // Calculate size in KB
    const sizeKB = (new Blob([compressedData]).size / 1024).toFixed(2);
    
    // Only log size in development mode
    if (isDevelopmentMode()) {
      devLog(`💾 Saving statistics (${sizeKB} KB compressed)`);
    }
    
    // Check localStorage quota (approximately 5-10MB in most browsers)
    const maxSizeKB = 5000; // 5MB conservative limit
    if (parseFloat(sizeKB) > maxSizeKB) {
      // If data is too large, try to clean old sessions
      const sessionsToKeep = 50; // Keep last 50 sessions
      if (statistics.sessions && statistics.sessions.length > sessionsToKeep) {
        statistics.sessions = statistics.sessions
          .sort((a, b) => (b.st || b.startTime || 0) - (a.st || a.startTime || 0))
          .slice(0, sessionsToKeep);
        devLog(`🧹 Cleaned old sessions, kept ${sessionsToKeep} most recent`);
      }
    }
    
    localStorage.setItem("examViewerStatistics", compressedData);
  } catch (error) {
    devError("Failed to save statistics:", error);
    showError("Failed to save statistics. Your progress may not be preserved.");
  }
}

/**
 * Load statistics from localStorage with decompression and migration
 */
function loadStatistics() {
  try {
    const savedData = localStorage.getItem("examViewerStatistics");
    if (!savedData) {
      devLog("📊 No saved statistics found, using defaults");
      return;
    }

    // Use decompression from models module
    const loadedData = window.decompressData ? window.decompressData(savedData) : JSON.parse(savedData);
    
    // Migrate old data format to new format if needed
    if (loadedData) {
      // Ensure all required properties exist
      statistics.sessions = loadedData.sessions || [];
      statistics.currentSession = loadedData.currentSession || null;
      statistics.totalStats = loadedData.totalStats || {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalTime: 0,
        examStats: {},
      };

      // Ensure totalStats has all required properties
      if (!statistics.totalStats.totalPreview) {
        statistics.totalStats.totalPreview = 0;
      }
      if (!statistics.totalStats.examStats) {
        statistics.totalStats.examStats = {};
      }

      // Clean up any sessions with corrupted data
      if (statistics.sessions && Array.isArray(statistics.sessions)) {
        statistics.sessions = statistics.sessions.filter(session => {
          // Check if session has required properties
          const hasBasicProps = session && 
            (session.ec || session.examCode) && 
            (session.en || session.examName);
          
          if (!hasBasicProps) {
            devLog("🧹 Removing corrupted session:", session);
            return false;
          }
          
          return true;
        });
      }

      devLog("📊 Statistics loaded successfully");
      
      // Recalculate total stats to ensure consistency
      if (typeof recalculateTotalStats === 'function') {
        recalculateTotalStats();
      }
      
      // Save the cleaned data back
      saveStatistics();
    }
  } catch (error) {
    devError("Failed to load statistics:", error);
    // Clean corrupted statistics if loading fails
    if (typeof cleanCorruptedStatistics === 'function') {
      cleanCorruptedStatistics();
    }
  }
}

// ===========================
// FAVORITES STORAGE
// ===========================

/**
 * Save favorites data to localStorage
 */
function saveFavorites() {
  try {
    localStorage.setItem("examViewerFavorites", JSON.stringify(favoritesData));
    devLog("💾 Favorites saved");
  } catch (error) {
    devError("Failed to save favorites:", error);
  }
}

/**
 * Load favorites from localStorage with data cleanup
 */
function loadFavorites() {
  try {
    const savedFavorites = localStorage.getItem("examViewerFavorites");
    if (savedFavorites) {
      const loadedData = JSON.parse(savedFavorites);
      
      // Merge with existing structure to ensure all properties exist
      favoritesData.favorites = loadedData.favorites || {};
      favoritesData.categories = loadedData.categories || [];
      favoritesData.customCategories = loadedData.customCategories || [];
      
      devLog("⭐ Favorites loaded successfully");
      
      // Clean up obsolete data if cleanup function exists
      if (typeof cleanupObsoleteData === 'function') {
        cleanupObsoleteData();
      }
    }
  } catch (error) {
    devError("Failed to load favorites:", error);
    // Reset to defaults on error
    favoritesData.favorites = {};
  }
}

// ===========================
// SETTINGS STORAGE
// ===========================

/**
 * Load settings from localStorage and apply to UI
 */
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem("examViewerSettings");
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      
      // Merge with default settings to ensure all properties exist
      Object.assign(settings, loadedSettings);
      
      // Apply settings to UI elements
      const elements = {
        showDiscussionDefault: document.getElementById("showDiscussionDefault"),
        highlightDefault: document.getElementById("highlightDefault"),
        darkMode: document.getElementById("darkMode"),
        showQuestionToolbar: document.getElementById("showQuestionToolbar"),
        showAdvancedSearch: document.getElementById("showAdvancedSearch"),
        enableLazyLoading: document.getElementById("enableLazyLoading"),
        showMainProgressBar: document.getElementById("showMainProgressBar"),
        showTooltips: document.getElementById("showTooltips"),
        enableResumePosition: document.getElementById("enableResumePosition"),
        autoSavePosition: document.getElementById("autoSavePosition"),
      };
      
      // Update checkboxes to match loaded settings
      Object.entries(elements).forEach(([key, element]) => {
        if (element && typeof settings[key] !== 'undefined') {
          element.checked = settings[key];
        }
      });
      
      // Apply theme and UI updates
      if (typeof applyTheme === 'function') {
        applyTheme();
      }
      if (typeof updateToolbarVisibility === 'function') {
        updateToolbarVisibility();
      }
      if (typeof updateTooltipVisibility === 'function') {
        updateTooltipVisibility();
      }
      
      devLog("⚙️ Settings loaded successfully");
    }
  } catch (error) {
    devError("Failed to load settings:", error);
  }
}

/**
 * Save current settings to localStorage
 */
function saveSettings() {
  try {
    // Update settings object from UI elements
    const elements = {
      showDiscussionDefault: document.getElementById("showDiscussionDefault"),
      highlightDefault: document.getElementById("highlightDefault"),
      darkMode: document.getElementById("darkMode"),
      showQuestionToolbar: document.getElementById("showQuestionToolbar"),
      showAdvancedSearch: document.getElementById("showAdvancedSearch"),
      enableLazyLoading: document.getElementById("enableLazyLoading"),
      showMainProgressBar: document.getElementById("showMainProgressBar"),
      showTooltips: document.getElementById("showTooltips"),
      enableResumePosition: document.getElementById("enableResumePosition"),
      autoSavePosition: document.getElementById("autoSavePosition"),
    };
    
    Object.entries(elements).forEach(([key, element]) => {
      if (element) {
        settings[key] = element.checked;
      }
    });
    
    localStorage.setItem("examViewerSettings", JSON.stringify(settings));
    devLog("⚙️ Settings saved");
  } catch (error) {
    devError("Failed to save settings:", error);
  }
}

// ===========================
// RESUME POSITION STORAGE
// ===========================

/**
 * Load resume positions from localStorage with validation
 */
function loadResumePositions() {
  try {
    const savedPositions = localStorage.getItem("examViewerResumePositions");
    if (savedPositions) {
      const loadedPositions = JSON.parse(savedPositions);
      
      // Validate and filter positions that might be corrupted
      Object.keys(loadedPositions).forEach(examCode => {
        const position = loadedPositions[examCode];
        if (position && typeof position.questionIndex === 'number' && position.timestamp) {
          resumePositions[examCode] = position;
        } else {
          devLog(`🧹 Removing invalid resume position for ${examCode}`);
        }
      });
      
      devLog("📍 Resume positions loaded successfully");
    }
  } catch (error) {
    devError("Failed to load resume positions:", error);
    resumePositions = {}; // Reset on error
  }
}

/**
 * Save resume positions to localStorage with size management
 */
function saveResumePositions() {
  try {
    // Limit the number of saved positions to prevent localStorage bloat
    const maxPositions = 20;
    const sortedPositions = Object.entries(resumePositions)
      .sort(([,a], [,b]) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, maxPositions);
    
    const trimmedPositions = Object.fromEntries(sortedPositions);
    
    localStorage.setItem("examViewerResumePositions", JSON.stringify(trimmedPositions));
    
    // Update in-memory positions to match saved ones
    resumePositions = trimmedPositions;
    
    devLog("📍 Resume positions saved");
  } catch (error) {
    devError("Failed to save resume positions:", error);
    showError("Failed to save study position. Your progress may not be preserved.");
  }
}

/**
 * Save current study position for a specific exam
 */
function saveResumePosition(examCode, questionIndex) {
  try {
    if (!settings.enableResumePosition) return;
    
    if (!examCode || typeof questionIndex !== 'number' || questionIndex < 0) {
      devError("Invalid parameters for saveResumePosition:", { examCode, questionIndex });
      return;
    }
    
    // Don't save position for very short sessions or at the beginning
    if (questionIndex === 0) return;
    
    resumePositions[examCode] = {
      questionIndex: questionIndex,
      timestamp: Date.now(),
      questionNumber: questionIndex + 1, // Human-readable question number
      totalQuestions: currentQuestions.length || 0,
      lastSessionId: statistics.currentSession?.id || null,
      examTitle: currentExam?.exam_name || examCode
    };
    
    saveResumePositions();
    devLog(`📍 Saved position for ${examCode}: question ${questionIndex + 1}`);
  } catch (error) {
    devError("Failed to save resume position:", error);
  }
}

/**
 * Get saved resume position for an exam
 */
function getResumePosition(examCode) {
  return resumePositions[examCode] || null;
}

/**
 * Clear resume position for a specific exam
 */
function clearResumePosition(examCode) {
  if (resumePositions[examCode]) {
    delete resumePositions[examCode];
    saveResumePositions();
    devLog(`🗑️ Cleared resume position for ${examCode}`);
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all storage functions for use in other modules
export {
  // Development utilities
  isDevelopmentMode,
  devLog,
  devError,
  
  // Data cleanup
  clearCorruptedData,
  
  // Statistics storage
  saveStatistics,
  loadStatistics,
  
  // Favorites storage
  saveFavorites,
  loadFavorites,
  
  // Settings storage
  loadSettings,
  saveSettings,
  
  // Resume position storage
  loadResumePositions,
  saveResumePositions,
  saveResumePosition,
  getResumePosition,
  clearResumePosition,
};