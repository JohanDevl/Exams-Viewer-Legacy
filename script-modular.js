/**
 * Exams-Viewer Modular Entry Point
 * 
 * This is the main entry point for the modular version of Exams-Viewer.
 * It imports all modules and orchestrates the application initialization.
 * 
 * Created as part of the modular architecture migration (Étape 18).
 */

// ===========================
// CORE MODULE IMPORTS
// ===========================

// Core state management (foundation)
import {
  initializeState,
  initializeGlobalState,
  syncGlobalState,
  getExamState,
  getSearchState,
  getAppSettings,
  getAllState,
  updateExamState,
  updateSearchState,
  updateAppSettings,
  resetAllState,
  getStateSummary,
} from './js/core/state.js';

// Data models
import {
  ExamSession,
  QuestionAttempt,
  compressData,
  decompressData,
  startExamSession,
  endCurrentSession,
  trackQuestionAttempt,
  trackQuestionVisit,
} from './js/core/models.js';

// Core navigation
import {
  navigateQuestion,
  navigateToQuestionIndex,
  navigateToQuestionAsync,
  navigateToRandomQuestion,
  jumpToQuestion,
  jumpToQuestionNumber,
  displayCurrentQuestion,
  displayAnswers,
  toggleAnswerSelection,
  validateAnswers,
  resetAnswers,
  goToHome,
  updateQuestionStatistics,
  updateQuestionJumpMaxValue,
} from './js/core/navigation.js';

// ===========================
// MODULE IMPORTS
// ===========================

// Storage management
import {
  loadStatistics,
  saveStatistics,
  loadFavorites,
  saveFavorites,
  loadSettings,
  saveSettings,
  getResumePosition,
  saveResumePosition,
  clearResumePosition,
  isDevelopmentMode,
  devLog,
  devError,
  clearCorruptedData,
} from './js/modules/storage.js';

// Settings and configuration
import {
  loadSettingsUI,
  saveSettingsUI,
  applyTheme,
  updateToolbarVisibility,
  updateTooltipVisibility,
  updateAdvancedSearchVisibility,
  setupSettingsEventListeners,
  initializeSettings,
} from './js/modules/settings.js';

// UI effects and feedback
import {
  showLoading,
  showError,
  showSuccess,
  addProgressMilestoneEffects,
  triggerMilestoneAnimation,
  resetMilestoneStates,
  animateNumberChange,
  showExportModal,
  hideExportModal,
  showKeyboardHelp,
  displayChangelog,
  updateMainProgressBarVisibility,
} from './js/modules/ui-effects.js';

// Statistics system
import {
  recalculateTotalStats,
  getCurrentSessionStats,
  getGlobalStats,
  isQuestionAnswered,
  getMostRecentAnswer,
  getQuestionStatus,
  clearQuestionStatusCache,
  cleanCorruptedStatistics,
} from './js/modules/statistics.js';

// Favorites and notes system
import {
  toggleQuestionFavorite,
  isQuestionFavorite,
  updateQuestionNote,
  getQuestionNote,
  addCustomCategory,
  removeCustomCategory,
  getAllCategories,
  toggleRevisionMode,
  updateRevisionFilter,
  getFilteredQuestions,
  getFavoritesStats,
  cleanupObsoleteData,
} from './js/modules/favorites.js';

// Search and filter system
import {
  initializeSearchInterface,
  resetSearchUI,
  clearSearchCache,
  searchQuestions,
  applyTextSearch,
  applyStatusFilters,
  applyCurrentFilters,
  resetAllFilters,
  getQuestionNumberSuggestions,
  showAutocompleteSuggestions,
  updateFilterCounts,
  handleSearchInput,
  handleFilterChange,
  setupSearchEventListeners,
} from './js/modules/search.js';

// Resume position system
import {
  saveStudyPosition,
  getStudyPosition,
  clearStudyPosition,
  autoSavePosition,
  setupAutoSave,
  showResumeDialog,
  checkAndShowResumeDialog,
  resumeToPosition,
  validateSavedPosition,
  cleanInvalidPositions,
  initializeResumePosition,
  handleNavigationChange,
} from './js/modules/resume-position.js';

