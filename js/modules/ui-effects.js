/**
 * UI Effects Module
 * 
 * Handles all visual effects, animations, modals, tooltips, and user feedback
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: currentQuestions, currentQuestionIndex, currentExam, statistics,
 *   settings, favoritesData, milestoneStates, isHighlightEnabled, selectedAnswers,
 *   sidebarOpen, isValidated
 * - External functions: navigateToQuestionIndex, updateProgressSidebar, updateSessionStats,
 *   saveStatistics, saveSettings, updateFilterCounts
 */

// ===========================
// LOADING AND MESSAGE DISPLAY
// ===========================

/**
 * Show or hide the loading indicator
 */
function showLoading(show) {
  const loadingSection = document.getElementById("loadingSection");
  if (loadingSection) {
    loadingSection.style.display = show ? "block" : "none";
  }
}

/**
 * Display error message to user
 */
function showError(message) {
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
  
  if (successMessage) {
    successMessage.style.display = "none";
  }
}

/**
 * Display success message to user with auto-hide
 */
function showSuccess(message) {
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  
  if (successMessage) {
    successMessage.textContent = message;
    successMessage.style.display = "block";
  }
  
  if (errorMessage) {
    errorMessage.style.display = "none";
  }
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (successMessage) {
      successMessage.style.display = "none";
    }
  }, 3000);
}


// ===========================
// PROGRESS MILESTONE ANIMATIONS
// ===========================

// Milestone tracking state
let milestoneStates = {
  milestone25: false,
  milestone50: false,
  milestone75: false,
  milestone100: false
};

/**
 * Add visual effects for progress milestones
 */
function addProgressMilestoneEffects(percentage) {
  const progressFill = document.getElementById("mainProgressFill");
  const progressPercentage = document.getElementById("mainProgressPercentage");
  
  if (!progressFill || !window.milestoneStates) {
    window.milestoneStates = milestoneStates;
  }
  
  // Check for milestone achievements
  if (percentage >= 25 && !window.milestoneStates.milestone25) {
    window.milestoneStates.milestone25 = true;
    triggerMilestoneAnimation('milestone-25');
  }
  if (percentage >= 50 && !window.milestoneStates.milestone50) {
    window.milestoneStates.milestone50 = true;
    triggerMilestoneAnimation('milestone-50');
  }
  if (percentage >= 75 && !window.milestoneStates.milestone75) {
    window.milestoneStates.milestone75 = true;
    triggerMilestoneAnimation('milestone-75');
  }
  if (percentage >= 100 && !window.milestoneStates.milestone100) {
    window.milestoneStates.milestone100 = true;
    triggerMilestoneAnimation('milestone-100');
  }
  
  // Add visual class based on percentage
  if (progressFill) {
    progressFill.className = 'progress-fill';
    if (percentage >= 25) progressFill.classList.add('milestone-25');
    if (percentage >= 50) progressFill.classList.add('milestone-50');
    if (percentage >= 75) progressFill.classList.add('milestone-75');
    if (percentage >= 100) progressFill.classList.add('milestone-100');
  }
}

/**
 * Trigger celebration animation for milestones
 */
function triggerMilestoneAnimation(type) {
  const progressSection = document.getElementById("mainProgressSection");
  if (progressSection) {
    progressSection.classList.add(type);
    
    // Add temporary celebration effect
    const celebration = document.createElement('div');
    celebration.className = 'milestone-celebration';
    celebration.innerHTML = '🎉';
    celebration.style.cssText = `
      position: absolute; top: -20px; right: 10px; font-size: 1.5em;
      animation: bounce 0.6s ease-in-out; pointer-events: none;
    `;
    progressSection.style.position = 'relative';
    progressSection.appendChild(celebration);
    
    setTimeout(() => {
      celebration.remove();
      progressSection.classList.remove(type);
    }, 600);
  }
}

/**
 * Hide main progress bar and reset milestones
 */
function hideMainProgressBar() {
  const mainProgressSection = document.getElementById("mainProgressSection");
  if (mainProgressSection) {
    mainProgressSection.style.display = "none";
  }
  resetMilestoneStates();
}

/**
 * Reset milestone tracking states
 */
function resetMilestoneStates() {
  if (window.milestoneStates) {
    window.milestoneStates = {
      milestone25: false,
      milestone50: false,
      milestone75: false,
      milestone100: false
    };
  }
}

// ===========================
// NUMBER ANIMATION
// ===========================

/**
 * Animate number changes with smooth transitions
 */
