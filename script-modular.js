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
  hideMainProgressBar,
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
  isQuestionAnsweredInCurrentSession,
  getMostRecentAnswer,
  getMostRecentAnswerCurrentSession,
  getQuestionStatus,
  clearQuestionStatusCache,
  clearQuestionStatusCacheForQuestion,
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
  getAnsweredQuestionsCount,
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
  window.hideMainProgressBar = hideMainProgressBar;
  window.showKeyboardHelp = showKeyboardHelp;
  window.displayChangelog = displayChangelog;

  // Statistics system
  window.recalculateTotalStats = recalculateTotalStats;
  window.getCurrentSessionStats = getCurrentSessionStats;
  window.getGlobalStats = getGlobalStats;
  window.isQuestionAnswered = isQuestionAnswered;
  window.isQuestionAnsweredInCurrentSession = isQuestionAnsweredInCurrentSession;
  window.getMostRecentAnswer = getMostRecentAnswer;
  window.getMostRecentAnswerCurrentSession = getMostRecentAnswerCurrentSession;
  window.getQuestionStatus = getQuestionStatus;
  window.clearQuestionStatusCache = clearQuestionStatusCache;
  window.clearQuestionStatusCacheForQuestion = clearQuestionStatusCacheForQuestion;
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
  window.getAnsweredQuestionsCount = getAnsweredQuestionsCount;
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

  // Sidebar toggle button
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Sidebar close button and overlay
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeSidebar);
  }
  
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Keyboard help button
  const keyboardHelpBtn = document.getElementById("keyboardHelpBtn");
  if (keyboardHelpBtn) {
    keyboardHelpBtn.addEventListener("click", showKeyboardHelp);
  }

  // History navigation buttons
  const historyBackBtn = document.getElementById("historyBackBtn");
  if (historyBackBtn) {
    historyBackBtn.addEventListener("click", navigateHistoryBack);
  }
  
  const historyForwardBtn = document.getElementById("historyForwardBtn");
  if (historyForwardBtn) {
    historyForwardBtn.addEventListener("click", navigateHistoryForward);
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
 * Update overview tab with CURRENT SESSION answered questions stats
 */
function updateOverviewTab() {
  const elements = {
    totalQuestions: document.getElementById("totalQuestions"),
    totalCorrect: document.getElementById("totalCorrect"),
    totalIncorrect: document.getElementById("totalIncorrect"),
    totalPreview: document.getElementById("totalPreview")
  };

  // Calculate actual answered questions from current session
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let previewAnswers = 0;
  
  // Count from current session questions directly
  if (window.statistics?.currentSession?.questions && window.statistics.currentSession.questions.length > 0) {
    window.statistics.currentSession.questions.forEach((question) => {
      const hasAnswers = (question.ua && question.ua.length > 0) || 
                        (question.userAnswers && question.userAnswers.length > 0);
      
      if (hasAnswers) {
        const isCorrect = question.ic !== undefined ? question.ic : question.isCorrect;
        if (isCorrect === true) {
          correctAnswers++;
        } else if (isCorrect === false) {
          incorrectAnswers++;
        }
      }
      
      // Count preview/highlight activities
      const hasPreviewActivity = (question.hvc && question.hvc > 0) || 
                                 (question.hbc && question.hbc > 0) ||
                                 (question.fat === 'p') ||
                                 (question.att && question.att.some(att => att.whe));
      
      if (hasPreviewActivity && !hasAnswers) {
        previewAnswers++;
      }
    });
  } else {
    // Fallback: try to get data from global statistics if current session is empty
    if (window.statistics?.totalStats) {
      correctAnswers = window.statistics.totalStats.totalCorrect || 0;
      incorrectAnswers = window.statistics.totalStats.totalIncorrect || 0;
      previewAnswers = window.statistics.totalStats.totalPreview || 0;
    }
  }

  // Total answered questions = correct + incorrect + preview
  const totalAnsweredQuestions = correctAnswers + incorrectAnswers + previewAnswers;

  // Map current session stats to display elements
  const statsMapping = {
    totalQuestions: totalAnsweredQuestions, // Show answered questions, not total exam questions
    totalCorrect: correctAnswers,
    totalIncorrect: incorrectAnswers,
    totalPreview: previewAnswers
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (element && statsMapping[key] !== undefined) {
      element.textContent = statsMapping[key];
    }
  });
}

