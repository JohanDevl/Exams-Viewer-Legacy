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
 * Reset search interface for new exam
 */
function resetSearchInterface() {
  try {
    // Force sync with global questions data for new exam
    allQuestions = [...(window.currentQuestions || [])];
    
    // Reset search state completely
    isSearchActive = false;
    filteredQuestions = [];
    searchCache = {};
    
    // Clear search input
    const searchInput = document.getElementById("questionSearch");
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Reset all filter checkboxes
    const filterCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    filterCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = false;
        const label = checkbox.closest('.filter-checkbox');
        if (label) {
          label.classList.remove('checked');
        }
      }
    });
    
    // Clear category filters
    const categoryCheckboxes = document.querySelectorAll('#categoryFilterOptions input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      const label = checkbox.closest('.filter-checkbox');
      if (label) {
        label.classList.remove('checked');
      }
    });
    
    // Update current questions reference
    window.currentQuestions = [...allQuestions];
    
    // Update filter counts with new data
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔄 Search interface reset for new exam with ${allQuestions.length} questions`);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resetting search interface:", error);
    }
  }
}

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
    resetSearchUI();
    
    // Setup toggle search button event listener
    const toggleSearchBtn = document.getElementById('toggleSearchBtn');
    const searchHeader = document.getElementById('searchHeader');
    const searchContent = document.getElementById('searchContent');
    
    if (toggleSearchBtn && searchContent) {
      // Function to toggle search content
      const toggleSearchContent = () => {
        const currentToggleBtn = document.getElementById('toggleSearchBtn'); // Get fresh reference
        const isCollapsed = searchContent.classList.contains('collapsed');
        
        if (isCollapsed) {
          // Expand search content
          searchContent.classList.remove('collapsed');
          currentToggleBtn.classList.remove('collapsed');
          
          if (typeof window.devLog === 'function') {
            window.devLog('🔍 Advanced search section expanded');
          }
        } else {
          // Collapse search content
          searchContent.classList.add('collapsed');
          currentToggleBtn.classList.add('collapsed');
          
          if (typeof window.devLog === 'function') {
            window.devLog('🔍 Advanced search section collapsed');
          }
        }
      };
      
      // Remove existing event listeners to avoid duplicates
      toggleSearchBtn.replaceWith(toggleSearchBtn.cloneNode(true));
      const newToggleBtn = document.getElementById('toggleSearchBtn');
      
      // Ensure the button state matches the content state
      if (searchContent.classList.contains('collapsed')) {
        newToggleBtn.classList.add('collapsed');
      } else {
        newToggleBtn.classList.remove('collapsed');
      }
      
      // Add event listener to toggle button
      newToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        toggleSearchContent();
      });
      
      // Add event listener to header (clickable header)
      if (searchHeader) {
        searchHeader.style.cursor = 'pointer';
        searchHeader.addEventListener('click', (e) => {
          // Only toggle if clicked on header, not on button
          if (e.target !== newToggleBtn && !newToggleBtn.contains(e.target)) {
            toggleSearchContent();
          }
        });
      }
      
      if (typeof window.devLog === 'function') {
        window.devLog('🔍 Toggle search events added (button and header clickable)');
      }
    }
    
    // Setup reset filters button
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
    
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
 * Reset search UI and filters (UI-specific reset, not state management)
 */
function resetSearchUI() {
  try {
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
      window.devLog("🔄 Search UI reset");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error resetting search UI:", error);
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
      
      // Search in comments/explanations - handle different data types
      let commentsText = '';
      if (question.comments) {
        if (typeof question.comments === 'string') {
          commentsText = question.comments.toLowerCase();
        } else if (Array.isArray(question.comments)) {
          commentsText = question.comments.join(' ').toLowerCase();
        } else if (typeof question.comments === 'object') {
          commentsText = JSON.stringify(question.comments).toLowerCase();
        }
      }
      
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
    
    // Update filter counts when search results change (before applying status filters)
    updateFilterCounts();
    
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
    
    // Get status filter states
    const showAnswered = document.getElementById("filterAnswered")?.checked || false;
    const showUnanswered = document.getElementById("filterUnanswered")?.checked || false;
    const showFavorites = document.getElementById("filterFavorites")?.checked || false;
    
    // Get active category filters
    const activeCategoryFilters = [];
    const categoryCheckboxes = document.querySelectorAll('#categoryFilterOptions input[type="checkbox"]:checked');
    categoryCheckboxes.forEach(checkbox => {
      if (checkbox.dataset.category) {
        activeCategoryFilters.push(checkbox.dataset.category);
      }
    });
    
    // If no filters are active, return all questions
    const hasStatusFilters = showAnswered || showUnanswered || showFavorites;
    const hasCategoryFilters = activeCategoryFilters.length > 0;
    
    if (!hasStatusFilters && !hasCategoryFilters) {
      return questionsToFilter;
    }
    
    return questionsToFilter.filter((question, index) => {
      // Find the original index in allQuestions
      const originalIndex = allQuestions.findIndex(q => 
        q.question_number === question.question_number ||
        (q.question === question.question && q.answers?.length === question.answers?.length)
      );
      
      if (originalIndex === -1) return false;
      
      let shouldIncludeByStatus = !hasStatusFilters; // Include by default if no status filters
      let shouldIncludeByCategory = !hasCategoryFilters; // Include by default if no category filters
      
      // Check status filters (OR logic)
      if (hasStatusFilters) {
        // For filters, only check answers from current session
        const isAnswered = typeof window.isQuestionAnsweredInCurrentSession === 'function' ? 
          window.isQuestionAnsweredInCurrentSession(originalIndex) : false;
        const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
          window.isQuestionFavorite(originalIndex) : false;
        
        shouldIncludeByStatus = 
          (showAnswered && isAnswered) ||
          (showUnanswered && !isAnswered) ||
          (showFavorites && isFavorite);
      }
      
      // Check category filters (OR logic)
      if (hasCategoryFilters) {
        const questionCategory = typeof window.getQuestionCategory === 'function' ? 
          window.getQuestionCategory(originalIndex) : null;
        
        shouldIncludeByCategory = questionCategory && activeCategoryFilters.includes(questionCategory);
      }
      
      // Both status and category filters must pass (AND logic between filter types)
      return shouldIncludeByStatus && shouldIncludeByCategory;
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
    
    // Update the display with filtered questions
    if (typeof window.displayCurrentQuestion === 'function') {
      // If we have results, go to the first question
      if (finalResults.length > 0) {
        window.currentQuestionIndex = 0;
        window.displayCurrentQuestion();
      }
    }
    
    // Update navigation UI
    if (typeof window.updateProgressSidebar === 'function') {
      window.updateProgressSidebar();
    }
    if (typeof window.updateProgressBar === 'function') {
      window.updateProgressBar();
    }
    
    // Update results count display
    updateSearchResultsDisplay(finalResults.length, allQuestions.length);
    
    // Don't update filter counts here - they should only update when search changes or data changes
    // not when status filters are applied
    
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
 * Update search results display
 */
function updateSearchResultsDisplay(filteredCount, totalCount) {
  try {
    const searchResultsCount = document.getElementById('searchResultsCount');
    if (searchResultsCount) {
      if (filteredCount === totalCount) {
        searchResultsCount.textContent = 'Showing all questions';
      } else {
        searchResultsCount.textContent = `Showing ${filteredCount} of ${totalCount} questions`;
      }
    }
    
    // Show/hide reset filters button based on whether filters are active
    updateResetFiltersButtonVisibility();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating search results display:", error);
    }
  }
}

/**
 * Update reset filters button visibility
 */
function updateResetFiltersButtonVisibility() {
  try {
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (!resetFiltersBtn) return;
    
    // Check if any filters are active
    const searchInput = document.getElementById("questionSearch");
    const hasSearchText = searchInput?.value && searchInput.value.trim() !== '';
    
    const statusCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    const hasStatusFilters = statusCheckboxes.some(id => {
      const checkbox = document.getElementById(id);
      return checkbox?.checked;
    });
    
    const categoryCheckboxes = document.querySelectorAll('#categoryFilterOptions input[type="checkbox"]:checked');
    const hasCategoryFilters = categoryCheckboxes.length > 0;
    
    // Show button if any filters are active
    if (hasSearchText || hasStatusFilters || hasCategoryFilters) {
      resetFiltersBtn.style.display = 'inline-flex';
    } else {
      resetFiltersBtn.style.display = 'none';
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating reset filters button visibility:", error);
    }
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
        // Remove checked class from parent label
        const label = checkbox.closest('.filter-checkbox');
        if (label) {
          label.classList.remove('checked');
        }
      }
    });
    
    // Clear category filter checkboxes
    const categoryCheckboxes = document.querySelectorAll('#categoryFilterOptions input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      // Remove checked class from parent label
      const label = checkbox.closest('.filter-checkbox');
      if (label) {
        label.classList.remove('checked');
      }
    });
    
    // Reset search state
    isSearchActive = false;
    filteredQuestions = [];
    window.currentQuestions = [...allQuestions];
    
    // Reset search UI
    resetSearchUI();
    
    // Update display
    if (typeof window.displayCurrentQuestion === 'function') {
      window.currentQuestionIndex = 0;
      window.displayCurrentQuestion();
    }
    
    // Update navigation UI
    if (typeof window.updateProgressSidebar === 'function') {
      window.updateProgressSidebar();
    }
    if (typeof window.updateProgressBar === 'function') {
      window.updateProgressBar();
    }
    
    // Update results count display
    updateSearchResultsDisplay(allQuestions.length, allQuestions.length);
    
    // Update filter counts to show all questions
    updateFilterCounts();
    
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
    const categoryCounts = {};
    
    // For status filters, always count based on search results (not applied filters)
    // This shows what's available to filter, not what's already filtered
    const questionsToCount = isSearchActive && filteredQuestions.length >= 0 ? filteredQuestions : allQuestions;
    const currentCount = questionsToCount.length;
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🔢 Updating filter counts for ${currentCount} questions (search active: ${isSearchActive})`);
    }
    
    // Count different question types on the currently visible/searched questions
    questionsToCount.forEach((question, questionIndex) => {
      // Find the original index in allQuestions for status checking
      const originalIndex = allQuestions.findIndex(q => 
        q.question_number === question.question_number ||
        (q.question === question.question && q.answers?.length === question.answers?.length)
      );
      
      if (originalIndex === -1) return; // Skip if can't find original
      
      // For filters, only count answers from current session
      const isAnswered = typeof window.isQuestionAnsweredInCurrentSession === 'function' ? 
        window.isQuestionAnsweredInCurrentSession(originalIndex) : false;
      const isFavorite = typeof window.isQuestionFavorite === 'function' ? 
        window.isQuestionFavorite(originalIndex) : false;
      const category = typeof window.getQuestionCategory === 'function' ? 
        window.getQuestionCategory(originalIndex) : null;
      
      if (isAnswered) {
        answeredCount++;
      } else {
        unansweredCount++;
      }
      
      if (isFavorite) {
        favoritesCount++;
      }
      
      // Count categories
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    // Update filter counts in spans
    const answeredCountSpan = document.getElementById('answeredCount');
    const unansweredCountSpan = document.getElementById('unansweredCount');
    const favoritesCountSpan = document.getElementById('favoritesCount');
    
    if (answeredCountSpan) {
      answeredCountSpan.textContent = answeredCount;
    }
    if (unansweredCountSpan) {
      unansweredCountSpan.textContent = unansweredCount;
    }
    if (favoritesCountSpan) {
      favoritesCountSpan.textContent = favoritesCount;
    }
    
    // Update category filters
    updateCategoryFilters(categoryCounts);
    
    // Update total count to reflect current search/filter results
    const totalCountElement = document.getElementById('totalQuestionsCount');
    if (totalCountElement) {
      const totalCount = allQuestions.length;
      totalCountElement.textContent = `Total: ${currentCount}/${totalCount}`;
    }
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating filter counts:", error);
    }
  }
}