function animateNumberChange(element, newValue) {
  if (!element) return;
  
  const currentValue = parseInt(element.textContent) || 0;
  const difference = newValue - currentValue;
  const duration = 300; // Animation duration in ms
  const steps = 20; // Number of animation steps
  const stepValue = difference / steps;
  const stepDuration = duration / steps;
  
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const currentStep = currentValue + (stepValue * step);
    element.textContent = Math.round(currentStep);
    
    if (step >= steps) {
      clearInterval(interval);
      element.textContent = newValue; // Ensure final value is exact
    }
  }, stepDuration);
}

// ===========================
// VISIBILITY CONTROL FUNCTIONS
// ===========================

/**
 * Update main progress bar visibility based on settings
 */
function updateMainProgressBarVisibility() {
  if (!window.settings) return;
  
  const mainProgressSection = document.getElementById("mainProgressSection");
  if (mainProgressSection) {
    if (window.settings.showMainProgressBar && window.currentQuestions && window.currentQuestions.length > 0) {
      mainProgressSection.style.display = "block";
      if (typeof window.updateMainProgressBar === 'function') {
        window.updateMainProgressBar();
      }
    } else {
      mainProgressSection.style.display = "none";
    }
  }
}

/**
 * Update toolbar visibility based on settings
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
 * Update tooltip visibility based on settings
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

// ===========================
// MODAL FUNCTIONS
// ===========================

/**
 * Show export options modal
 */
function showExportModal() {
  const modal = document.getElementById("exportOptionsModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("fade-in");
  }
}

/**
 * Hide export modal
 */
function hideExportModal() {
  const modal = document.getElementById("exportOptionsModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("fade-in");
  }
}

/**
 * Show keyboard shortcuts help modal
 */
function showKeyboardHelp() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('keyboardHelpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'keyboardHelpModal';
    modal.className = 'modal keyboard-help-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
          <button class="close-btn" onclick="closeKeyboardHelp()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-grid">
            <div class="shortcut-section">
              <h3>Navigation</h3>
              <div class="shortcut-item">
                <kbd>←</kbd><kbd>→</kbd> <span>Previous/Next Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>H</kbd><kbd>L</kbd> <span>Previous/Next (Vim style)</span>
              </div>
              <div class="shortcut-item">
                <kbd>J</kbd><kbd>K</kbd> <span>Jump 5 Questions</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>J</kbd><kbd>K</kbd> <span>Jump 10 Questions</span>
              </div>
              <div class="shortcut-item">
                <kbd>Home</kbd><kbd>End</kbd> <span>First/Last Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>1-9</kbd> <span>Jump to Question 1-9</span>
              </div>
            </div>
            
            <div class="shortcut-section">
              <h3>Actions</h3>
              <div class="shortcut-item">
                <kbd>Space</kbd> <span>Validate Answers</span>
              </div>
              <div class="shortcut-item">
                <kbd>V</kbd> <span>Validate/Preview</span>
              </div>
              <div class="shortcut-item">
                <kbd>R</kbd> <span>Random Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>F</kbd> <span>Toggle Favorite</span>
              </div>
              <div class="shortcut-item">
                <kbd>N</kbd> <span>Add/Edit Note</span>
              </div>
              <div class="shortcut-item">
                <kbd>H</kbd> <span>Toggle Highlight</span>
              </div>
            </div>
            
            <div class="shortcut-section">
              <h3>Interface</h3>
              <div class="shortcut-item">
                <kbd>S</kbd> <span>Toggle Sidebar</span>
              </div>
              <div class="shortcut-item">
                <kbd>D</kbd> <span>Toggle Discussion</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>B</kbd> <span>Back in History</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>F</kbd> <span>Forward in History</span>
              </div>
              <div class="shortcut-item">
                <kbd>?</kbd> <span>Show This Help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-overlay" onclick="closeKeyboardHelp()"></div>
    `;
    document.body.appendChild(modal);
  }
  
  modal.style.display = 'block';
  modal.classList.add('fade-in');
}

/**
 * Close keyboard help modal
 */
function closeKeyboardHelp() {
  const modal = document.getElementById('keyboardHelpModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('fade-in');
  }
}

/**
 * Display changelog modal with loading and error handling
 */
function displayChangelog() {
  let modal = document.getElementById('changelogModal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'changelogModal';
    modal.className = 'modal changelog-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-list-alt"></i> Changelog</h2>
          <button class="close-btn" onclick="this.closest('.modal').style.display='none'">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div id="changelogContent">Loading changelog...</div>
        </div>
      </div>
      <div class="modal-overlay" onclick="this.closest('.modal').style.display='none'"></div>
    `;
    document.body.appendChild(modal);
  }
  
  modal.style.display = 'block';
  
  // Load changelog content
  fetch('CHANGELOG.md')
    .then(response => response.text())
    .then(text => {
      const content = document.getElementById('changelogContent');
      if (content) {
        content.innerHTML = renderMarkdown(text);
      }
    })
    .catch(error => {
      const content = document.getElementById('changelogContent');
      if (content) {
        content.innerHTML = '<p class="error">Failed to load changelog. Please check the repository for updates.</p>';
      }
    });
}

