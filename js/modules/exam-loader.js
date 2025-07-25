/**
 * Exam Loading & Discovery Module
 * 
 * Handles exam discovery, loading, and initialization for Exams-Viewer application.
 * Includes manifest loading, directory discovery, chunked exam support, and UI initialization.
 * 
 * Dependencies: 
 * - Global variables: availableExams, currentExam, allQuestions, currentQuestions, currentQuestionIndex,
 *   filteredQuestions, isSearchActive, searchCache, lazyLoadingConfig, settings, isHighlightEnabled,
 *   isHighlightTemporaryOverride
 * - External functions: devLog, devError, showLoading, showError, showSuccess, clearQuestionStatusCache,
 *   startExamSession, updateAdvancedSearchVisibility, initializeSearchInterface, handleResumePosition,
 *   displayCurrentQuestion, clearNavigationHistory, updateProgressSidebar, updateHistoryButtons,
 *   updateQuestionJumpMaxValue, testQuestionJumpField, resetFavoritesData, exportFavorites,
 *   isDevelopmentMode
 * - Lazy Loading Module: checkForChunkedExam, loadChunk, preloadChunks, assembleCurrentQuestions
 */

// Import lazy loading functions
// Note: These will be imported by the main script that uses this module

// ===========================
// EXAM DISCOVERY FUNCTIONS
// ===========================

/**
 * Discover available exams using multiple methods
 */
async function discoverAvailableExams() {
  try {
    const discoveredExams = {};

    // Method 1: Try to load manifest file first (most efficient, no 404 errors)
    if (typeof window.devLog === 'function') {
      window.devLog("Attempting to load manifest file...");
    }
    try {
      const manifestResponse = await fetch("data/manifest.json");
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        if (manifest.exams && Array.isArray(manifest.exams)) {
          if (typeof window.devLog === 'function') {
            window.devLog("Found manifest file with exams:", manifest.exams);
          }

          // Preload popular exams via service worker
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PRELOAD_EXAMS',
              exams: manifest.exams.slice(0, 5) // Top 5 most popular
            });
          }

          // Trust manifest data - no need to verify each exam file exists
          // This eliminates redundant HEAD requests for better performance
          manifest.exams.forEach(examCode => {
            discoveredExams[examCode] = examCode;
          });

          if (Object.keys(discoveredExams).length > 0) {
            window.availableExams = discoveredExams;
            if (typeof window.devLog === 'function') {
              window.devLog(
                "Successfully loaded exams from manifest:",
                Object.keys(window.availableExams)
              );
            }
            return window.availableExams;
          }
        }
      }
    } catch (error) {
      if (typeof window.devLog === 'function') {
        window.devLog(
          "Manifest file not found or invalid, falling back to directory discovery"
        );
      }
    }

    // Method 2: Try to get file listing from directory (if server supports it)
    try {
      const dirResponse = await fetch("data/");
      if (dirResponse.ok) {
        const dirText = await dirResponse.text();

        // Parse HTML directory listing to find .json files (excluding _links.json)
        const jsonFileRegex = /href="([^"]*\.json)"/g;
        let match;
        while ((match = jsonFileRegex.exec(dirText)) !== null) {
          const filename = match[1];
          // Skip _links.json files, only get main exam files
          if (
            !filename.includes("_links") &&
            filename.endsWith(".json") &&
            filename !== "manifest.json"
          ) {
            const examCode = filename.replace(".json", "");
            discoveredExams[examCode] = examCode;
          }
        }

        if (Object.keys(discoveredExams).length > 0) {
          if (typeof window.devLog === 'function') {
            window.devLog(
              "Discovered exams from directory listing:",
              Object.keys(discoveredExams)
            );
          }
          window.availableExams = discoveredExams;
          return window.availableExams;
        }
      }
    } catch (error) {
      if (typeof window.devLog === 'function') {
        window.devLog("Directory listing not available, trying alternative methods");
      }
    }

    // Method 3: Auto-discover by scanning for _links.json files (only if previous methods failed)
    if (typeof window.devLog === 'function') {
      window.devLog("Auto-discovering exams by scanning for _links.json files...");
    }

    // Generate potential exam codes based on common patterns (only the ones that actually exist)
    const examPrefixes = ["CAD", "CSA", "CAS-PA"];
    const cisModules = [
      "APM",
      "CPG",
      "CSM",
      "Discovery",
      "EM",
      "FSM",
      "HAM",
      "HR",
      "ITSM",
      "PPM",
      "RC",
      "SAM",
      "SIR",
      "SM",
      "SPM",
      "VR",
      "VRM",
    ];

    // Add CIS- prefixed modules
    for (const module of cisModules) {
      examPrefixes.push(`CIS-${module}`);
    }

    const allPotentialCodes = [...examPrefixes];
    if (typeof window.devLog === 'function') {
      window.devLog("Checking potential codes:", allPotentialCodes);
    }

    // Check for _links.json files to discover what exams are available
    const availableCodes = [];
    const checkPromises = allPotentialCodes.map(async (code) => {
      try {
        const linkResponse = await fetch(`data/${code}/links.json`, {
          method: "HEAD",
        });
        if (linkResponse.ok) {
          availableCodes.push(code);
          if (typeof window.devLog === 'function') {
            window.devLog(`Found _links.json for: ${code}`);
          }
        }
      } catch (error) {
        // Ignore errors for non-existent files
      }
    });

    await Promise.all(checkPromises);
    if (typeof window.devLog === 'function') {
      window.devLog("Available codes with _links.json:", availableCodes);
    }

    // Now check if corresponding .json files exist for discovered codes
    const examCheckPromises = availableCodes.map(async (examCode) => {
      try {
        const response = await fetch(`data/${examCode}/exam.json`, {
          method: "HEAD",
        });
        if (response.ok) {
          discoveredExams[examCode] = examCode;
          if (typeof window.devLog === 'function') {
            window.devLog(`Confirmed exam file exists for: ${examCode}`);
          }
        } else {
          if (typeof window.devLog === 'function') {
            window.devLog(
              `Exam file not found for: ${examCode} (status: ${response.status})`
            );
          }
        }
      } catch (error) {
        if (typeof window.devLog === 'function') {
          window.devLog(`Failed to check exam file for: ${examCode}`, error);
        }
      }
    });

    await Promise.all(examCheckPromises);

    window.availableExams = discoveredExams;
    if (typeof window.devLog === 'function') {
      window.devLog("Final discovered exams:", Object.keys(window.availableExams));
    }

    return window.availableExams;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error discovering exams:", error);
    }
    // Fallback: return empty object if discovery fails
    window.availableExams = {};
    return window.availableExams;
  }
}