// Mobile navigation
import {
  setupMobileTooltips,
  setupTouchGestures,
  manageSwipeIndicators,
  createSwipeIndicators,
  showSwipeIndicator,
  hideSwipeIndicators,
  addHapticFeedback as mobileHapticFeedback,
  setupTouchFeedback,
  createMobileBottomNavigation,
  setupSidebarSwipeToClose,
  handleMobileResize,
  setupMobileResizeListener,
  isMobileDevice,
  refreshMobileNavigation,
  initializeMobileNavigation,
} from './js/modules/mobile-navigation.js';

// Enhanced navigation
import {
  addToNavigationHistory,
  navigateHistoryBack,
  navigateHistoryForward,
  updateHistoryButtons,
  clearNavigationHistory,
  getNavigationHistoryState,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  isSidebarOpen,
  updateProgressSidebar,
  updateProgressBar,
  updateMainProgressBar,
  getFavoritesCount,
  setupKeyboardShortcuts,
  handleKeyboardShortcuts,
  removeKeyboardShortcuts,
  initializeEnhancedNavigation,
  refreshEnhancedNavigation,
  navigateToQuestionWithHistory,
} from './js/modules/enhanced-navigation.js';

// Exam loading and discovery
import {
  discoverAvailableExams,
  displayAvailableExams,
  getResumeIndicatorText,
  getTimeAgo,
  loadExam,
  processEmbeddedImages,
} from './js/modules/exam-loader.js';

// Lazy loading system
import {
  checkForChunkedExam,
  loadChunk,
  preloadChunks,
  getChunkIdForQuestion,
  ensureQuestionLoaded,
  assembleCurrentQuestions,
  clearUnusedChunks,
  getMemoryStats,
  resetLazyLoadingConfig,
  createPerformanceMonitor,
  initializeLazyLoading,
} from './js/modules/lazy-loading.js';

// ===========================
// GLOBAL FUNCTION ASSIGNMENTS
// ===========================

/**
 * Expose all functions globally for backward compatibility
 */
