/**
 * Enhanced Navigation System Module
 * 
 * Handles advanced navigation features including history, keyboard shortcuts,
 * progress sidebar, and enhanced question management for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: currentQuestions, currentQuestionIndex, currentExam, settings, statistics, favoritesData
 * - External functions: navigateToQuestionIndex, navigateQuestion, navigateToRandomQuestion,
 *   getQuestionStatus, isQuestionFavorite, getAnsweredQuestionsCount, truncateText,
 *   saveSettings, animateNumberChange, addProgressMilestoneEffects, resetMilestoneStates,
 *   hideExportModal, showKeyboardHelp, devLog, devError
 */

// ===========================
// NAVIGATION HISTORY MANAGEMENT
// ===========================

// Navigation history for back/forward functionality
let navigationHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

/**
 * Add current question to navigation history
 */
function addToNavigationHistory(questionIndex) {
  try {
    // Don't add if it's the same as current position
    if (historyIndex >= 0 && navigationHistory[historyIndex] === questionIndex) {
      return;
    }
    
    // Remove any history after current position (user went back and then navigated elsewhere)
    if (historyIndex < navigationHistory.length - 1) {
      navigationHistory = navigationHistory.slice(0, historyIndex + 1);
    }
    
    // Add new entry
    navigationHistory.push(questionIndex);
    
    // Limit history size
    if (navigationHistory.length > MAX_HISTORY) {
      navigationHistory.shift();
    } else {
      historyIndex++;
    }
    
    updateHistoryButtons();

    if (typeof window.devLog === 'function') {
      window.devLog(`🧭 Added to navigation history: Question ${questionIndex + 1}`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error adding to navigation history:", error);
    }
  }
}

/**
 * Navigate back in history
 */
function navigateHistoryBack() {
  try {
    if (historyIndex > 0) {
      historyIndex--;
      const targetIndex = navigationHistory[historyIndex];
      
      if (typeof window.navigateToQuestionIndex === 'function') {
        window.navigateToQuestionIndex(targetIndex, false); // false = don't add to history
      }
      updateHistoryButtons();

      if (typeof window.devLog === 'function') {
        window.devLog(`⬅️ Navigate back to Question ${targetIndex + 1}`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating history back:", error);
    }
  }
}

/**
 * Navigate forward in history
 */
function navigateHistoryForward() {
  try {
    if (historyIndex < navigationHistory.length - 1) {
      historyIndex++;
      const targetIndex = navigationHistory[historyIndex];
      
      if (typeof window.navigateToQuestionIndex === 'function') {
        window.navigateToQuestionIndex(targetIndex, false); // false = don't add to history
      }
      updateHistoryButtons();

      if (typeof window.devLog === 'function') {
        window.devLog(`➡️ Navigate forward to Question ${targetIndex + 1}`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating history forward:", error);
    }
  }
}

/**
 * Update history button states
 */
function updateHistoryButtons() {
  try {
    const backBtn = document.getElementById("historyBackBtn");
    const forwardBtn = document.getElementById("historyForwardBtn");
    
    if (backBtn) {
      backBtn.disabled = historyIndex <= 0;
      backBtn.title = `Go back (${historyIndex} steps available)`;
    }
    
    if (forwardBtn) {
      forwardBtn.disabled = historyIndex >= navigationHistory.length - 1;
      forwardBtn.title = `Go forward (${navigationHistory.length - 1 - historyIndex} steps available)`;
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating history buttons:", error);
    }
  }
}

/**
 * Clear navigation history
 */
function clearNavigationHistory() {
  try {
    navigationHistory = [];
    historyIndex = -1;
    updateHistoryButtons();

    if (typeof window.devLog === 'function') {
      window.devLog("🗑️ Navigation history cleared");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error clearing navigation history:", error);
    }
  }
}

/**
 * Get navigation history state
 */
function getNavigationHistoryState() {
  return {
    history: [...navigationHistory],
    currentIndex: historyIndex,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < navigationHistory.length - 1,
    totalEntries: navigationHistory.length
  };
}

// ===========================
// SIDEBAR MANAGEMENT
// ===========================

// Sidebar state
let sidebarOpen = false;

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  try {
    sidebarOpen = !sidebarOpen;
    const sidebar = document.getElementById("progressSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggleBtn = document.getElementById("sidebarToggle");
    
    if (sidebar) {
      sidebar.classList.toggle("open", sidebarOpen);
      overlay?.classList.toggle("active", sidebarOpen);
      toggleBtn?.classList.toggle("open", sidebarOpen);
      
      // Update toggle button icon
      const icon = toggleBtn?.querySelector("i");
      if (icon) {
        icon.className = sidebarOpen ? "fas fa-times" : "fas fa-bars";
      }
      
      // Save sidebar state
      if (window.settings) {
        window.settings.sidebarOpen = sidebarOpen;
        if (typeof window.saveSettings === 'function') {
          window.saveSettings();
        }
      }
      
      // Update sidebar content if opening
      if (sidebarOpen) {
        updateProgressSidebar();
      }

      if (typeof window.devLog === 'function') {
        window.devLog(`🗂️ Sidebar ${sidebarOpen ? 'opened' : 'closed'}`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error toggling sidebar:", error);
    }
  }
}

/**
 * Open sidebar if not already open
 */
function openSidebar() {
  try {
    if (!sidebarOpen) {
      toggleSidebar();
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error opening sidebar:", error);
    }
  }
}

/**
 * Close sidebar if open
 */
function closeSidebar() {
  try {
    if (sidebarOpen) {
      toggleSidebar();
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error closing sidebar:", error);
    }
  }
}

/**
 * Check if sidebar is open
 */
function isSidebarOpen() {
  return sidebarOpen;
}

// ===========================
// PROGRESS SIDEBAR MANAGEMENT
// ===========================

/**
 * Update progress sidebar with question list
 */
function updateProgressSidebar() {
  try {
    const sidebar = document.getElementById("progressSidebar");
    if (!sidebar || !window.currentQuestions?.length) return;
    
    const questionList = sidebar.querySelector(".question-list");
    if (!questionList) return;
    
    // Generate question items with enhanced status indicators
    const items = window.currentQuestions.map((question, index) => {
      const isCurrentQuestion = index === window.currentQuestionIndex;
      const isPlaceholder = question.isPlaceholder;
      
      let statusClass = "";
      let statusIcon = "";
      let questionPreview = "";
      let statusBadges = "";
      let originalIndex = -1; // Initialize originalIndex in proper scope
      
      if (isPlaceholder) {
        statusClass = "loading";
        statusIcon = '<i class="fas fa-spinner fa-spin"></i>';
        questionPreview = `Chunk ${question.chunkId + 1} - Loading...`;
      } else {
        // Find the original index in allQuestions for proper status checking
        const allQuestions = typeof window.getAllQuestions === 'function' ? window.getAllQuestions() : window.allQuestions || [];
        originalIndex = allQuestions.findIndex(q => 
          parseInt(q.question_number, 10) === parseInt(question.question_number, 10) ||
          (q.question === question.question && q.answers?.length === question.answers?.length)
        );
        
        const questionStatus = typeof window.getQuestionStatus === 'function'
          ? window.getQuestionStatus(index)
          : { primaryStatus: 'new', isFavorite: false, hasNotes: false, isCategorized: false };
        
        // Escape HTML and truncate question text to prevent layout issues
        const questionText = question.question || "";
        const cleanText = questionText.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
        questionPreview = typeof window.truncateText === 'function'
          ? window.truncateText(cleanText, 60)
          : cleanText.substring(0, 60) + (cleanText.length > 60 ? '...' : '');
        
        // Determine main status class and icon based on current question and status
        if (isCurrentQuestion) {
          statusClass = "current";
          statusIcon = '<i class="fas fa-arrow-right"></i>';
        } else {
          statusClass = questionStatus.primaryStatus;
          
          // Set icon based on primary status
          switch (questionStatus.primaryStatus) {
            case 'correct':
              statusIcon = '<i class="fas fa-check-circle"></i>';
              break;
            case 'incorrect':
              statusIcon = '<i class="fas fa-times-circle"></i>';
              break;
            case 'preview':
              statusIcon = '<i class="fas fa-lightbulb"></i>';
              break;
            case 'viewed':
              statusIcon = '<i class="fas fa-eye"></i>';
              break;
            case 'new':
            default:
              statusIcon = '<i class="far fa-circle"></i>';
              break;
          }
        }
        
        // Generate status badges
        const badges = [];
        
        // Primary status badge
        let primaryBadgeText = "";
        let primaryBadgeIcon = "";
        let primaryBadgeClass = questionStatus.primaryStatus;
        
        switch (questionStatus.primaryStatus) {
          case 'correct':
            primaryBadgeText = "Correct";
            primaryBadgeIcon = '<i class="fas fa-check"></i>';
            break;
          case 'incorrect':
            primaryBadgeText = "Wrong";
            primaryBadgeIcon = '<i class="fas fa-times"></i>';
            break;
          case 'preview':
            primaryBadgeText = "Preview";
            primaryBadgeIcon = '<i class="fas fa-lightbulb"></i>';
            break;
          case 'viewed':
            primaryBadgeText = "Viewed";
            primaryBadgeIcon = '<i class="fas fa-eye"></i>';
            break;
          case 'new':
            primaryBadgeText = "New";
            primaryBadgeIcon = '<i class="fas fa-circle"></i>';
            break;
        }
        
        badges.push(`
          <span class="status-badge ${primaryBadgeClass}" aria-label="${primaryBadgeText} question">
            ${primaryBadgeIcon}
            ${primaryBadgeText}
          </span>
        `);
        
        // Secondary badges for additional properties
        if (questionStatus.isFavorite) {
          badges.push(`
            <span class="status-badge favorite" aria-label="Favorited question">
              <i class="fas fa-star"></i>
            </span>
          `);
        }
        
        if (questionStatus.hasNotes) {
          badges.push(`
            <span class="status-badge with-notes" aria-label="Question has notes">
              <i class="fas fa-sticky-note"></i>
            </span>
          `);
        }
        
        if (questionStatus.isCategorized) {
          badges.push(`
            <span class="status-badge categorized" aria-label="Question is categorized">
              <i class="fas fa-tag"></i>
            </span>
          `);
        }
        
        statusBadges = `
          <div class="question-status-indicators">
            <div class="primary-status">
              ${badges[0]}
            </div>
            <div class="secondary-badges">
              ${badges.slice(1).join('')}
            </div>
          </div>
        `;
      }
      
      return `
        <div class="question-item question-item-enhanced ${statusClass}" data-index="${index}" data-original-index="${originalIndex}" onclick="navigateToQuestionAsync(${index})">
          <div class="question-number">
            ${statusIcon}
            <span>Q${parseInt(question.question_number, 10) || index + 1}</span>
          </div>
          <div class="question-preview">${questionPreview}</div>
          ${statusBadges}
        </div>
      `;
    }).join("");
    
    questionList.innerHTML = items;
    
    // Update progress bar
    updateProgressBar();
    
    // Update main progress bar
    updateMainProgressBar();
    
    // Scroll current question into view
    setTimeout(() => {
      const currentItem = questionList.querySelector(".question-item.current");
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    if (typeof window.devLog === 'function') {
      window.devLog(`📊 Progress sidebar updated with ${window.currentQuestions.length} questions`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating progress sidebar:", error);
    }
  }
}

/**
 * Update progress bar in sidebar
 */
function updateProgressBar() {
  try {
    const progressBar = document.getElementById("overallProgress");
    if (!progressBar || !window.currentQuestions?.length) return;
    
    const answeredCount = typeof window.getAnsweredQuestionsCount === 'function'
      ? window.getAnsweredQuestionsCount()
      : 0;
    const percentage = (answeredCount / window.currentQuestions.length) * 100;
    
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage.toFixed(1));
    
    // Update progress text
    const progressText = document.getElementById("progressText");
    if (progressText) {
      progressText.textContent = `${answeredCount}/${window.currentQuestions.length} (${percentage.toFixed(1)}%)`;
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating progress bar:", error);
    }
  }
}

/**
 * Update main progress indicator in header
 */
function updateMainProgressBar() {
  try {
    if (typeof window.devLog === 'function') {
      window.devLog("🔄 updateMainProgressBar() called");
    }
    
    const mainProgressSection = document.getElementById("mainProgressSection");
    if (!mainProgressSection || !window.currentQuestions?.length) {
      if (typeof window.devLog === 'function') {
        window.devLog("❌ updateMainProgressBar() early return - no section or questions");
      }
      return;
    }

    // Check if the main progress bar is enabled in settings
    if (!window.settings?.showMainProgressBar) {
      if (typeof window.devLog === 'function') {
        window.devLog("❌ updateMainProgressBar() disabled in settings");
      }
      mainProgressSection.style.display = "none";
      return;
    }

    // Show the progress section if it's hidden and enabled
    if (mainProgressSection.style.display === "none") {
      mainProgressSection.style.display = "block";
      // Reset milestone states for new exam display
      if (typeof window.resetMilestoneStates === 'function') {
        window.resetMilestoneStates();
      }
    }

    const progressFill = document.getElementById("mainProgressFill");
    const progressText = document.getElementById("mainProgressText");
    const progressPercentage = document.getElementById("mainProgressPercentage");
    const answeredCountMain = document.getElementById("answeredCountMain");
    const favoritesCountMain = document.getElementById("favoritesCountMain");
    const remainingCountMain = document.getElementById("remainingCountMain");

    if (!progressFill || !progressText || !progressPercentage) return;

    // Calculate progress metrics
    const totalQuestions = window.currentQuestions.length;
    const answeredCount = typeof window.getAnsweredQuestionsCount === 'function'
      ? window.getAnsweredQuestionsCount()
      : 0;
    const favoritesCount = getFavoritesCount();
    const remainingCount = totalQuestions - answeredCount;
    const answerPercentage = (answeredCount / totalQuestions) * 100;
    
    // Debug log for favorites count
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 Main progress bar update - Favorites count: ${favoritesCount}`);
    }

    // Update progress bar with smooth animation
    progressFill.style.width = `${answerPercentage}%`;
    progressFill.setAttribute("aria-valuenow", answerPercentage.toFixed(1));

    // Update text displays
    progressText.textContent = `Question ${(window.currentQuestionIndex || 0) + 1} of ${totalQuestions}`;
    progressPercentage.textContent = `${answerPercentage.toFixed(1)}%`;

    // Update statistics with smooth number transitions
    if (answeredCountMain && typeof window.animateNumberChange === 'function') {
      window.animateNumberChange(answeredCountMain, answeredCount);
    }
    if (favoritesCountMain && typeof window.animateNumberChange === 'function') {
      window.animateNumberChange(favoritesCountMain, favoritesCount);
    }
    if (remainingCountMain && typeof window.animateNumberChange === 'function') {
      window.animateNumberChange(remainingCountMain, remainingCount);
    }

    // Add visual feedback for progress milestones
    if (typeof window.addProgressMilestoneEffects === 'function') {
      window.addProgressMilestoneEffects(answerPercentage);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating main progress bar:", error);
    }
  }
}

/**
 * Get count of answered questions in current session
 */
function getAnsweredQuestionsCount() {
  try {
    if (!window.currentQuestions?.length || !window.statistics?.currentSession) return 0;
    
    let count = 0;
    
    // Count questions that have answers in current session
    window.currentQuestions.forEach((question, index) => {
      const questionNumber = parseInt(question.question_number, 10);
      
      // Look for this question in current session
      const questionAttempt = window.statistics.currentSession.questions?.find(q => 
        (q.qn === questionNumber) || (q.questionNumber === questionNumber)
      );
      
      if (questionAttempt) {
        
        // Check if has user answers (actual validation)
        const hasAnswers = (questionAttempt.ua && questionAttempt.ua.length > 0) || 
                          (questionAttempt.userAnswers && questionAttempt.userAnswers.length > 0);
        
        // Check if preview was the first action (should count as "answered" for progress)
        const hasPreviewAsFirstAction = questionAttempt.fat === 'p' && questionAttempt.far;
        
        // Check if has any highlight interactions
        const hasHighlightInteractions = (questionAttempt.hbc && questionAttempt.hbc > 0) || 
                                        (questionAttempt.hvc && questionAttempt.hvc > 0);
        
        if (hasAnswers || (hasPreviewAsFirstAction && hasHighlightInteractions)) {
          count++;
          if (typeof window.devLog === 'function') {
            window.devLog(`📊 Q${questionNumber}: counted as answered (hasAnswers: ${hasAnswers}, preview first: ${hasPreviewAsFirstAction}, highlights: ${hasHighlightInteractions})`);
          }
        }
      }
    });
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 getAnsweredQuestionsCount: ${count}/${window.currentQuestions.length} questions answered`);
    }
    return count;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error counting answered questions:", error);
    }
    return 0;
  }
}

/**
 * Get count of favorite questions in current session (for progress bar consistency)
 */
function getFavoritesCount() {
  try {
    if (!window.currentQuestions?.length) return 0;
    
    let count = 0;
    
    // Count favorites from current questions (like answered count does)
    window.currentQuestions.forEach((question, index) => {
      // Use direct isQuestionFavorite check like the session data
      const isFav = typeof window.isQuestionFavorite === 'function' && 
                    window.isQuestionFavorite(index);
      if (isFav) {
        count++;
      }
      
      // Debug first few questions
      if (index < 3 && typeof window.devLog === 'function') {
        window.devLog(`🔍 Current Question ${index} (Q${question.question_number}): isFavorite = ${isFav}`);
      }
    });
    
    // Debug log for favorites count calculation
    if (typeof window.devLog === 'function') {
      window.devLog(`⭐ getFavoritesCount() calculated: ${count} favorites from currentQuestions`);
    }
    
    return count;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting favorites count:", error);
    }
    return 0;
  }
}

// ===========================
// KEYBOARD SHORTCUTS SYSTEM
// ===========================

/**
 * Setup enhanced keyboard shortcuts for navigation
 */
function setupKeyboardShortcuts() {
  try {
    document.addEventListener("keydown", handleKeyboardShortcuts);

    if (typeof window.devLog === 'function') {
      window.devLog("⌨️ Keyboard shortcuts setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up keyboard shortcuts:", error);
    }
  }
}

/**
 * Handle keyboard shortcuts
 */
async function handleKeyboardShortcuts(e) {
  try {
    if (!window.currentQuestions?.length || 
        e.target.tagName === "INPUT" || 
        e.target.tagName === "TEXTAREA") {
      return;
    }

    switch (e.key) {
      case "ArrowLeft":
      case "h": // Vim-style navigation
        e.preventDefault();
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(-1);
          if (typeof window.showShortcutFeedback === 'function') {
            window.showShortcutFeedback(e.key === "ArrowLeft" ? "←" : "H", "Previous Question");
          }
        }
        break;
        
      case "ArrowRight":
      case "l": // Vim-style navigation
        e.preventDefault();
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(1);
          if (typeof window.showShortcutFeedback === 'function') {
            window.showShortcutFeedback(e.key === "ArrowRight" ? "→" : "L", "Next Question");
          }
        }
        break;
        
      case "ArrowUp":
      case "k": // Vim-style navigation
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Up: Jump to first question
          if (typeof window.navigateToQuestionIndex === 'function') {
            await window.navigateToQuestionIndex(0);
          }
        } else {
          // Regular Up: Previous 5 questions
          if (typeof window.navigateQuestion === 'function') {
            await window.navigateQuestion(-5);
          }
        }
        break;
        
      case "ArrowDown":
      case "j": // Vim-style navigation
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Down: Jump to last question
          if (typeof window.navigateToQuestionIndex === 'function') {
            await window.navigateToQuestionIndex(window.currentQuestions.length - 1);
          }
        } else {
          // Regular Down: Next 5 questions
          if (typeof window.navigateQuestion === 'function') {
            await window.navigateQuestion(5);
          }
        }
        break;
        
      case "Home":
        e.preventDefault();
        if (typeof window.navigateToQuestionIndex === 'function') {
          await window.navigateToQuestionIndex(0);
        }
        break;
        
      case "End":
        e.preventDefault();
        if (typeof window.navigateToQuestionIndex === 'function') {
          await window.navigateToQuestionIndex(window.currentQuestions.length - 1);
        }
        break;
        
      case "PageUp":
        e.preventDefault();
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(-10);
        }
        break;
        
      case "PageDown":
        e.preventDefault();
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(10);
        }
        break;
        
      case " ": // Space bar
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Space: Previous question
          if (typeof window.navigateQuestion === 'function') {
            await window.navigateQuestion(-1);
          }
        } else {
          // Space: Next question
          if (typeof window.navigateQuestion === 'function') {
            await window.navigateQuestion(1);
          }
        }
        break;
        
      case "Enter":
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Enter: Validate answers
          const validateBtn = document.getElementById("validateBtn");
          if (validateBtn) validateBtn.click();
        } else {
          // Enter: Next question
          if (typeof window.navigateQuestion === 'function') {
            await window.navigateQuestion(1);
          }
        }
        break;
        
      case "r":
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+R: Reset current question (our custom action)
          e.preventDefault();
          const resetBtn = document.getElementById("resetBtn");
          if (resetBtn && resetBtn.style.display !== "none") {
            resetBtn.click();
          }
        } else if (!e.shiftKey && !e.altKey) {
          // R: Random question (only plain "r", no modifiers)
          e.preventDefault();
          if (typeof window.navigateToRandomQuestion === 'function') {
            await window.navigateToRandomQuestion();
          }
        }
        // Let other combinations (like F5 refresh equivalent) pass through
        break;
        
      case "v":
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          // V: Validate answers (only plain "v", no modifiers)
          e.preventDefault();
          const validateBtn = document.getElementById("validateBtn");
          if (validateBtn) {
            validateBtn.click();
            if (typeof window.showShortcutFeedback === 'function') {
              window.showShortcutFeedback("V", "Validate Answers");
            }
          }
        }
        // Let Ctrl+V (paste), Shift+V, etc. pass through to browser
        break;
        
      case "t":
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          // T: Toggle highlight mode (only plain "t", no modifiers)
          e.preventDefault();
          const highlightBtn = document.getElementById("highlightBtn");
          if (highlightBtn) highlightBtn.click();
        }
        // Let Ctrl+T (new tab), Shift+T, etc. pass through to browser
        break;
        
      case "f":
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          // F: Toggle favorite (only plain "f", no modifiers)
          e.preventDefault();
          const favoriteBtn = document.getElementById("favoriteBtn");
          if (favoriteBtn) {
            favoriteBtn.click();
            if (typeof window.showShortcutFeedback === 'function') {
              window.showShortcutFeedback("F", "Toggle Favorite");
            }
          }
        }
        // Let Ctrl+F (find), Shift+F, etc. pass through to browser
        break;
        
      case "n":
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          // N: Toggle note (only plain "n", no modifiers)
          e.preventDefault();
          const noteBtn = document.getElementById("noteBtn");
          if (noteBtn) {
            noteBtn.click();
            if (typeof window.showShortcutFeedback === 'function') {
              window.showShortcutFeedback("N", "Add/Edit Note");
            }
          }
        }
        // Let Ctrl+N (new tab), Shift+N, etc. pass through to browser
        break;
        
      case "s":
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+S: Toggle sidebar (our custom action) 
          e.preventDefault();
          toggleSidebar();
        } else if (!e.shiftKey && !e.altKey) {
          // S: Focus search input (only plain "s", no modifiers)
          e.preventDefault();
          const searchInput = document.getElementById("searchInput");
          const searchSection = document.getElementById("searchSection");
          if (searchSection?.style.display !== "none" && searchInput) {
            searchInput.focus();
          }
        }
        // Let other combinations pass through to browser
        break;
        
      case "Escape":
        e.preventDefault();
        // Escape: Close modals, toggle sidebar, or clear search
        if (document.getElementById('exportOptionsModal')?.style.display === 'flex') {
          // Close export modal
          if (typeof window.hideExportModal === 'function') {
            window.hideExportModal();
          }
        } else if (document.querySelector('.modal[style*="block"]')) {
          // Close any open modal
          const openModal = document.querySelector('.modal[style*="block"]');
          if (openModal) openModal.style.display = "none";
        } else if (isSidebarOpen()) {
          // Close sidebar if open
          closeSidebar();
        } else {
          // Clear search if active
          const clearBtn = document.getElementById("clearSearchBtn");
          if (clearBtn && clearBtn.style.display !== "none") {
            clearBtn.click();
          }
        }
        break;
        
      case "e":
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          // E: Show export modal (only plain "e", no modifiers)
          e.preventDefault();
          if (typeof window.showExportModal === 'function') {
            window.showExportModal();
            if (typeof window.showShortcutFeedback === 'function') {
              window.showShortcutFeedback("E", "Export Modal");
            }
          }
        }
        // Let Ctrl+E, Shift+E, etc. pass through to browser/extensions
        break;
        
      case "?":
        e.preventDefault();
        // ?: Show keyboard shortcuts help
        if (typeof window.showKeyboardHelp === 'function') {
          window.showKeyboardHelp();
        }
        break;
    }

  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling keyboard shortcuts:", error);
    }
  }
}

