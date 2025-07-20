/**
 * Favorites & Notes System Module
 * 
 * Handles favorites management, custom categories, notes system, and revision mode
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: favoritesData, currentQuestions, currentExam, currentQuestionIndex
 * - External functions: saveFavorites, updateProgressSidebar, updateFilterCounts, 
 *   showSuccess, showError, devLog, devError
 */

// ===========================
// FAVORITES MANAGEMENT
// ===========================

/**
 * Toggle favorite status for a question
 */
function toggleQuestionFavorite(questionIndex, category = 'Important') {
  try {
    if (!window.currentExam || !window.currentQuestions) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot toggle favorite: no exam or questions loaded");
      }
      return false;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot toggle favorite: exam code not found");
      }
      return false;
    }

    // Initialize favorites for exam if not exists
    if (!window.favoritesData.favorites[examCode]) {
      window.favoritesData.favorites[examCode] = {};
    }

    const questionNumber = questionIndex + 1; // Convert to 1-based
    const currentFavorite = window.favoritesData.favorites[examCode][questionNumber];

    if (currentFavorite && currentFavorite.isFavorite) {
      // Remove from favorites
      delete window.favoritesData.favorites[examCode][questionNumber];
      
      if (typeof window.devLog === 'function') {
        window.devLog(`⭐ Removed question ${questionNumber} from favorites`);
      }
    } else {
      // Add to favorites
      window.favoritesData.favorites[examCode][questionNumber] = {
        isFavorite: true,
        category: category,
        note: currentFavorite?.note || '',
        dateAdded: Date.now(),
        lastModified: Date.now(),
      };
      
      if (typeof window.devLog === 'function') {
        window.devLog(`⭐ Added question ${questionNumber} to favorites (${category})`);
      }
    }

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    // Update UI if functions available
    if (typeof window.updateProgressSidebar === 'function') {
      window.updateProgressSidebar();
    }
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error toggling question favorite:", error);
    }
    return false;
  }
}

/**
 * Check if a question is marked as favorite
 */
function isQuestionFavorite(questionIndex) {
  try {
    if (!window.currentExam || !window.favoritesData?.favorites) {
      return false;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) return false;

    const questionNumber = questionIndex + 1; // Convert to 1-based
    const favorite = window.favoritesData.favorites[examCode]?.[questionNumber];
    
    return favorite?.isFavorite || false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error checking if question is favorite:", error);
    }
    return false;
  }
}

/**
 * Get favorite data for a question
 */
function getQuestionFavoriteData(questionIndex) {
  try {
    if (!window.currentExam || !window.favoritesData?.favorites) {
      return null;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) return null;

    const questionNumber = questionIndex + 1; // Convert to 1-based
    return window.favoritesData.favorites[examCode]?.[questionNumber] || null;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting question favorite data:", error);
    }
    return null;
  }
}

/**
 * Get all favorites for current exam
 */
function getCurrentExamFavorites() {
  try {
    if (!window.currentExam || !window.favoritesData?.favorites) {
      return {};
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) return {};

    return window.favoritesData.favorites[examCode] || {};
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting current exam favorites:", error);
    }
    return {};
  }
}

// ===========================
// NOTES MANAGEMENT
// ===========================

/**
 * Add or update note for a question
 */
function updateQuestionNote(questionIndex, note) {
  try {
    if (!window.currentExam) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot update note: no exam loaded");
      }
      return false;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot update note: exam code not found");
      }
      return false;
    }

    // Initialize favorites for exam if not exists
    if (!window.favoritesData.favorites[examCode]) {
      window.favoritesData.favorites[examCode] = {};
    }

    const questionNumber = questionIndex + 1; // Convert to 1-based
    const currentFavorite = window.favoritesData.favorites[examCode][questionNumber];

    if (note.trim() === '') {
      // Remove note if empty and not a favorite
      if (currentFavorite && !currentFavorite.isFavorite) {
        delete window.favoritesData.favorites[examCode][questionNumber];
      } else if (currentFavorite) {
        currentFavorite.note = '';
        currentFavorite.lastModified = Date.now();
      }
    } else {
      // Add or update note
      if (currentFavorite) {
        currentFavorite.note = note.trim();
        currentFavorite.lastModified = Date.now();
      } else {
        window.favoritesData.favorites[examCode][questionNumber] = {
          isFavorite: false,
          category: 'Important',
          note: note.trim(),
          dateAdded: Date.now(),
          lastModified: Date.now(),
        };
      }
    }

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`📝 Updated note for question ${questionNumber}`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating question note:", error);
    }
    return false;
  }
}

/**
 * Get note for a question
 */