function exposeGlobalFunctions() {
  // Core state management
  window.initializeState = initializeState;
  window.initializeGlobalState = initializeGlobalState;
  window.syncGlobalState = syncGlobalState;
  window.getExamState = getExamState;
  window.getSearchState = getSearchState;
  window.getAppSettings = getAppSettings;
  window.getAllState = getAllState;
  window.updateExamState = updateExamState;
  window.updateSearchState = updateSearchState;
  window.updateAppSettings = updateAppSettings;
  window.resetAllState = resetAllState;
  window.getStateSummary = getStateSummary;

  // Data models
  window.ExamSession = ExamSession;
  window.QuestionAttempt = QuestionAttempt;
  window.compressData = compressData;
  window.decompressData = decompressData;
  window.startExamSession = startExamSession;
  window.endCurrentSession = endCurrentSession;
  window.trackQuestionAttempt = trackQuestionAttempt;
  window.trackQuestionVisit = trackQuestionVisit;

  // Core navigation
  window.navigateQuestion = navigateQuestion;
  window.navigateToQuestionIndex = navigateToQuestionIndex;
  window.navigateToQuestionAsync = navigateToQuestionAsync;
  window.navigateToRandomQuestion = navigateToRandomQuestion;
  window.jumpToQuestion = jumpToQuestion;
  window.jumpToQuestionNumber = jumpToQuestionNumber;
  window.displayCurrentQuestion = displayCurrentQuestion;
  window.displayAnswers = displayAnswers;
  window.toggleAnswerSelection = toggleAnswerSelection;
  window.validateAnswers = validateAnswers;
  window.resetAnswers = resetAnswers;
  window.goToHome = goToHome;
  window.updateQuestionStatistics = updateQuestionStatistics;
  window.updateQuestionJumpMaxValue = updateQuestionJumpMaxValue;

  // Storage management
  window.loadStatistics = loadStatistics;
  window.saveStatistics = saveStatistics;
  window.loadFavorites = loadFavorites;
  window.saveFavorites = saveFavorites;
  window.loadSettings = loadSettings;
  window.saveSettings = saveSettings;
  window.getResumePosition = getResumePosition;
  window.saveResumePosition = saveResumePosition;
  window.clearResumePosition = clearResumePosition;
  window.isDevelopmentMode = isDevelopmentMode;
  window.devLog = devLog;
  window.devError = devError;
  window.clearCorruptedData = clearCorruptedData;

  // Settings and configuration
  window.loadSettingsUI = loadSettingsUI;
  window.saveSettingsUI = saveSettingsUI;
  window.applyTheme = applyTheme;
  window.updateToolbarVisibility = updateToolbarVisibility;
  window.updateTooltipVisibility = updateTooltipVisibility;
  window.updateAdvancedSearchVisibility = updateAdvancedSearchVisibility;
  window.updateMainProgressBarVisibility = updateMainProgressBarVisibility;
  window.setupSettingsEventListeners = setupSettingsEventListeners;
  window.initializeSettings = initializeSettings;

  // UI effects
  window.showLoading = showLoading;
  window.showError = showError;
  window.showSuccess = showSuccess;
  window.showSwipeIndicator = showSwipeIndicator;
  window.hideSwipeIndicators = hideSwipeIndicators;
  window.addHapticFeedback = mobileHapticFeedback;
  window.addProgressMilestoneEffects = addProgressMilestoneEffects;
  window.triggerMilestoneAnimation = triggerMilestoneAnimation;
  window.resetMilestoneStates = resetMilestoneStates;
  window.animateNumberChange = animateNumberChange;
  window.showExportModal = showExportModal;
  window.hideExportModal = hideExportModal;
  window.showKeyboardHelp = showKeyboardHelp;
  window.displayChangelog = displayChangelog;

  // Statistics system
  window.recalculateTotalStats = recalculateTotalStats;
  window.getCurrentSessionStats = getCurrentSessionStats;
  window.getGlobalStats = getGlobalStats;
  window.isQuestionAnswered = isQuestionAnswered;
  window.getMostRecentAnswer = getMostRecentAnswer;
  window.getQuestionStatus = getQuestionStatus;
  window.clearQuestionStatusCache = clearQuestionStatusCache;
  window.cleanCorruptedStatistics = cleanCorruptedStatistics;

  // Favorites and notes
  window.toggleQuestionFavorite = toggleQuestionFavorite;
  window.isQuestionFavorite = isQuestionFavorite;
  window.updateQuestionNote = updateQuestionNote;
  window.getQuestionNote = getQuestionNote;
  window.addCustomCategory = addCustomCategory;
  window.removeCustomCategory = removeCustomCategory;
  window.getAllCategories = getAllCategories;
  window.toggleRevisionMode = toggleRevisionMode;
  window.updateRevisionFilter = updateRevisionFilter;
  window.getFilteredQuestions = getFilteredQuestions;
  window.getFavoritesStats = getFavoritesStats;
  // Note: resetFavoritesData, exportFavorites, importFavorites not implemented in favorites module yet
  // window.resetFavoritesData = resetFavoritesData;
  // window.exportFavorites = exportFavorites;
  // window.importFavorites = importFavorites;
  window.cleanupObsoleteData = cleanupObsoleteData;

  // Search and filter
  window.initializeSearchInterface = initializeSearchInterface;
  window.resetSearchUI = resetSearchUI;
  window.clearSearchCache = clearSearchCache;
  window.searchQuestions = searchQuestions;
  window.applyTextSearch = applyTextSearch;
  window.applyStatusFilters = applyStatusFilters;
  window.applyCurrentFilters = applyCurrentFilters;
  window.resetAllFilters = resetAllFilters;
  window.getQuestionNumberSuggestions = getQuestionNumberSuggestions;
  window.showAutocompleteSuggestions = showAutocompleteSuggestions;
  window.updateFilterCounts = updateFilterCounts;
  window.handleSearchInput = handleSearchInput;
  window.handleFilterChange = handleFilterChange;
  window.setupSearchEventListeners = setupSearchEventListeners;

  // Resume position
  window.saveStudyPosition = saveStudyPosition;
  window.getStudyPosition = getStudyPosition;
  window.clearStudyPosition = clearStudyPosition;
  window.autoSavePosition = autoSavePosition;
  window.setupAutoSave = setupAutoSave;
  window.showResumeDialog = showResumeDialog;
  window.checkAndShowResumeDialog = checkAndShowResumeDialog;
  window.resumeToPosition = resumeToPosition;
  window.validateSavedPosition = validateSavedPosition;
  window.cleanInvalidPositions = cleanInvalidPositions;
  window.initializeResumePosition = initializeResumePosition;
  window.handleNavigationChange = handleNavigationChange;

  // Mobile navigation
  window.setupMobileTooltips = setupMobileTooltips;
  window.setupTouchGestures = setupTouchGestures;
  window.manageSwipeIndicators = manageSwipeIndicators;
  window.createSwipeIndicators = createSwipeIndicators;
  window.setupTouchFeedback = setupTouchFeedback;
  window.createMobileBottomNavigation = createMobileBottomNavigation;
  window.setupSidebarSwipeToClose = setupSidebarSwipeToClose;
  window.handleMobileResize = handleMobileResize;
  window.setupMobileResizeListener = setupMobileResizeListener;
  window.isMobileDevice = isMobileDevice;
  window.refreshMobileNavigation = refreshMobileNavigation;
  window.initializeMobileNavigation = initializeMobileNavigation;

  // Enhanced navigation
  window.addToNavigationHistory = addToNavigationHistory;
  window.navigateHistoryBack = navigateHistoryBack;
  window.navigateHistoryForward = navigateHistoryForward;
  window.updateHistoryButtons = updateHistoryButtons;
  window.clearNavigationHistory = clearNavigationHistory;
  window.getNavigationHistoryState = getNavigationHistoryState;
  window.toggleSidebar = toggleSidebar;
  window.openSidebar = openSidebar;
  window.closeSidebar = closeSidebar;
  window.isSidebarOpen = isSidebarOpen;
  window.updateProgressSidebar = updateProgressSidebar;
  window.updateProgressBar = updateProgressBar;
  window.updateMainProgressBar = updateMainProgressBar;
  window.getFavoritesCount = getFavoritesCount;
  window.setupKeyboardShortcuts = setupKeyboardShortcuts;
  window.handleKeyboardShortcuts = handleKeyboardShortcuts;
  window.removeKeyboardShortcuts = removeKeyboardShortcuts;
  window.initializeEnhancedNavigation = initializeEnhancedNavigation;
  window.refreshEnhancedNavigation = refreshEnhancedNavigation;
  window.navigateToQuestionWithHistory = navigateToQuestionWithHistory;

  // Exam loading
  window.discoverAvailableExams = discoverAvailableExams;
  window.displayAvailableExams = displayAvailableExams;
  window.getResumeIndicatorText = getResumeIndicatorText;
  window.getTimeAgo = getTimeAgo;
  window.loadExam = loadExam;
  window.processEmbeddedImages = processEmbeddedImages;

  // Lazy loading
  window.checkForChunkedExam = checkForChunkedExam;
  window.loadChunk = loadChunk;
  window.preloadChunks = preloadChunks;
  window.getChunkIdForQuestion = getChunkIdForQuestion;
  window.ensureQuestionLoaded = ensureQuestionLoaded;
  window.assembleCurrentQuestions = assembleCurrentQuestions;
  window.clearUnusedChunks = clearUnusedChunks;
  window.getMemoryStats = getMemoryStats;
  window.resetLazyLoadingConfig = resetLazyLoadingConfig;
  window.createPerformanceMonitor = createPerformanceMonitor;
  window.initializeLazyLoading = initializeLazyLoading;

  // Statistics UI functions
  window.displayStatistics = displayStatistics;
  window.showStatsTab = showStatsTab;
  window.updateOverviewTab = updateOverviewTab;
  window.updateExamsTab = updateExamsTab;
  window.updateSessionsTab = updateSessionsTab;
  window.updateProgressTab = updateProgressTab;
  window.exportStatistics = exportStatistics;
  window.resetAllStatistics = resetAllStatistics;

  devLog("🌍 All functions exposed globally for backward compatibility");
}

