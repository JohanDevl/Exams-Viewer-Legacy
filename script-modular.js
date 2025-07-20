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
  loadData,
  saveData,
  loadStatistics,
  saveStatistics,
  loadFavorites,
  saveFavorites,
  loadSettings,
  saveSettings,
  getResumePosition,
  saveResumePosition,
  isDevelopmentMode,
  devLog,
  devError,
  cleanupStorage,
} from './js/modules/storage.js';

// Settings and configuration
import {
  loadSettingsUI,
  saveSettingsUI,
  applyTheme,
  updateToolbarVisibility,
  updateTooltipVisibility,
  updateAdvancedSearchVisibility,
  updateMainProgressBarVisibility,
  setupSettingsEventListeners,
  initializeSettings,
} from './js/modules/settings.js';

// UI effects and feedback
import {
  showLoading,
  showError,
  showSuccess,
  showSwipeIndicator,
  hideSwipeIndicators,
  addHapticFeedback,
  addProgressMilestoneEffects,
  triggerMilestoneAnimation,
  resetMilestoneStates,
  animateNumberChange,
  showExportModal,
  hideExportModal,
  showValidationFeedbackModal,
  showChangelogModal,
  showKeyboardHelp,
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
  addQuestionNote,
  removeQuestionNote,
  getQuestionNote,
  addCustomCategory,
  removeCustomCategory,
  getAllCategories,
  toggleRevisionMode,
  updateRevisionFilter,
  getFilteredQuestions,
  getFavoritesStats,
  resetFavoritesData,
  exportFavorites,
  importFavorites,
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
  window.loadData = loadData;
  window.saveData = saveData;
  window.loadStatistics = loadStatistics;
  window.saveStatistics = saveStatistics;
  window.loadFavorites = loadFavorites;
  window.saveFavorites = saveFavorites;
  window.loadSettings = loadSettings;
  window.saveSettings = saveSettings;
  window.getResumePosition = getResumePosition;
  window.saveResumePosition = saveResumePosition;
  window.isDevelopmentMode = isDevelopmentMode;
  window.devLog = devLog;
  window.devError = devError;
  window.cleanupStorage = cleanupStorage;

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
  window.addHapticFeedback = addHapticFeedback;
  window.addProgressMilestoneEffects = addProgressMilestoneEffects;
  window.triggerMilestoneAnimation = triggerMilestoneAnimation;
  window.resetMilestoneStates = resetMilestoneStates;
  window.animateNumberChange = animateNumberChange;
  window.showExportModal = showExportModal;
  window.hideExportModal = hideExportModal;
  window.showValidationFeedbackModal = showValidationFeedbackModal;
  window.showChangelogModal = showChangelogModal;
  window.showKeyboardHelp = showKeyboardHelp;

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
  window.addQuestionNote = addQuestionNote;
  window.removeQuestionNote = removeQuestionNote;
  window.getQuestionNote = getQuestionNote;
  window.addCustomCategory = addCustomCategory;
  window.removeCustomCategory = removeCustomCategory;
  window.getAllCategories = getAllCategories;
  window.toggleRevisionMode = toggleRevisionMode;
  window.updateRevisionFilter = updateRevisionFilter;
  window.getFilteredQuestions = getFilteredQuestions;
  window.getFavoritesStats = getFavoritesStats;
  window.resetFavoritesData = resetFavoritesData;
  window.exportFavorites = exportFavorites;
  window.importFavorites = importFavorites;
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