function getQuestionNote(questionIndex) {
  try {
    if (!window.currentExam || !window.favoritesData?.favorites) {
      return '';
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) return '';

    const questionNumber = questionIndex + 1; // Convert to 1-based
    const favorite = window.favoritesData.favorites[examCode]?.[questionNumber];
    
    return favorite?.note || '';
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting question note:", error);
    }
    return '';
  }
}

// ===========================
// CATEGORIES MANAGEMENT
// ===========================

/**
 * Add a custom category
 */
function addCustomCategory(categoryName) {
  try {
    if (!categoryName || typeof categoryName !== 'string') {
      if (typeof window.showError === 'function') {
        window.showError("Category name is required");
      }
      return false;
    }

    const trimmedName = categoryName.trim();
    if (trimmedName.length === 0) {
      if (typeof window.showError === 'function') {
        window.showError("Category name cannot be empty");
      }
      return false;
    }

    // Check if category already exists (case insensitive)
    const allCategories = [...window.favoritesData.categories, ...window.favoritesData.customCategories];
    const categoryExists = allCategories.some(cat => 
      cat.toLowerCase() === trimmedName.toLowerCase()
    );

    if (categoryExists) {
      if (typeof window.showError === 'function') {
        window.showError("Category already exists");
      }
      return false;
    }

    // Add to custom categories
    window.favoritesData.customCategories.push(trimmedName);

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`📁 Added custom category: ${trimmedName}`);
    }

    if (typeof window.showSuccess === 'function') {
      window.showSuccess(`Category "${trimmedName}" added successfully`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error adding custom category:", error);
    }
    return false;
  }
}

/**
 * Remove a custom category
 */
function removeCustomCategory(categoryName) {
  try {
    const index = window.favoritesData.customCategories.indexOf(categoryName);
    if (index === -1) {
      if (typeof window.showError === 'function') {
        window.showError("Category not found");
      }
      return false;
    }

    // Remove from custom categories
    window.favoritesData.customCategories.splice(index, 1);

    // Update all favorites using this category to default category
    Object.values(window.favoritesData.favorites).forEach(examFavorites => {
      Object.values(examFavorites).forEach(favorite => {
        if (favorite.category === categoryName) {
          favorite.category = 'Important'; // Reset to default
          favorite.lastModified = Date.now();
        }
      });
    });

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`🗑️ Removed custom category: ${categoryName}`);
    }

    if (typeof window.showSuccess === 'function') {
      window.showSuccess(`Category "${categoryName}" removed successfully`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error removing custom category:", error);
    }
    return false;
  }
}

/**
 * Get all available categories (default + custom)
 */
function getAllCategories() {
  try {
    return [...window.favoritesData.categories, ...window.favoritesData.customCategories];
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting all categories:", error);
    }
    return ['Important', 'Review', 'Difficult']; // Fallback to defaults
  }
}

/**
 * Update question category
 */
function updateQuestionCategory(questionIndex, newCategory) {
  try {
    if (!window.currentExam) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot update category: no exam loaded");
      }
      return false;
    }

    const examCode = window.currentExam.exam_code || window.currentExam.code;
    if (!examCode) return false;

    const questionNumber = questionIndex + 1; // Convert to 1-based
    const favorite = window.favoritesData.favorites[examCode]?.[questionNumber];

    if (!favorite) {
      if (typeof window.devError === 'function') {
        window.devError("Cannot update category: question is not a favorite");
      }
      return false;
    }

    // Verify category exists
    const allCategories = getAllCategories();
    if (!allCategories.includes(newCategory)) {
      if (typeof window.devError === 'function') {
        window.devError(`Category "${newCategory}" does not exist`);
      }
      return false;
    }

    // Update category
    favorite.category = newCategory;
    favorite.lastModified = Date.now();

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`📁 Updated question ${questionNumber} category to: ${newCategory}`);
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating question category:", error);
    }
    return false;
  }
}

// ===========================
// REVISION MODE
// ===========================

/**
 * Toggle revision mode
 */
function toggleRevisionMode() {
  try {
    window.favoritesData.isRevisionMode = !window.favoritesData.isRevisionMode;

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog(`🔄 Revision mode: ${window.favoritesData.isRevisionMode ? 'ON' : 'OFF'}`);
    }

    // Update UI if functions available
    if (typeof window.updateFilterCounts === 'function') {
      window.updateFilterCounts();
    }

    return window.favoritesData.isRevisionMode;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error toggling revision mode:", error);
    }
    return false;
  }
}

/**
 * Update revision filter settings
 */
function updateRevisionFilter(filterSettings) {
  try {
    if (!filterSettings || typeof filterSettings !== 'object') {
      if (typeof window.devError === 'function') {
        window.devError("Invalid filter settings");
      }
      return false;
    }

    // Update filter settings
    Object.assign(window.favoritesData.revisionFilter, filterSettings);

    // Save to localStorage
    if (typeof window.saveFavorites === 'function') {
      window.saveFavorites();
    }

    if (typeof window.devLog === 'function') {
      window.devLog("🔍 Updated revision filter settings");
    }

    return true;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating revision filter:", error);
    }
    return false;
  }
}