// ===========================
// EXAM DISPLAY FUNCTIONS
// ===========================

/**
 * Populate exam select dropdown with question counts
 */
async function populateExamSelect() {
  const examSelect = document.getElementById("examCode");
  if (!examSelect) return;
  
  // Clear existing options except the first one
  while (examSelect.children.length > 1) {
    examSelect.removeChild(examSelect.lastChild);
  }
  
  if (!window.availableExams || Object.keys(window.availableExams).length === 0) {
    return;
  }
  
  // Add options for each available exam (sorted alphabetically)
  const sortedExamCodes = Object.keys(window.availableExams).sort();
  
  for (const examCode of sortedExamCodes) {
    // Try to get question count
    let questionCount = "";
    try {
      const response = await fetch(`data/${examCode}/exam.json`);
      if (response.ok) {
        const data = await response.json();
        const count = data.questions?.length || 0;
        questionCount = ` (${count} questions)`;
      }
    } catch (error) {
      // If we can't get the count, just show the exam code
      questionCount = "";
    }
    
    const option = document.createElement("option");
    option.value = examCode;
    option.textContent = `${examCode}${questionCount}`;
    examSelect.appendChild(option);
  }
  
  if (typeof window.devLog === 'function') {
    window.devLog(`📝 Populated exam select with ${sortedExamCodes.length} exams`);
  }
}

/**
 * Display available exams
 */