/**
 * Update exams tab with current session focus
 */
function updateExamsTab() {
  const examsList = document.getElementById("examStatsList");
  if (!examsList) return;

  examsList.innerHTML = "";
  
  // Show current session exam first if available
  if (window.statistics?.currentSession && window.currentExam) {
    const examCode = window.currentExam.exam_code || window.currentExam.code;
    const examName = window.currentExam.title || window.currentExam.exam_name || examCode;
    
    // Calculate answered questions from current session
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let previewAnswers = 0;
    
    if (window.statistics.currentSession.questions && window.statistics.currentSession.questions.length > 0) {
      window.statistics.currentSession.questions.forEach(question => {
        const hasAnswers = (question.ua && question.ua.length > 0) || 
                          (question.userAnswers && question.userAnswers.length > 0);
        
        if (hasAnswers) {
          const isCorrect = question.ic !== undefined ? question.ic : question.isCorrect;
          if (isCorrect === true) {
            correctAnswers++;
          } else if (isCorrect === false) {
            incorrectAnswers++;
          }
        }
        
        // Count preview/highlight activities
        const hasPreviewActivity = (question.hvc && question.hvc > 0) || 
                                   (question.hbc && question.hbc > 0) ||
                                   (question.fat === 'p') ||
                                   (question.att && question.att.some(att => att.whe));
        
        if (hasPreviewActivity && !hasAnswers) {
          previewAnswers++;
        }
      });
    }
    
    const totalAnsweredQuestions = correctAnswers + incorrectAnswers + previewAnswers;
    const accuracy = (correctAnswers + incorrectAnswers) > 0 ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) : 0;
    
    if (examCode && totalAnsweredQuestions > 0) {
      const examDiv = document.createElement("div");
      examDiv.className = "exam-stat-item current-session";
      examDiv.innerHTML = `
        <div class="exam-header">
          <strong>${examName}</strong>
          <span class="session-badge">Current Session</span>
        </div>
        <div class="exam-stats">
          <div class="stat-group">
            <span class="stat-label">Total Questions:</span>
            <span class="stat-value">${totalAnsweredQuestions}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Correct:</span>
            <span class="stat-value correct">${correctAnswers}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Incorrect:</span>
            <span class="stat-value incorrect">${incorrectAnswers}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Preview:</span>
            <span class="stat-value preview">${previewAnswers}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value">${accuracy}%</span>
          </div>
        </div>
      `;
      examsList.appendChild(examDiv);
    }
  }
  
  // Show global exam stats if available
  if (window.statistics?.totalStats?.examStats) {
    const globalExamsTitle = document.createElement("div");
    globalExamsTitle.className = "exams-section-title";
    globalExamsTitle.innerHTML = "<h4>All Time Statistics</h4>";
    examsList.appendChild(globalExamsTitle);
    
    Object.entries(window.statistics.totalStats.examStats).forEach(([examCode, stats]) => {
      // Calculate answered questions for global stats (not total questions in exam)
      const totalAnsweredGlobal = (stats.totalCorrect || 0) + (stats.totalIncorrect || 0) + (stats.totalPreview || 0);
      const accuracy = (stats.totalCorrect || 0) + (stats.totalIncorrect || 0) > 0 
        ? Math.round(((stats.totalCorrect || 0) / ((stats.totalCorrect || 0) + (stats.totalIncorrect || 0))) * 100) 
        : 0;
      
      const examDiv = document.createElement("div");
      examDiv.className = "exam-stat-item global-stats";
      examDiv.innerHTML = `
        <div class="exam-header">
          <strong>${stats.examName || examCode}</strong>
          <span class="sessions-count">${stats.sessionsCount || 0} sessions</span>
        </div>
        <div class="exam-stats">
          <div class="stat-group">
            <span class="stat-label">Total Questions:</span>
            <span class="stat-value">${totalAnsweredGlobal}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Correct:</span>
            <span class="stat-value correct">${stats.totalCorrect || 0}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Incorrect:</span>
            <span class="stat-value incorrect">${stats.totalIncorrect || 0}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Preview:</span>
            <span class="stat-value preview">${stats.totalPreview || 0}</span>
          </div>
          <div class="stat-group">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value">${accuracy}%</span>
          </div>
        </div>
      `;
      examsList.appendChild(examDiv);
    });
  }
  
  if (examsList.children.length === 0) {
    examsList.innerHTML = '<div class="no-data">No exam statistics available yet.</div>';
  }
}