// ===========================
// TOGGLE FUNCTIONS
// ===========================


/**
 * Toggle search section collapse/expand
 */
function toggleSearchSection() {
  const searchSection = document.getElementById("searchSection");
  const searchHeader = document.querySelector(".search-header");
  
  if (searchSection && searchHeader) {
    const isCollapsed = searchSection.classList.contains("collapsed");
    
    if (isCollapsed) {
      searchSection.classList.remove("collapsed");
      searchHeader.setAttribute("aria-expanded", "true");
    } else {
      searchSection.classList.add("collapsed");
      searchHeader.setAttribute("aria-expanded", "false");
    }
  }
}

/**
 * Toggle legal information display
 */
function toggleLegalInfo() {
  const legalInfo = document.getElementById("legal-info");
  if (legalInfo) {
    const isVisible = legalInfo.style.display === "block";
    legalInfo.style.display = isVisible ? "none" : "block";
  }
}

// ===========================
// VALIDATION AND FEEDBACK
// ===========================

/**
 * Show visual feedback for answer validation
 */
function showValidationResults(correctAnswers) {
  const instructions = document.getElementById("answerInstructions");
  if (!instructions) return;
  
  const isCorrect = window.selectedAnswers && 
    window.selectedAnswers.size === correctAnswers.length &&
    [...window.selectedAnswers].every(answer => correctAnswers.includes(answer));
  
  if (isCorrect) {
    instructions.className = "answer-instructions success";
    instructions.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Well done.';
  } else if (window.selectedAnswers && window.selectedAnswers.size > 0) {
    instructions.className = "answer-instructions warning";
    instructions.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not quite right. Try again!';
  } else {
    instructions.className = "answer-instructions error";
    instructions.innerHTML = '<i class="fas fa-times-circle"></i> Please select an answer first.';
  }
  
  // Add animation
  instructions.style.animation = 'fadeIn 0.3s ease-in';
  setTimeout(() => {
    if (instructions.style.animation) {
      instructions.style.animation = '';
    }
  }, 300);
}

// ===========================
// SEARCH UI EFFECTS
// ===========================

/**
 * Show autocomplete suggestions for question numbers
 */
function showQuestionNumberSuggestions(query) {
  const container = document.getElementById("autocompleteSuggestions");
  if (!container || !window.currentQuestions) return;
  
  const suggestions = [];
  const queryNum = parseInt(query);
  
  // Find matching question numbers
  if (!isNaN(queryNum)) {
    for (let i = 1; i <= Math.min(window.currentQuestions.length, queryNum * 10); i++) {
      if (i.toString().startsWith(query)) {
        suggestions.push(i);
        if (suggestions.length >= 5) break; // Limit to 5 suggestions
      }
    }
  }
  
  if (suggestions.length > 0) {
    container.innerHTML = suggestions.map(num => 
      `<div class="autocomplete-suggestion" onclick="jumpToQuestionNumber(${num})">${num}</div>`
    ).join('');
    container.style.display = 'block';
  } else {
    hideAutocompleteSuggestions();
  }
}

/**
 * Hide autocomplete suggestions
 */
function hideAutocompleteSuggestions() {
  const container = document.getElementById("autocompleteSuggestions");
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }
}

// ===========================
// MARKDOWN RENDERING
// ===========================

/**
 * Simple markdown to HTML renderer for changelog
 */
function renderMarkdown(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/^\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/gim, '<br>');
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all UI effects functions
export {
  // Loading and messages
  showLoading,
  showError,
  showSuccess,
  
  // Progress milestone animations
  addProgressMilestoneEffects,
  triggerMilestoneAnimation,
  hideMainProgressBar,
  resetMilestoneStates,
  
  // Number animation
  animateNumberChange,
  
  // Visibility controls
  updateMainProgressBarVisibility,
  hideMainProgressBar,
  updateToolbarVisibility,
  updateTooltipVisibility,
  
  // Modal functions
  showExportModal,
  hideExportModal,
  showKeyboardHelp,
  closeKeyboardHelp,
  displayChangelog,
  
  // Toggle functions
  toggleSearchSection,
  toggleLegalInfo,
  
  // Validation and feedback
  showValidationResults,
  
  // Search UI effects
  showQuestionNumberSuggestions,
  hideAutocompleteSuggestions,
  
  // Utility
  renderMarkdown,
};