/**
 * Remove keyboard shortcuts event listener
 */
function removeKeyboardShortcuts() {
  try {
    document.removeEventListener("keydown", handleKeyboardShortcuts);

    if (typeof window.devLog === 'function') {
      window.devLog("⌨️ Keyboard shortcuts removed");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error removing keyboard shortcuts:", error);
    }
  }
}

// ===========================
// ENHANCED NAVIGATION INTEGRATION
// ===========================

/**
 * Initialize enhanced navigation system
 */
function initializeEnhancedNavigation() {
  try {
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize sidebar state from settings
    if (window.settings?.sidebarOpen) {
      sidebarOpen = window.settings.sidebarOpen;
    }
    
    // Clear navigation history for fresh start
    clearNavigationHistory();

    // Setup mobile sidebar swipe-to-close now that sidebar is available
    if (typeof window.isMobileDevice === 'function' && window.isMobileDevice() && 
        typeof window.setupSidebarSwipeToClose === 'function') {
      window.setupSidebarSwipeToClose();
    }

    if (typeof window.devLog === 'function') {
      window.devLog("🧭 Enhanced navigation system initialized");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error initializing enhanced navigation:", error);
    }
  }
}

/**
 * Refresh enhanced navigation when exam changes
 */
function refreshEnhancedNavigation() {
  try {
    // Update progress sidebar
    updateProgressSidebar();
    
    // Clear navigation history for new exam
    clearNavigationHistory();
    
    // Update history buttons
    updateHistoryButtons();

    if (typeof window.devLog === 'function') {
      window.devLog("🧭 Enhanced navigation refreshed for new exam");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error refreshing enhanced navigation:", error);
    }
  }
}