async function displayAvailableExams() {
  const examsList = document.getElementById("examsList");
  if (!examsList) return;
  
  examsList.innerHTML = "";

  if (!window.availableExams || Object.keys(window.availableExams).length === 0) {
    examsList.innerHTML = "<p>No exams found in data folder</p>";
    return;
  }
  
  // Create cards for each available exam (sorted alphabetically)
  const sortedExamCodes = Object.keys(window.availableExams).sort();
  for (const code of sortedExamCodes) {
    const examCard = document.createElement("div");
    examCard.className = "exam-card";

    // Try to get question count
    let questionCount = "Loading...";
    try {
      const response = await fetch(`data/${code}/exam.json`);
      if (response.ok) {
        const data = await response.json();
        questionCount = `${data.questions?.length || 0} questions`;
      } else {
        questionCount = "Click to load";
      }
    } catch (error) {
      questionCount = "Click to load";
    }

    // Check for resume position
    const resumeIndicator = getResumeIndicatorText(code);
    const resumeHTML = resumeIndicator ? `<div class="resume-indicator">${resumeIndicator}</div>` : '';
    
    examCard.innerHTML = `
            <div class="exam-code">${code}</div>
            <div class="exam-count">${questionCount}</div>
            ${resumeHTML}
        `;

    examCard.addEventListener("click", () => {
      const examCodeField = document.getElementById("examCode");
      if (examCodeField) {
        examCodeField.value = code;
      }
      loadExam(code);
    });

    examsList.appendChild(examCard);
  }
}

/**
 * Get resume indicator text for exam card
 */
function getResumeIndicatorText(examCode) {
  if (!window.settings?.enableResumePosition) {
    return null;
  }
  
  // Get saved position from localStorage or window.resumePositions
  let savedPosition = null;
  
  try {
    const studyPositions = JSON.parse(localStorage.getItem('study_positions') || '{}');
    savedPosition = studyPositions[examCode];
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError('Error reading study positions:', error);
    }
  }
  
  if (!savedPosition) {
    // Try legacy format
    if (window.resumePositions && window.resumePositions[examCode]) {
      savedPosition = window.resumePositions[examCode];
    }
  }
  
  if (savedPosition && savedPosition.questionIndex !== undefined) {
    const questionNum = savedPosition.questionIndex + 1;
    const totalQuestions = savedPosition.totalQuestions || '?';
    const timeAgo = getTimeAgo(savedPosition.timestamp);
    return `📍 Resume at Q${questionNum}/${totalQuestions} (${timeAgo})`;
  }
  
  return null;
}

/**
 * Get time ago string for timestamps
 */
function getTimeAgo(timestamp) {
  if (!timestamp) return 'unknown';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
}

// ===========================
// EXAM LOADING FUNCTIONS
// ===========================

/**
 * Load exam data
 */