/**
 * Get filtered questions based on revision settings
 */
function getFilteredQuestions() {
  try {
    if (!window.favoritesData.isRevisionMode || !window.currentQuestions) {
      return window.currentQuestions || [];
    }

    const examFavorites = getCurrentExamFavorites();
    const filter = window.favoritesData.revisionFilter;

    return window.currentQuestions.filter((question, index) => {
      const questionNumber = index + 1;
      const favorite = examFavorites[questionNumber];

      if (!favorite) return false; // Not a favorite or has notes

      // Check favorite filter
      if (filter.showFavorites && favorite.isFavorite) {
        // Check category filter
        if (filter.showCategories.length === 0 || 
            filter.showCategories.includes(favorite.category)) {
          return true;
        }
      }

      // Check notes filter
      if (filter.showNotes && favorite.note && favorite.note.trim() !== '') {
        return true;
      }

      return false;
    });
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting filtered questions:", error);
    }
    return window.currentQuestions || [];
  }
}

// ===========================
// STATISTICS & ANALYTICS
// ===========================

/**
 * Get favorites statistics for current exam
 */
function getFavoritesStats() {
  try {
    const examFavorites = getCurrentExamFavorites();
    const stats = {
      totalFavorites: 0,
      categoryCounts: {},
      totalNotes: 0,
      recentlyAdded: [],
    };

    // Initialize category counts
    getAllCategories().forEach(category => {
      stats.categoryCounts[category] = 0;
    });

    // Process favorites
    Object.values(examFavorites).forEach(favorite => {
      if (favorite.isFavorite) {
        stats.totalFavorites++;
        stats.categoryCounts[favorite.category] = (stats.categoryCounts[favorite.category] || 0) + 1;
      }

      if (favorite.note && favorite.note.trim() !== '') {
        stats.totalNotes++;
      }

      // Recent favorites (added in last 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (favorite.dateAdded && favorite.dateAdded > weekAgo) {
        stats.recentlyAdded.push(favorite);
      }
    });

    return stats;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error getting favorites stats:", error);
    }
    return {
      totalFavorites: 0,
      categoryCounts: {},
      totalNotes: 0,
      recentlyAdded: [],
    };
  }
}

// ===========================
// DATA CLEANUP
// ===========================

/**
 * Clean obsolete favorites data
 */
function cleanupObsoleteData() {
  try {
    let cleanupCount = 0;

    // Remove empty exam objects
    Object.keys(window.favoritesData.favorites).forEach(examCode => {
      const examFavorites = window.favoritesData.favorites[examCode];
      
      if (!examFavorites || Object.keys(examFavorites).length === 0) {
        delete window.favoritesData.favorites[examCode];
        cleanupCount++;
      } else {
        // Remove invalid favorite entries
        Object.keys(examFavorites).forEach(questionNumber => {
          const favorite = examFavorites[questionNumber];
          
          if (!favorite || typeof favorite !== 'object') {
            delete examFavorites[questionNumber];
            cleanupCount++;
          } else {
            // Ensure favorite has required properties
            if (typeof favorite.isFavorite === 'undefined') {
              favorite.isFavorite = false;
            }
            if (!favorite.category) {
              favorite.category = 'Important';
            }
            if (!favorite.note) {
              favorite.note = '';
            }
            if (!favorite.dateAdded) {
              favorite.dateAdded = Date.now();
            }
            if (!favorite.lastModified) {
              favorite.lastModified = Date.now();
            }
          }
        });
      }
    });

    // Remove duplicate custom categories
    window.favoritesData.customCategories = [...new Set(window.favoritesData.customCategories)];

    if (cleanupCount > 0 && typeof window.devLog === 'function') {
      window.devLog(`🧹 Cleaned ${cleanupCount} obsolete favorite entries`);
    }

    return cleanupCount;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error cleaning up obsolete data:", error);
    }
    return 0;
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all favorites functions for use in other modules
export {
  // Favorites management
  toggleQuestionFavorite,
  isQuestionFavorite,
  getQuestionFavoriteData,
  getCurrentExamFavorites,
  
  // Notes management
  updateQuestionNote,
  getQuestionNote,
  
  // Categories management
  addCustomCategory,
  removeCustomCategory,
  getAllCategories,
  updateQuestionCategory,
  
  // Revision mode
  toggleRevisionMode,
  updateRevisionFilter,
  getFilteredQuestions,
  
  // Statistics & analytics
  getFavoritesStats,
  
  // Data cleanup
  cleanupObsoleteData,
};