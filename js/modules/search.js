/**
 * Search & Filter System Module
 * 
 * Handles text search, filters, auto-completion, and question filtering
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: allQuestions, currentQuestions, filteredQuestions, isSearchActive, 
 *   searchCache, currentExam, statistics, favoritesData
 * - External functions: isQuestionAnswered, isQuestionFavorite, navigateToQuestionIndex,
 *   updateFilterCounts, devLog, devError
 */

// ===========================
// SEARCH STATE MANAGEMENT
// ===========================

let searchCache = {};
let isSearchActive = false;
let allQuestions = [];
let filteredQuestions = [];

/**
 * Initialize search interface
 */
function initializeSearchInterface() {
  try {
    // Store original questions if not already stored
    if (!allQuestions.length && window.currentQuestions) {
      allQuestions = [...window.currentQuestions];
    }
    
    // Clear previous search state
    resetSearchState();
    
    // Update filter counts
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔍 Search interface initialized with ${allQuestions.length} questions`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error initializing search interface:", error);
    }
  }
}

/**
 * Reset search state to original questions
 */
function resetSearchState() {
  try {
    isSearchActive = false;
    filteredQuestions = [];
    searchCache = {};
    
    // Restore original questions
    if (allQuestions.length > 0) {
      window.currentQuestions = [...allQuestions];
    }
    
    // Clear search input if it exists
    const searchInput = document.getElementById("questionSearch");
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Clear filter checkboxes
    const filterCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    filterCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = false;
      }
    });
    
    if (typeof window.devLog === 'function') {
      window.devLog("🔄 Search state reset");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resetting search state:", error);
    }
  }
}

// ===========================
// TEXT SEARCH FUNCTIONS
// ===========================

/**
 * Search questions based on text query
 */
function searchQuestions(query) {
  try {
    if (!query || typeof query !== 'string') {
      return allQuestions;
    }
    
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery === '') {
      return allQuestions;
    }
    
    // Check cache first
    if (searchCache[trimmedQuery]) {
      if (typeof window.devLog === 'function') {
        window.devLog(`🎯 Using cached search results for: "${trimmedQuery}"`);
      }
      return searchCache[trimmedQuery];
    }
    
    // Split query into words for multi-word search
    const queryWords = trimmedQuery.split(/\s+/).filter(word => word.length > 0);
    
    const results = allQuestions.filter((question, index) => {
      // Search in question text
      const questionText = (question.question || '').toLowerCase();
      
      // Search in answers
      const answersText = (question.answers || [])
        .map(answer => (answer.text || '').toLowerCase())
        .join(' ');
      
      // Search in comments/explanations
      const commentsText = (question.comments || '').toLowerCase();
      
      // Combine all searchable text
      const searchableText = `${questionText} ${answersText} ${commentsText}`;
      
      // Check if all query words are found
      return queryWords.every(word => searchableText.includes(word));
    });
    
    // Cache the results
    searchCache[trimmedQuery] = results;
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔍 Search "${trimmedQuery}": ${results.length}/${allQuestions.length} results`);
    }
    
    return results;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error searching questions:", error);
    }
    return allQuestions;
  }
}

/**
 * Apply text search to current questions
 */
function applyTextSearch(query) {
  try {
    const searchResults = searchQuestions(query);
    
    if (query && query.trim() !== '') {
      isSearchActive = true;
      filteredQuestions = searchResults;
    } else {
      isSearchActive = false;
      filteredQuestions = [];
    }
    
    // Apply current filters to search results
    applyCurrentFilters();
    
    return window.currentQuestions;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error applying text search:", error);
    }
    return allQuestions;
  }
}

// ===========================
// STATUS FILTERS
// ===========================

/**
 * Apply status-based filters (answered, unanswered, favorites)
 */
function applyStatusFilters(baseQuestions = null) {
  try {
    const questionsToFilter = baseQuestions || (isSearchActive ? filteredQuestions : allQuestions);
    
    // Get filter states
    const showAnswered = document.getElementById("filterAnswered")?.checked || false;
    const showUnanswered = document.getElementById("filterUnanswered")?.checked || false;
    const showFavorites = document.getElementById("filterFavorites")?.checked || false;
    
    // If no filters are active, return all questions
    if (!showAnswered && !showUnanswered && !showFavorites) {
      return questionsToFilter;
    }
    
    return questionsToFilter.filter((question, index) => {
      // Find the original index in allQuestions
      const originalIndex = allQuestions.findIndex(q => 
        q.question_number === question.question_number ||
        (q.question === question.question && q.answers?.length === question.answers?.length)
      );
      
      if (originalIndex === -1) return false;
      
      let shouldInclude = false;
      
      // Check answered/unanswered status
      const isAnswered = typeof window.isQuestionAnswered === 'function' ? 
        window.isQuestionAnswered(originalIndex) : false;
      
      if (showAnswered && isAnswered) {
        shouldInclude = true;
      }
      
      if (showUnanswered && !isAnswered) {
        shouldInclude = true;
      }
      
      // Check favorites status
      if (showFavorites) {
        const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
          window.isQuestionFavorite(originalIndex) : false;
        
        if (isFavorite) {
          shouldInclude = true;
        }
      }
      
      return shouldInclude;
    });
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error applying status filters:", error);
    }
    return baseQuestions || allQuestions;
  }
}

