/**
 * Core Navigation System Module
 * 
 * Handles fundamental navigation between questions, answer validation, 
 * question display, and basic interaction logic for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: currentQuestions, currentQuestionIndex, currentExam, selectedAnswers,
 *   isValidated, isHighlightEnabled, questionStartTime, settings, statistics, favoritesData
 * - External functions: addToNavigationHistory, updateProgressSidebar, trackQuestionAttempt,
 *   updateFilterCounts, clearQuestionStatusCache, processEmbeddedImages,
 *   trackQuestionVisit, showError, showSuccess, devLog, devError
 */

// ===========================
// CORE NAVIGATION FUNCTIONS
// ===========================

/**
 * Navigate relative to current question
 */
async function navigateQuestion(direction) {
  try {
    if (!window.currentQuestions?.length) return;

    const newIndex = (window.currentQuestionIndex || 0) + direction;
    if (newIndex >= 0 && newIndex < window.currentQuestions.length) {
      await navigateToQuestionIndex(newIndex);
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`🧭 Navigate ${direction > 0 ? 'forward' : 'backward'} to question ${newIndex + 1}`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating question:", error);
    }
  }
}

/**
 * Navigate to random question
 */
async function navigateToRandomQuestion() {
  try {
    if (!window.currentQuestions?.length) return;
    
    const randomIndex = Math.floor(Math.random() * window.currentQuestions.length);
    await navigateToQuestionIndex(randomIndex);

    if (typeof window.devLog === 'function') {
      window.devLog(`🎲 Navigate to random question ${randomIndex + 1}`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating to random question:", error);
    }
  }
}

/**
 * Navigate to specific question index
 */
async function navigateToQuestionIndex(newIndex, addToHistory = true) {
  try {
    if (!window.currentQuestions?.length) return;
    
    if (newIndex >= 0 && newIndex < window.currentQuestions.length) {
      // Add to history before changing
      if (addToHistory && window.currentQuestionIndex !== newIndex) {
        if (typeof window.addToNavigationHistory === 'function') {
          window.addToNavigationHistory(window.currentQuestionIndex);
        }
      }
      
      // Set current index immediately for responsive UI
      window.currentQuestionIndex = newIndex;
      
      // Reset highlight override when navigating to a new question
      if (window.isHighlightTemporaryOverride !== undefined) {
        window.isHighlightTemporaryOverride = false;
      }
      
      // Check if we need to load a chunk for this question
      if (window.lazyLoadingConfig?.isChunkedExam && window.currentQuestions[newIndex]?.isPlaceholder) {
        const examCode = window.currentExam?.exam_code || window.currentExam?.code || window.currentExam?.exam_name;
        
        if (examCode) {
          // Show placeholder immediately while loading
          displayCurrentQuestion();
          if (typeof window.updateProgressSidebar === 'function') {
            window.updateProgressSidebar();
          }
          
          // Load chunk in background without blocking UI
          if (typeof window.ensureQuestionLoaded === 'function') {
            const success = await window.ensureQuestionLoaded(examCode, newIndex);
            if (success) {
              // Update current questions after successful loading
              window.currentQuestions = window.isSearchActive ? window.currentQuestions : [...window.allQuestions];
              // Refresh display with loaded content
              displayCurrentQuestion();
              if (typeof window.updateProgressSidebar === 'function') {
                window.updateProgressSidebar();
              }
            }
          }
          return;
        }
      }
      
      // Standard navigation for loaded questions
      displayCurrentQuestion();
      if (typeof window.updateProgressSidebar === 'function') {
        window.updateProgressSidebar();
      }
      

      if (typeof window.devLog === 'function') {
        window.devLog(`🧭 Navigated to question ${newIndex + 1}/${window.currentQuestions.length}`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error navigating to question index:", error);
    }
  }
}

/**
 * Async wrapper for onclick handlers
 */
async function navigateToQuestionAsync(index) {
  try {
    await navigateToQuestionIndex(index);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error in async navigation:", error);
    }
  }
}

// ===========================
// QUESTION JUMPING
// ===========================

/**
 * Jump to specific question by number
 */
async function jumpToQuestion() {
  try {
    const questionNumber = parseInt(
      document.getElementById("questionJump")?.value
    );

    // Find the question by its question_number field
    const questionIndex = window.currentQuestions?.findIndex(
      (q) => parseInt(q.question_number) === questionNumber
    );

    if (questionIndex !== -1) {
      await navigateToQuestionIndex(questionIndex);
      const jumpField = document.getElementById("questionJump");
      if (jumpField) jumpField.value = "";
      
      if (typeof window.devLog === 'function') {
        window.devLog(`🎯 Jumped to question ${questionNumber}`);
      }
    } else {
      if (typeof window.showError === 'function') {
        window.showError(`Question ${questionNumber} not found`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error jumping to question:", error);
    }
  }
}

/**
 * Jump to question by number (alternative interface)
 */
async function jumpToQuestionNumber(questionNumber) {
  try {
    const questionIndex = window.currentQuestions?.findIndex(
      (q) => parseInt(q.question_number) === parseInt(questionNumber)
    );

    if (questionIndex !== -1) {
      await navigateToQuestionIndex(questionIndex);
      
      if (typeof window.devLog === 'function') {
        window.devLog(`🎯 Jumped to question number ${questionNumber}`);
      }
    } else {
      if (typeof window.showError === 'function') {
        window.showError(`Question ${questionNumber} not found`);
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error jumping to question number:", error);
    }
  }
}

/**
 * Update question jump field max value
 */
function updateQuestionJumpMaxValue() {
  try {
    const questionJumpField = document.getElementById("questionJump");
    if (!questionJumpField) return;
    
    if (window.currentQuestions?.length > 0) {
      // Find the highest question number in the current exam
      const maxQuestionNumber = Math.max(
        ...window.currentQuestions.map((q) => parseInt(q.question_number) || 0)
      );

      // Update max value with multiple methods to ensure it works
      questionJumpField.setAttribute("max", maxQuestionNumber);
      questionJumpField.max = maxQuestionNumber;
      questionJumpField.setAttribute("step", "1");

      // Force a refresh of the element
      questionJumpField.style.display = "none";
      questionJumpField.offsetHeight; // trigger reflow
      questionJumpField.style.display = "";

      if (typeof window.devLog === 'function') {
        window.devLog(`✅ Updated question jump max value to: ${maxQuestionNumber}`);
      }
    } else {
      // Reset to default when no questions are loaded
      questionJumpField.setAttribute("max", "1");
      questionJumpField.max = "1";
      
      if (typeof window.devLog === 'function') {
        window.devLog("🔄 Reset question jump max value to: 1");
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating question jump max value:", error);
    }
  }
}

// ===========================
// HOME NAVIGATION
// ===========================

/**
 * Go to home page
 */
function goToHome() {
  try {

    // End current session if exists
    if (typeof window.endCurrentSession === 'function') {
      window.endCurrentSession();
    }

    // Reset exam state and cleanup memory
    window.currentExam = null;
    window.currentQuestions = [];
    window.currentQuestionIndex = 0;
    window.selectedAnswers?.clear();
    window.isValidated = false;
    window.isHighlightEnabled = false;
    
    // Cleanup chunk cache and search cache for memory optimization
    if (window.lazyLoadingConfig) {
      window.lazyLoadingConfig.loadedChunks?.clear();
      window.lazyLoadingConfig.currentChunk = 0;
      window.lazyLoadingConfig.examMetadata = null;
    }
    if (window.searchCache) {
      window.searchCache = {};
    }
    
    // Progressive localStorage cleanup
    if (typeof window.performProgressiveCleanup === 'function') {
      window.performProgressiveCleanup();
    }
    
    // Remove mobile navigation when returning to home
    if (typeof window.createMobileBottomNavigation === 'function') {
      window.createMobileBottomNavigation();
    }
    window.isHighlightTemporaryOverride = false;
    window.questionStartTime = null;

    // Reset UI
    const examCodeField = document.getElementById("examCode");
    if (examCodeField) examCodeField.value = "";
    
    const uiElements = [
      { id: "availableExams", display: "block" },
      { id: "navigationSection", display: "none" },
      { id: "questionSection", display: "none" },
      { id: "exportBtn", display: "none" },
      { id: "homeBtn", display: "none" },
      { id: "searchSection", display: "none" }
    ];
    
    uiElements.forEach(({ id, display }) => {
      const element = document.getElementById(id);
      if (element) element.style.display = display;
    });
    
    // Hide main progress bar
    if (typeof window.hideMainProgressBar === 'function') {
      window.hideMainProgressBar();
    }
    
    // Reset enhanced navigation features
    if (typeof window.clearNavigationHistory === 'function') {
      window.clearNavigationHistory();
    }
    if (typeof window.closeSidebar === 'function') {
      window.closeSidebar();
    }

    // Reset question jump field max value
    updateQuestionJumpMaxValue();

    // Hide any messages
    const messageElements = ["errorMessage", "successMessage"];
    messageElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });

    // Show success message
    if (typeof window.showSuccess === 'function') {
      window.showSuccess("Returned to home page");
    }

    if (typeof window.devLog === 'function') {
      window.devLog("🏠 Returned to home page");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error going to home:", error);
    }
  }
}

// ===========================
// QUESTION DISPLAY
// ===========================

/**
 * Display current question
 */
function displayCurrentQuestion(fromToggleAction = false) {
  try {
    if (!window.currentQuestions?.length) return;

    const question = window.currentQuestions[window.currentQuestionIndex || 0];
    
    // Create mobile bottom navigation if needed
    if (typeof window.createMobileBottomNavigation === 'function') {
      window.createMobileBottomNavigation();
    }
    
    // Manage swipe indicators for current question
    if (typeof window.manageSwipeIndicators === 'function') {
      window.manageSwipeIndicators();
    }
    
    // Handle placeholder questions for lazy loading
    if (question?.isPlaceholder) {
      const questionText = document.getElementById("questionText");
      const answersList = document.getElementById("answersList");
      
      if (questionText && answersList) {
        // Clear existing content efficiently
        while (questionText.firstChild) questionText.removeChild(questionText.firstChild);
        while (answersList.firstChild) answersList.removeChild(answersList.firstChild);
        
        // Create loading placeholder with DOM methods
        const placeholder = document.createElement("div");
        placeholder.className = "loading-placeholder";
        
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        placeholder.appendChild(spinner);
        
        const loadingText = document.createElement("p");
        loadingText.textContent = `Loading question ${question.question_number}...`;
        placeholder.appendChild(loadingText);
        
        questionText.appendChild(placeholder);
      }
      return;
    }

    // Track question visit for status indicators
    if (question.question_number && typeof window.trackQuestionVisit === 'function') {
      window.trackQuestionVisit(question.question_number);
      
      // Clear cache for this question to ensure status updates
      if (typeof window.clearQuestionStatusCacheForQuestion === 'function') {
        window.clearQuestionStatusCacheForQuestion(window.currentQuestionIndex);
      }
    }


    // Reset state first
    window.selectedAnswers?.clear();
    window.isValidated = false;
    window.questionStartTime = new Date(); // Start timing the question

    // Reset highlight to default setting unless user has manually overridden it
    if (!window.isHighlightTemporaryOverride && !fromToggleAction) {
      window.isHighlightEnabled = window.settings?.highlightDefault || false;
    }

    // Track highlight view if highlight is already enabled when viewing this question
    if (window.isHighlightEnabled && window.statistics?.currentSession && !fromToggleAction) {
      const questionNumber = question.question_number;
      
      // Track highlight view using the new function
      if (typeof window.trackQuestionHighlight === 'function') {
        window.trackQuestionHighlight(questionNumber, 'view');
        if (typeof window.devLog === 'function') {
          window.devLog(`🔦 Tracked highlight view for Q${questionNumber}`);
        }
      }
      
      // Clear cache to refresh sidebar with new preview status
      if (typeof window.clearQuestionStatusCacheForQuestion === 'function') {
        window.clearQuestionStatusCacheForQuestion(window.currentQuestionIndex);
      }
    }

    // Update navigation
    const currentQuestionNumber = question.question_number || (window.currentQuestionIndex + 1);
    
    const questionCounter = document.getElementById("questionCounter");
    if (questionCounter) {
      questionCounter.textContent = `${(window.currentQuestionIndex || 0) + 1} of ${window.currentQuestions.length} questions`;
    }
    
    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
      prevBtn.disabled = (window.currentQuestionIndex || 0) === 0;
    }
    
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.disabled = (window.currentQuestionIndex || 0) === window.currentQuestions.length - 1;
    }

    // Update question title and link
    const questionTitle = document.getElementById("questionTitle");
    if (questionTitle) {
      questionTitle.textContent = `Question ${question.question_number || (window.currentQuestionIndex + 1)}`;
    }
    
    const examTopicsLink = document.getElementById("examTopicsLink");
    if (examTopicsLink) {
      examTopicsLink.href = question.link || "#";
    }

    // Process question text and handle embedded images
    let questionText = question.question || "";
    
    // Replace embedded image references with base64 data
    if (question.images && Object.keys(question.images).length > 0) {
      if (typeof window.processEmbeddedImages === 'function') {
        questionText = window.processEmbeddedImages(questionText, question.images);
      }
    }
    
    // Fix any remaining image paths to point to ExamTopics.com (fallback)
    const originalText = questionText;
    questionText = questionText.replace(
      /src="\/assets\/media\/exam-media\//g,
      'src="https://www.examtopics.com/assets/media/exam-media/'
    );

    // Debug log image processing
    if (question.images && Object.keys(question.images).length > 0 && typeof window.devLog === 'function') {
      window.devLog("🖼️ Processed embedded images:", Object.keys(question.images).length, "images found");
    }
    if (originalText !== questionText && typeof window.devLog === 'function') {
      window.devLog("🔧 Image path fixed:", originalText.length, "→", questionText.length);
    }

    const questionTextElement = document.getElementById("questionText");
    if (questionTextElement) {
      questionTextElement.innerHTML = questionText;
    }

    // Display answers
    displayAnswers(question);

    // Try to restore previous answers for this question
    if (question.question_number && typeof window.restorePreviousAnswers === 'function') {
      const restored = window.restorePreviousAnswers(question.question_number);
      if (restored && typeof window.devLog === 'function') {
        window.devLog(`Restored previous answers for question ${question.question_number}`);
      }
    }

    // Reset controls (will be updated by restorePreviousAnswers if needed)
    if (!window.isValidated) {
      const validateBtn = document.getElementById("validateBtn");
      const highlightBtn = document.getElementById("highlightBtn");
      const resetBtn = document.getElementById("resetBtn");
      
      if (validateBtn) {
        validateBtn.disabled = false;
        validateBtn.style.opacity = "1";
        validateBtn.style.cursor = "pointer";
        validateBtn.title = "";
        validateBtn.style.display = "inline-flex";
      }
      
      if (highlightBtn) {
        highlightBtn.disabled = false;
        highlightBtn.style.opacity = "1";
        highlightBtn.style.cursor = "pointer";
        highlightBtn.title = "";
        highlightBtn.style.display = "inline-flex";
      }
      
      if (resetBtn) resetBtn.style.display = "none";
    }

    // Update question statistics
    updateQuestionStatistics();

    // Update discussion
    const showDiscussion = window.settings?.showDiscussionDefault || false;
    const discussionContent = document.getElementById("discussionContent");
    const discussionToggle = document.getElementById("discussionToggle");

    if (discussionContent) {
      discussionContent.style.display = showDiscussion ? "block" : "none";
    }
    if (discussionToggle) {
      discussionToggle.innerHTML = `<i class="fas fa-comments"></i> ${showDiscussion ? "Hide" : "Show"} Discussion`;
    }

    if (showDiscussion && typeof window.displayDiscussion === 'function') {
      window.displayDiscussion(question);
    }

    // Update various UI elements (skip if question is already validated)
    if (typeof window.updateInstructions === 'function' && !window.isValidated) {
      window.updateInstructions();
    }
    if (typeof window.updateHighlightButton === 'function') {
      window.updateHighlightButton();
    }
    if (typeof window.updateFavoritesUI === 'function') {
      window.updateFavoritesUI();
    }

    // Ensure question jump field max value is always up to date
    updateQuestionJumpMaxValue();

    // Update toolbar visibility based on settings
    if (typeof window.updateToolbarVisibility === 'function') {
      window.updateToolbarVisibility();
    }


    if (typeof window.devLog === 'function') {
      window.devLog(`📄 Displayed question ${currentQuestionNumber}`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error displaying current question:", error);
    }
  }
}

/**
 * Display answers for current question
 */
function displayAnswers(question) {
  try {
    const answers = question.answers || [];
    const mostVoted = question.most_voted || "";
    const correctAnswers = new Set(mostVoted.split(""));

    const answersList = document.getElementById("answersList");
    if (!answersList) return;
    
    // Use efficient DOM manipulation instead of innerHTML
    while (answersList.firstChild) {
      answersList.removeChild(answersList.firstChild);
    }

    answers.forEach((answer) => {
      const answerLetter = answer.charAt(0);
      let answerText = answer.substring(3);

      // Process embedded images in answers
      if (question.images && Object.keys(question.images).length > 0 && 
          typeof window.processEmbeddedImages === 'function') {
        answerText = window.processEmbeddedImages(answerText, question.images);
      }

      // Fix image paths in answers too (fallback)
      answerText = answerText.replace(
        /src="\/assets\/media\/exam-media\//g,
        'src="https://www.examtopics.com/assets/media/exam-media/'
      );

      const answerElement = document.createElement("div");
      answerElement.className = "answer-option";
      answerElement.dataset.answer = answerLetter; // Add data-answer attribute for restoration
      answerElement.innerHTML = `<span class="answer-letter">${answerLetter}.</span> ${answerText}`;

      answerElement.addEventListener("click", () => {
        if (!window.isValidated) {
          toggleAnswerSelection(answerLetter, answerElement);
        }
      });

      if (window.isHighlightEnabled && correctAnswers.has(answerLetter)) {
        answerElement.classList.add("correct-not-selected");
      }

      answersList.appendChild(answerElement);
    });
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error displaying answers:", error);
    }
  }
}

/**
 * Toggle answer selection
 */
function toggleAnswerSelection(letter, element) {
  try {
    if (!window.selectedAnswers) {
      window.selectedAnswers = new Set();
    }
    
    if (window.selectedAnswers.has(letter)) {
      window.selectedAnswers.delete(letter);
      element.classList.remove("selected");
    } else {
      window.selectedAnswers.add(letter);
      element.classList.add("selected");
    }
    
    if (typeof window.updateInstructions === 'function' && !window.isValidated) {
      window.updateInstructions();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`🔘 Toggled answer ${letter}: ${window.selectedAnswers.has(letter) ? 'selected' : 'deselected'}`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error toggling answer selection:", error);
    }
  }
}

// ===========================
// QUESTION STATISTICS
// ===========================

/**
 * Update question statistics display
 */
function updateQuestionStatistics() {
  try {
    if (!window.statistics?.currentSession || !window.currentQuestions?.length) {
      const questionStats = document.getElementById("questionStats");
      if (questionStats) {
        questionStats.style.display = "none";
      }
      return;
    }

    const question = window.currentQuestions[window.currentQuestionIndex || 0];
    const questionNumber = question.question_number;

    // Find the question attempt in statistics
    const questions = window.statistics.currentSession.q || window.statistics.currentSession.questions || [];
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 updateQuestionStatistics: Looking for question ${questionNumber}`);
      window.devLog(`📊 updateQuestionStatistics: Using data source:`, {
        hasQ: !!window.statistics.currentSession.q,
        hasQuestions: !!window.statistics.currentSession.questions,
        questionsLength: questions.length
      });
      window.devLog(`📊 updateQuestionStatistics: Available questions:`, questions.map(q => ({
        qn: q.qn, 
        questionNumber: q.questionNumber, 
        rc: q.rc
      })));
    }
    
    // Find all matching attempts and take the most recent one (last in array)
    const matchingAttempts = questions.filter(
      (q) => (q.qn && q.qn.toString() === questionNumber.toString()) ||
             (q.questionNumber && q.questionNumber.toString() === questionNumber.toString())
    );
    const questionAttempt = matchingAttempts.length > 0 ? matchingAttempts[matchingAttempts.length - 1] : null;

    if (!questionAttempt) {
      if (typeof window.devLog === 'function') {
        window.devLog(`📊 updateQuestionStatistics: No questionAttempt found for question ${questionNumber}`);
      }
      const resetCount = document.getElementById("resetCount");
      const highlightValidationsCount = document.getElementById("highlightValidationsCount");
      const questionStats = document.getElementById("questionStats");
      
      if (resetCount) resetCount.textContent = "0";
      if (highlightValidationsCount) highlightValidationsCount.textContent = "0";
      if (questionStats) questionStats.style.display = "none";
      return;
    }

    const resetCount = questionAttempt.rc || questionAttempt.resetCount || 0;
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 updateQuestionStatistics: Found ${matchingAttempts.length} matching attempts, using most recent:`);
      window.devLog(`📊 updateQuestionStatistics: Selected questionAttempt:`, {
        qn: questionAttempt.qn,
        questionNumber: questionAttempt.questionNumber,
        rc: questionAttempt.rc,
        resetCount: questionAttempt.resetCount,
        calculatedResetCount: resetCount
      });
    }

    // Calculate total highlight interactions using new method or old way
    const totalHighlightInteractions = questionAttempt.getTotalHighlightInteractions
      ? questionAttempt.getTotalHighlightInteractions()
      : (questionAttempt.hbc || questionAttempt.highlightButtonClicks || 0) +
        (questionAttempt.hvc || questionAttempt.highlightViewCount || 0) +
        (questionAttempt.highlightAnswers ? questionAttempt.highlightAnswers.length : 0);

    const resetCountElement = document.getElementById("resetCount");
    const highlightValidationsCountElement = document.getElementById("highlightValidationsCount");
    const questionStats = document.getElementById("questionStats");
    
    if (typeof window.devLog === 'function') {
      window.devLog(`📊 updateQuestionStatistics: DOM elements found:`, {
        resetCountElement: !!resetCountElement,
        questionStats: !!questionStats
      });
    }
    
    if (resetCountElement) {
      resetCountElement.textContent = resetCount;
      if (typeof window.devLog === 'function') {
        window.devLog(`📊 updateQuestionStatistics: Updated resetCountElement.textContent to ${resetCount}`);
      }
    }
    if (highlightValidationsCountElement) {
      highlightValidationsCountElement.textContent = totalHighlightInteractions;
    }

    // Show stats only if there are any statistics to display
    if (questionStats) {
      if (resetCount > 0 || totalHighlightInteractions > 0) {
        questionStats.style.display = "flex";
      } else {
        questionStats.style.display = "none";
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating question statistics:", error);
    }
  }
}

// ===========================
// ANSWER VALIDATION
// ===========================

/**
 * Validate selected answers
 */
function validateAnswers() {
  try {
    const wasHighlightEnabled = window.isHighlightEnabled;
    
    if (typeof window.devLog === 'function') {
      window.devLog("🔍 Starting answer validation...");
      window.devLog("🔍 Current session exists:", !!window.statistics?.currentSession);
    }

    if (window.isHighlightEnabled) {
      if (typeof window.devLog === 'function') {
        window.devLog("🔍 Processing highlight validation");
      }
      
      window.isHighlightEnabled = false;
      if (typeof window.updateHighlightButton === 'function') {
        window.updateHighlightButton();
      }

      // Track highlight answers separately for statistics
      if (window.statistics?.currentSession) {
        const question = window.currentQuestions[window.currentQuestionIndex || 0];
        const questionNumber = question.question_number;

        // Find existing question attempt or create new one
        let questionAttempt = window.statistics.currentSession.questions?.find(
          (q) => q.questionNumber === questionNumber
        );

        if (!questionAttempt && typeof window.QuestionAttempt === 'function') {
          const mostVoted = question.most_voted || "";
          const correctAnswers = Array.from(new Set(mostVoted.split("")));
          questionAttempt = new window.QuestionAttempt(questionNumber, correctAnswers);
          window.statistics.currentSession.questions.push(questionAttempt);
        }

        // Track highlight view
        if (questionAttempt?.addHighlightView) {
          questionAttempt.addHighlightView();
        }

        // Track first action if this is the first interaction
        if (questionAttempt && !questionAttempt.firstActionRecorded) {
          questionAttempt.firstActionType = "preview";
          questionAttempt.firstActionRecorded = true;
        }

        if (typeof window.updateSessionStats === 'function') {
          window.updateSessionStats();
        }
        if (typeof window.saveStatistics === 'function') {
          window.saveStatistics();
        }
        
        if (typeof window.devLog === 'function') {
          window.devLog("✅ Highlight validation tracked as preview action");
        }
      }
    }

    if (!window.selectedAnswers?.size) {
      if (typeof window.showError === 'function') {
        window.showError("Please select at least one answer");
      }
      return;
    }

    const question = window.currentQuestions[window.currentQuestionIndex || 0];
    const mostVoted = question.most_voted || "";
    const correctAnswers = new Set(mostVoted.split(""));

    if (typeof window.devLog === 'function') {
      window.devLog("📝 Question:", question.question_number, "Most voted:", mostVoted, "Correct answers:", Array.from(correctAnswers));
      window.devLog("👤 Selected answers:", Array.from(window.selectedAnswers));
    }

    window.isValidated = true;

    // Update answer elements
    const answerElements = document.querySelectorAll(".answer-option");
    answerElements.forEach((element) => {
      const letter = element.querySelector(".answer-letter")?.textContent.charAt(0);
      const isSelected = window.selectedAnswers.has(letter);
      const isCorrect = correctAnswers.has(letter);

      element.classList.add("disabled");
      element.classList.remove("selected", "correct-not-selected");

      if (isSelected && isCorrect) {
        element.classList.add("correct");
      } else if (isSelected && !isCorrect) {
        element.classList.add("incorrect");
      } else if (!isSelected && isCorrect) {
        element.classList.add("correct-not-selected");
      }
    });

    // Calculate time spent on question
    const timeSpent = window.questionStartTime
      ? Math.floor((new Date() - window.questionStartTime) / 1000)
      : 0;

    // Calculate correct and incorrect selections for statistics
    const correctSelected = new Set(
      [...window.selectedAnswers].filter((x) => correctAnswers.has(x))
    );
    const incorrectSelected = new Set(
      [...window.selectedAnswers].filter((x) => !correctAnswers.has(x))
    );

    // Track the question attempt for statistics
    const isCorrect = correctSelected.size === correctAnswers.size && incorrectSelected.size === 0;

    if (typeof window.devLog === 'function') {
      window.devLog("📊 Tracking question attempt - isCorrect:", isCorrect, "highlight was enabled:", wasHighlightEnabled);
    }

    try {
      if (typeof window.devLog === 'function') {
        window.devLog(`📅 About to track question attempt:`);
        window.devLog(`📅 question.question_number: ${question.question_number}`);
        window.devLog(`📅 currentQuestionIndex: ${window.currentQuestionIndex}`);
        window.devLog(`📅 isCorrect: ${isCorrect}`);
      }
      
      if (typeof window.trackQuestionAttempt === 'function') {
        window.trackQuestionAttempt(
          question.question_number,
          Array.from(correctAnswers),
          window.selectedAnswers,
          isCorrect,
          timeSpent,
          wasHighlightEnabled
        );
        
        if (typeof window.devLog === 'function') {
          window.devLog("📊 Question attempt tracked successfully");
        }
        
        if (typeof window.devLog === 'function') {
          window.devLog(`✅ Successfully tracked Q${question.question_number} at index ${window.currentQuestionIndex}`);
        }
      } else {
        if (typeof window.devLog === 'function') {
          window.devLog(`❌ trackQuestionAttempt function not available`);
        }
      }
    } catch (error) {
      if (typeof window.devError === 'function') {
        window.devError("❌ Error tracking question attempt:", error);
      }
    }

    // Update controls - disable validate and highlight buttons after validation
    const validateBtn = document.getElementById("validateBtn");
    const highlightBtn = document.getElementById("highlightBtn");
    const resetBtn = document.getElementById("resetBtn");
    
    if (validateBtn) {
      validateBtn.disabled = true;
      validateBtn.style.opacity = "0.5";
      validateBtn.style.cursor = "not-allowed";
      validateBtn.title = "Answers validated - reset to validate again";
    }
    
    if (highlightBtn) {
      highlightBtn.disabled = true;
      highlightBtn.style.opacity = "0.5";
      highlightBtn.style.cursor = "not-allowed";
      highlightBtn.title = "Answers validated - reset to highlight again";
    }
    
    if (resetBtn) resetBtn.style.display = "inline-flex";

    // Update question statistics display
    updateQuestionStatistics();

    // Show validation results
    if (typeof window.devLog === 'function') {
      window.devLog("🎯 Checking showValidationResults function...");
      window.devLog("🎯 typeof window.showValidationResults:", typeof window.showValidationResults);
      window.devLog("🎯 window.showValidationResults:", window.showValidationResults);
    }
    if (typeof window.showValidationResults === 'function') {
      if (typeof window.devLog === 'function') {
        window.devLog("🎯 Calling showValidationResults with correctAnswers:", correctAnswers);
      }
      window.showValidationResults(correctAnswers);
    } else {
      if (typeof window.devLog === 'function') {
        window.devLog("❌ showValidationResults is not available!");
      }
    }
    
    // Update filter counts after answer validation
    if (typeof window.updateFilterCounts === 'function') {
      if (typeof window.devLog === 'function') {
        window.devLog("🔄 Updating filter counts after validation...");
      }
      window.updateFilterCounts();
      if (typeof window.devLog === 'function') {
        window.devLog("✅ Filter counts updated");
      }
    }
    
    // Clear cache for this specific question only (performance optimization)
    if (typeof window.clearQuestionStatusCacheForQuestion === 'function') {
      if (typeof window.devLog === 'function') {
        window.devLog(`🗄 Clearing cache for question index ${window.currentQuestionIndex}...`);
      }
      window.clearQuestionStatusCacheForQuestion(window.currentQuestionIndex);
      if (typeof window.devLog === 'function') {
        window.devLog("✅ Question status cache cleared for current question");
      }
    }
    
    // Update progress sidebar to reflect answered status
    if (typeof window.updateProgressSidebar === 'function') {
      if (typeof window.devLog === 'function') {
        window.devLog("📊 Updating progress sidebar after validation...");
        window.devLog("Current question index:", window.currentQuestionIndex);
        window.devLog("Total questions:", window.currentQuestions?.length);
      }
      window.updateProgressSidebar();
      if (typeof window.devLog === 'function') {
        window.devLog("✅ Progress sidebar updated");
      }
    }

    // Update progress bars to reflect new answer count
    if (typeof window.updateProgressBar === 'function') {
      window.updateProgressBar();
      if (typeof window.devLog === 'function') {
        window.devLog("📊 Progress bar updated");
      }
    }
    
    if (typeof window.updateMainProgressBar === 'function') {
      window.updateMainProgressBar();
      if (typeof window.devLog === 'function') {
        window.devLog("📊 Main progress bar updated");
      }
    }

    if (typeof window.devLog === 'function') {
      window.devLog("✅ validateAnswers() completed successfully");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error validating answers:", error);
    }
  }
}

/**
 * Reset answers for current question
 */
function resetAnswers() {
  try {
    // Store validation state before clearing
    const wasValidated = window.isValidated;
    
    window.selectedAnswers?.clear();

    // Track reset count for the current question - only if it was previously validated
    if (window.statistics?.currentSession && wasValidated) {
      const question = window.currentQuestions[window.currentQuestionIndex || 0];
      const questionNumber = question.question_number;

      // Find existing question attempt or create new one
      // Use string comparison to ensure consistency with different data types
      let questionAttempt = window.statistics.currentSession.questions?.find(
        (q) => (q.qn && q.qn.toString() === questionNumber.toString()) ||
               (q.questionNumber && q.questionNumber.toString() === questionNumber.toString())
      );

      if (!questionAttempt && typeof window.QuestionAttempt === 'function') {
        const mostVoted = question.most_voted || "";
        const correctAnswers = Array.from(new Set(mostVoted.split("")));
        questionAttempt = new window.QuestionAttempt(questionNumber, correctAnswers);
        window.statistics.currentSession.questions.push(questionAttempt);
      }

      if (questionAttempt?.addReset) {
        questionAttempt.addReset();
        
        if (typeof window.updateSessionStats === 'function') {
          window.updateSessionStats();
        }
        if (typeof window.saveStatistics === 'function') {
          window.saveStatistics();
        }
        
        if (typeof window.devLog === 'function') {
          window.devLog(`🔄 Reset count incremented for validated question ${questionNumber} (total resets: ${questionAttempt.rc})`);
        }
      }
    } else if (typeof window.devLog === 'function') {
      window.devLog('🔄 Reset triggered but question was not validated - reset count not incremented');
    }

    // Reset UI state
    window.isValidated = false;

    // Reset answer elements
    const answerElements = document.querySelectorAll(".answer-option");
    answerElements.forEach((element) => {
      element.classList.remove("selected", "correct", "incorrect", "disabled", "correct-not-selected");
      
      // Re-apply highlight if enabled
      if (window.isHighlightEnabled) {
        const letter = element.querySelector(".answer-letter")?.textContent.charAt(0);
        const question = window.currentQuestions[window.currentQuestionIndex || 0];
        const mostVoted = question.most_voted || "";
        const correctAnswers = new Set(mostVoted.split(""));
        
        if (correctAnswers.has(letter)) {
          element.classList.add("correct-not-selected");
        }
      }
    });

    // Update controls - re-enable validate and highlight buttons after reset
    const validateBtn = document.getElementById("validateBtn");
    const highlightBtn = document.getElementById("highlightBtn");
    const resetBtn = document.getElementById("resetBtn");
    
    if (validateBtn) {
      validateBtn.disabled = false;
      validateBtn.style.opacity = "1";
      validateBtn.style.cursor = "pointer";
      validateBtn.title = "";
      validateBtn.style.display = "inline-flex";
    }
    
    if (highlightBtn) {
      highlightBtn.disabled = false;
      highlightBtn.style.opacity = "1";
      highlightBtn.style.cursor = "pointer";
      highlightBtn.title = "";
      highlightBtn.style.display = "inline-flex";
    }
    
    if (resetBtn) resetBtn.style.display = "none";

    // Update instructions and statistics
    if (typeof window.updateInstructions === 'function' && !window.isValidated) {
      window.updateInstructions();
    }
    
    // Force update of question statistics after reset tracking
    if (typeof window.devLog === 'function') {
      window.devLog('🔄 About to update question statistics after reset');
    }
    updateQuestionStatistics();

    if (typeof window.devLog === 'function') {
      window.devLog("🔄 Answers reset for current question");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resetting answers:", error);
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all core navigation functions for use in other modules
export {
  // Core navigation
  navigateQuestion,
  navigateToRandomQuestion,
  navigateToQuestionIndex,
  navigateToQuestionAsync,
  
  // Question jumping
  jumpToQuestion,
  jumpToQuestionNumber,
  updateQuestionJumpMaxValue,
  
  // Home navigation
  goToHome,
  
  // Question display
  displayCurrentQuestion,
  displayAnswers,
  toggleAnswerSelection,
  
  // Question statistics
  updateQuestionStatistics,
  
  // Answer validation
  validateAnswers,
  resetAnswers,
};