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
  trackQuestionHighlight,
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
  closeKeyboardHelp,
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
  getQuestionCategory,
  addCustomCategory,
  removeCustomCategory,
  getAllCategories,
  updateQuestionCategory,
  getFavoritesStats,
  cleanupObsoleteData,
} from './js/modules/favorites.js';

// Search and filter system
import {
  initializeSearchInterface,
  resetSearchInterface,
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
  updateCategoryFilters,
  updateSearchResultsDisplay,
  updateResetFiltersButtonVisibility,
  handleSearchInput,
  handleFilterChange,
  setupSearchEventListeners,
} from './js/modules/search.js';


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
  populateExamSelect,
  getTimeAgo,
  loadExam,
  processEmbeddedImages,
} from './js/modules/exam-loader.js';


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
  window.trackQuestionHighlight = trackQuestionHighlight;

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
  window.closeKeyboardHelp = closeKeyboardHelp;
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
  window.getQuestionCategory = getQuestionCategory;
  window.addCustomCategory = addCustomCategory;
  window.removeCustomCategory = removeCustomCategory;
  window.getAllCategories = getAllCategories;
  window.updateQuestionCategory = updateQuestionCategory;
  window.getFavoritesStats = getFavoritesStats;
  // Note: resetFavoritesData, exportFavorites, importFavorites not implemented in favorites module yet
  // window.resetFavoritesData = resetFavoritesData;
  // window.exportFavorites = exportFavorites;
  // window.importFavorites = importFavorites;
  window.cleanupObsoleteData = cleanupObsoleteData;

  // Search and filter
  window.initializeSearchInterface = initializeSearchInterface;
  window.resetSearchInterface = resetSearchInterface;
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
  window.updateCategoryFilters = updateCategoryFilters;
  window.updateSearchResultsDisplay = updateSearchResultsDisplay;
  window.updateResetFiltersButtonVisibility = updateResetFiltersButtonVisibility;
  window.handleSearchInput = handleSearchInput;
  window.handleFilterChange = handleFilterChange;
  window.setupSearchEventListeners = setupSearchEventListeners;


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
  window.populateExamSelect = populateExamSelect;
  window.getTimeAgo = getTimeAgo;
  window.loadExam = loadExam;
  window.processEmbeddedImages = processEmbeddedImages;


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
    await populateExamSelect(); // Populate select with question counts
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

  // Load exam on selection change
  const examCodeSelect = document.getElementById("examCode");
  if (examCodeSelect) {
    examCodeSelect.addEventListener("change", async (e) => {
      const examCode = e.target.value.trim();
      if (examCode) {
        await loadExam(examCode.toUpperCase());
      }
    });
    
    // Also handle Enter key for manual typing
    examCodeSelect.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const examCode = e.target.value.trim();
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

  // Question jump input and button
  const questionJumpInput = document.getElementById("questionJump");
  const jumpBtn = document.getElementById("jumpBtn");
  
  const handleJumpToQuestion = () => {
    if (questionJumpInput) {
      const questionNum = parseInt(questionJumpInput.value, 10);
      if (!isNaN(questionNum) && questionNum > 0) {
        jumpToQuestionNumber(questionNum);
      }
    }
  };
  
  if (questionJumpInput) {
    questionJumpInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleJumpToQuestion();
      }
    });
  }
  
  if (jumpBtn) {
    jumpBtn.addEventListener("click", handleJumpToQuestion);
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

  // Highlight toggle button
  const highlightBtn = document.getElementById("highlightBtn");
  if (highlightBtn) {
    highlightBtn.addEventListener("click", () => {
      // Toggle highlight mode
      window.isHighlightEnabled = !window.isHighlightEnabled;
      
      // Track this as a preview action for the current question ONLY when activating highlight
      if (window.isHighlightEnabled && window.currentQuestionIndex !== undefined && window.currentQuestions?.length > 0) {
        const questionNumber = window.currentQuestions[window.currentQuestionIndex]?.question_number || (window.currentQuestionIndex + 1);
        
        // Track highlight button click using the new function (only when activating)
        if (typeof window.trackQuestionHighlight === 'function') {
          window.trackQuestionHighlight(questionNumber, 'button_click');
          console.log(`🔦 Tracked highlight activation for Q${questionNumber}`);
        }
      }
      
      // Always update UI elements when toggling (whether activating or deactivating)
      if (window.currentQuestionIndex !== undefined && window.currentQuestions?.length > 0) {
        // Clear question status cache to refresh sidebar
        if (typeof window.clearQuestionStatusCacheForQuestion === 'function') {
          window.clearQuestionStatusCacheForQuestion(window.currentQuestionIndex);
        }
        
        // Update question statistics to show counters
        if (typeof window.updateQuestionStatistics === 'function') {
          window.updateQuestionStatistics();
        }
        
        // Update sidebar and progress bars to reflect preview status
        if (typeof window.updateProgressSidebar === 'function') {
          window.updateProgressSidebar();
        }
        if (typeof window.updateProgressBar === 'function') {
          window.updateProgressBar();
        }
        if (typeof window.updateMainProgressBar === 'function') {
          window.updateMainProgressBar();
        }
      }
      
      // Re-display current question to apply highlight changes
      if (window.currentQuestions?.length > 0) {
        displayCurrentQuestion(true); // true = fromToggleAction
      }
      
      // Update highlight button appearance
      updateHighlightButton();
      
      // Update instructions (after displayCurrentQuestion to ensure button state is correct)
      updateInstructions();
      
      console.log(`🔦 Highlight mode ${window.isHighlightEnabled ? 'enabled' : 'disabled'}`);
    });
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

  // Discussion toggle button
  const discussionToggle = document.getElementById("discussionToggle");
  if (discussionToggle) {
    discussionToggle.addEventListener("click", toggleDiscussion);
  }

  // ===========================
  // FAVORITES & NOTES TOOLBAR
  // ===========================

  // Favorite button
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
      if (!window.currentExam || !window.currentQuestions?.length) return;

      if (typeof window.toggleQuestionFavorite === 'function') {
        // Get selected category from dropdown - no fallback
        const categorySelect = document.getElementById('categorySelect');
        const selectedCategory = categorySelect?.value || null;
        
        console.log("⭐ Adding to favorites with category:", selectedCategory || 'no category');
        
        // toggleQuestionFavorite takes questionIndex (0-based), not examCode/questionNumber
        if (selectedCategory) {
          window.toggleQuestionFavorite(window.currentQuestionIndex, selectedCategory);
        } else {
          // Call without category parameter - let the function use its own default logic
          window.toggleQuestionFavorite(window.currentQuestionIndex);
        }
        
        if (typeof window.updateFavoritesUI === 'function') {
          window.updateFavoritesUI();
        }
        if (typeof window.updateProgressSidebar === 'function') {
          window.updateProgressSidebar();
        }
        
        // Show feedback to user
        if (typeof window.isQuestionFavorite === 'function') {
          const isFav = window.isQuestionFavorite(window.currentQuestionIndex);
          if (typeof window.showSuccess === 'function') {
            window.showSuccess(isFav ? "Question added to favorites" : "Question removed from favorites");
          }
        }
      }
    });
  }

  // Category select
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      if (!window.currentExam || !window.currentQuestions?.length) return;

      const category = categorySelect.value;

      if (typeof window.updateQuestionCategory === 'function') {
        // updateQuestionCategory takes questionIndex, not examCode/questionNumber  
        window.updateQuestionCategory(window.currentQuestionIndex, category);
        if (typeof window.updateFavoritesUI === 'function') {
          window.updateFavoritesUI();
        }
        if (typeof window.showSuccess === 'function') {
          window.showSuccess(`Question categorized as: ${category}`);
        }
      }
    });
  }

  // Add category button
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      const modal = document.getElementById("categoryModal");
      if (modal) {
        modal.style.display = "flex";
        // Update the modal with current categories when opening
        updateCategoryModal();
      }
    });
  }

  // Note button
  const noteBtn = document.getElementById("noteBtn");
  if (noteBtn) {
    noteBtn.addEventListener("click", () => {
      const noteSection = document.getElementById("questionNote");
      if (noteSection) {
        const isVisible = noteSection.style.display !== "none" && noteSection.style.display !== "";
        
        if (isVisible) {
          // Hide note section
          noteSection.style.display = "none";
        } else {
          // Show note section in read mode
          noteSection.style.display = "block";
          
          // Scroll to the note section so it's visible
          setTimeout(() => {
            noteSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          
          if (typeof window.showNoteReadView === 'function') {
            window.showNoteReadView();
          }
        }
      }
    });
  } else {
    console.error("❌ Note button not found with id 'noteBtn'");
  }

  // Edit note button
  const editNoteBtn = document.getElementById("editNoteBtn");
  if (editNoteBtn) {
    editNoteBtn.addEventListener("click", () => {
      showNoteEditView();
    });
  }

  // Cancel note view button (close without editing)
  const cancelNoteViewBtn = document.getElementById("cancelNoteViewBtn");
  if (cancelNoteViewBtn) {
    cancelNoteViewBtn.addEventListener("click", () => {
      const noteSection = document.getElementById("questionNote");
      if (noteSection) noteSection.style.display = "none";
    });
  }

  // Save note button
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener("click", () => {
      if (!window.currentExam || !window.currentQuestions?.length) return;

      const noteTextarea = document.getElementById("noteTextarea");
      const noteText = noteTextarea?.value.trim() || "";

      if (typeof window.updateQuestionNote === 'function') {
        // updateQuestionNote takes questionIndex, not examCode/questionNumber
        window.updateQuestionNote(window.currentQuestionIndex, noteText);
        
        // Update UI
        if (typeof window.updateFavoritesUI === 'function') {
          window.updateFavoritesUI();
        }

        if (typeof window.showSuccess === 'function') {
          window.showSuccess(noteText ? "Note saved successfully" : "Note removed");
        }

        // Switch back to read view
        showNoteReadView();
      }
    });
  }

  // Cancel note button (cancel editing)
  const cancelNoteBtn = document.getElementById("cancelNoteBtn");
  if (cancelNoteBtn) {
    cancelNoteBtn.addEventListener("click", () => {
      // Cancel editing and return to read view
      showNoteReadView();
    });
  }

  // Close category modal
  const closeCategoryModal = document.getElementById("closeCategoryModal");
  if (closeCategoryModal) {
    closeCategoryModal.addEventListener("click", () => {
      const modal = document.getElementById("categoryModal");
      if (modal) modal.style.display = "none";
    });
  }

  // Add new category button in modal
  const addNewCategoryBtn = document.getElementById("addNewCategoryBtn");
  if (addNewCategoryBtn) {
    addNewCategoryBtn.addEventListener("click", () => {
      const input = document.getElementById("newCategoryInput");
      const categoryName = input?.value.trim();
      if (categoryName) {
        if (typeof window.addCustomCategory === 'function') {
          const success = window.addCustomCategory(categoryName);
          if (success) {
            input.value = "";
            // Update both the modal and dropdown
            updateCategoryModal();
            if (typeof window.updateCategoryDropdown === 'function') {
              window.updateCategoryDropdown();
            }
            if (typeof window.showSuccess === 'function') {
              window.showSuccess(`Category "${categoryName}" added successfully`);
            }
          } else {
            if (typeof window.showError === 'function') {
              window.showError(`Category "${categoryName}" already exists`);
            }
          }
        }
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

  // Changelog button
  const changelogBtn = document.getElementById("changelogBtn");
  if (changelogBtn) {
    changelogBtn.addEventListener("click", () => {
      if (typeof window.displayChangelog === 'function') {
        window.displayChangelog();
      }
    });
  }

  // Close changelog modal
  const closeChangelogModal = document.getElementById("closeChangelogModal");
  if (closeChangelogModal) {
    closeChangelogModal.addEventListener("click", () => {
      const modal = document.getElementById("changelogModal");
      if (modal) modal.style.display = "none";
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

  // ===========================
  // SETTINGS ACTION BUTTONS
  // ===========================


  // Export Favorites
  const exportFavoritesBtn = document.getElementById("exportFavoritesBtn");
  if (exportFavoritesBtn) {
    exportFavoritesBtn.addEventListener("click", () => {
      try {
        // Use correct localStorage key OR window.favoritesData directly
        let favoritesData = null;
        
        // Try to get from window.favoritesData first (most current)
        if (window.favoritesData && Object.keys(window.favoritesData.favorites || {}).length > 0) {
          favoritesData = JSON.stringify(window.favoritesData);
        } else {
          // Fallback to localStorage with correct key
          const savedData = localStorage.getItem('examViewerFavorites');
          if (savedData) {
            favoritesData = savedData;
          }
        }
        
        if (!favoritesData) {
          if (typeof window.showError === 'function') {
            window.showError("No favorites data to export.");
          } else {
            alert("No favorites data to export.");
          }
          return;
        }

        console.log("📥 Exporting favorites data:", favoritesData);

        const blob = new Blob([favoritesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof window.showSuccess === 'function') {
          window.showSuccess("Favorites exported successfully.");
        } else {
          alert("Favorites exported successfully.");
        }
      } catch (error) {
        console.error("Error exporting favorites:", error);
        if (typeof window.showError === 'function') {
          window.showError("Error exporting favorites: " + error.message);
        } else {
          alert("Error exporting favorites: " + error.message);
        }
      }
    });
  }

  // Import Favorites
  const importFavoritesBtn = document.getElementById("importFavoritesBtn");
  if (importFavoritesBtn) {
    importFavoritesBtn.addEventListener("click", () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            console.log("📤 Importing favorites data:", importedData);
            
            if (confirm("This will replace all existing favorites data. Are you sure?")) {
              // Use correct localStorage key
              localStorage.setItem('examViewerFavorites', JSON.stringify(importedData));
              
              // Update window.favoritesData directly as well
              if (window.favoritesData) {
                window.favoritesData = importedData;
              }
              
              // Update UI
              if (typeof window.updateFavoritesUI === 'function') {
                window.updateFavoritesUI();
              }
              
              // Update category dropdown
              if (typeof window.updateCategoryDropdown === 'function') {
                window.updateCategoryDropdown();
              }
              
              if (typeof window.showSuccess === 'function') {
                window.showSuccess("Favorites imported successfully.");
              } else {
                alert("Favorites imported successfully.");
              }
            }
          } catch (error) {
            console.error("Error importing favorites:", error);
            if (typeof window.showError === 'function') {
              window.showError("Invalid favorites file format.");
            } else {
              alert("Invalid favorites file format.");
            }
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }

  // Reset All Favorites Data
  const resetFavoritesBtn = document.getElementById("resetFavoritesBtn");
  if (resetFavoritesBtn) {
    resetFavoritesBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset ALL favorites data? This will permanently delete all favorites, categories, and notes. This cannot be undone.")) {
        try {
          // Clear favorites data from localStorage (correct key)
          localStorage.removeItem('examViewerFavorites');
          
          // Reset window.favoritesData to completely empty state
          if (window.favoritesData) {
            window.favoritesData.favorites = {};
            window.favoritesData.categories = []; // Empty categories instead of defaults
            window.favoritesData.customCategories = [];
          }
          
          // Save the empty state
          if (typeof window.saveFavorites === 'function') {
            window.saveFavorites();
          }
          
          // Update UI to reflect empty state
          if (typeof window.updateFavoritesUI === 'function') {
            window.updateFavoritesUI();
          }
          
          // Update category dropdown
          if (typeof window.updateCategoryDropdown === 'function') {
            window.updateCategoryDropdown();
          }
          
          console.log("🗑️ All favorites data reset - favoritesData:", window.favoritesData);
          
          if (typeof window.showSuccess === 'function') {
            window.showSuccess("All favorites data has been completely reset.");
          } else {
            alert("All favorites data has been completely reset.");
          }
        } catch (error) {
          console.error("Error resetting favorites data:", error);
          if (typeof window.showError === 'function') {
            window.showError("Error resetting favorites data: " + error.message);
          } else {
            alert("Error resetting favorites data: " + error.message);
          }
        }
      }
    });
  }

  // Clean Old Sessions
  const cleanOldStatisticsBtn = document.getElementById("cleanOldStatisticsBtn");
  if (cleanOldStatisticsBtn) {
    cleanOldStatisticsBtn.addEventListener("click", () => {
      if (confirm("This will keep only the last 20 sessions and remove older session data. Continue?")) {
        try {
          if (window.statistics && window.statistics.sessions) {
            // Keep only last 20 sessions
            window.statistics.sessions = window.statistics.sessions.slice(-20);
            
            // Save updated statistics
            if (typeof window.saveStatistics === 'function') {
              window.saveStatistics();
            }
            
            if (typeof window.showSuccess === 'function') {
              window.showSuccess("Old session data cleaned successfully.");
            } else {
              alert("Old session data cleaned successfully.");
            }
          } else {
            if (typeof window.showError === 'function') {
              window.showError("No statistics data found.");
            } else {
              alert("No statistics data found.");
            }
          }
        } catch (error) {
          console.error("Error cleaning old sessions:", error);
          if (typeof window.showError === 'function') {
            window.showError("Error cleaning old sessions: " + error.message);
          } else {
            alert("Error cleaning old sessions: " + error.message);
          }
        }
      }
    });
  }

  // Reset All Statistics
  const resetStatisticsBtn = document.getElementById("resetStatisticsBtn");
  if (resetStatisticsBtn) {
    resetStatisticsBtn.addEventListener("click", () => {
      if (typeof window.resetAllStatistics === 'function') {
        window.resetAllStatistics();
      } else {
        if (confirm("Are you sure you want to reset ALL statistics? This action cannot be undone.")) {
          // Clear statistics data
          localStorage.removeItem('statistics');
          
          // Reinitialize statistics
          if (typeof window.loadStatistics === 'function') {
            window.loadStatistics();
          }
          
          if (typeof window.showSuccess === 'function') {
            window.showSuccess("All statistics have been reset.");
          } else {
            alert("All statistics have been reset.");
          }
        }
      }
    });
  }

  // ===========================
  // MODAL UNIVERSAL CLOSE HANDLERS
  // ===========================

  // Setup universal modal close handlers (ESC key + click outside)
  function setupModalCloseHandlers() {
    const modals = [
      { id: 'settingsModal', closeFunction: () => {
        const modal = document.getElementById("settingsModal");
        if (modal) modal.style.display = "none";
        if (typeof window.saveSettings === 'function') {
          window.saveSettings();
        }
      }},
      { id: 'exportOptionsModal', closeFunction: () => {
        if (typeof window.hideExportModal === 'function') {
          window.hideExportModal();
        }
      }},
      { id: 'categoryModal', closeFunction: () => {
        const modal = document.getElementById("categoryModal");
        if (modal) modal.style.display = "none";
      }},
      { id: 'statisticsModal', closeFunction: () => {
        const modal = document.getElementById("statisticsModal");
        if (modal) modal.style.display = "none";
      }}
    ];

    // ESC key handler for all modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        // Find which modal is currently open
        for (const modalInfo of modals) {
          const modal = document.getElementById(modalInfo.id);
          if (modal && modal.style.display === 'flex') {
            modalInfo.closeFunction();
            event.preventDefault();
            break;
          }
        }
      }
    });

    // Click outside modal handler
    modals.forEach(modalInfo => {
      const modal = document.getElementById(modalInfo.id);
      if (modal) {
        modal.addEventListener('click', (event) => {
          // Only close if clicking on the modal backdrop (not the modal content)
          if (event.target === modal) {
            modalInfo.closeFunction();
          }
        });
      }
    });

    console.log("🔧 Universal modal close handlers setup complete");
  }

  // Initialize modal close handlers
  setupModalCloseHandlers();

  // Export modal event listeners
  const closeExportModalBtn = document.getElementById("closeExportModal");
  if (closeExportModalBtn) {
    closeExportModalBtn.addEventListener("click", () => {
      if (typeof window.hideExportModal === 'function') {
        window.hideExportModal();
      }
    });
  }

  const cancelExportBtn = document.getElementById("cancelExportBtn");
  if (cancelExportBtn) {
    cancelExportBtn.addEventListener("click", () => {
      if (typeof window.hideExportModal === 'function') {
        window.hideExportModal();
      }
    });
  }

  const startExportBtn = document.getElementById("startExportBtn");
  if (startExportBtn) {
    console.log("✅ Found startExportBtn, adding event listener");
    startExportBtn.addEventListener("click", () => {
      console.log("🖱️ Export button clicked!");
      console.log("🔍 Checking if performExport function exists:", typeof window.performExport);
      
      if (typeof window.performExport === 'function') {
        console.log("✅ Calling performExport function...");
        window.performExport();
      } else {
        console.error("❌ performExport function not available");
        alert("Export function not available");
      }
    });
  } else {
    console.error("❌ startExportBtn not found in DOM");
  }

  // Update export preview when options change
  const exportFormatInputs = document.querySelectorAll('input[name="exportFormat"]');
  const contentFilterInputs = document.querySelectorAll('input[name="contentFilter"]');
  const contentOptionInputs = document.querySelectorAll('#includeQuestions, #includeAnswers, #includeCorrectAnswers, #includeDiscussions, #includeImages, #includeUserNotes, #includeMetadata');

  exportFormatInputs.forEach(input => {
    input.addEventListener("change", () => {
      if (typeof window.updateExportPreview === 'function') {
        window.updateExportPreview();
      }
    });
  });

  contentFilterInputs.forEach(input => {
    input.addEventListener("change", () => {
      if (typeof window.updateExportPreview === 'function') {
        window.updateExportPreview();
      }
      // Show/hide category selection
      const categorySelection = document.getElementById("categorySelection");
      if (categorySelection) {
        if (input.value === "category") {
          categorySelection.style.display = "block";
          populateExportCategories();
        } else {
          categorySelection.style.display = "none";
        }
      }
    });
  });

  contentOptionInputs.forEach(input => {
    input.addEventListener("change", () => {
      if (typeof window.updateExportPreview === 'function') {
        window.updateExportPreview();
      }
    });
  });

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
  // Ensure statistics are recalculated before displaying
  if (typeof window.recalculateTotalStats === 'function') {
    window.recalculateTotalStats();
    if (typeof window.devLog === 'function') {
      window.devLog("📊 Statistics recalculated before display");
    }
  }
  
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
 * Update overview tab with ENHANCED global statistics from all exams and sessions
 */
function updateOverviewTab() {
  // First ensure statistics are recalculated and up to date
  if (typeof window.recalculateTotalStats === 'function') {
    window.recalculateTotalStats();
  }
  
  // Use the global statistics function from the statistics module
  const globalStats = typeof window.getGlobalStats === 'function' 
    ? window.getGlobalStats() 
    : {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalPreview: 0,
        totalAnswered: 0,
        overallAccuracy: 0,
        totalTime: 0,
        averageTimePerQuestion: 0,
        totalSessions: 0,
        examsCount: 0
      };

  // Calculate derived metrics
  const totalAnsweredQuestions = globalStats.totalCorrect + globalStats.totalIncorrect + globalStats.totalPreview;
  const correctPercentage = totalAnsweredQuestions > 0 ? Math.round((globalStats.totalCorrect / totalAnsweredQuestions) * 100) : 0;
  const incorrectPercentage = totalAnsweredQuestions > 0 ? Math.round((globalStats.totalIncorrect / totalAnsweredQuestions) * 100) : 0;
  const previewPercentage = totalAnsweredQuestions > 0 ? Math.round((globalStats.totalPreview / totalAnsweredQuestions) * 100) : 0;
  
  // Calculate favorites count from favoritesData structure
  let totalFavorites = 0;
  if (window.favoritesData && window.favoritesData.favorites && typeof window.favoritesData.favorites === 'object') {
    Object.values(window.favoritesData.favorites).forEach(examFavorites => {
      if (examFavorites && typeof examFavorites === 'object') {
        // Count only questions where isFavorite is true
        Object.values(examFavorites).forEach(favoriteData => {
          if (favoriteData && favoriteData.isFavorite === true) {
            totalFavorites++;
          }
        });
      }
    });
  }
  
  if (typeof window.devLog === 'function') {
    window.devLog(`📊 Calculating favorites: found ${totalFavorites} favorites in total`);
    window.devLog(`📊 Favorites data structure:`, window.favoritesData?.favorites);
  }
  
  // Format time display
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  const averageQuestionsPerSession = globalStats.totalSessions > 0 ? 
    Math.round(totalAnsweredQuestions / globalStats.totalSessions) : 0;

  // Update main metric elements
  const elements = {
    // Main metrics
    totalQuestions: document.getElementById("totalQuestions"),
    totalCorrect: document.getElementById("totalCorrect"),
    totalIncorrect: document.getElementById("totalIncorrect"),
    totalPreview: document.getElementById("totalPreview"),
    
    // Additional metrics
    totalExams: document.getElementById("totalExams"),
    totalTimeSpent: document.getElementById("totalTimeSpent"),
    totalSessions: document.getElementById("totalSessions"),
    totalFavorites: document.getElementById("totalFavorites"),
    
    // Percentages and trends
    correctPercentage: document.getElementById("correctPercentage"),
    incorrectPercentage: document.getElementById("incorrectPercentage"),
    previewPercentage: document.getElementById("previewPercentage"),
    averageTimePerQuestion: document.getElementById("averageTimePerQuestion"),
    averageQuestionsPerSession: document.getElementById("averageQuestionsPerSession"),
    
    // Overall accuracy
    overallAccuracyPercent: document.getElementById("overallAccuracyPercent"),
    
    // Progress segments
    correctProgressSegment: document.getElementById("correctProgressSegment"),
    incorrectProgressSegment: document.getElementById("incorrectProgressSegment"),
    previewProgressSegment: document.getElementById("previewProgressSegment"),
    correctProgressText: document.getElementById("correctProgressText"),
    incorrectProgressText: document.getElementById("incorrectProgressText"),
    previewProgressText: document.getElementById("previewProgressText")
  };

  // Update elements
  if (elements.totalQuestions) elements.totalQuestions.textContent = totalAnsweredQuestions;
  if (elements.totalCorrect) elements.totalCorrect.textContent = globalStats.totalCorrect;
  if (elements.totalIncorrect) elements.totalIncorrect.textContent = globalStats.totalIncorrect;
  if (elements.totalPreview) elements.totalPreview.textContent = globalStats.totalPreview;
  if (elements.totalExams) elements.totalExams.textContent = globalStats.examsCount;
  if (elements.totalTimeSpent) elements.totalTimeSpent.textContent = formatTime(globalStats.totalTime);
  if (elements.totalSessions) elements.totalSessions.textContent = globalStats.totalSessions;
  if (elements.totalFavorites) elements.totalFavorites.textContent = totalFavorites;
  
  // Update percentage displays
  if (elements.correctPercentage) elements.correctPercentage.textContent = `${correctPercentage}% correct`;
  if (elements.incorrectPercentage) elements.incorrectPercentage.textContent = `${incorrectPercentage}% incorrect`;
  if (elements.previewPercentage) elements.previewPercentage.textContent = `${previewPercentage}% previewed`;
  if (elements.averageTimePerQuestion) elements.averageTimePerQuestion.textContent = `${globalStats.averageTimePerQuestion}s avg/question`;
  if (elements.averageQuestionsPerSession) elements.averageQuestionsPerSession.textContent = `${averageQuestionsPerSession} avg questions`;
  
  // Update overall accuracy badge
  if (elements.overallAccuracyPercent) {
    elements.overallAccuracyPercent.textContent = `${globalStats.overallAccuracy}%`;
    
    // Update badge color based on accuracy
    const accuracyBadge = document.getElementById("overallAccuracyBadge");
    if (accuracyBadge) {
      let badgeClass = 'accuracy-low';
      if (globalStats.overallAccuracy >= 80) badgeClass = 'accuracy-high';
      else if (globalStats.overallAccuracy >= 60) badgeClass = 'accuracy-medium';
      
      accuracyBadge.className = `accuracy-badge ${badgeClass}`;
    }
  }
  
  // Update progress bar segments
  if (elements.correctProgressSegment) elements.correctProgressSegment.style.width = `${correctPercentage}%`;
  if (elements.incorrectProgressSegment) elements.incorrectProgressSegment.style.width = `${incorrectPercentage}%`;
  if (elements.previewProgressSegment) elements.previewProgressSegment.style.width = `${previewPercentage}%`;
  if (elements.correctProgressText) elements.correctProgressText.textContent = `${correctPercentage}%`;
  if (elements.incorrectProgressText) elements.incorrectProgressText.textContent = `${incorrectPercentage}%`;
  if (elements.previewProgressText) elements.previewProgressText.textContent = `${previewPercentage}%`;
  
  if (typeof window.devLog === 'function') {
    window.devLog(`📊 Enhanced Overview updated - Total: ${totalAnsweredQuestions}, Accuracy: ${globalStats.overallAccuracy}%, Exams: ${globalStats.examsCount}, Sessions: ${globalStats.totalSessions}`);
  }
}

/**
 * Update exams tab with modern visual design and clean layout
 */
function updateExamsTab() {
  const examsList = document.getElementById("examStatsList");
  if (!examsList) return;

  let content = "";
  
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
    const accuracyColor = accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336';
    
    if (examCode && totalAnsweredQuestions > 0) {
      content += `
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #444;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #fff; font-size: 18px;">📚 ${examName}</h3>
            <span style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">CURRENT SESSION</span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div style="text-align: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">${totalAnsweredQuestions}</div>
              <div style="font-size: 12px; color: #bbb; text-transform: uppercase;">Total Questions</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">${correctAnswers}</div>
              <div style="font-size: 12px; color: #bbb; text-transform: uppercase;">Correct</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #f44336; margin-bottom: 5px;">${incorrectAnswers}</div>
              <div style="font-size: 12px; color: #bbb; text-transform: uppercase;">Incorrect</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #FF9800; margin-bottom: 5px;">${previewAnswers}</div>
              <div style="font-size: 12px; color: #bbb; text-transform: uppercase;">Preview</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 18px; margin-right: 10px;">🎯</span>
              <div>
                <span style="font-size: 20px; font-weight: bold; color: ${accuracyColor};">${accuracy}%</span>
                <span style="font-size: 14px; color: #bbb; margin-left: 5px;">Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Show global exam stats if available
  if (window.statistics?.totalStats?.examStats) {
    content += `
      <div style="margin-bottom: 15px;">
        <h4 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">All Time Statistics</h4>
      </div>
    `;
    
    Object.entries(window.statistics.totalStats.examStats).forEach(([examCode, stats]) => {
      // Calculate answered questions for global stats (not total questions in exam)
      const totalAnsweredGlobal = (stats.totalCorrect || 0) + (stats.totalIncorrect || 0) + (stats.totalPreview || 0);
      const accuracy = (stats.totalCorrect || 0) + (stats.totalIncorrect || 0) > 0 
        ? Math.round(((stats.totalCorrect || 0) / ((stats.totalCorrect || 0) + (stats.totalIncorrect || 0))) * 100) 
        : 0;
      const accuracyColor = accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336';
      
      content += `
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 15px; border: 1px solid #444;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 40px; height: 40px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px;">📊</div>
              <div>
                <h3 style="margin: 0; color: #fff; font-size: 18px;">${stats.examName || examCode}</h3>
                <div style="font-size: 12px; color: #bbb;">${stats.sessionsCount || 0} sessions</div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;">
            <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #4CAF50; margin-bottom: 3px;">${totalAnsweredGlobal}</div>
              <div style="font-size: 10px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Total<br>Questions</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #4CAF50; margin-bottom: 3px;">${stats.totalCorrect || 0}</div>
              <div style="font-size: 10px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Correct</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #f44336; margin-bottom: 3px;">${stats.totalIncorrect || 0}</div>
              <div style="font-size: 10px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Incorrect</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #FF9800; margin-bottom: 3px;">${stats.totalPreview || 0}</div>
              <div style="font-size: 10px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Preview</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: ${accuracyColor}; margin-bottom: 3px;">${accuracy}%</div>
              <div style="font-size: 10px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Accuracy</div>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  if (content === "") {
    content = `
      <div style="text-align: center; padding: 60px 20px; background: #2a2a2a; border-radius: 12px; border: 1px solid #444;">
        <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
        <h3 style="color: #fff; margin-bottom: 15px;">No Exam Statistics</h3>
        <p style="color: #bbb; font-size: 14px;">Start studying exams to see your performance statistics here!</p>
      </div>
    `;
  }
  
  examsList.innerHTML = content;
}

/**
 * Update sessions tab with modern visual cards design
 */
function updateSessionsTab() {
  const sessionsList = document.getElementById("sessionsList");
  if (!sessionsList) return;

  let content = "";
  
  // Show current session first
  if (window.statistics?.currentSession) {
    const currentSession = window.statistics.currentSession;
    const currentSessionStats = getCurrentSessionStats();
    
    const examName = currentSession.examName || currentSession.en || (window.currentExam?.title) || "Current Exam";
    const startTime = currentSession.startTime || currentSession.st || Date.now();
    const date = new Date(startTime).toLocaleString();
    const duration = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    const accuracyColor = currentSessionStats.accuracy >= 80 ? '#4CAF50' : currentSessionStats.accuracy >= 60 ? '#FF9800' : '#f44336';
    
    content += `
      <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #444; border-left: 4px solid #4CAF50;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; margin-right: 10px; animation: pulse 2s infinite;"></div>
            <h3 style="margin: 0; color: #fff; font-size: 18px;">${examName}</h3>
          </div>
          <span style="background: #4CAF50; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">ACTIVE SESSION</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 13px; color: #bbb;">
          <span>${date}</span>
          <span>${duration}min</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
            <div style="font-size: 18px; color: #4CAF50; font-weight: bold;">${currentSessionStats.totalAnswered}/${currentSessionStats.totalQuestions}</div>
            <div style="font-size: 11px; color: #bbb; text-transform: uppercase;">Questions</div>
          </div>
          <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px;">
            <div style="font-size: 18px; color: ${accuracyColor}; font-weight: bold;">${currentSessionStats.accuracy}%</div>
            <div style="font-size: 11px; color: #bbb; text-transform: uppercase;">Accuracy</div>
          </div>
          <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span style="color: #4CAF50; font-size: 14px;">${currentSessionStats.correctAnswers} ✓</span>
            <span style="color: #f44336; font-size: 14px;">${currentSessionStats.incorrectAnswers} ✗</span>
            <span style="color: #FF9800; font-size: 14px;">${currentSessionStats.previewAnswers} 👁</span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Show historical sessions
  if (window.statistics?.sessions?.length > 0) {
    content += `
      <div style="margin-bottom: 15px;">
        <h4 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Previous Sessions</h4>
      </div>
    `;
    
    const recentSessions = window.statistics.sessions.slice(-10).reverse();
    
    recentSessions.forEach((session, index) => {
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
      const accuracyColor = accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336';
      
      const duration = totalTime > 0 
        ? `${Math.round(totalTime / 60)}min` 
        : (startTime && endTime ? `${Math.round((endTime - startTime) / 1000 / 60)}min` : "0min");
      
      const sessionNumber = recentSessions.length - index;
      
      content += `
        <div style="background: #2a2a2a; border-radius: 12px; padding: 18px; margin-bottom: 12px; border: 1px solid #444;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 32px; height: 32px; background: #444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px; color: #bbb; font-weight: bold;">${examName.charAt(0)}</div>
              <div>
                <h4 style="margin: 0; color: #fff; font-size: 16px;">${examName}</h4>
                <div style="font-size: 11px; color: #888;">${date} ${time}</div>
              </div>
            </div>
            <span style="background: #444; color: #bbb; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: bold;">#${sessionNumber}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
            <div style="text-align: center; background: #1a1a1a; padding: 10px 8px; border-radius: 4px;">
              <div style="font-size: 16px; color: #4CAF50; font-weight: bold;">${correctAnswers + incorrectAnswers}/${totalQuestions}</div>
              <div style="font-size: 9px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Questions</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 10px 8px; border-radius: 4px;">
              <div style="font-size: 16px; color: ${accuracyColor}; font-weight: bold;">${accuracy}%</div>
              <div style="font-size: 9px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Accuracy</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 10px 8px; border-radius: 4px;">
              <div style="font-size: 16px; color: #FF9800; font-weight: bold;">${duration}</div>
              <div style="font-size: 9px; color: #bbb; text-transform: uppercase; line-height: 1.2;">Duration</div>
            </div>
            <div style="text-align: center; background: #1a1a1a; padding: 10px 8px; border-radius: 4px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px;">
              <div style="display: flex; gap: 6px; font-size: 12px;">
                <span style="color: #4CAF50;">${correctAnswers} ✓</span>
                <span style="color: #f44336;">${incorrectAnswers} ✗</span>
                <span style="color: #FF9800;">${previewAnswers} 👁</span>
              </div>
              <div style="font-size: 9px; color: #bbb; text-transform: uppercase;">Answers</div>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  // Empty state
  if (content === "") {
    content = `
      <div style="text-align: center; padding: 60px 20px; background: #2a2a2a; border-radius: 12px; border: 1px solid #444;">
        <div style="font-size: 48px; margin-bottom: 20px;">📅</div>
        <h3 style="color: #fff; margin-bottom: 15px;">No Session History</h3>
        <p style="color: #bbb; font-size: 14px;">Start studying to see your session history and track your progress over time!</p>
      </div>
    `;
  }
  
  sessionsList.innerHTML = content;
}

/**
 * Update progress tab with clean, simple design using inline styles
 */
function updateProgressTab() {
  const progressContent = document.getElementById("progressTab");
  if (!progressContent) return;

  const currentSessionStats = getCurrentSessionStats();
  const globalStats = getGlobalStats();
  
  let content = "";
  
  // Current Session Stats (if active)
  if (window.statistics?.currentSession && currentSessionStats.totalQuestions > 0) {
    const completionPercentage = (currentSessionStats.totalAnswered / currentSessionStats.totalQuestions * 100).toFixed(1);
    const accuracyColor = currentSessionStats.accuracy >= 80 ? '#4CAF50' : currentSessionStats.accuracy >= 60 ? '#FF9800' : '#f44336';
    
    content += `
      <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #444;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #fff; font-size: 18px;">📺 Current Session</h3>
          <span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">LIVE</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${currentSessionStats.totalAnswered}</div>
            <div style="font-size: 12px; color: #bbb;">Answered</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: ${accuracyColor};">${currentSessionStats.accuracy}%</div>
            <div style="font-size: 12px; color: #bbb;">Accuracy</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #FF9800;">${Math.round(currentSessionStats.timeSpent / 60)}m</div>
            <div style="font-size: 12px; color: #bbb;">Time</div>
          </div>
        </div>
        
        <div style="margin-top: 15px;">
          <div style="background: #1a1a1a; border-radius: 8px; height: 8px; overflow: hidden;">
            <div style="height: 100%; background: #4CAF50; width: ${completionPercentage}%; transition: width 0.3s ease;"></div>
          </div>
          <div style="text-align: center; margin-top: 8px; font-size: 14px; color: #bbb;">${completionPercentage}% Complete</div>
        </div>
        
        <div style="display: flex; justify-content: space-around; margin-top: 15px; font-size: 14px;">
          <span style="color: #4CAF50;">✓ ${currentSessionStats.correctAnswers}</span>
          <span style="color: #f44336;">✗ ${currentSessionStats.incorrectAnswers}</span>
          <span style="color: #FF9800;">👁 ${currentSessionStats.previewAnswers}</span>
        </div>
      </div>
    `;
  }
  
  // Global Statistics Grid
  if (globalStats.totalQuestions > 0) {
    const studyHours = Math.floor(globalStats.totalTime / 3600);
    const studyMinutes = Math.floor((globalStats.totalTime % 3600) / 60);
    const realAnsweredQuestions = globalStats.totalCorrect + globalStats.totalIncorrect + globalStats.totalPreview;
    
    content += `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #444;">
          <div style="width: 50px; height: 50px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 20px;">📚</div>
          <div style="font-size: 28px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">${realAnsweredQuestions}</div>
          <div style="font-size: 14px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">Questions Answered</div>
          <div style="font-size: 12px; color: #888; margin-top: 5px;">All Time</div>
        </div>
        
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #444;">
          <div style="width: 50px; height: 50px; background: #FF9800; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 20px;">🎯</div>
          <div style="font-size: 28px; font-weight: bold; color: #FF9800; margin-bottom: 5px;">${globalStats.overallAccuracy}%</div>
          <div style="font-size: 14px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">Overall Accuracy</div>
          <div style="font-size: 12px; color: #888; margin-top: 5px;">${globalStats.totalCorrect}/${globalStats.totalAnswered} correct</div>
        </div>
        
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #444;">
          <div style="width: 50px; height: 50px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 20px;">📅</div>
          <div style="font-size: 28px; font-weight: bold; color: #2196F3; margin-bottom: 5px;">${globalStats.totalSessions}</div>
          <div style="font-size: 14px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">Study Sessions</div>
          <div style="font-size: 12px; color: #888; margin-top: 5px;">${globalStats.examsCount} exams studied</div>
        </div>
        
        <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #444;">
          <div style="width: 50px; height: 50px; background: #9C27B0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 20px;">⏰</div>
          <div style="font-size: 28px; font-weight: bold; color: #9C27B0; margin-bottom: 5px;">${studyHours}h ${studyMinutes}m</div>
          <div style="font-size: 14px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">Study Time</div>
          <div style="font-size: 12px; color: #888; margin-top: 5px;">${globalStats.totalSessions > 0 ? Math.round(globalStats.totalTime / globalStats.totalSessions / 60) : 0}m avg/session</div>
        </div>
        
      </div>
    `;
  }
  
  // Learning Analytics
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
      <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; border: 1px solid #444;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; background: #FF9800; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px;">📊</div>
          <h3 style="margin: 0; color: #fff; font-size: 18px;">Learning Analytics</h3>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: #1a1a1a; padding: 15px; border-radius: 8px;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 10px;">${trendIcon}</span>
            <div>
              <div style="font-weight: bold; color: ${trendColor}; font-size: 16px;">${trendText}</div>
              <div style="font-size: 12px; color: #bbb;">${Math.abs(trendDirection)}% change</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="font-size: 14px; color: #bbb; margin-bottom: 10px;">Recent Accuracy Trend:</div>
          <div style="display: flex; align-items: end; justify-content: space-around; height: 60px; background: #1a1a1a; padding: 10px; border-radius: 8px;">
            ${accuracyTrend.map((accuracy, index) => {
              const barColor = accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336';
              const height = Math.max((accuracy / 100) * 40, 4);
              return `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="font-size: 10px; color: #bbb; margin-bottom: 5px;">${accuracy}%</div>
                  <div style="width: 20px; height: ${height}px; background: ${barColor}; border-radius: 2px; ${index === accuracyTrend.length - 1 ? 'box-shadow: 0 0 8px ' + barColor + ';' : ''}"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div style="display: flex; align-items: center; background: #1a1a1a; padding: 15px; border-radius: 8px;">
          <div style="width: 30px; height: 30px; background: ${trendColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">💡</div>
          <div style="color: #bbb; font-size: 14px;">
            ${trendDirection > 5 ? "Great progress! Keep up the excellent work." :
              trendDirection > 0 ? "You're improving steadily. Nice work!" :
              trendDirection === 0 ? "Consistent performance. Try challenging yourself more!" :
              "Focus on reviewing incorrect answers to improve."}
          </div>
        </div>
      </div>
    `;
  }
  
  // Empty state
  if (globalStats.totalQuestions === 0 && (!window.statistics?.currentSession || currentSessionStats.totalQuestions === 0)) {
    content = `
      <div style="text-align: center; padding: 60px 20px; background: #2a2a2a; border-radius: 12px; border: 1px solid #444;">
        <div style="font-size: 48px; margin-bottom: 20px;">📈</div>
        <h3 style="color: #fff; margin-bottom: 15px;">Ready to Track Your Progress?</h3>
        <p style="color: #bbb; font-size: 14px; max-width: 400px; margin: 0 auto;">Start answering questions to see detailed analytics, trends, and insights about your learning journey!</p>
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
// UI INTERACTION FUNCTIONS
// ===========================

/**
 * Update highlight button appearance and text
 */
function updateHighlightButton() {
  const highlightBtn = document.getElementById("highlightBtn");
  if (!highlightBtn) return;

  if (window.isHighlightEnabled) {
    highlightBtn.classList.add("active");
    highlightBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Disable Highlight';
    highlightBtn.style.backgroundColor = "#e0a800"; // Yellow for highlight mode
    highlightBtn.style.color = "#212529";
    highlightBtn.title = "Click to disable highlight mode";
  } else {
    highlightBtn.classList.remove("active");
    highlightBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Highlight Answers';
    highlightBtn.style.backgroundColor = ""; // Default color
    highlightBtn.style.color = "";
    highlightBtn.title = "Click to highlight correct answers";
  }
}

/**
 * Update instructions and validate button based on current state
 */
function updateInstructions() {
  const instructions = document.getElementById("answerInstructions");
  const validateBtn = document.getElementById("validateBtn");
  
  if (!instructions || !validateBtn) {
    console.log('❌ updateInstructions: Missing elements - instructions:', !!instructions, 'validateBtn:', !!validateBtn);
    return;
  }

  const selectedCount = window.selectedAnswers?.size || 0;
  
  console.log('🔍 updateInstructions: isHighlightEnabled =', window.isHighlightEnabled);
  console.log('🔍 updateInstructions: selectedCount =', selectedCount);

  if (window.isHighlightEnabled) {
    console.log('🔦 updateInstructions: Setting highlight mode instructions');
    instructions.className = "answer-instructions warning";
    instructions.innerHTML = '<i class="fas fa-lightbulb"></i><span>Highlight mode is active - correct answers are shown. Disable highlight to validate your answers.</span>';
    
    // Disable validate button when highlight is active
    validateBtn.disabled = true;
    validateBtn.style.opacity = "0.5";
    validateBtn.style.cursor = "not-allowed";
    validateBtn.title = "Disable highlight mode to validate answers";
    console.log('🔦 validateBtn disabled - opacity:', validateBtn.style.opacity, 'disabled:', validateBtn.disabled);
    
    // Hide reset button when highlight is active
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn && !window.isValidated) {
      resetBtn.style.display = "none";
    }
  } else if (selectedCount === 0) {
    console.log('ℹ️ updateInstructions: No selections, normal mode');
    instructions.className = "answer-instructions";
    instructions.innerHTML = '<i class="fas fa-info-circle"></i><span>Click on the answers to select them</span>';
    
    // Enable validate button
    validateBtn.disabled = false;
    validateBtn.style.opacity = "1";
    validateBtn.style.cursor = "pointer";
    validateBtn.title = "";
    console.log('✅ validateBtn enabled - opacity:', validateBtn.style.opacity, 'disabled:', validateBtn.disabled);
    
    // Hide reset button when no answers are selected and not validated
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn && !window.isValidated) {
      resetBtn.style.display = "none";
    }
  } else {
    console.log('📝 updateInstructions: Has selections, normal mode');
    instructions.className = "answer-instructions info";
    const plural = selectedCount === 1 ? "answer" : "answers";
    instructions.innerHTML = `<i class="fas fa-check-circle"></i><span>You selected ${selectedCount} ${plural}. Click validate to check your answer.</span>`;
    
    // Enable validate button
    validateBtn.disabled = false;
    validateBtn.style.opacity = "1";
    validateBtn.style.cursor = "pointer";
    validateBtn.title = "";
    console.log('✅ validateBtn enabled - opacity:', validateBtn.style.opacity, 'disabled:', validateBtn.disabled);
    
    // Show reset button when answers are selected
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn && !window.isValidated) {
      resetBtn.style.display = "inline-flex";
    }
  }
}

// Attach functions to window for global access
window.updateHighlightButton = updateHighlightButton;
window.updateInstructions = updateInstructions;

// ===========================
// DISCUSSION MANAGEMENT
// ===========================

/**
 * Toggle discussion display
 */
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
    displayDiscussion(window.currentQuestions[window.currentQuestionIndex]);
  }
}

/**
 * Display discussion comments for a question
 */
function displayDiscussion(question) {
  const comments = question.comments || [];
  const discussionList = document.getElementById("discussionList");

  if (!discussionList) return;

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
        comment.content || comment.comment || "",
        question.images
      )}</div>
    `;
    discussionList.appendChild(commentElement);
  });
}

/**
 * Convert URLs to clickable links
 */
function convertUrlsToLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Format comment text with line breaks and links
 */
function formatCommentText(text, imagesData = null) {
  if (!text) return "";

  // Convert line breaks to <br> tags
  let formattedText = text.replace(/\n/g, "<br>");

  // Process embedded images if available
  if (imagesData && Object.keys(imagesData).length > 0 && typeof window.processEmbeddedImages === 'function') {
    formattedText = window.processEmbeddedImages(formattedText, imagesData);
  }

  // Convert URLs to clickable links
  formattedText = convertUrlsToLinks(formattedText);

  return formattedText;
}

// Attach discussion functions to window
window.toggleDiscussion = toggleDiscussion;
window.displayDiscussion = displayDiscussion;
window.convertUrlsToLinks = convertUrlsToLinks;
window.formatCommentText = formatCommentText;


// ===========================
// CATEGORY UI MANAGEMENT
// ===========================

/**
 * Get question data from favorites storage
 */
function getQuestionData(examCode, questionNumber) {
  if (window.favoritesData?.favorites[examCode] && 
      window.favoritesData.favorites[examCode][questionNumber]) {
    return window.favoritesData.favorites[examCode][questionNumber];
  }
  return {
    isFavorite: false,
    category: null,
    note: "",
    timestamp: null,
  };
}

/**
 * Update favorites UI elements for current question
 */
function updateFavoritesUI() {
  if (!window.currentExam || !window.currentQuestions?.length || window.currentQuestionIndex === undefined) return;

  const question = window.currentQuestions[window.currentQuestionIndex];
  const questionNumber = question.question_number;
  const examCode = window.currentExam.exam_name || window.currentExam.exam_code || window.currentExam.code || "UNKNOWN";

  // Get question data using the helper function
  const questionData = getQuestionData(examCode, questionNumber);
  
  // Use isQuestionFavorite for consistency with the module
  const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
    window.isQuestionFavorite(window.currentQuestionIndex) : questionData.isFavorite;

  // Update favorite button
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    favoriteBtn.classList.toggle("active", isFavorite);
    favoriteBtn.innerHTML = isFavorite
      ? '<i class="fas fa-star"></i>'
      : '<i class="far fa-star"></i>';
  }

  // Update category dropdown and select
  updateCategoryDropdown();
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    // Show the actual category or empty if none
    categorySelect.value = questionData.category || "";
    console.log("🏷️ Current question category:", questionData.category || 'no category');
  }

  // Update note display and button state
  const noteBtn = document.getElementById("noteBtn");
  if (noteBtn) {
    const currentNote = typeof window.getQuestionNote === 'function' ? 
      window.getQuestionNote(window.currentQuestionIndex) : (questionData.note || "");
    
    noteBtn.classList.toggle("active", !!currentNote);
    
    // Update note display if note section is visible
    const noteSection = document.getElementById("questionNote");
    if (noteSection && noteSection.style.display !== "none") {
      showNoteReadView();
    }
  }
}

/**
 * Update category dropdown with available categories
 */
function updateCategoryDropdown() {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  const currentValue = categorySelect.value;
  
  if (typeof window.getAllCategories === 'function') {
    const categories = window.getAllCategories();

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
}

/**
 * Update category modal with current categories
 */
function updateCategoryModal() {
  const categoryList = document.getElementById("customCategoriesList");
  if (!categoryList) return;

  if (typeof window.getAllCategories === 'function') {
    const customCategories = window.favoritesData?.customCategories || [];

    categoryList.innerHTML = "";

    // Only show custom categories in the management modal
    customCategories.forEach((category) => {
      const categoryElement = document.createElement("div");
      categoryElement.className = "category-item";
      categoryElement.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 0.375rem;
        margin-bottom: 0.5rem;
      `;
      categoryElement.innerHTML = `
        <span class="category-name" style="color: var(--text-primary);">${category}</span>
        <button class="remove-category-btn" onclick="window.removeCategoryAndRefreshUI('${category}');" style="
          background: var(--danger-color);
          color: white;
          border: none;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
        ">
          <i class="fas fa-trash"></i> Remove
        </button>
      `;
      categoryList.appendChild(categoryElement);
    });

    // Show message if no custom categories
    if (customCategories.length === 0) {
      categoryList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No custom categories created yet.</p>';
    }
  }
}

/**
 * Show note in read-only view
 */
function showNoteReadView() {
  const noteReadView = document.getElementById("noteReadView");
  const noteEditView = document.getElementById("noteEditView");
  const noteDisplayText = document.getElementById("noteDisplayText");
  
  if (noteReadView && noteEditView && noteDisplayText) {
    // Get current note text
    const currentNote = typeof window.getQuestionNote === 'function' && window.currentQuestionIndex !== undefined ? 
      window.getQuestionNote(window.currentQuestionIndex) : "";
    
    // Update display text
    if (currentNote.trim()) {
      noteDisplayText.textContent = currentNote;
      noteDisplayText.style.fontStyle = "normal";
      noteDisplayText.style.color = "var(--text-primary)";
    } else {
      noteDisplayText.textContent = "No note added yet.";
      noteDisplayText.style.fontStyle = "italic";
      noteDisplayText.style.color = "var(--text-muted)";
    }
    
    // Show read view, hide edit view
    noteReadView.style.display = "block";
    noteEditView.style.display = "none";
  }
}

/**
 * Show note in edit mode
 */
function showNoteEditView() {
  const noteReadView = document.getElementById("noteReadView");
  const noteEditView = document.getElementById("noteEditView");
  const noteTextarea = document.getElementById("noteTextarea");
  
  if (noteReadView && noteEditView && noteTextarea) {
    // Get current note text
    const currentNote = typeof window.getQuestionNote === 'function' && window.currentQuestionIndex !== undefined ? 
      window.getQuestionNote(window.currentQuestionIndex) : "";
    
    // Fill textarea with current note
    noteTextarea.value = currentNote;
    
    // Show edit view, hide read view
    noteReadView.style.display = "none";
    noteEditView.style.display = "block";
    
    // Focus textarea
    setTimeout(() => {
      noteTextarea.focus();
      noteTextarea.setSelectionRange(noteTextarea.value.length, noteTextarea.value.length);
    }, 100);
  }
}

/**
 * Remove category and refresh all UI elements
 */
function removeCategoryAndRefreshUI(categoryName) {
  if (typeof window.removeCustomCategory === 'function') {
    // Check if current question has this category selected
    const categorySelect = document.getElementById("categorySelect");
    const isCurrentlySelected = categorySelect && categorySelect.value === categoryName;
    
    // Remove the category
    const success = window.removeCustomCategory(categoryName);
    
    if (success) {
      // Update the modal
      updateCategoryModal();
      
      // Update the dropdown
      if (typeof window.updateCategoryDropdown === 'function') {
        window.updateCategoryDropdown();
      }
      
      // If this category was selected for current question, clear the selection
      if (isCurrentlySelected && categorySelect) {
        categorySelect.value = "";
        
        // Also update the question's category in favorites data
        if (window.currentExam && window.currentQuestions?.length && window.currentQuestionIndex !== undefined) {
          if (typeof window.updateQuestionCategory === 'function') {
            window.updateQuestionCategory(window.currentQuestionIndex, null);
          }
          
          // Update the UI to reflect the change
          if (typeof window.updateFavoritesUI === 'function') {
            window.updateFavoritesUI();
          }
        }
      }
      
      if (typeof window.showSuccess === 'function') {
        window.showSuccess(`Category "${categoryName}" removed successfully`);
      }
    }
  }
}

// Attach favorites and category UI functions to window
window.getQuestionData = getQuestionData;
window.updateFavoritesUI = updateFavoritesUI;
window.updateCategoryDropdown = updateCategoryDropdown;
window.updateCategoryModal = updateCategoryModal;
window.removeCategoryAndRefreshUI = removeCategoryAndRefreshUI;
window.showNoteReadView = showNoteReadView;
window.showNoteEditView = showNoteEditView;

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

// ===========================
// EXPORT FUNCTIONALITY
// ===========================

/**
 * Update export preview with current selections
 */
function updateExportPreview() {
  try {
    if (!window.currentExam || !window.currentQuestions?.length) {
      updatePreviewDisplay("No exam loaded", 0, 0);
      return;
    }

    const format = getSelectedExportFormat();
    const filter = getSelectedContentFilter();
    const options = getSelectedContentOptions();
    
    const filteredQuestions = getFilteredQuestionsForExport(filter);
    const questionCount = filteredQuestions.length;
    const estimatedSize = calculateEstimatedFileSize(filteredQuestions, format, options);
    
    const formatText = format.toUpperCase();
    const filterText = getFilterDisplayText(filter);
    const previewText = `${filterText} will be exported as ${formatText}`;
    
    updatePreviewDisplay(previewText, questionCount, estimatedSize);
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating export preview:", error);
    }
    updatePreviewDisplay("Error calculating preview", 0, 0);
  }
}

/**
 * Get selected export format
 */
function getSelectedExportFormat() {
  const selected = document.querySelector('input[name="exportFormat"]:checked');
  return selected?.value || 'json'; // Default to JSON instead of PDF
}

/**
 * Get selected content filter
 */
function getSelectedContentFilter() {
  const selected = document.querySelector('input[name="contentFilter"]:checked');
  return selected?.value || 'all';
}

/**
 * Get selected content options
 */
function getSelectedContentOptions() {
  const options = {
    includeQuestions: document.getElementById('includeQuestions')?.checked ?? false,
    includeAnswers: document.getElementById('includeAnswers')?.checked ?? false,
    includeCorrectAnswers: document.getElementById('includeCorrectAnswers')?.checked ?? false,
    includeDiscussions: document.getElementById('includeDiscussions')?.checked ?? false,
    includeImages: document.getElementById('includeImages')?.checked ?? false,
    includeUserNotes: document.getElementById('includeUserNotes')?.checked ?? false,
    includeMetadata: document.getElementById('includeMetadata')?.checked ?? false
  };
  
  console.log("🎛️ Export options selected:", options);
  return options;
}

/**
 * Get filtered questions based on selected filter
 */
function getFilteredQuestionsForExport(filter) {
  const allQuestions = window.currentQuestions || [];
  
  switch (filter) {
    case 'favorites':
      return allQuestions.filter((_, index) => 
        typeof window.isQuestionFavorite === 'function' ? 
        window.isQuestionFavorite(index) : false
      );
      
    case 'answered':
      return allQuestions.filter((_, index) => 
        typeof window.isQuestionAnswered === 'function' ? 
        window.isQuestionAnswered(index) : false
      );
      
    case 'notes':
      return allQuestions.filter((_, index) => {
        const note = typeof window.getQuestionNote === 'function' ? 
          window.getQuestionNote(index) : '';
        return note && note.trim() !== '';
      });
      
    case 'category':
      // Get selected categories from checkboxes
      const selectedCategoriesElements = document.querySelectorAll('.export-category-checkbox:checked');
      const selectedCategories = Array.from(selectedCategoriesElements).map(el => el.value);
      
      console.log("🏷️ Selected categories for export:", selectedCategories);
      
      if (selectedCategories.length === 0) {
        console.log("⚠️ No categories selected for export");
        return [];
      }
      
      return allQuestions.filter((_, index) => {
        if (typeof window.getQuestionCategory === 'function') {
          const questionCategory = window.getQuestionCategory(index);
          return selectedCategories.includes(questionCategory);
        }
        return false;
      });
      
    case 'all':
    default:
      return allQuestions;
  }
}

/**
 * Calculate estimated file size
 */
function calculateEstimatedFileSize(questions, format, options) {
  console.log("📏 Calculating file size for:", questions.length, "questions, format:", format);
  
  if (questions.length === 0) {
    console.log("❌ No questions to calculate size for");
    return 0;
  }
  
  let baseSize = 0;
  
  questions.forEach(question => {
    // Question text
    if (options.includeQuestions) {
      baseSize += (question.question || '').length * 2; // UTF-8 approximation
    }
    
    // Answers
    if (options.includeAnswers && question.answers) {
      question.answers.forEach(answer => {
        baseSize += (answer.text || '').length * 2;
      });
    }
    
    // Comments/discussions
    if (options.includeDiscussions && question.comments) {
      question.comments.forEach(comment => {
        baseSize += ((comment.content || '') + (comment.comment || '')).length * 2;
      });
    }
    
    // User notes
    if (options.includeUserNotes) {
      const note = typeof window.getQuestionNote === 'function' ? 
        window.getQuestionNote(questions.indexOf(question)) : '';
      baseSize += note.length * 2;
    }
    
    // Images (rough estimation)
    if (options.includeImages && question.images) {
      baseSize += Object.keys(question.images).length * 50000; // ~50KB per image
    }
  });
  
  console.log("📏 Base size before format multiplier:", baseSize, "bytes");
  
  // Format-specific multipliers
  switch (format) {
    case 'pdf':
      baseSize *= 3; // PDF overhead
      console.log("📏 PDF multiplier applied (x3)");
      break;
    case 'json':
      baseSize *= 1.5; // JSON structure overhead
      console.log("📏 JSON multiplier applied (x1.5)");
      break;
    case 'csv':
      baseSize *= 0.8; // CSV is compact
      console.log("📏 CSV multiplier applied (x0.8)");
      break;
    case 'txt':
      baseSize *= 1; // Plain text is most compact
      console.log("📏 TXT multiplier applied (x1)");
      break;
  }
  
  const finalSize = Math.max(1024, Math.round(baseSize)); // Minimum 1KB
  console.log("📏 Final calculated size:", finalSize, "bytes");
  
  return finalSize;
}

/**
 * Get display text for filter
 */
function getFilterDisplayText(filter) {
  switch (filter) {
    case 'favorites': return 'Favorite questions';
    case 'answered': return 'Answered questions';
    case 'notes': return 'Questions with notes';
    case 'category': return 'Questions by category';
    case 'all': 
    default: return 'All questions';
  }
}

/**
 * Populate export categories with available categories containing questions
 */
function populateExportCategories() {
  const categoryListEl = document.getElementById('exportCategoryList');
  if (!categoryListEl) return;

  // Get all available categories
  const allCategories = typeof window.getAllCategories === 'function' ? 
    window.getAllCategories() : [];
  
  console.log("🏷️ All available categories:", allCategories);
  console.log("🏷️ Current exam code:", window.currentExamCode);
  console.log("🏷️ Current exam object:", window.currentExam);
  console.log("🏷️ Total questions:", window.currentQuestions?.length || 0);
  
  // Ensure currentExamCode is available for getQuestionCategory
  if (!window.currentExamCode && window.currentExam) {
    window.currentExamCode = window.currentExam.exam_code || window.currentExam.code;
    console.log("🔧 Fixed currentExamCode:", window.currentExamCode);
  }

  // Filter categories that have questions
  const categoriesWithQuestions = allCategories.filter(category => {
    // Categories are strings, not objects
    const categoryName = typeof category === 'string' ? category : category.name;
    const questionsInCategory = getQuestionsInCategory(categoryName);
    console.log(`🔍 Category "${categoryName}" has ${questionsInCategory.length} questions`);
    console.log(`🔍 Category object:`, category);
    return questionsInCategory.length > 0;
  });

  console.log("📋 Categories with questions:", categoriesWithQuestions);

  // Clear existing content
  categoryListEl.innerHTML = '';

  if (categoriesWithQuestions.length === 0) {
    categoryListEl.innerHTML = `
      <div class="no-categories-message">
        <i class="fas fa-info-circle"></i>
        No categories available containing questions. Create categories by adding questions to favorites first.
      </div>
    `;
    return;
  }

  // Create checkboxes for categories with questions
  categoriesWithQuestions.forEach(category => {
    // Categories are strings, not objects
    const categoryName = typeof category === 'string' ? category : category.name;
    const questionCount = getQuestionsInCategory(categoryName).length;
    const checkboxHtml = `
      <label class="checkbox-option">
        <input type="checkbox" value="${categoryName}" class="export-category-checkbox" checked>
        <span class="checkbox-custom"></span>
        <div class="option-main">
          <div class="main-text">
            <i class="fas fa-tag"></i> ${categoryName}
          </div>
          <div class="sub-text">${questionCount} question${questionCount !== 1 ? 's' : ''}</div>
        </div>
      </label>
    `;
    categoryListEl.innerHTML += checkboxHtml;
  });

  // Add event listeners to category checkboxes
  const categoryCheckboxes = categoryListEl.querySelectorAll('.export-category-checkbox');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      if (typeof window.updateExportPreview === 'function') {
        window.updateExportPreview();
      }
    });
  });
}

/**
 * Get questions in a specific category
 */
function getQuestionsInCategory(categoryName) {
  const allQuestions = window.currentQuestions || [];
  console.log(`📋 Checking category "${categoryName}" against ${allQuestions.length} questions`);
  
  const questionsInCategory = allQuestions.filter((_, index) => {
    // Check if question is in the specified category
    if (typeof window.getQuestionCategory === 'function') {
      const questionCategory = window.getQuestionCategory(index);
      console.log(`🔎 Question ${index + 1} category: "${questionCategory}" (looking for: "${categoryName}")`);
      const matches = questionCategory === categoryName;
      if (matches) {
        console.log(`✅ Question ${index + 1} matches category "${categoryName}"`);
      }
      return matches;
    } else {
      console.log("❌ getQuestionCategory function not available");
    }
    return false;
  });
  
  console.log(`📊 Category "${categoryName}" final count: ${questionsInCategory.length} questions`);
  return questionsInCategory;
}

/**
 * Update preview display elements
 */
function updatePreviewDisplay(previewText, questionCount, sizeBytes) {
  const previewTextEl = document.getElementById('exportPreviewText');
  const questionCountEl = document.getElementById('exportQuestionCount');
  const estimatedSizeEl = document.getElementById('exportEstimatedSize');
  
  if (previewTextEl) {
    previewTextEl.textContent = previewText;
  }
  
  if (questionCountEl) {
    questionCountEl.textContent = `${questionCount} question${questionCount !== 1 ? 's' : ''}`;
  }
  
  if (estimatedSizeEl) {
    estimatedSizeEl.textContent = `~${formatFileSize(sizeBytes)}`;
  }
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 KB';
  
  const k = 1024;
  
  // Always show in KB for small files (< 1MB)
  if (bytes < k * k) {
    return Math.ceil(bytes / k) + ' KB';
  }
  
  // Always show in MB for files >= 1MB (never show GB)
  return (bytes / (k * k)).toFixed(1) + ' MB';
}

/**
 * Perform the actual export
 */
function performExport() {
  console.log("🔄 Starting export process...");
  
  try {
    console.log("📊 Getting export selections...");
    const format = getSelectedExportFormat();
    const filter = getSelectedContentFilter();
    const options = getSelectedContentOptions();
    
    console.log("📝 Export settings:", { format, filter, options });
    
    console.log("🔍 Filtering questions...");
    const filteredQuestions = getFilteredQuestionsForExport(filter);
    console.log("📋 Filtered questions count:", filteredQuestions.length);
    
    if (filteredQuestions.length === 0) {
      console.error("❌ No questions to export");
      if (typeof window.showError === 'function') {
        window.showError("No questions to export with the current filter selection.");
      } else {
        alert("No questions to export with the current filter selection.");
      }
      return;
    }
    
    console.log("✅ Questions ready for export, hiding modal...");
    
    // Hide the modal first
    if (typeof window.hideExportModal === 'function') {
      window.hideExportModal();
    }
    
    // Show success message
    const successMessage = `Preparing to export ${filteredQuestions.length} questions as ${format.toUpperCase()}...`;
    console.log("💬 Success message:", successMessage);
    
    if (typeof window.showSuccess === 'function') {
      window.showSuccess(successMessage);
    } else {
      alert(successMessage);
    }
    
    console.log("⏱️ Starting export in 500ms...");
    
    // Perform export based on format
    setTimeout(() => {
      console.log("🚀 Executing export for format:", format);
      
      switch (format) {
        case 'pdf':
          console.log("📄 Starting PDF export");
          try {
            console.log("🔍 About to call exportToPDF function...");
            console.log("🔍 exportToPDF function exists:", typeof exportToPDF);
            exportToPDF(filteredQuestions, options);
            console.log("✅ exportToPDF function completed");
          } catch (error) {
            console.error("❌ Error in exportToPDF:", error);
            alert("PDF Export Error: " + error.message);
          }
          break;
        case 'json':
          console.log("📄 Starting JSON export");
          exportToJSON(filteredQuestions, options);
          break;
        case 'txt':
          console.log("📄 Starting TXT export");
          exportToTXT(filteredQuestions, options);
          break;
        case 'csv':
          console.log("📄 Starting CSV export");
          exportToCSV(filteredQuestions, options);
          break;
        default:
          console.error("❌ Unsupported export format:", format);
          if (typeof window.showError === 'function') {
            window.showError("Unsupported export format: " + format);
          } else {
            alert("Unsupported export format: " + format);
          }
      }
    }, 500);
    
  } catch (error) {
    console.error("❌ Export error:", error);
    
    if (typeof window.devError === 'function') {
      window.devError("Error performing export:", error);
    }
    
    const errorMessage = "Export failed: " + error.message;
    if (typeof window.showError === 'function') {
      window.showError(errorMessage);
    } else {
      alert(errorMessage);
    }
  }
}

/**
 * Export to JSON format
 */
function exportToJSON(questions, options) {
  console.log("📦 Starting JSON export with:", questions.length, "questions");
  console.log("📦 JSON export options:", options);
  
  const examName = window.currentExam?.exam_name || window.currentExam?.code || 'exam';
  console.log("📦 Exam name for export:", examName);
  
  const exportData = {
    exam: {
      name: examName,
      code: window.currentExam?.exam_code || window.currentExam?.code,
      exportDate: new Date().toISOString(),
      questionCount: questions.length
    },
    questions: questions.map((question, index) => {
      const exportQuestion = {};
      
      if (options.includeQuestions) {
        exportQuestion.question = question.question;
        exportQuestion.question_number = question.question_number;
      }
      
      if (options.includeAnswers && question.answers) {
        exportQuestion.answers = question.answers;
      }
      
      if (options.includeCorrectAnswers) {
        exportQuestion.correct_answers = question.correct_answers;
      }
      
      if (options.includeDiscussions && question.comments) {
        exportQuestion.comments = question.comments;
      }
      
      if (options.includeUserNotes) {
        const note = typeof window.getQuestionNote === 'function' ? 
          window.getQuestionNote(index) : '';
        if (note) exportQuestion.userNote = note;
      }
      
      if (options.includeImages && question.images) {
        exportQuestion.images = question.images;
      }
      
      if (options.includeMetadata) {
        exportQuestion.metadata = {
          isFavorite: typeof window.isQuestionFavorite === 'function' ? 
            window.isQuestionFavorite(index) : false,
          isAnswered: typeof window.isQuestionAnswered === 'function' ? 
            window.isQuestionAnswered(index) : false
        };
      }
      
      return exportQuestion;
    })
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  downloadFile(jsonString, `${examName}_export.json`, 'application/json');
}

/**
 * Export to plain text format
 */
function exportToTXT(questions, options) {
  const examName = window.currentExam?.exam_name || window.currentExam?.code || 'exam';
  let content = `${examName} - Question Export\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Questions: ${questions.length}\n`;
  content += '='.repeat(50) + '\n\n';
  
  questions.forEach((question, index) => {
    if (options.includeQuestions) {
      content += `Question ${question.question_number}: ${question.question}\n\n`;
    }
    
    if (options.includeAnswers && question.answers) {
      content += 'Answers:\n';
      question.answers.forEach((answer, i) => {
        const letter = String.fromCharCode(65 + i); // A, B, C, D
        content += `${letter}. ${answer.text}\n`;
      });
      content += '\n';
    }
    
    if (options.includeCorrectAnswers && question.correct_answers) {
      content += `Correct Answer(s): ${question.correct_answers.join(', ')}\n\n`;
    }
    
    if (options.includeUserNotes) {
      const note = typeof window.getQuestionNote === 'function' ? 
        window.getQuestionNote(index) : '';
      if (note) {
        content += `Personal Note: ${note}\n\n`;
      }
    }
    
    content += '-'.repeat(30) + '\n\n';
  });
  
  downloadFile(content, `${examName}_export.txt`, 'text/plain');
}

/**
 * Export to CSV format
 */
function exportToCSV(questions, options) {
  const examName = window.currentExam?.exam_name || window.currentExam?.code || 'exam';
  let csvContent = 'Question Number,Question Text,Answer A,Answer B,Answer C,Answer D,Correct Answer,User Note,Is Favorite\n';
  
  questions.forEach((question, index) => {
    const row = [];
    
    row.push(escapeCSV(question.question_number));
    row.push(options.includeQuestions ? escapeCSV(question.question) : '');
    
    // Add answer columns
    for (let i = 0; i < 4; i++) {
      const answer = question.answers?.[i]?.text || '';
      row.push(options.includeAnswers ? escapeCSV(answer) : '');
    }
    
    row.push(options.includeCorrectAnswers ? escapeCSV(question.correct_answers?.join(', ') || '') : '');
    
    if (options.includeUserNotes) {
      const note = typeof window.getQuestionNote === 'function' ? 
        window.getQuestionNote(index) : '';
      row.push(escapeCSV(note));
    } else {
      row.push('');
    }
    
    if (options.includeMetadata) {
      const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
        window.isQuestionFavorite(index) : false;
      row.push(isFavorite ? 'Yes' : 'No');
    } else {
      row.push('');
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  downloadFile(csvContent, `${examName}_export.csv`, 'text/csv');
}

/**
 * Export to PDF format - opens print dialog for PDF save
 */
function exportToPDF(questions, options) {
  console.log("📄 PDF export called with", questions.length, "questions");
  console.log("📄 PDF export options:", options);
  
  if (!questions || questions.length === 0) {
    console.error("❌ No questions to export");
    if (typeof window.showError === 'function') {
      window.showError("No questions loaded to export");
    }
    return;
  }

  const {
    includeQuestions = true,
    includeAnswers = true,
    includeCorrectAnswers = true,
    includeDiscussions = true,
    includeImages = true,
    includeUserNotes = true,
    includeMetadata = true
  } = options;

  console.log("🖨️ Opening print window...");

  // Create a printable version
  const printWindow = window.open("", "_blank");
  const printDocument = printWindow.document;

  const examName = window.currentExam?.exam_name || window.currentExam?.code || 'Exam Questions';
  
  printDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${examName} - Questions Export</title>
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
                .user-note { margin-top: 10px; padding: 8px; background-color: #fff3cd; border-radius: 3px; border-left: 4px solid #ffc107; }
                .user-note-header { font-weight: bold; font-size: 12px; color: #856404; }
                @media print {
                    body { margin: 0; }
                    .question { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
    `);

  // Add metadata header
  if (includeMetadata) {
    printDocument.write(`
      <h1>Exam Questions - ${examName}</h1>
      <p>Total Questions: ${questions.length}</p>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <p>Export Options: ${Object.entries(options).filter(([k, v]) => v).map(([k]) => k.replace('include', '')).join(', ')}</p>
      <hr>
    `);
  }

  questions.forEach((question, index) => {
    const questionNumber = question.question_number || index + 1;

    printDocument.write(`<div class="question">`);
    
    // Question header
    printDocument.write(`<div class="question-header">Question ${questionNumber}</div>`);
    
    // Question text
    if (includeQuestions) {
      let questionText = question.question || "";
      
      // Process embedded images first
      if (includeImages && question.images && Object.keys(question.images).length > 0) {
        questionText = typeof window.processEmbeddedImages === 'function' ? 
          window.processEmbeddedImages(questionText, question.images) : questionText;
      }
      
      // Fix any remaining image paths for PDF export
      if (includeImages) {
        questionText = questionText.replace(
          /src="\/assets\/media\/exam-media\//g,
          'src="https://www.examtopics.com/assets/media/exam-media/'
        );
      } else {
        // Remove images if not included
        questionText = questionText.replace(/<img[^>]*>/g, '[Image not included]');
      }

      printDocument.write(`<div class="question-text">${questionText}</div>`);
    }
    
    // Answers
    if (includeAnswers && question.answers) {
      const answers = question.answers || [];
      const mostVoted = question.most_voted || "";
      const correctAnswers = mostVoted.split(""); // Convert string to array of letters
      const correctSet = new Set(correctAnswers);

      console.log("📝 Processing answers for question", questionNumber, "- found", answers.length, "answers");
      console.log("📝 Answer structure:", answers[0]);
      console.log("📝 Most voted (raw):", mostVoted);
      console.log("📝 Correct answers (converted):", correctAnswers);

      printDocument.write(`<div class="answers">`);

      answers.forEach((answer, answerIndex) => {
        // Handle different answer structures
        let answerLetter = '';
        let answerText = '';
        
        if (typeof answer === 'string') {
          // Old format: "A. Answer text"
          answerLetter = answer.charAt(0);
          answerText = answer.substring(3);
        } else if (answer.text) {
          // Format: {text: "A. Answer text"}
          answerLetter = answer.text.charAt(0);
          answerText = answer.text.substring(3);
        } else if (typeof answer === 'object') {
          // New format: {letter: "A", text: "Answer text"}
          answerLetter = answer.letter || String.fromCharCode(65 + answerIndex); // A, B, C, D
          answerText = answer.text || answer.content || '';
        } else {
          // Fallback: generate letter
          answerLetter = String.fromCharCode(65 + answerIndex); // A, B, C, D
          answerText = String(answer);
        }

        console.log(`📝 Answer ${answerLetter}: ${answerText.substring(0, 50)}...`);

        // Process embedded images in answers
        if (includeImages && question.images && Object.keys(question.images).length > 0) {
          answerText = typeof window.processEmbeddedImages === 'function' ? 
            window.processEmbeddedImages(answerText, question.images) : answerText;
        }

        // Fix image paths in answers for PDF export too
        if (includeImages) {
          answerText = answerText.replace(
            /src="\/assets\/media\/exam-media\//g,
            'src="https://www.examtopics.com/assets/media/exam-media/'
          );
        } else {
          answerText = answerText.replace(/<img[^>]*>/g, '[Image not included]');
        }

        const isCorrect = correctSet.has(answerLetter);
        const fullAnswer = answerLetter + ". " + answerText;

        printDocument.write(`
                <div class="answer ${(isCorrect && includeCorrectAnswers) ? "correct-answer" : ""}">
                    ${fullAnswer} ${(isCorrect && includeCorrectAnswers) ? "✓" : ""}
                </div>
            `);
      });

      printDocument.write("</div>");

      // Show correct answers if enabled
      console.log("🎯 Checking correct answers section:");
      console.log("🎯 includeCorrectAnswers:", includeCorrectAnswers);
      console.log("🎯 correctAnswers:", correctAnswers);
      console.log("🎯 correctAnswers.length:", correctAnswers.length);
      
      if (includeCorrectAnswers && correctAnswers.length > 0) {
        console.log("✅ Showing correct answers section");
        printDocument.write(`
                <div style="margin-top: 10px; font-weight: bold; color: #28a745;">
                    Correct Answer(s): ${correctAnswers.join(', ')}
                </div>
            `);
      } else {
        console.log("❌ Not showing correct answers because:");
        console.log("   - includeCorrectAnswers:", includeCorrectAnswers);
        console.log("   - correctAnswers array:", correctAnswers);
        console.log("   - is empty?", correctAnswers.length === 0);
      }
    }

    // User notes
    if (includeUserNotes) {
      const userNote = typeof window.getQuestionNote === 'function' ? 
        window.getQuestionNote(index) : '';
      
      if (userNote && userNote.trim()) {
        printDocument.write(`
          <div class="user-note">
            <div class="user-note-header">Personal Note:</div>
            <div>${userNote}</div>
          </div>
        `);
      }
    }

    // Discussion
    if (includeDiscussions && question.comments && question.comments.length > 0) {
      printDocument.write(`
                <div class="discussion">
                    <strong>Discussion:</strong>
            `);

      question.comments.slice(0, 5).forEach((comment) => {
        const commentText = typeof window.formatCommentText === 'function' ? 
          window.formatCommentText(comment.content || comment.comment || "", question.images) :
          (comment.content || comment.comment || "");
          
        printDocument.write(`
                     <div class="comment">
                         <div class="comment-header">Selected: ${comment.selected_answer || "N/A"}</div>
                         <div>${commentText}</div>
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
  
  console.log("✅ Print document ready, opening print dialog...");

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    console.log("🖨️ Print dialog opened");
  }, 1000);

  if (typeof window.showSuccess === 'function') {
    window.showSuccess('Print dialog opened. Choose "Save as PDF" to export to PDF file.');
  } else {
    alert('Print dialog opened. Choose "Save as PDF" to export to PDF file.');
  }
}

/**
 * Escape CSV values
 */
function escapeCSV(value) {
  if (typeof value !== 'string') return '';
  
  // Remove HTML tags
  value = value.replace(/<[^>]*>/g, '');
  
  // Escape quotes and wrap in quotes if needed
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
}

/**
 * Download file to user's computer
 */
function downloadFile(content, filename, mimeType) {
  console.log("💾 Starting download:", filename, "Type:", mimeType, "Size:", content.length, "chars");
  
  try {
    const blob = new Blob([content], { type: mimeType });
    console.log("💾 Blob created, size:", blob.size, "bytes");
    
    const url = URL.createObjectURL(blob);
    console.log("💾 Object URL created:", url);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    
    console.log("💾 Clicking download link...");
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("✅ Download initiated successfully");
    
    if (typeof window.showSuccess === 'function') {
      window.showSuccess(`Export completed: ${filename}`);
    } else {
      alert(`Export completed: ${filename}`);
    }
  } catch (error) {
    console.error("❌ Download error:", error);
    alert("Download failed: " + error.message);
  }
}

// Expose export functions globally
window.updateExportPreview = updateExportPreview;
window.performExport = performExport;
// hideExportModal is already defined in ui-effects.js module

devLog("📦 script-modular.js loaded successfully");