/**
 * Apply all current filters
 */
function applyCurrentFilters() {
  try {
    let baseQuestions = allQuestions;
    
    // Apply text search first if active
    if (isSearchActive && filteredQuestions.length >= 0) {
      baseQuestions = filteredQuestions;
    }
    
    // Apply status filters
    const finalResults = applyStatusFilters(baseQuestions);
    
    // Update current questions
    window.currentQuestions = finalResults;
    
    // Update filter counts
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔍 Applied filters: ${finalResults.length}/${allQuestions.length} questions`);
    }
    
    return finalResults;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error applying current filters:", error);
    }
    return allQuestions;
  }
}

/**
 * Reset all filters
 */
function resetAllFilters() {
  try {
    // Clear search input
    const searchInput = document.getElementById("questionSearch");
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Clear filter checkboxes
    const filterCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    filterCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = false;
      }
    });
    
    // Reset search state
    resetSearchState();
    
    // Update filter counts
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog("🗑️ All filters reset");
    }
    
    return window.currentQuestions;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resetting all filters:", error);
    }
    return allQuestions;
  }
}

// ===========================
// AUTO-COMPLETION
// ===========================

/**
 * Get question number suggestions for auto-completion
 */
function getQuestionNumberSuggestions(input) {
  try {
    if (!input || typeof input !== 'string') {
      return [];
    }
    
    const query = input.trim();
    if (query === '') {
      return [];
    }
    
    // Convert to number if it's a numeric input
    const numericQuery = parseInt(query, 10);
    
    const suggestions = [];
    
    // Look for question numbers that start with the query
    for (let i = 0; i < allQuestions.length; i++) {
      const question = allQuestions[i];
      const questionNumber = question.question_number || (i + 1);
      
      // Check if question number starts with query
      if (questionNumber.toString().startsWith(query)) {
        suggestions.push({
          questionNumber: questionNumber,
          questionIndex: i,
          text: `Question ${questionNumber}`,
          preview: (question.question || '').substring(0, 60) + '...'
        });
        
        // Limit to 5 suggestions
        if (suggestions.length >= 5) {
          break;
        }
      }
    }
    
    return suggestions;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting question number suggestions:", error);
    }
    return [];
  }
}

/**
 * Show auto-completion suggestions
 */
function showAutocompleteSuggestions(suggestions, inputElement) {
  try {
    // Remove existing suggestions
    if (typeof window.hideAutocompleteSuggestions === 'function') {
      window.hideAutocompleteSuggestions();
    }
    
    if (!suggestions || suggestions.length === 0) {
      return;
    }
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'autocompleteSuggestions';
    suggestionsContainer.className = 'autocomplete-suggestions';
    suggestionsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    `;
    
    // Add suggestions
    suggestions.forEach((suggestion, index) => {
      const suggestionElement = document.createElement('div');
      suggestionElement.className = 'autocomplete-suggestion';
      suggestionElement.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s;
      `;
      
      suggestionElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 2px;">${suggestion.text}</div>
        <div style="font-size: 0.85em; color: var(--text-muted); line-height: 1.2;">${suggestion.preview}</div>
      `;
      
      // Add hover effects
      suggestionElement.addEventListener('mouseenter', () => {
        suggestionElement.style.backgroundColor = 'var(--hover-color)';
      });
      
      suggestionElement.addEventListener('mouseleave', () => {
        suggestionElement.style.backgroundColor = 'transparent';
      });
      
      // Add click handler
      suggestionElement.addEventListener('click', () => {
        if (typeof window.navigateToQuestionIndex === 'function') {
          window.navigateToQuestionIndex(suggestion.questionIndex);
        }
        if (typeof window.hideAutocompleteSuggestions === 'function') {
          window.hideAutocompleteSuggestions();
        }
      });
      
      suggestionsContainer.appendChild(suggestionElement);
    });
    
    // Position relative to input
    const inputRect = inputElement.getBoundingClientRect();
    const parentElement = inputElement.parentElement;
    parentElement.style.position = 'relative';
    parentElement.appendChild(suggestionsContainer);
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing autocomplete suggestions:", error);
    }
  }
}


// ===========================
// FILTER STATISTICS
// ===========================