/**
 * Update sessions tab with enhanced display
 */
function updateSessionsTab() {
  const sessionsList = document.getElementById("sessionsList");
  if (!sessionsList) return;

  sessionsList.innerHTML = "";
  
  // Show current session first
  if (window.statistics?.currentSession) {
    const currentSession = window.statistics.currentSession;
    const currentSessionStats = getCurrentSessionStats();
    
    const sessionDiv = document.createElement("div");
    sessionDiv.className = "session-item current-session";
    const examName = currentSession.examName || currentSession.en || (window.currentExam?.title) || "Current Exam";
    const startTime = currentSession.startTime || currentSession.st || Date.now();
    const date = new Date(startTime).toLocaleString();
    const duration = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    
    sessionDiv.innerHTML = `
      <div class="session-header">
        <strong>${examName}</strong>
        <span class="current-badge">Active Session</span>
      </div>
      <div class="session-details">
        <div class="session-info">
          <span class="session-date">${date}</span>
          <span class="session-duration">${duration}min</span>
        </div>
        <div class="session-stats">
          <span class="questions-stats">${currentSessionStats.totalAnswered}/${currentSessionStats.totalQuestions} questions</span>
          <span class="accuracy-stats">${currentSessionStats.accuracy}% accuracy</span>
          <span class="answers-breakdown">
            <span class="correct">${currentSessionStats.correctAnswers} ✓</span>
            <span class="incorrect">${currentSessionStats.incorrectAnswers} ✗</span>
            <span class="preview">${currentSessionStats.previewAnswers} 👁</span>
          </span>
        </div>
      </div>
    `;
    sessionsList.appendChild(sessionDiv);
  }
  
  // Show historical sessions
  if (window.statistics?.sessions?.length > 0) {
    const pastSessionsTitle = document.createElement("div");
    pastSessionsTitle.className = "sessions-section-title";
    pastSessionsTitle.innerHTML = "<h4>Previous Sessions</h4>";
    sessionsList.appendChild(pastSessionsTitle);
    
    const recentSessions = window.statistics.sessions.slice(-10).reverse();
    
    recentSessions.forEach((session, index) => {
      const sessionDiv = document.createElement("div");
      sessionDiv.className = "session-item past-session";
      
      const examName = session.examName || session.en || "Unknown Exam";
      const startTime = session.startTime || session.st;
      const endTime = session.endTime || session.et;
      const date = startTime ? new Date(startTime).toLocaleDateString() : "Unknown Date";
      const time = startTime ? new Date(startTime).toLocaleTimeString() : "";
      
      const totalQuestions = session.totalQuestions || session.tq || 0;
      const correctAnswers = session.correctAnswers || session.ca || 0;
      const incorrectAnswers = session.incorrectAnswers || session.ia || 0;
      const previewAnswers = session.previewAnswers || session.pa || 0;
      const totalTime = session.totalTime || session.tt || 0;
      
      const accuracy = (correctAnswers + incorrectAnswers) > 0 
        ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) 
        : 0;
      
      const duration = totalTime > 0 
        ? `${Math.round(totalTime / 60)}min` 
        : (startTime && endTime ? `${Math.round((endTime - startTime) / 1000 / 60)}min` : "");
      
      sessionDiv.innerHTML = `
        <div class="session-header">
          <strong>${examName}</strong>
          <span class="session-index">#${recentSessions.length - index}</span>
        </div>
        <div class="session-details">
          <div class="session-info">
            <span class="session-date">${date} ${time}</span>
            ${duration ? `<span class="session-duration">${duration}</span>` : ''}
          </div>
          <div class="session-stats">
            <span class="questions-stats">${correctAnswers + incorrectAnswers}/${totalQuestions} questions</span>
            <span class="accuracy-stats">${accuracy}% accuracy</span>
            <span class="answers-breakdown">
              <span class="correct">${correctAnswers} ✓</span>
              <span class="incorrect">${incorrectAnswers} ✗</span>
              <span class="preview">${previewAnswers} 👁</span>
            </span>
          </div>
        </div>
      `;
      sessionsList.appendChild(sessionDiv);
    });
  }
  
  if (sessionsList.children.length === 0) {
    sessionsList.innerHTML = '<div class="no-data">No session data available yet.</div>';
  }
}

