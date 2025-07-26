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
  
  const questionToolbar = document.getElementById("questionToolbar");
  
  if (window.settings.showQuestionToolbar) {
    if (questionToolbar) questionToolbar.style.display = "flex";
  } else {
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
    modal.style.display = "flex"; // Use flex instead of block for proper centering
    modal.classList.add("fade-in");
    
    // Update export preview when modal opens
    if (typeof window.updateExportPreview === 'function') {
      window.updateExportPreview();
    }
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
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      margin: 0;
      padding: 0;
    `;
    modal.innerHTML = `
      <div class="modal-content" style="
        background: #2a2a2a;
        border-radius: 12px;
        padding: 0;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        margin: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 1px solid #444;
        position: relative;
      ">
        <div class="modal-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #444;
        ">
          <h2 style="margin: 0; color: #fff;"><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
          <button class="close-btn" onclick="closeKeyboardHelp()" style="
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#444'" onmouseout="this.style.backgroundColor='transparent'">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="padding: 20px; color: #fff;">
          <div class="shortcuts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="shortcut-section" style="padding: 15px; border-radius: 8px; border: 1px solid #444;">
              <h3>Navigation</h3>
              <div class="shortcut-item">
                <kbd>←</kbd><kbd>→</kbd> <span>Previous/Next Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>H</kbd><kbd>L</kbd> <span>Previous/Next (Vim style)</span>
              </div>
              <div class="shortcut-item">
                <kbd>J</kbd><kbd>K</kbd> <span>Jump 5 Questions Back/Forward</span>
              </div>
              <div class="shortcut-item">
                <kbd>Page↑</kbd><kbd>Page↓</kbd> <span>Jump 10 Questions</span>
              </div>
              <div class="shortcut-item">
                <kbd>Home</kbd><kbd>End</kbd> <span>First/Last Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>Space</kbd> <span>Next Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>Enter</kbd> <span>Next Question</span>
              </div>
            </div>
            
            <div class="shortcut-section" style="padding: 15px; border-radius: 8px; border: 1px solid #444;">
              <h3>Actions</h3>
              <div class="shortcut-item">
                <kbd>V</kbd> <span>Validate Answers</span>
              </div>
              <div class="shortcut-item">
                <kbd>R</kbd> <span>Random Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>R</kbd> <span>Reset Question</span>
              </div>
              <div class="shortcut-item">
                <kbd>F</kbd> <span>Toggle Favorite</span>
              </div>
              <div class="shortcut-item">
                <kbd>N</kbd> <span>Add/Edit Note</span>
              </div>
              <div class="shortcut-item">
                <kbd>T</kbd> <span>Toggle Highlight</span>
              </div>
            </div>
            
            <div class="shortcut-section" style="padding: 15px; border-radius: 8px; border: 1px solid #444;">
              <h3>Interface</h3>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>S</kbd> <span>Toggle Sidebar</span>
              </div>
              <div class="shortcut-item">
                <kbd>S</kbd> <span>Focus Search</span>
              </div>
              <div class="shortcut-item">
                <kbd>Escape</kbd> <span>Close Modal/Sidebar</span>
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
async function displayChangelog() {
  const modal = document.getElementById("changelogModal");
  const content = document.getElementById("changelogContent");

  // Show modal
  modal.style.display = "flex";

  // Show loading state
  content.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading changelog...</p>
    </div>
  `;

  try {
    // Fetch changelog content
    const response = await fetch("CHANGELOG.md");
    if (!response.ok) {
      throw new Error(`Failed to load changelog: ${response.status}`);
    }

    const markdownText = await response.text();
    const htmlContent = renderMarkdown(markdownText);

    // Display rendered content
    content.innerHTML = `<div class="markdown-content">${htmlContent}</div>`;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error loading changelog:", error);
    }
    content.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Changelog</h3>
        <p>Unable to load the changelog: ${error.message}</p>
        <button onclick="window.displayChangelog()" class="retry-btn">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
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
  console.log("🎯 showValidationResults called with:", correctAnswers);
  const instructions = document.getElementById("answerInstructions");
  if (!instructions) {
    console.log("❌ showValidationResults: instructions element not found");
    return;
  }
  
  if (!window.selectedAnswers || window.selectedAnswers.size === 0) {
    instructions.className = "answer-instructions error";
    instructions.innerHTML = '<i class="fas fa-times-circle"></i> Please select an answer first.';
    return;
  }
  
  // Convert correctAnswers to Set for easier comparison
  const correctSet = new Set(correctAnswers);
  const selectedArray = [...window.selectedAnswers];
  
  console.log("🎯 correctAnswers type:", typeof correctAnswers, "value:", correctAnswers);
  console.log("🎯 correctSet:", correctSet);
  console.log("🎯 selectedArray:", selectedArray);
  
  // Calculate correct and incorrect selections
  const correctSelected = selectedArray.filter(answer => correctSet.has(answer));
  const incorrectSelected = selectedArray.filter(answer => !correctSet.has(answer));
  const correctNotSelected = [...correctSet].filter(answer => !window.selectedAnswers.has(answer));
  
  console.log("🎯 correctSelected:", correctSelected, "incorrectSelected:", incorrectSelected, "correctNotSelected:", correctNotSelected);
  
  // Determine result type  
  const correctAnswersSize = correctAnswers instanceof Set ? correctAnswers.size : correctAnswers.length;
  const isFullyCorrect = correctSelected.length === correctAnswersSize && incorrectSelected.length === 0;
  const hasCorrectAnswers = correctSelected.length > 0;
  const hasIncorrectAnswers = incorrectSelected.length > 0;
  const hasMissingAnswers = correctNotSelected.length > 0;
  
  console.log("🎯 isFullyCorrect:", isFullyCorrect, "hasCorrectAnswers:", hasCorrectAnswers, "hasIncorrectAnswers:", hasIncorrectAnswers, "hasMissingAnswers:", hasMissingAnswers);
  
  if (isFullyCorrect) {
    console.log("🎯 Setting CORRECT message");
    instructions.className = "answer-instructions success";
    instructions.innerHTML = '<i class="fas fa-check-circle"></i> <span>Correct! Well done.</span>';
  } else if (hasCorrectAnswers && (hasIncorrectAnswers || hasMissingAnswers)) {
    // Partially correct
    console.log("🎯 Setting PARTIALLY CORRECT message");
    instructions.className = "answer-instructions warning";
    let message = '<i class="fas fa-exclamation-triangle"></i> <span>Partially correct. ';
    
    if (hasIncorrectAnswers && hasMissingAnswers) {
      message += `You selected ${incorrectSelected.length} incorrect answer(s) and missed ${correctNotSelected.length} correct answer(s).`;
    } else if (hasIncorrectAnswers) {
      message += `You selected ${incorrectSelected.length} incorrect answer(s).`;
    } else if (hasMissingAnswers) {
      message += `You missed ${correctNotSelected.length} correct answer(s).`;
    }
    message += '</span>';
    instructions.innerHTML = message;
  } else {
    // Completely incorrect
    console.log("🎯 Setting INCORRECT message");
    instructions.className = "answer-instructions error";
    instructions.innerHTML = '<i class="fas fa-times-circle"></i> <span>Incorrect. None of your selected answers are correct.</span>';
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
  let html = markdown;

  // Convert headers by counting # symbols
  html = html.replace(/^(#{1,6})\s+(.*$)/gim, (match, hashes, content) => {
    const level = hashes.length;

    // Add icons for changelog sections (level 3 headers)
    if (level === 3) {
      const sectionIcons = {
        Added:
          '<i class="fas fa-plus-circle" style="color: var(--success-color);"></i>',
        Changed:
          '<i class="fas fa-edit" style="color: var(--accent-color);"></i>',
        Enhanced:
          '<i class="fas fa-arrow-up" style="color: var(--accent-color);"></i>',
        Fixed:
          '<i class="fas fa-wrench" style="color: var(--warning-color);"></i>',
        Removed:
          '<i class="fas fa-minus-circle" style="color: var(--error-color);"></i>',
        Deprecated:
          '<i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>',
        Security:
          '<i class="fas fa-shield-alt" style="color: var(--error-color);"></i>',
        Features:
          '<i class="fas fa-star" style="color: var(--accent-color);"></i>',
        Technical:
          '<i class="fas fa-cog" style="color: var(--text-muted);"></i>',
        Infrastructure:
          '<i class="fas fa-server" style="color: var(--text-muted);"></i>',
      };

      const sectionName = content.trim();
      const icon = sectionIcons[sectionName];

      if (icon) {
        return `<h${level}>${icon} ${content}</h${level}>`;
      }
    }

    return `<h${level}>${content}</h${level}>`;
  });

  // Convert version badges with dates (including {PR_MERGE_DATE})
  html = html.replace(
    /\[([^\]]+)\] - (\{PR_MERGE_DATE\}|\d{4}-\d{2}-\d{2})/g,
    (match, version, date) => {
      let badgeClass = "version-badge";

      if (version.includes("Unreleased")) {
        badgeClass += " unreleased";
      } else if (version.match(/\d+\.0\.0/)) {
        badgeClass += " major";
      } else if (version.match(/\d+\.\d+\.0/)) {
        badgeClass += " minor";
      } else {
        badgeClass += " patch";
      }

      // Handle {PR_MERGE_DATE} placeholder
      const displayDate =
        date === "{PR_MERGE_DATE}"
          ? '<span style="color: var(--warning-color, #ff9800); font-style: italic;">Pending merge</span>'
          : `<em>${date}</em>`;

      return `<span class="${badgeClass}">${version}</span> ${displayDate}`;
    }
  );

  // Convert [Unreleased] without date
  html = html.replace(
    /\[Unreleased\]/g,
    '<span class="version-badge unreleased">Unreleased</span>'
  );

  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Convert horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Convert unordered lists with support for unlimited nested lists
  function processNestedLists(lines, startIndex = 0, expectedIndent = 0) {
    const result = [];
    let i = startIndex;
    
    while (i < lines.length) {
      const line = lines[i];
      const listMatch = line.match(/^(\s*)- (.*)$/);
      
      if (!listMatch) {
        if (expectedIndent === 0) {
          result.push(line);
        } else {
          break; // Exit nested processing
        }
        i++;
        continue;
      }
      
      const [, indent, content] = listMatch;
      const currentIndent = indent.length;
      
      if (currentIndent < expectedIndent) {
        break; // This item belongs to a parent level
      } else if (currentIndent > expectedIndent) {
        // This should not happen in well-formed markdown, skip
        i++;
        continue;
      }
      
      // Look ahead for nested items
      const nestedResult = processNestedLists(lines, i + 1, currentIndent + 2);
      const nestedItems = nestedResult.items;
      
      if (nestedItems.length > 0) {
        result.push(`<li>${content}<ul>${nestedItems.join('')}</ul></li>`);
      } else {
        result.push(`<li>${content}</li>`);
      }
      
      i = nestedResult.nextIndex;
    }
    
    return { items: result, nextIndex: i };
  }
  
  const lines = html.split("\n");
  const processed = processNestedLists(lines);
  
  html = processed.items.join("\n");
  
  // Wrap consecutive <li> items in <ul> tags
  html = html.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/g, (match) => {
    return `<ul>${match.replace(/\n/g, '')}</ul>`;
  });

  // Convert line breaks to paragraphs
  html = html
    .split("\n\n")
    .map((paragraph) => {
      paragraph = paragraph.trim();
      if (!paragraph) return "";

      // Skip if already wrapped in HTML tags
      if (paragraph.startsWith("<") && paragraph.endsWith(">")) {
        return paragraph;
      }

      // Skip if it's a list
      if (paragraph.includes("<ul>") || paragraph.includes("<ol>")) {
        return paragraph;
      }

      // Skip if it's a header
      if (paragraph.startsWith("<h")) {
        return paragraph;
      }

      return `<p>${paragraph}</p>`;
    })
    .join("\n");

  // Clean up extra line breaks
  html = html.replace(/\n\s*\n/g, "\n");

  return html;
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