/**
 * Update filter counts display
 */
function updateFilterCounts() {
  try {
    if (!allQuestions.length) {
      return;
    }
    
    let answeredCount = 0;
    let unansweredCount = 0;
    let favoritesCount = 0;
    
    // Count different question types
    allQuestions.forEach((question, index) => {
      const isAnswered = typeof window.isQuestionAnswered === 'function' ? 
        window.isQuestionAnswered(index) : false;
      const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
        window.isQuestionFavorite(index) : false;
      
      if (isAnswered) {
        answeredCount++;
      } else {
        unansweredCount++;
      }
      
      if (isFavorite) {
        favoritesCount++;
      }
    });
    
    // Update filter labels with counts
    const filterLabels = {
      'filterAnsweredLabel': `Answered (${answeredCount})`,
      'filterUnansweredLabel': `Unanswered (${unansweredCount})`,
      'filterFavoritesLabel': `Favorites (${favoritesCount})`
    };
    
    Object.entries(filterLabels).forEach(([labelId, text]) => {
      const label = document.getElementById(labelId);
      if (label) {
        label.textContent = text;
      }
    });
    
    // Update total count
    const totalCountElement = document.getElementById('totalQuestionsCount');
    if (totalCountElement) {
      totalCountElement.textContent = `Total: ${window.currentQuestions?.length || 0}/${allQuestions.length}`;
    }
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating filter counts:", error);
    }
  }
}

// ===========================
// SEARCH EVENT HANDLERS
// ===========================

/**
 * Handle search input changes
 */
function handleSearchInput(event) {
  try {
    const query = event.target.value;
    
    // Apply text search
    applyTextSearch(query);
    
    // Show autocomplete for question numbers
    if (query && /^\d+$/.test(query.trim())) {
      const suggestions = getQuestionNumberSuggestions(query);
      if (suggestions.length > 0) {
        if (typeof window.showQuestionNumberSuggestions === 'function') {
          window.showQuestionNumberSuggestions(suggestions, event.target);
        } else {
          showAutocompleteSuggestions(suggestions, event.target);
        }
      } else {
        if (typeof window.hideAutocompleteSuggestions === 'function') {
          window.hideAutocompleteSuggestions();
        }
      }
    } else {
      if (typeof window.hideAutocompleteSuggestions === 'function') {
        window.hideAutocompleteSuggestions();
      }
    }
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling search input:", error);
    }
  }
}

/**
 * Handle filter checkbox changes
 */
function handleFilterChange() {
  try {
    applyCurrentFilters();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling filter change:", error);
    }
  }
}

/**
 * Setup search event listeners
 */
function setupSearchEventListeners() {
  try {
    // Search input
    const searchInput = document.getElementById("questionSearch");
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('focus', () => {
        if (searchInput.value && /^\d+$/.test(searchInput.value.trim())) {
          const suggestions = getQuestionNumberSuggestions(searchInput.value);
          if (suggestions.length > 0) {
            showAutocompleteSuggestions(suggestions, searchInput);
          }
        }
      });
      searchInput.addEventListener('blur', () => {
        // Delay hiding to allow for clicks on suggestions
        setTimeout(() => {
          if (typeof window.hideAutocompleteSuggestions === 'function') {
            window.hideAutocompleteSuggestions();
          }
        }, 200);
      });
    }
    
    // Filter checkboxes
    const filterCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    filterCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener('change', handleFilterChange);
      }
    });
    
    // Reset filters button
    const resetButton = document.getElementById("resetFilters");
    if (resetButton) {
      resetButton.addEventListener('click', resetAllFilters);
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog("🔍 Search event listeners set up");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up search event listeners:", error);
    }
  }
}

// ===========================
// PUBLIC API
// ===========================

/**
 * Get current search state
 */
function getSearchState() {
  return {
    isSearchActive,
    totalQuestions: allQuestions.length,
    filteredQuestions: window.currentQuestions?.length || 0,
    cacheSize: Object.keys(searchCache).length
  };
}

/**
 * Clear search cache
 */
function clearSearchCache() {
  searchCache = {};
  if (typeof window.devLog === 'function') {
    window.devLog("🗑️ Search cache cleared");
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all search functions for use in other modules
export {
  // Search state management
  initializeSearchInterface,
  resetSearchState,
  getSearchState,
  clearSearchCache,
  
  // Text search functions
  searchQuestions,
  applyTextSearch,
  
  // Status filters
  applyStatusFilters,
  applyCurrentFilters,
  resetAllFilters,
  
  // Auto-completion
  getQuestionNumberSuggestions,
  showAutocompleteSuggestions,
  
  // Filter statistics
  updateFilterCounts,
  
  // Event handlers
  handleSearchInput,
  handleFilterChange,
  setupSearchEventListeners,
};