/**
 * Update progress tab with modern visual design and comprehensive tracking
 */
function updateProgressTab() {
  const progressContent = document.getElementById("progressTab");
  if (!progressContent) return;

  const currentSessionStats = getCurrentSessionStats();
  const globalStats = getGlobalStats();
  
  let content = `
    <div class="progress-dashboard">
  `;
  
  // Current Session Progress Card
  if (window.statistics?.currentSession && currentSessionStats.totalQuestions > 0) {
    const completionPercentage = (currentSessionStats.totalAnswered / currentSessionStats.totalQuestions * 100).toFixed(1);
    const accuracyColor = currentSessionStats.accuracy >= 80 ? '#4CAF50' : currentSessionStats.accuracy >= 60 ? '#FF9800' : '#f44336';
    
    content += `
      <div class="progress-card current-session-card">
        <div class="card-header">
          <h3><i class="fas fa-play-circle"></i> Current Session</h3>
          <div class="session-badge active">Live</div>
        </div>
        
        <div class="progress-visual">
          <div class="circular-progress" style="--progress: ${completionPercentage}%">
            <div class="progress-value">${completionPercentage}%</div>
            <div class="progress-label">Complete</div>
          </div>
          
          <div class="session-metrics">
            <div class="metric answered">
              <span class="metric-number">${currentSessionStats.totalAnswered}</span>
              <span class="metric-text">Answered</span>
            </div>
            <div class="metric remaining">
              <span class="metric-number">${currentSessionStats.totalQuestions - currentSessionStats.totalAnswered}</span>
              <span class="metric-text">Remaining</span>
            </div>
          </div>
        </div>
        
        <div class="performance-indicators">
          <div class="performance-item accuracy" style="--accuracy-color: ${accuracyColor}">
            <div class="indicator-icon">🎯</div>
            <div class="indicator-content">
              <span class="indicator-value">${currentSessionStats.accuracy}%</span>
              <span class="indicator-label">Accuracy</span>
            </div>
          </div>
          
          <div class="performance-item time">
            <div class="indicator-icon">⏱️</div>
            <div class="indicator-content">
              <span class="indicator-value">${Math.round(currentSessionStats.timeSpent / 60)}m</span>
              <span class="indicator-label">Time Spent</span>
            </div>
          </div>
        </div>
        
        <div class="answer-distribution">
          <div class="distribution-item correct" style="width: ${currentSessionStats.totalAnswered > 0 ? (currentSessionStats.correctAnswers / currentSessionStats.totalAnswered) * 100 : 0}%">
            <span class="count">${currentSessionStats.correctAnswers}</span>
          </div>
          <div class="distribution-item incorrect" style="width: ${currentSessionStats.totalAnswered > 0 ? (currentSessionStats.incorrectAnswers / currentSessionStats.totalAnswered) * 100 : 0}%">
            <span class="count">${currentSessionStats.incorrectAnswers}</span>
          </div>
          <div class="distribution-item preview" style="width: ${currentSessionStats.totalAnswered > 0 ? (currentSessionStats.previewAnswers / currentSessionStats.totalAnswered) * 100 : 0}%">
            <span class="count">${currentSessionStats.previewAnswers}</span>
          </div>
        </div>
        <div class="distribution-labels">
          <span class="label correct">✓ Correct</span>
          <span class="label incorrect">✗ Incorrect</span>
          <span class="label preview">👁 Preview</span>
        </div>
      </div>
    `;
  }
  
  // Global Statistics Cards Grid
  if (globalStats.totalQuestions > 0) {
    const studyHours = Math.floor(globalStats.totalTime / 3600);
    const studyMinutes = Math.floor((globalStats.totalTime % 3600) / 60);
    
    // Calculate real answered questions from global stats
    const realAnsweredQuestions = globalStats.totalCorrect + globalStats.totalIncorrect + globalStats.totalPreview;
    
    content += `
      <div class="stats-grid">
        <div class="stat-card total-questions">
          <div class="stat-icon-circle">
            <div class="icon-content">📚</div>
          </div>
          <div class="stat-content">
            <div class="stat-number">${realAnsweredQuestions.toLocaleString()}</div>
            <div class="stat-label">QUESTIONS ANSWERED</div>
            <div class="stat-sublabel">All Time</div>
          </div>
        </div>
        
        <div class="stat-card accuracy">
          <div class="stat-icon-circle">
            <div class="icon-content">🎯</div>
          </div>
          <div class="stat-content">
            <div class="stat-number">${globalStats.overallAccuracy}%</div>
            <div class="stat-label">OVERALL ACCURACY</div>
            <div class="stat-sublabel">${globalStats.totalCorrect}/${globalStats.totalAnswered} correct</div>
          </div>
        </div>
        
        <div class="stat-card sessions">
          <div class="stat-icon-circle">
            <div class="icon-content">📅</div>
          </div>
          <div class="stat-content">
            <div class="stat-number">${globalStats.totalSessions}</div>
            <div class="stat-label">STUDY SESSIONS</div>
            <div class="stat-sublabel">${globalStats.examsCount} exams studied</div>
          </div>
        </div>
        
        <div class="stat-card study-time">
          <div class="stat-icon-circle">
            <div class="icon-content">⏰</div>
          </div>
          <div class="stat-content">
            <div class="stat-number">${studyHours}h ${studyMinutes}m</div>
            <div class="stat-label">STUDY TIME</div>
            <div class="stat-sublabel">${globalStats.totalSessions > 0 ? Math.round(globalStats.totalTime / globalStats.totalSessions / 60) : 0}m avg/session</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Learning Analytics & Trends
  if (window.statistics?.sessions?.length > 0) {
    const recentSessions = window.statistics.sessions.slice(-5);
    const accuracyTrend = recentSessions.map(session => {
      const correct = session.correctAnswers || session.ca || 0;
      const incorrect = session.incorrectAnswers || session.ia || 0;
      const total = correct + incorrect;
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    });
    
    const trendDirection = accuracyTrend.length >= 2 
      ? accuracyTrend[accuracyTrend.length - 1] - accuracyTrend[0]
      : 0;
    
    const trendIcon = trendDirection > 0 ? "📈" : trendDirection < 0 ? "📉" : "➡️";
    const trendText = trendDirection > 0 ? "Improving" : trendDirection < 0 ? "Declining" : "Stable";
    const trendColor = trendDirection > 0 ? "#4CAF50" : trendDirection < 0 ? "#f44336" : "#9E9E9E";
    
    content += `
      <div class="analytics-section">
        <div class="analytics-header">
          <div class="analytics-icon-circle">
            <div class="icon-content">📊</div>
          </div>
          <h3>Learning Analytics</h3>
        </div>
        
        <div class="analytics-content">
          <div class="trend-card">
            <div class="trend-status-indicator" style="background-color: ${trendColor}">
              <span class="trend-emoji">${trendIcon}</span>
            </div>
            <div class="trend-details">
              <div class="trend-title">${trendText}</div>
              <div class="trend-subtitle">${Math.abs(trendDirection)}% change</div>
            </div>
          </div>
          
          <div class="accuracy-progress-section">
            <div class="progress-label">Recent Accuracy Trend:</div>
            <div class="accuracy-chart">
              ${accuracyTrend.map((accuracy, index) => `
                <div class="chart-bar ${index === accuracyTrend.length - 1 ? 'current' : ''}" 
                     style="height: ${Math.max(accuracy * 0.8, 8)}px; background-color: ${accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336'}">
                  <div class="bar-label">${accuracy}%</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-icon-circle" style="background-color: ${trendColor}">
              <span>💡</span>
            </div>
            <div class="insight-message">
              ${trendDirection > 5 ? "Great progress! Keep up the excellent work." :
                trendDirection > 0 ? "You're improving steadily. Nice work!" :
                trendDirection === 0 ? "Consistent performance. Try challenging yourself more!" :
                "Focus on reviewing incorrect answers to improve."}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  content += `</div>`; // Close progress-dashboard
  
  if (globalStats.totalQuestions === 0 && (!window.statistics?.currentSession || currentSessionStats.totalQuestions === 0)) {
    content = `
      <div class="empty-progress">
        <div class="empty-icon">📈</div>
        <h3>Ready to Track Your Progress?</h3>
        <p>Start answering questions to see detailed analytics, trends, and insights about your learning journey!</p>
      </div>
    `;
  }
  
  progressContent.innerHTML = content;
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