// ===========================
// INITIALIZATION ORCHESTRATION
// ===========================

/**
 * Initialize all modules in the correct order
 */
async function initializeApplication() {
  try {
    devLog("🚀 Starting modular application initialization...");

    // 1. Initialize core state management first
    initializeState();
    initializeGlobalState();
    devLog("✅ Core state management initialized");

    // 2. Load and apply settings
    loadSettings();
    initializeSettings();
    devLog("✅ Settings loaded and initialized");

    // 3. Load user data
    loadStatistics();
    loadFavorites();
    devLog("✅ User data loaded");

    // 4. Initialize lazy loading system
    initializeLazyLoading();
    devLog("✅ Lazy loading system initialized");

    // 5. Initialize resume position system
    initializeResumePosition();
    devLog("✅ Resume position system initialized");

    // 6. Initialize mobile navigation if on mobile device
    if (isMobileDevice()) {
      initializeMobileNavigation();
      devLog("✅ Mobile navigation initialized");
    }

    // 7. Initialize enhanced navigation
    initializeEnhancedNavigation();
    devLog("✅ Enhanced navigation initialized");

    // 8. Discover and display available exams
    await discoverAvailableExams();
    await displayAvailableExams();
    devLog("✅ Exams discovered and displayed");

    // 9. Setup search interface if enabled
    if (getAppSettings().showAdvancedSearch) {
      initializeSearchInterface();
      devLog("✅ Search interface initialized");
    }

    // 10. Setup event listeners
    setupSettingsEventListeners();
    setupSearchEventListeners();
    setupKeyboardShortcuts();
    devLog("✅ Event listeners setup complete");

    // 11. Apply initial theme
    applyTheme();
    devLog("✅ Theme applied");

    // 12. Update UI visibility
    updateToolbarVisibility();
    updateTooltipVisibility();
    updateAdvancedSearchVisibility();
    updateMainProgressBarVisibility();
    devLog("✅ UI visibility updated");

    // 13. Setup mobile listeners
    setupMobileResizeListener();
    devLog("✅ Mobile resize listeners setup");

    devLog("🎉 Modular application initialization complete!");
    
    // Show success message
    if (typeof showSuccess === 'function') {
      setTimeout(() => {
        showSuccess("Exams Viewer loaded successfully! 🚀");
      }, 500);
    }

  } catch (error) {
    devError("❌ Application initialization failed:", error);
    if (typeof showError === 'function') {
      showError(`Initialization failed: ${error.message}`);
    }
  }
}