/**
 * Calculate category counts for filters
 */
function calculateCategoryCounts() {
  try {
    const categoryCounts = {};
    const questionsToCount = isSearchActive && filteredQuestions.length >= 0 ? filteredQuestions : allQuestions;
    
    questionsToCount.forEach((question, index) => {
      const category = typeof window.getQuestionCategory === 'function' 
        ? window.getQuestionCategory(window.currentExamCode, question.question_number) 
        : null;
      
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    return categoryCounts;
  } catch (error) {
    console.error("Error calculating category counts:", error);
    return {};
  }
}

/**
 * Update category filters dynamically
 */
function updateCategoryFilters(categoryCounts) {
  try {
    const categoryFilterGroup = document.getElementById('categoryFilterGroup');
    const categoryFilterOptions = document.getElementById('categoryFilterOptions');
    
    if (!categoryFilterGroup || !categoryFilterOptions) {
      return;
    }
    
    // If no categoryCounts provided, calculate them
    if (!categoryCounts || typeof categoryCounts !== 'object') {
      categoryCounts = calculateCategoryCounts();
    }
    
    // Save current checkbox states before clearing
    const currentStates = {};
    const existingCheckboxes = categoryFilterOptions.querySelectorAll('input[type="checkbox"]');
    existingCheckboxes.forEach(checkbox => {
      if (checkbox.dataset.category) {
        currentStates[checkbox.dataset.category] = checkbox.checked;
      }
    });
    
    // Clear existing category filters
    categoryFilterOptions.innerHTML = '';
    
    // Show/hide category group based on whether there are categories
    const hasCategories = Object.keys(categoryCounts || {}).length > 0;
    categoryFilterGroup.style.display = hasCategories ? 'block' : 'none';
    
    if (!hasCategories) {
      return;
    }
    
    // Create category filter checkboxes
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const checkboxLabel = document.createElement('label');
      checkboxLabel.className = 'filter-checkbox';
      
      const checkboxId = `filterCategory${category.replace(/\s+/g, '')}`;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = checkboxId;
      checkbox.dataset.category = category;
      
      // Restore previous checked state if it existed
      if (currentStates[category]) {
        checkbox.checked = true;
        checkboxLabel.classList.add('checked');
      }
      
      // Important: Set the 'for' attribute to associate label with checkbox
      checkboxLabel.setAttribute('for', checkboxId);
      
      const checkmark = document.createElement('span');
      checkmark.className = 'checkmark';
      
      const filterText = document.createElement('span');
      filterText.className = 'filter-text';
      filterText.textContent = category;
      
      const filterCount = document.createElement('span');
      filterCount.className = 'filter-count';
      filterCount.textContent = count;
      
      // The order is important for CSS: checkbox, checkmark, text, count
      checkboxLabel.appendChild(checkbox);
      checkboxLabel.appendChild(checkmark);
      checkboxLabel.appendChild(filterText);
      checkboxLabel.appendChild(filterCount);
      
      // Add event listener for category filter
      checkbox.addEventListener('change', (e) => {
        // Toggle checked class on label
        if (e.target.checked) {
          checkboxLabel.classList.add('checked');
        } else {
          checkboxLabel.classList.remove('checked');
        }
        handleFilterChange();
      });
      
      categoryFilterOptions.appendChild(checkboxLabel);
    });
    
    if (typeof window.devLog === 'function') {
      window.devLog(`🏷️ Updated category filters: ${Object.keys(categoryCounts).join(', ')}`);
    }
    
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating category filters:", error);
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
    
    // Update reset button visibility
    updateResetFiltersButtonVisibility();
    
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
    updateResetFiltersButtonVisibility();
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
    
    // Search button
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById("questionSearch");
        if (searchInput) {
          handleSearchInput({ target: searchInput });
        }
      });
    }
    
    // Clear search button
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById("questionSearch");
        if (searchInput) {
          searchInput.value = '';
          handleSearchInput({ target: searchInput });
        }
      });
    }
    
    // Filter checkboxes
    const filterCheckboxes = ['filterAnswered', 'filterUnanswered', 'filterFavorites'];
    filterCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          // Toggle checked class on parent label
          const label = e.target.closest('.filter-checkbox');
          if (label) {
            if (e.target.checked) {
              label.classList.add('checked');
            } else {
              label.classList.remove('checked');
            }
          }
          handleFilterChange();
        });
      }
    });
    
    // Reset filters button
    const resetButton = document.getElementById("resetFiltersBtn");
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
  resetSearchInterface,
  resetSearchUI,
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
  updateCategoryFilters,
  updateSearchResultsDisplay,
  updateResetFiltersButtonVisibility,
  
  // Event handlers
  handleSearchInput,
  handleFilterChange,
  setupSearchEventListeners,
};