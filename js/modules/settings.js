/**
 * Settings & Configuration Module
 * 
 * Handles user preferences, theme management, and UI configuration
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: settings, isHighlightEnabled, sidebarOpen, currentQuestions, 
 *   currentQuestionIndex, statistics, isHighlightTemporaryOverride, currentExam, 
 *   allQuestions, isSearchActive
 * - External functions: updateMainProgressBar, displayCurrentQuestion, updateHighlightButton,
 *   updateInstructions, updateSessionStats, saveStatistics, clearQuestionStatusCache,
 *   updateProgressSidebar, updateFilterCounts, initializeSearchInterface, resetAllFilters,
 *   showSuccess
 */

// ===========================
// CORE SETTINGS MANAGEMENT
// ===========================

/**
 * Apply dark/light theme to the UI
 */
function applyTheme(isDark = null) {
  if (typeof window.devLog === 'function') {
    window.devLog("🎨 applyTheme() called with isDark:", isDark);
    window.devLog("📄 window.settings in applyTheme:", window.settings);
  }
  
  const body = document.body;
  const darkModeBtn = document.getElementById("darkModeBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");
  
  // Use parameter if provided, otherwise use settings
  const darkMode = isDark !== null ? isDark : (window.settings?.darkMode || false);
  if (typeof window.devLog === 'function') {
    window.devLog("🎨 Calculated darkMode value:", darkMode);
  }
  
  // Update settings object if parameter was provided
  if (isDark !== null && window.settings) {
    window.settings.darkMode = isDark;
  }
  
  // Update checkbox to match the theme
  if (darkModeToggle) {
    darkModeToggle.checked = darkMode;
  }
  
  if (darkMode) {
    if (typeof window.devLog === 'function') {
      window.devLog("🌙 Applying DARK mode - setting data-theme='dark'");
    }
    body.setAttribute("data-theme", "dark");
    body.classList.remove("dark-mode"); // Remove old class if exists
    if (darkModeBtn) {
      darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      darkModeBtn.title = "Switch to Light Mode";
      if (typeof window.devLog === 'function') {
        window.devLog("🌅 Dark mode button updated to sun icon");
      }
    }
  } else {
    if (typeof window.devLog === 'function') {
      window.devLog("☀️ Applying LIGHT mode - removing data-theme attribute");
    }
    body.removeAttribute("data-theme");
    body.classList.remove("dark-mode"); // Remove old class if exists
    if (darkModeBtn) {
      darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeBtn.title = "Switch to Dark Mode";
      if (typeof window.devLog === 'function') {
        window.devLog("🌙 Dark mode button updated to moon icon");
      }
    }
  }
  if (typeof window.devLog === 'function') {
    window.devLog("🎨 Final body data-theme:", body.getAttribute("data-theme"));
    window.devLog("🎨 Final body classes:", body.className);
    window.devLog("🎨 applyTheme() completed - FIXED!");
  }
}

/**
 * Load settings from localStorage and apply them to the UI
 */