// ===========================
// SETUP EVENT LISTENERS
// ===========================

/**
 * Setup main application event listeners
 */
function setupMainEventListeners() {
  // Load exam button
  const loadExamBtn = document.getElementById("loadExamBtn");
  if (loadExamBtn) {
    loadExamBtn.addEventListener("click", async () => {
      const examCodeInput = document.getElementById("examCode");
      if (examCodeInput && examCodeInput.value.trim()) {
        await loadExam(examCodeInput.value.trim().toUpperCase());
      }
    });
  }

  // Load exam on Enter key
  const examCodeInput = document.getElementById("examCode");
  if (examCodeInput) {
    examCodeInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const examCode = examCodeInput.value.trim();
        if (examCode) {
          await loadExam(examCode.toUpperCase());
        }
      }
    });
  }

  // Home button
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", goToHome);
  }

  // Export button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", showExportModal);
  }

  // Previous/Next navigation buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const randomBtn = document.getElementById("randomBtn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => navigateQuestion(-1));
  }
  
  if (nextBtn) {
    nextBtn.addEventListener("click", () => navigateQuestion(1));
  }
  
  if (randomBtn) {
    randomBtn.addEventListener("click", navigateToRandomQuestion);
  }

  // Question jump input
  const questionJumpInput = document.getElementById("questionJump");
  if (questionJumpInput) {
    questionJumpInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const questionNum = parseInt(questionJumpInput.value, 10);
        if (!isNaN(questionNum) && questionNum > 0) {
          jumpToQuestionNumber(questionNum);
        }
      }
    });
  }

  // Validate answers button
  const validateBtn = document.getElementById("validateBtn");
  if (validateBtn) {
    validateBtn.addEventListener("click", validateAnswers);
  }

  // Reset answers button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAnswers);
  }

  // Statistics button
  const statisticsBtn = document.getElementById("statisticsBtn");
  if (statisticsBtn) {
    statisticsBtn.addEventListener("click", () => {
      if (typeof window.displayStatistics === 'function') {
        window.displayStatistics();
      }
    });
  }

  // Close stats modal
  const closeStatsModal = document.getElementById("closeStatsModal");
  if (closeStatsModal) {
    closeStatsModal.addEventListener("click", () => {
      const modal = document.getElementById("statisticsModal");
      if (modal) modal.style.display = "none";
    });
  }

  // Statistics tabs
  document.querySelectorAll(".stats-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (typeof window.showStatsTab === 'function') {
        window.showStatsTab(tab.dataset.tab);
      }
    });
  });

  // Export stats button
  const exportStatsBtn = document.getElementById("exportStatsBtn");
  if (exportStatsBtn) {
    exportStatsBtn.addEventListener("click", () => {
      if (typeof window.exportStatistics === 'function') {
        window.exportStatistics();
      }
    });
  }

  // Reset stats button
  const resetStatsBtn = document.getElementById("resetStatsBtn");
  if (resetStatsBtn) {
    resetStatsBtn.addEventListener("click", () => {
      if (typeof window.resetAllStatistics === 'function') {
        window.resetAllStatistics();
      }
    });
  }

  // Settings button
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      const modal = document.getElementById("settingsModal");
      if (modal) modal.style.display = "flex";
    });
  }

  // Close settings modal
  const closeModal = document.getElementById("closeModal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal = document.getElementById("settingsModal");
      if (modal) modal.style.display = "none";
      if (typeof window.saveSettings === 'function') {
        window.saveSettings();
      }
    });
  }

  // Dark mode toggle in settings
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      if (typeof window.saveSettingsUI === 'function') {
        window.saveSettingsUI();
      }
    });
  }

  // Quick dark mode toggle button
  const darkModeBtn = document.getElementById("darkModeBtn");
  if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
      console.log("🎨 Dark mode button clicked");
      const toggle = document.getElementById("darkModeToggle");
      if (toggle) {
        const oldValue = toggle.checked;
        toggle.checked = !toggle.checked;
        console.log(`🔄 Toggle changed from ${oldValue} to ${toggle.checked}`);
        console.log("📄 window.settings before:", window.settings);
        
        if (typeof window.saveSettingsUI === 'function') {
          window.saveSettingsUI();
        }
        
        console.log("📄 window.settings after:", window.settings);
        console.log("🎨 Body classes:", document.body.className);
      }
    });
  }

  devLog("🔗 Main event listeners setup complete");
}