async function loadExam(examCode) {
  if (!window.availableExams || !window.availableExams[examCode]) {
    if (typeof window.showError === 'function') {
      window.showError(
        `Exam code "${examCode}" not found. Available exams: ${Object.keys(
          window.availableExams || {}
        ).join(", ")}`
      );
    }
    return;
  }

  if (typeof window.showLoading === 'function') {
    window.showLoading(true);
  }

  try {
    // Reset lazy loading state
    if (window.lazyLoadingConfig) {
      window.lazyLoadingConfig.loadedChunks.clear();
      window.lazyLoadingConfig.currentChunk = 0;
      window.lazyLoadingConfig.examMetadata = null;
    }

    // Check if this exam has chunked version for lazy loading
    const isChunked = await window.checkForChunkedExam(examCode);

    if (isChunked) {
      // Load first chunk immediately for chunked exams
      const firstChunk = await window.loadChunk(examCode, 0);
      if (firstChunk.length === 0) {
        throw new Error("Failed to load first chunk of exam data");
      }

      // Set up exam data
      window.currentExam = {
        exam_name: window.lazyLoadingConfig.examMetadata.exam_name || examCode,
        exam_code: examCode,
        code: examCode,
        questions: [], // Will be assembled dynamically
        isChunked: true
      };
      
      // Set global exam code for favorites system
      window.currentExamCode = examCode;

      // Preload nearby chunks
      await window.preloadChunks(examCode, 0);

      // Assemble current questions from loaded chunks
      window.allQuestions = window.assembleCurrentQuestions();
      window.currentQuestions = [...window.allQuestions];
    } else {
      // Standard loading for smaller exams
      const response = await fetch(`data/${examCode}/exam.json`);
      if (!response.ok) {
        throw new Error(`Failed to load exam data: ${response.status}`);
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid exam data format");
      }

      // Store the complete exam data object
      window.currentExam = {
        exam_name: data.exam_name || examCode,
        exam_code: examCode,
        code: examCode,
        questions: data.questions,
        isChunked: false
      };
      
      // Set global exam code for favorites system
      window.currentExamCode = examCode;

      // Sort questions by question_number numerically with robust comparison
      window.allQuestions = data.questions.sort((a, b) => {
        const numA = parseInt(a.question_number, 10);
        const numB = parseInt(b.question_number, 10);

        // Handle invalid numbers
        if (isNaN(numA) && isNaN(numB)) return 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;

        return numA - numB;
      });

      // Initialize current questions
      window.currentQuestions = [...window.allQuestions];
    }
    
    // Reset search state
    window.filteredQuestions = [];
    window.isSearchActive = false;
    window.searchCache = {};
    window.currentQuestionIndex = 0;

    // Debug: Log first few questions to verify sorting
    if (typeof window.devLog === 'function') {
      window.devLog(
        "First 10 questions after sorting:",
        window.currentQuestions.slice(0, 10).map((q) => q.question_number)
      );
      window.devLog("Total questions loaded:", window.currentQuestions.length);
    }

    // Clear question status cache for fresh start
    if (typeof window.clearQuestionStatusCache === 'function') {
      window.clearQuestionStatusCache();
    }

    // Start exam session for statistics
    if (typeof window.startExamSession === 'function') {
      window.startExamSession(examCode, window.currentExam.exam_name);
    }

    // Initialize highlight state from settings
    window.isHighlightEnabled = window.settings?.highlightDefault || false;
    window.isHighlightTemporaryOverride = false; // Reset override flag for new exam

    // Update UI
    const uiElements = [
      { id: "availableExams", display: "none" },
      { id: "navigationSection", display: "block" },
      { id: "questionSection", display: "block" },
      { id: "exportBtn", display: "flex" },
      { id: "homeBtn", display: "inline-block" }
    ];
    
    uiElements.forEach(({ id, display }) => {
      const element = document.getElementById(id);
      if (element) element.style.display = display;
    });

    // Show/hide advanced search based on settings
    if (typeof window.updateAdvancedSearchVisibility === 'function') {
      window.updateAdvancedSearchVisibility();
    }
    
    // Reset and initialize search UI if enabled
    if (window.settings?.showAdvancedSearch) {
      if (typeof window.resetSearchInterface === 'function') {
        window.resetSearchInterface();
      } else if (typeof window.initializeSearchInterface === 'function') {
        window.initializeSearchInterface();
      }
    }
    
    // Check for resume position after questions are loaded
    if (typeof window.handleResumePosition === 'function') {
      await window.handleResumePosition(examCode);
    }
    
    // Display current question
    if (typeof window.displayCurrentQuestion === 'function') {
      window.displayCurrentQuestion();
    }
    
    // Initialize sidebar and navigation history
    if (typeof window.clearNavigationHistory === 'function') {
      window.clearNavigationHistory();
    }
    if (typeof window.updateProgressSidebar === 'function') {
      window.updateProgressSidebar();
    }
    if (typeof window.updateHistoryButtons === 'function') {
      window.updateHistoryButtons();
    }
    
    // Initialize favorites UI and category dropdown
    if (typeof window.updateFavoritesUI === 'function') {
      window.updateFavoritesUI();
    }
    if (typeof window.updateCategoryDropdown === 'function') {
      window.updateCategoryDropdown();
    }

    // Update question jump field max value immediately and with delay
    if (typeof window.updateQuestionJumpMaxValue === 'function') {
      window.updateQuestionJumpMaxValue();
    }

    // Also try with a delay to ensure DOM is ready
    setTimeout(() => {
      if (typeof window.updateQuestionJumpMaxValue === 'function') {
        window.updateQuestionJumpMaxValue();
      }
      
      // Update filter counts after everything is loaded
      if (typeof window.updateFilterCounts === 'function') {
        window.updateFilterCounts();
        if (typeof window.devLog === 'function') {
          window.devLog("🔄 Filter counts updated for new exam");
        }
      }
      
      // Also make the test function available in console
      if (typeof window.isDevelopmentMode === 'function' && window.isDevelopmentMode()) {
        window.testQuestionJumpField = window.testQuestionJumpField;
        window.resetFavoritesData = window.resetFavoritesData;
        window.exportFavorites = window.exportFavorites;
        if (typeof window.devLog === 'function') {
          window.devLog(
            "💡 You can run 'testQuestionJumpField()' in console to check field state"
          );
          window.devLog(
            "💡 You can run 'resetFavoritesData()' in console to reset favorites data"
          );
          window.devLog(
            "💡 You can run 'exportFavorites()' in console to test export functionality"
          );
        }
      }
    }, 100);

    // And one more time with a longer delay
    setTimeout(() => {
      if (typeof window.updateQuestionJumpMaxValue === 'function') {
        window.updateQuestionJumpMaxValue();
      }
      
      // Final update of filter counts to ensure they're correct
      if (typeof window.updateFilterCounts === 'function') {
        window.updateFilterCounts();
        if (typeof window.devLog === 'function') {
          window.devLog("🔄 Final filter counts update for new exam");
        }
      }
      
      if (typeof window.devLog === 'function') {
        window.devLog("🔄 Final attempt to update max value");
      }
    }, 500);
    
    if (typeof window.showSuccess === 'function') {
      window.showSuccess(`Loaded ${window.currentQuestions.length} questions for ${examCode}`);
    }
  } catch (error) {
    if (typeof window.showError === 'function') {
      window.showError(`Error loading exam: ${error.message}`);
    }
  } finally {
    if (typeof window.showLoading === 'function') {
      window.showLoading(false);
    }
  }
}

