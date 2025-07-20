/**
 * Core State Management Module
 * 
 * Centralizes all global state variables for Exams-Viewer application.
 * Provides a single source of truth for application state with proper initialization,
 * getters, setters, and state management utilities.
 * 
 * Dependencies: None (this is the foundation module)
 */

// ===========================
// CORE APPLICATION STATE
// ===========================

/**
 * Core exam and question state
 */
const examState = {
  currentExam: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  selectedAnswers: new Set(),
  isValidated: false,
  isHighlightEnabled: false,
  isHighlightTemporaryOverride: false, // Track if user manually toggled highlight
  questionStartTime: null, // Track when question was started
};

/**
 * Search and filter state
 */
const searchState = {
  allQuestions: [], // Store original questions array
  filteredQuestions: [], // Store filtered results
  isSearchActive: false, // Track if search/filter is active
  searchCache: {}, // Cache search results for performance
};

/**
 * Application settings with defaults
 */
const appSettings = {
  showDiscussionDefault: false,
  highlightDefault: false,
  darkMode: false,
  showQuestionToolbar: false,
  showAdvancedSearch: false,
  sidebarOpen: false,
  enableLazyLoading: false, // Lazy loading disabled by default
  showMainProgressBar: true, // Main progress bar enabled by default
  showTooltips: false, // Tooltips disabled by default
  enableResumePosition: false, // Resume position disabled by default
  autoSavePosition: false, // Auto-save position disabled by default
};

/**
 * Available exams mapping
 */
const examDiscovery = {
  availableExams: {}, // Will be populated dynamically
};

/**
 * Lazy loading system configuration
 */
const lazyLoadingState = {
  chunkSize: 50, // Questions per chunk
  loadedChunks: new Map(), // Map of chunkId -> questions array
  currentChunk: 0,
  totalChunks: 0,
  preloadBuffer: 1, // Number of chunks to preload ahead/behind
  isChunkedExam: false, // Whether current exam uses chunking
  examMetadata: null, // Metadata for chunked exams
};

/**
 * Favorites and Notes system state
 */
const favoritesState = {
  favorites: {}, // { examCode: { questionNumber: { isFavorite: true, category: 'important', note: 'text', timestamp: timestamp } } }
  categories: ["Important", "Review", "Difficult"], // Default categories
  customCategories: [], // User-defined categories
  isRevisionMode: false, // Track if we're in revision mode
  revisionFilter: {
    showFavorites: true,
    showCategories: [], // Categories to show in revision mode
    showNotes: true, // Show only questions with notes
  },
};

/**
 * Statistics system state
 */