// ===========================
// APPLICATION STARTUP
// ===========================

/**
 * Start the application when DOM is ready
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Expose functions globally first
    exposeGlobalFunctions();
    
    // Setup main event listeners
    setupMainEventListeners();
    
    // Initialize the application
    await initializeApplication();
    
    devLog("🎯 Exams-Viewer modular application ready!");
    
  } catch (error) {
    console.error("❌ Failed to start Exams-Viewer:", error);
    if (typeof showError === 'function') {
      showError(`Failed to start application: ${error.message}`);
    }
  }
});

// ===========================
// MISSING STATISTICS FUNCTIONS
// ===========================

/**
 * Display statistics modal
 */
function displayStatistics() {
  const modal = document.getElementById("statisticsModal");
  if (modal) {
    modal.style.display = "flex";
    showStatsTab("overview");
    updateOverviewTab();
    updateExamsTab();
    updateSessionsTab();
    updateProgressTab();
  }
}

/**
 * Show specific statistics tab
 */
function showStatsTab(tabName) {
  const tabs = document.querySelectorAll(".stats-tab");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active");
    }
  });

  const contents = document.querySelectorAll(".stats-tab-content");
  contents.forEach((content) => {
    content.classList.remove("active");
  });

  const targetTab = document.getElementById(`${tabName}Tab`);
  if (targetTab) {
    targetTab.classList.add("active");
  }
}

/**
 * Update overview tab
 */
function updateOverviewTab() {
  if (typeof recalculateTotalStats === 'function') {
    recalculateTotalStats();
  }

  const totalStats = window.statistics?.totalStats;
  if (!totalStats) return;

  const elements = {
    totalQuestions: document.getElementById("totalQuestions"),
    totalCorrect: document.getElementById("totalCorrect"),
    totalIncorrect: document.getElementById("totalIncorrect"),
    totalPreview: document.getElementById("totalPreview")
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (element && totalStats[key] !== undefined) {
      element.textContent = totalStats[key];
    }
  });
}