// Note: checkForChunkedExam is now provided by the Lazy Loading module

// ===========================
// IMAGE PROCESSING FUNCTIONS
// ===========================

/**
 * Process embedded images in HTML content
 */
function processEmbeddedImages(htmlContent, imagesData) {
  if (!htmlContent || !imagesData || Object.keys(imagesData).length === 0) {
    return htmlContent;
  }

  let processedContent = htmlContent;

  // Replace image references with base64 data
  Object.keys(imagesData).forEach(imageId => {
    const imageInfo = imagesData[imageId];
    
    // Use WebP format for better compression, fallback to JPEG
    const imageDataUrl = `data:image/webp;base64,${imageInfo.webp}`;
    
    // Pattern to find img tags with this data-img-id
    const imgPattern = new RegExp(`<img[^>]*data-img-id="${imageId}"[^>]*>`, 'gi');
    
    processedContent = processedContent.replace(imgPattern, (match) => {
      let updatedTag = match;
      
      // Replace the src attribute (it might be truncated base64)
      updatedTag = updatedTag.replace(/src="[^"]*"/gi, `src="${imageDataUrl}"`);
      
      // Add width and height attributes if available and not already present
      if (imageInfo.size && imageInfo.size.length === 2) {
        const [width, height] = imageInfo.size;
        if (!updatedTag.includes('width=')) {
          updatedTag = updatedTag.replace('<img', `<img width="${width}"`);
        }
        if (!updatedTag.includes('height=')) {
          updatedTag = updatedTag.replace('<img', `<img height="${height}"`);
        }
      }
      
      // Add alt text for accessibility if not present
      if (!updatedTag.includes('alt=')) {
        updatedTag = updatedTag.replace('<img', `<img alt="Question image"`);
      }
      
      // Add style for responsive images
      if (!updatedTag.includes('style=')) {
        updatedTag = updatedTag.replace('<img', `<img style="max-width: 100%; height: auto;"`);
      }
      
      return updatedTag;
    });
    
    // Also handle cases where the original URL might still be referenced
    if (imageInfo.original_url) {
      const urlPattern = new RegExp(`src="${imageInfo.original_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'gi');
      processedContent = processedContent.replace(urlPattern, `src="${imageDataUrl}"`);
    }
  });

  return processedContent;
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all exam loader functions for use in other modules
export {
  // Exam discovery
  discoverAvailableExams,
  
  // Exam display
  displayAvailableExams,
  populateExamSelect,
  getResumeIndicatorText,
  getTimeAgo,
  
  // Exam loading
  loadExam,
  
  // Image processing
  processEmbeddedImages,
};