const statisticsState = {
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

/**
 * Resume position system state
 */
const resumeState = {
  positions: {}, // examCode: { questionIndex: number, timestamp: number, questionNumber: number, totalQuestions: number, lastSessionId: string }
};

/**
 * Navigation state for enhanced navigation features
 */
const navigationState = {
  history: [], // Navigation history
  historyIndex: -1, // Current position in history
  sidebarOpen: false, // Sidebar visibility
  milestoneStates: {
    milestone25: false,
    milestone50: false,
    milestone75: false,
    milestone100: false
  },
};

// ===========================
// STATE ACCESS FUNCTIONS
// ===========================

/**
 * Get exam state
 */
function getExamState() {
  return examState;
}

/**
 * Get search state
 */
function getSearchState() {
  return searchState;
}

/**
 * Get application settings
 */
function getAppSettings() {
  return appSettings;
}

/**
 * Get exam discovery state
 */
function getExamDiscovery() {
  return examDiscovery;
}

/**
 * Get lazy loading state
 */
function getLazyLoadingState() {
  return lazyLoadingState;
}

/**
 * Get favorites state
 */
function getFavoritesState() {
  return favoritesState;
}

/**
 * Get statistics state
 */
function getStatisticsState() {
  return statisticsState;
}

/**
 * Get resume state
 */
function getResumeState() {
  return resumeState;
}

/**
 * Get navigation state
 */
function getNavigationState() {
  return navigationState;
}

/**
 * Get all application state (for debugging or export)
 */
function getAllState() {
  return {
    exam: examState,
    search: searchState,
    settings: appSettings,
    discovery: examDiscovery,
    lazyLoading: lazyLoadingState,
    favorites: favoritesState,
    statistics: statisticsState,
    resume: resumeState,
    navigation: navigationState,
  };
}

// ===========================
// STATE MODIFICATION FUNCTIONS
// ===========================

/**
 * Update exam state properties
 */
function updateExamState(updates) {
  Object.assign(examState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Exam state updated:', Object.keys(updates));
  }
}

/**
 * Update search state properties
 */
function updateSearchState(updates) {
  Object.assign(searchState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Search state updated:', Object.keys(updates));
  }
}

/**
 * Update application settings
 */
function updateAppSettings(updates) {
  Object.assign(appSettings, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('App settings updated:', Object.keys(updates));
  }
}

/**
 * Update exam discovery state
 */
function updateExamDiscovery(updates) {
  Object.assign(examDiscovery, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Exam discovery updated:', Object.keys(updates));
  }
}

/**
 * Update lazy loading state
 */
function updateLazyLoadingState(updates) {
  Object.assign(lazyLoadingState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Lazy loading state updated:', Object.keys(updates));
  }
}

/**
 * Update favorites state
 */
function updateFavoritesState(updates) {
  Object.assign(favoritesState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Favorites state updated:', Object.keys(updates));
  }
}

/**
 * Update statistics state
 */
function updateStatisticsState(updates) {
  Object.assign(statisticsState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Statistics state updated:', Object.keys(updates));
  }
}

/**
 * Update resume state
 */
function updateResumeState(updates) {
  Object.assign(resumeState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Resume state updated:', Object.keys(updates));
  }
}

/**
 * Update navigation state
 */
function updateNavigationState(updates) {
  Object.assign(navigationState, updates);
  if (typeof window.devLog === 'function') {
    window.devLog('Navigation state updated:', Object.keys(updates));
  }
}

// ===========================
// STATE RESET FUNCTIONS
// ===========================

/**
 * Reset exam state to defaults
 */
function resetExamState() {
  examState.currentExam = null;
  examState.currentQuestions = [];
  examState.currentQuestionIndex = 0;
  examState.selectedAnswers = new Set();
  examState.isValidated = false;
  examState.isHighlightEnabled = false;
  examState.isHighlightTemporaryOverride = false;
  examState.questionStartTime = null;
  
  if (typeof window.devLog === 'function') {
    window.devLog('Exam state reset to defaults');
  }
}

/**
 * Reset search state to defaults
 */
function resetSearchState() {
  searchState.allQuestions = [];
  searchState.filteredQuestions = [];
  searchState.isSearchActive = false;
  searchState.searchCache = {};
  
  if (typeof window.devLog === 'function') {
    window.devLog('Search state reset to defaults');
  }
}

/**
 * Reset lazy loading state to defaults
 */
function resetLazyLoadingState() {
  lazyLoadingState.loadedChunks.clear();
  lazyLoadingState.currentChunk = 0;
  lazyLoadingState.totalChunks = 0;
  lazyLoadingState.isChunkedExam = false;
  lazyLoadingState.examMetadata = null;
  
  if (typeof window.devLog === 'function') {
    window.devLog('Lazy loading state reset to defaults');
  }
}

/**
 * Reset navigation state to defaults
 */
function resetNavigationState() {
  navigationState.history = [];
  navigationState.historyIndex = -1;
  navigationState.sidebarOpen = false;
  navigationState.milestoneStates = {
    milestone25: false,
    milestone50: false,
    milestone75: false,
    milestone100: false
  };
  
  if (typeof window.devLog === 'function') {
    window.devLog('Navigation state reset to defaults');
  }
}

/**
 * Reset all application state to defaults (except settings)
 */
function resetAllState() {
  resetExamState();
  resetSearchState();
  resetLazyLoadingState();
  resetNavigationState();
  
  // Don't reset settings, favorites, statistics, or resume positions
  // as these should persist across sessions
  
  if (typeof window.devLog === 'function') {
    window.devLog('All application state reset to defaults');
  }
}

// ===========================
// STATE INITIALIZATION
// ===========================

/**
 * Initialize all state to default values
 */
function initializeState() {
  // Most state is already initialized with defaults
  // This function can be used for any additional setup
  
  if (typeof window.devLog === 'function') {
    window.devLog('Core state management initialized');
  }
}

/**
 * Initialize and expose state globally for backward compatibility
 */
function initializeGlobalState() {
  // Expose state objects globally for backward compatibility
  window.currentExam = examState.currentExam;
  window.currentQuestions = examState.currentQuestions;
  window.currentQuestionIndex = examState.currentQuestionIndex;
  window.selectedAnswers = examState.selectedAnswers;
  window.isValidated = examState.isValidated;
  window.isHighlightEnabled = examState.isHighlightEnabled;
  window.isHighlightTemporaryOverride = examState.isHighlightTemporaryOverride;
  window.questionStartTime = examState.questionStartTime;
  
  window.allQuestions = searchState.allQuestions;
  window.filteredQuestions = searchState.filteredQuestions;
  window.isSearchActive = searchState.isSearchActive;
  window.searchCache = searchState.searchCache;
  
  window.settings = appSettings;
  window.availableExams = examDiscovery.availableExams;
  window.lazyLoadingConfig = lazyLoadingState;
  window.favoritesData = favoritesState;
  window.statistics = statisticsState;
  window.resumePositions = resumeState.positions;
  window.milestoneStates = navigationState.milestoneStates;
  window.sidebarOpen = navigationState.sidebarOpen;
  window.navigationHistory = navigationState.history;
  window.historyIndex = navigationState.historyIndex;
  
  if (typeof window.devLog === 'function') {
    window.devLog('Global state variables initialized for backward compatibility');
  }
}

// ===========================
// STATE SYNCHRONIZATION
// ===========================

/**
 * Sync global variables back to state objects
 * (for backward compatibility when global variables are modified)
 */
function syncGlobalState() {
  // Sync exam state
  examState.currentExam = window.currentExam;
  examState.currentQuestions = window.currentQuestions;
  examState.currentQuestionIndex = window.currentQuestionIndex;
  examState.selectedAnswers = window.selectedAnswers;
  examState.isValidated = window.isValidated;
  examState.isHighlightEnabled = window.isHighlightEnabled;
  examState.isHighlightTemporaryOverride = window.isHighlightTemporaryOverride;
  examState.questionStartTime = window.questionStartTime;
  
  // Sync search state
  searchState.allQuestions = window.allQuestions;
  searchState.filteredQuestions = window.filteredQuestions;
  searchState.isSearchActive = window.isSearchActive;
  searchState.searchCache = window.searchCache;
  
  // Sync other states
  Object.assign(appSettings, window.settings);
  Object.assign(examDiscovery.availableExams, window.availableExams);
  Object.assign(lazyLoadingState, window.lazyLoadingConfig);
  Object.assign(favoritesState, window.favoritesData);
  Object.assign(statisticsState, window.statistics);
  Object.assign(resumeState.positions, window.resumePositions);
  Object.assign(navigationState.milestoneStates, window.milestoneStates);
  navigationState.sidebarOpen = window.sidebarOpen;
  navigationState.history = window.navigationHistory;
  navigationState.historyIndex = window.historyIndex;
  
  if (typeof window.devLog === 'function') {
    window.devLog('Global state synchronized back to state objects');
  }
}

// ===========================
// STATE UTILITIES
// ===========================

/**
 * Get state summary for debugging
 */
function getStateSummary() {
  const summary = {
    exam: {
      hasExam: !!examState.currentExam,
      questionsCount: examState.currentQuestions.length,
      currentIndex: examState.currentQuestionIndex,
      selectedAnswers: examState.selectedAnswers.size,
      isValidated: examState.isValidated,
      isHighlightEnabled: examState.isHighlightEnabled,
    },
    search: {
      allQuestionsCount: searchState.allQuestions.length,
      filteredQuestionsCount: searchState.filteredQuestions.length,
      isSearchActive: searchState.isSearchActive,
      cacheEntries: Object.keys(searchState.searchCache).length,
    },
    lazyLoading: {
      isChunkedExam: lazyLoadingState.isChunkedExam,
      loadedChunks: lazyLoadingState.loadedChunks.size,
      totalChunks: lazyLoadingState.totalChunks,
      chunkSize: lazyLoadingState.chunkSize,
    },
    favorites: {
      examCount: Object.keys(favoritesState.favorites).length,
      isRevisionMode: favoritesState.isRevisionMode,
      categoriesCount: favoritesState.categories.length + favoritesState.customCategories.length,
    },
    statistics: {
      sessionsCount: statisticsState.sessions.length,
      hasCurrentSession: !!statisticsState.currentSession,
      totalQuestions: statisticsState.totalStats.totalQuestions,
      totalCorrect: statisticsState.totalStats.totalCorrect,
    },
    resume: {
      positionsCount: Object.keys(resumeState.positions).length,
    },
    navigation: {
      historyLength: navigationState.history.length,
      historyIndex: navigationState.historyIndex,
      sidebarOpen: navigationState.sidebarOpen,
    },
  };
  
  return summary;
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all state management functions
export {
  // State access functions
  getExamState,
  getSearchState,
  getAppSettings,
  getExamDiscovery,
  getLazyLoadingState,
  getFavoritesState,
  getStatisticsState,
  getResumeState,
  getNavigationState,
  getAllState,
  
  // State modification functions
  updateExamState,
  updateSearchState,
  updateAppSettings,
  updateExamDiscovery,
  updateLazyLoadingState,
  updateFavoritesState,
  updateStatisticsState,
  updateResumeState,
  updateNavigationState,
  
  // State reset functions
  resetExamState,
  resetSearchState,
  resetLazyLoadingState,
  resetNavigationState,
  resetAllState,
  
  // State initialization
  initializeState,
  initializeGlobalState,
  syncGlobalState,
  
  // State utilities
  getStateSummary,
};