/**
 * Update exams tab
 */
function updateExamsTab() {
  const examsList = document.getElementById("examStatsList");
  if (!examsList || !window.statistics?.totalStats?.examStats) return;

  examsList.innerHTML = "";
  Object.entries(window.statistics.totalStats.examStats).forEach(([exam, stats]) => {
    const examDiv = document.createElement("div");
    examDiv.className = "exam-stat-item";
    examDiv.innerHTML = `
      <strong>${exam}</strong><br>
      Questions: ${stats.questions || 0} | Correct: ${stats.correct || 0} | Incorrect: ${stats.incorrect || 0}
    `;
    examsList.appendChild(examDiv);
  });
}

/**
 * Update sessions tab
 */
function updateSessionsTab() {
  const sessionsList = document.getElementById("sessionsList");
  if (!sessionsList || !window.statistics?.sessions) return;

  sessionsList.innerHTML = "";
  const recentSessions = window.statistics.sessions.slice(-10).reverse();
  
  recentSessions.forEach(session => {
    const sessionDiv = document.createElement("div");
    sessionDiv.className = "session-item";
    const examName = session.en || session.examName || "Unknown Exam";
    const date = new Date(session.st || session.startTime).toLocaleDateString();
    sessionDiv.innerHTML = `
      <strong>${examName}</strong> - ${date}<br>
      Questions: ${(session.q || session.questions || []).length}
    `;
    sessionsList.appendChild(sessionDiv);
  });
}

/**
 * Update progress tab
 */
function updateProgressTab() {
  // Simple implementation - can be enhanced
  const progressContent = document.getElementById("progressTab");
  if (progressContent && window.statistics?.totalStats) {
    const stats = window.statistics.totalStats;
    const totalQuestions = stats.totalQuestions || 0;
    const accuracy = totalQuestions > 0 ? ((stats.totalCorrect || 0) / totalQuestions * 100).toFixed(1) : 0;
    
    let content = `<p>Overall Accuracy: ${accuracy}%</p>`;
    progressContent.innerHTML = content;
  }
}

/**
 * Export statistics
 */
function exportStatistics() {
  try {
    const dataToExport = {
      statistics: window.statistics,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exams-viewer-statistics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showSuccess === 'function') {
      showSuccess("Statistics exported successfully!");
    }
  } catch (error) {
    if (typeof showError === 'function') {
      showError("Failed to export statistics: " + error.message);
    }
  }
}

/**
 * Reset all statistics
 */
function resetAllStatistics() {
  if (confirm("Are you sure you want to reset ALL statistics? This action cannot be undone.")) {
    window.statistics = {
      sessions: [],
      currentSession: null,
      totalStats: {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalTime: 0,
        examStats: {}
      }
    };
    
    if (typeof saveStatistics === 'function') {
      saveStatistics();
    }
    
    // Refresh the display
    updateOverviewTab();
    updateExamsTab();
    updateSessionsTab();
    updateProgressTab();
    
    if (typeof showSuccess === 'function') {
      showSuccess("All statistics have been reset!");
    }
  }
}

// ===========================
// DEVELOPMENT UTILITIES
// ===========================

// Expose useful functions for console debugging in development mode
if (isDevelopmentMode()) {
  window.getModularInfo = () => {
    return {
      modules: [
        'Core State Management',
        'Data Models', 
        'Core Navigation',
        'Storage Management',
        'Settings & Configuration',
        'UI Effects',
        'Statistics System',
        'Favorites & Notes',
        'Search & Filter',
        'Resume Position',
        'Mobile Navigation',
        'Enhanced Navigation',
        'Exam Loading',
        'Lazy Loading'
      ],
      state: getStateSummary(),
      version: "Modular Architecture v1.0"
    };
  };
  
  window.resetApplication = () => {
    resetAllState();
    location.reload();
  };
  
  devLog("🔧 Development utilities available: getModularInfo(), resetApplication()");
}

devLog("📦 script-modular.js loaded successfully");