/**
 * Navigate to question with history tracking
 */
async function navigateToQuestionWithHistory(questionIndex, addToHistory = true) {
  try {
    if (addToHistory) {
      addToNavigationHistory(questionIndex);
    }
    
    if (typeof window.navigateToQuestionIndex === 'function') {
      await window.navigateToQuestionIndex(questionIndex, false); // Don't double-add to history
    }
    
    // Update sidebar
    updateProgressSidebar();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating to question with history:", error);
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all enhanced navigation functions for use in other modules
export {
  // Navigation history
  addToNavigationHistory,
  navigateHistoryBack,
  navigateHistoryForward,
  updateHistoryButtons,
  clearNavigationHistory,
  getNavigationHistoryState,
  
  // Sidebar management
  toggleSidebar,
  openSidebar,
  closeSidebar,
  isSidebarOpen,
  
  // Progress sidebar
  updateProgressSidebar,
  updateProgressBar,
  updateMainProgressBar,
  getAnsweredQuestionsCount,
  getFavoritesCount,
  
  // Keyboard shortcuts
  setupKeyboardShortcuts,
  handleKeyboardShortcuts,
  removeKeyboardShortcuts,
  
  // Enhanced navigation integration
  initializeEnhancedNavigation,
  refreshEnhancedNavigation,
  navigateToQuestionWithHistory,
};