function loadSettingsUI() {
  try {
    const savedSettings = localStorage.getItem("examViewerSettings");
    
    // Ensure settings object exists with defaults
    if (!window.settings) {
      window.settings = {
        showDiscussionDefault: false,
        highlightDefault: false,
        darkMode: false,
        showQuestionToolbar: false,
        showAdvancedSearch: false,
        sidebarOpen: false,
        showMainProgressBar: true,
        showTooltips: false,
      };
    }
    
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      
      // Merge with default settings to ensure all properties exist
      Object.assign(window.settings, loadedSettings);
      
      if (typeof window.devLog === 'function') {
        window.devLog("⚙️ Settings loaded from localStorage");
      }
    } else {
      if (typeof window.devLog === 'function') {
        window.devLog("⚙️ No saved settings found, using defaults");
      }
    }
    
    // Apply settings to UI elements
    const elements = {
      showDiscussionDefault: document.getElementById("showDiscussionDefault"),
      highlightDefault: document.getElementById("highlightDefault"),
      darkMode: document.getElementById("darkModeToggle"),
      showQuestionToolbar: document.getElementById("showQuestionToolbar"),
      showAdvancedSearch: document.getElementById("showAdvancedSearch"),
      showMainProgressBar: document.getElementById("showMainProgressBar"),
      showTooltips: document.getElementById("showTooltips"),
    };
    
    // Update checkboxes to match loaded settings
    Object.entries(elements).forEach(([key, element]) => {
      if (element && window.settings && typeof window.settings[key] !== 'undefined') {
        element.checked = window.settings[key];
      }
    });
    
    // Apply global state from settings
    if (window.settings) {
      if (typeof window.isHighlightEnabled !== 'undefined') {
        window.isHighlightEnabled = window.settings.highlightDefault;
      }
      if (typeof window.sidebarOpen !== 'undefined') {
        window.sidebarOpen = window.settings.sidebarOpen;
      }
    }
    
    // Apply theme and UI updates
    applyTheme();
    updateToolbarVisibility();
    updateTooltipVisibility();
    
    if (typeof window.devLog === 'function') {
      window.devLog("⚙️ Settings applied successfully");
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

/**
 * Save current settings from UI to localStorage and apply changes
 */
function saveSettingsUI() {
  try {
    // Ensure settings object exists
    if (!window.settings) {
      window.settings = {
        showDiscussionDefault: false,
        highlightDefault: false,
        darkMode: false,
        showQuestionToolbar: false,
        showAdvancedSearch: false,
        sidebarOpen: false,
        showMainProgressBar: true,
        showTooltips: false,
      };
    }
    
    // Update settings object from UI elements
    const elements = {
      showDiscussionDefault: document.getElementById("showDiscussionDefault"),
      highlightDefault: document.getElementById("highlightDefault"),
      darkMode: document.getElementById("darkModeToggle"),
      showQuestionToolbar: document.getElementById("showQuestionToolbar"),
      showAdvancedSearch: document.getElementById("showAdvancedSearch"),
      showMainProgressBar: document.getElementById("showMainProgressBar"),
      showTooltips: document.getElementById("showTooltips"),
    };
    
    // Update settings from UI
    Object.entries(elements).forEach(([key, element]) => {
      if (element) {
        window.settings[key] = element.checked;
      }
    });
    
    // Update global state variables
    if (typeof window.isHighlightEnabled !== 'undefined') {
      window.isHighlightEnabled = window.settings.highlightDefault;
      if (typeof window.isHighlightTemporaryOverride !== 'undefined') {
        window.isHighlightTemporaryOverride = false; // Reset temporary override
      }
    }
    
    // Apply theme changes
    applyTheme();
    
    // Update UI visibility based on settings
    updateMainProgressBarVisibility();
    updateTooltipVisibility();
    updateAdvancedSearchVisibility();
    
    // Update current question display if in exam
    if (window.currentQuestions && window.currentQuestions.length > 0) {
      if (typeof window.displayCurrentQuestion === 'function') {
        window.displayCurrentQuestion();
      }
      if (typeof window.updateHighlightButton === 'function') {
        window.updateHighlightButton();
      }
      if (typeof window.updateInstructions === 'function' && !window.isValidated) {
        window.updateInstructions();
      }
      if (typeof window.updateSessionStats === 'function') {
        window.updateSessionStats();
      }
      if (typeof window.clearQuestionStatusCache === 'function') {
        window.clearQuestionStatusCache();
      }
      if (typeof window.updateProgressSidebar === 'function') {
        window.updateProgressSidebar();
      }
      if (typeof window.updateMainProgressBar === 'function') {
        window.updateMainProgressBar();
      }
      if (typeof window.updateFilterCounts === 'function') {
        window.updateFilterCounts();
      }
    }
    
    // Save to localStorage
    localStorage.setItem("examViewerSettings", JSON.stringify(window.settings));
    
    // Save statistics if function available
    if (typeof window.saveStatistics === 'function') {
      window.saveStatistics();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog("⚙️ Settings saved successfully");
    }
    
    // Show success message if function available
    if (typeof window.showSuccess === 'function') {
      window.showSuccess("Settings saved successfully!");
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// ===========================
// UI VISIBILITY MANAGEMENT
// ===========================

// NOTE: updateMainProgressBarVisibility moved to ui-effects.js module

/**
 * Show/hide question toolbar based on settings
 */
function updateToolbarVisibility() {
  if (!window.settings) return;
  
  const revisionModeBtn = document.getElementById("revisionModeBtn");
  const questionToolbar = document.getElementById("questionToolbar");
  
  if (window.settings.showQuestionToolbar) {
    if (revisionModeBtn) revisionModeBtn.style.display = "inline-block";
    if (questionToolbar) questionToolbar.style.display = "flex";
  } else {
    if (revisionModeBtn) revisionModeBtn.style.display = "none";
    if (questionToolbar) questionToolbar.style.display = "none";
  }
}

/**
 * Enable/disable tooltips based on settings
 */
function updateTooltipVisibility() {
  if (!window.settings) return;
  
  const body = document.body;
  if (body) {
    if (window.settings.showTooltips) {
      body.classList.add("tooltips-enabled");
    } else {
      body.classList.remove("tooltips-enabled");
    }
  }
}

/**
 * Show/hide advanced search section based on settings
 */
function updateAdvancedSearchVisibility() {
  if (!window.settings) return;
  
  const searchSection = document.getElementById("searchSection");
  if (searchSection) {
    if (window.settings.showAdvancedSearch && 
        window.currentExam && 
        window.allQuestions && 
        window.allQuestions.length > 0) {
      searchSection.style.display = "block";
      
      // Expand search content by default when first shown
      const searchContent = document.getElementById('searchContent');
      const toggleSearchBtn = document.getElementById('toggleSearchBtn');
      if (searchContent && toggleSearchBtn) {
        searchContent.classList.remove('collapsed');
        toggleSearchBtn.classList.remove('collapsed');
      }
      
      // Initialize search interface if function available
      if (typeof window.initializeSearchInterface === 'function') {
        window.initializeSearchInterface();
      }
    } else {
      searchSection.style.display = "none";
      
      // Reset filters if search is disabled
      if (window.isSearchActive && typeof window.resetAllFilters === 'function') {
        window.resetAllFilters();
      }
    }
  }
}

// ===========================
// SETTINGS EVENT HANDLERS
// ===========================

/**
 * Handle dark mode toggle
 */
function handleDarkModeToggle() {
  if (window.settings) {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      window.settings.darkMode = darkModeToggle.checked;
      applyTheme();
      saveSettingsUI();
    }
  }
}

/**
 * Handle highlight default toggle
 */
function handleHighlightDefaultToggle() {
  if (window.settings) {
    const highlightDefault = document.getElementById("highlightDefault");
    if (highlightDefault) {
      window.settings.highlightDefault = highlightDefault.checked;
      if (typeof window.isHighlightEnabled !== 'undefined') {
        window.isHighlightEnabled = highlightDefault.checked;
      }
      if (typeof window.isHighlightTemporaryOverride !== 'undefined') {
        window.isHighlightTemporaryOverride = false;
      }
      saveSettingsUI();
    }
  }
}

/**
 * Handle show discussion default toggle
 */
function handleShowDiscussionDefaultToggle() {
  if (window.settings) {
    const showDiscussionDefault = document.getElementById("showDiscussionDefault");
    if (showDiscussionDefault) {
      window.settings.showDiscussionDefault = showDiscussionDefault.checked;
      saveSettingsUI();
    }
  }
}

/**
 * Handle question toolbar visibility toggle
 */
function handleQuestionToolbarToggle() {
  if (window.settings) {
    const showQuestionToolbar = document.getElementById("showQuestionToolbar");
    if (showQuestionToolbar) {
      window.settings.showQuestionToolbar = showQuestionToolbar.checked;
      updateToolbarVisibility();
      saveSettingsUI();
    }
  }
}

/**
 * Handle advanced search visibility toggle
 */
function handleAdvancedSearchToggle() {
  if (window.settings) {
    const showAdvancedSearch = document.getElementById("showAdvancedSearch");
    if (showAdvancedSearch) {
      window.settings.showAdvancedSearch = showAdvancedSearch.checked;
      updateAdvancedSearchVisibility();
      saveSettingsUI();
    }
  }
}


/**
 * Handle main progress bar visibility toggle
 */
function handleMainProgressBarToggle() {
  if (window.settings) {
    const showMainProgressBar = document.getElementById("showMainProgressBar");
    if (showMainProgressBar) {
      window.settings.showMainProgressBar = showMainProgressBar.checked;
      
      // Clear question status cache to force refresh of progress calculations
      if (typeof window.clearQuestionStatusCache === 'function') {
        window.clearQuestionStatusCache();
        if (typeof window.devLog === 'function') {
          window.devLog(`⚙️ Main progress bar toggled - cleared question status cache`);
        }
      }
      
      updateMainProgressBarVisibility();
      saveSettingsUI();
      
      // Force update of progress sidebar and main progress bar
      if (typeof window.updateProgressSidebar === 'function') {
        window.updateProgressSidebar();
      }
      if (typeof window.updateMainProgressBar === 'function') {
        window.updateMainProgressBar();
      }
    }
  }
}

/**
 * Handle tooltips visibility toggle
 */
function handleTooltipsToggle() {
  if (window.settings) {
    const showTooltips = document.getElementById("showTooltips");
    if (showTooltips) {
      window.settings.showTooltips = showTooltips.checked;
      updateTooltipVisibility();
      saveSettingsUI();
    }
  }
}


// ===========================
// SETTINGS INITIALIZATION
// ===========================

/**
 * Setup all settings event listeners
 */
function setupSettingsEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", handleDarkModeToggle);
  }
  
  // Highlight default toggle
  const highlightDefault = document.getElementById("highlightDefault");
  if (highlightDefault) {
    highlightDefault.addEventListener("change", handleHighlightDefaultToggle);
  }
  
  // Show discussion default toggle
  const showDiscussionDefault = document.getElementById("showDiscussionDefault");
  if (showDiscussionDefault) {
    showDiscussionDefault.addEventListener("change", handleShowDiscussionDefaultToggle);
  }
  
  // Question toolbar toggle
  const showQuestionToolbar = document.getElementById("showQuestionToolbar");
  if (showQuestionToolbar) {
    showQuestionToolbar.addEventListener("change", handleQuestionToolbarToggle);
  }
  
  // Advanced search toggle
  const showAdvancedSearch = document.getElementById("showAdvancedSearch");
  if (showAdvancedSearch) {
    showAdvancedSearch.addEventListener("change", handleAdvancedSearchToggle);
  }
  
  
  // Main progress bar toggle
  const showMainProgressBar = document.getElementById("showMainProgressBar");
  if (showMainProgressBar) {
    showMainProgressBar.addEventListener("change", handleMainProgressBarToggle);
  }
  
  // Tooltips toggle
  const showTooltips = document.getElementById("showTooltips");
  if (showTooltips) {
    showTooltips.addEventListener("change", handleTooltipsToggle);
  }
  
  
  if (typeof window.devLog === 'function') {
    window.devLog("⚙️ Settings event listeners initialized");
  }
}

/**
 * Initialize settings module
 */
function initializeSettings() {
  // Load settings from localStorage
  loadSettingsUI();
  
  // Setup event listeners
  setupSettingsEventListeners();
  
  // Apply initial theme
  applyTheme();
  
  if (typeof window.devLog === 'function') {
    window.devLog("⚙️ Settings module initialized");
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all settings functions for use in other modules
export {
  // Core settings management
  applyTheme,
  loadSettingsUI,
  saveSettingsUI,
  
  // UI visibility management  
  updateToolbarVisibility,
  updateTooltipVisibility,
  updateAdvancedSearchVisibility,
  
  // Event handlers
  handleDarkModeToggle,
  handleHighlightDefaultToggle,
  handleShowDiscussionDefaultToggle,
  handleQuestionToolbarToggle,
  handleAdvancedSearchToggle,
  handleMainProgressBarToggle,
  handleTooltipsToggle,
  
  // Initialization
  setupSettingsEventListeners,
  initializeSettings,
};