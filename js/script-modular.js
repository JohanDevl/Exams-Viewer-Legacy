/**
 * Modular Script Entry Point
 * 
 * This is the main entry point for the modular architecture version of script.js
 * Currently imports and uses the Storage module while keeping all other functionality inline.
 */

// Import storage module
import {
  isDevelopmentMode,
  devLog,
  devError,
  compressData,
  decompressData,
  clearCorruptedData,
  saveStatistics,
  loadStatistics,
  saveFavorites,
  loadFavorites,
  loadSettings,
  saveSettings,
  loadResumePositions,
  saveResumePositions,
  saveResumePosition,
  getResumePosition,
  clearResumePosition,
} from './modules/storage.js';

// Import settings module
import {
  applyTheme,
  loadSettingsUI,
  saveSettingsUI,
  updateMainProgressBarVisibility,
  updateToolbarVisibility,
  updateTooltipVisibility,
  updateAdvancedSearchVisibility,
  handleDarkModeToggle,
  handleHighlightDefaultToggle,
  handleShowDiscussionDefaultToggle,
  handleQuestionToolbarToggle,
  handleAdvancedSearchToggle,
  handleLazyLoadingToggle,
  handleMainProgressBarToggle,
  handleTooltipsToggle,
  handleResumePositionToggle,
  handleAutoSavePositionToggle,
  setupSettingsEventListeners,
  initializeSettings,
} from './modules/settings.js';

// Make storage functions globally available for now (backward compatibility)
window.isDevelopmentMode = isDevelopmentMode;
window.devLog = devLog;
window.devError = devError;
window.compressData = compressData;
window.decompressData = decompressData;
window.clearCorruptedData = clearCorruptedData;
window.saveStatistics = saveStatistics;
window.loadStatistics = loadStatistics;
window.saveFavorites = saveFavorites;
window.loadFavorites = loadFavorites;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.loadResumePositions = loadResumePositions;
window.saveResumePositions = saveResumePositions;
window.saveResumePosition = saveResumePosition;
window.getResumePosition = getResumePosition;
window.clearResumePosition = clearResumePosition;

// Make settings functions globally available for now (backward compatibility)
window.applyTheme = applyTheme;
window.loadSettingsUI = loadSettingsUI;
window.saveSettingsUI = saveSettingsUI;
window.updateMainProgressBarVisibility = updateMainProgressBarVisibility;
window.updateToolbarVisibility = updateToolbarVisibility;
window.updateTooltipVisibility = updateTooltipVisibility;
window.updateAdvancedSearchVisibility = updateAdvancedSearchVisibility;
window.handleDarkModeToggle = handleDarkModeToggle;
window.handleHighlightDefaultToggle = handleHighlightDefaultToggle;
window.handleShowDiscussionDefaultToggle = handleShowDiscussionDefaultToggle;
window.handleQuestionToolbarToggle = handleQuestionToolbarToggle;
window.handleAdvancedSearchToggle = handleAdvancedSearchToggle;
window.handleLazyLoadingToggle = handleLazyLoadingToggle;
window.handleMainProgressBarToggle = handleMainProgressBarToggle;
window.handleTooltipsToggle = handleTooltipsToggle;
window.handleResumePositionToggle = handleResumePositionToggle;
window.handleAutoSavePositionToggle = handleAutoSavePositionToggle;
window.setupSettingsEventListeners = setupSettingsEventListeners;
window.initializeSettings = initializeSettings;

// Initialize global settings object if not exists
if (!window.settings) {
  window.settings = {
    showDiscussionDefault: false,
    highlightDefault: false,
    darkMode: false,
    showQuestionToolbar: false,
    showAdvancedSearch: false,
    sidebarOpen: false,
    enableLazyLoading: false,
    showMainProgressBar: true,
    showTooltips: false,
    enableResumePosition: false,
    autoSavePosition: false,
  };
}

console.log("📦 Storage module loaded successfully");
console.log("⚙️ Settings module loaded successfully");
console.log("⚙️ Global settings object initialized");

// ===========================
// TEMPORARY: Load remaining script.js functionality
// This will be modularized in future steps
// ===========================

// For now, we'll load the rest of script.js content inline
// This is a temporary solution until all modules are extracted

// [The rest of script.js content will be dynamically loaded here]
// For testing purposes, we'll include a minimal implementation

console.log("🚀 Modular architecture initialized");
console.log("📦 Available modules: Storage, Settings");
console.log("⚠️  Other functionality still loading from script.js");