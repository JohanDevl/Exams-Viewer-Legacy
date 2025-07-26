/**
 * Mobile Navigation System Module
 * 
 * Handles touch gestures, swipe navigation, mobile optimizations, and thumb-friendly controls
 * for Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: currentQuestions, currentQuestionIndex, settings
 * - External functions: navigateQuestion, navigateToRandomQuestion, toggleSidebar, 
 *   closeSidebar, devLog, devError
 */

// ===========================
// TOUCH GESTURE VARIABLES
// ===========================

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isSwiping = false;
let touchStartTime = 0;

// Sidebar swipe tracking
let sidebarTouchStartX = 0;
let sidebarTouchStartY = 0;

// ===========================
// MOBILE TOOLTIPS SYSTEM
// ===========================

/**
 * Setup mobile tooltip handling for touch devices
 */
function setupMobileTooltips() {
  try {
    // Add touch event listeners for tooltips on mobile
    document.addEventListener('touchstart', (e) => {
      const tooltipElement = e.target.closest('[data-tooltip]');
      if (tooltipElement && window.settings?.showTooltips) {
        // Clear any existing focus
        document.querySelectorAll('[data-tooltip]:focus').forEach(el => {
          if (el !== tooltipElement) el.blur();
        });
        
        // Focus the tooltip element to show tooltip
        tooltipElement.focus();
        
        // Auto-hide after 3 seconds on mobile
        setTimeout(() => {
          if (document.activeElement === tooltipElement) {
            tooltipElement.blur();
          }
        }, 3000);
      }
    });
    
    // Hide tooltip when touching outside
    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('[data-tooltip]')) {
        document.querySelectorAll('[data-tooltip]:focus').forEach(el => el.blur());
      }
    });
    
    // Hide tooltips when clicking on tooltip elements
    document.addEventListener('click', (e) => {
      const tooltipElement = e.target.closest('[data-tooltip]');
      if (tooltipElement && window.settings?.showTooltips) {
        tooltipElement.blur();
      }
    });

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Mobile tooltips setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up mobile tooltips:", error);
    }
  }
}

// ===========================
// TOUCH GESTURE NAVIGATION
// ===========================

/**
 * Setup touch gesture navigation
 */
function setupTouchGestures() {
  try {
    const questionSection = document.getElementById('questionSection');
    if (!questionSection) {
      if (typeof window.devError === 'function') {
        window.devError("Question section not found for touch gestures");
      }
      return;
    }

    // Touch start handler
    questionSection.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Touch move handler
    questionSection.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Touch end handler
    questionSection.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Manage swipe indicators
    manageSwipeIndicators();

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Touch gestures setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up touch gestures:", error);
    }
  }
}

/**
 * Handle touch start event
 */
function handleTouchStart(e) {
  try {
    // Only handle single touch
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    isSwiping = false;
    
    // Don't interfere with scrolling or form inputs
    // Allow swipe on question content but not on navigation buttons or forms
    if (e.target.closest('input, textarea, select, .modal, .sidebar, .nav-btn, .mobile-nav-bottom')) {
      return;
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling touch start:", error);
    }
  }
}

/**
 * Handle touch move event
 */
function handleTouchMove(e) {
  try {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Check if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      isSwiping = true;
      
      // Show swipe indicator
      const direction = deltaX > 0 ? 'right' : 'left';
      showSwipeIndicator(direction);
      
      // Prevent default to stop scrolling during swipe
      e.preventDefault();
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling touch move:", error);
    }
  }
}

/**
 * Handle touch end event
 */
async function handleTouchEnd(e) {
  try {
    if (!isSwiping) return;
    
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = Date.now() - touchStartTime;
    
    // Hide swipe indicators
    hideSwipeIndicators();
    
    // Check if swipe meets criteria
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
      // Add haptic feedback
      addHapticFeedback();
      
      if (deltaX > 0) {
        // Swipe right - previous question
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(-1);
        }
      } else {
        // Swipe left - next question
        if (typeof window.navigateQuestion === 'function') {
          await window.navigateQuestion(1);
        }
      }
    }
    
    isSwiping = false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling touch end:", error);
    }
  }
}

// ===========================
// SWIPE INDICATORS
// ===========================

/**
 * Manage swipe indicators based on screen size
 */
function manageSwipeIndicators() {
  try {
    const leftIndicator = document.getElementById('swipeIndicatorLeft');
    const rightIndicator = document.getElementById('swipeIndicatorRight');
    
    if (window.innerWidth <= 480) {
      // Mobile: Create indicators if they don't exist
      if (!leftIndicator || !rightIndicator) {
        createSwipeIndicators();
      }
    } else {
      // Desktop: Remove indicators if they exist
      if (leftIndicator) leftIndicator.remove();
      if (rightIndicator) rightIndicator.remove();
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error managing swipe indicators:", error);
    }
  }
}

/**
 * Create swipe indicators for mobile
 */
function createSwipeIndicators() {
  try {
    // Only create on mobile
    if (window.innerWidth > 480) return;
    
    // Check if indicators already exist
    if (document.getElementById('swipeIndicatorLeft') && document.getElementById('swipeIndicatorRight')) {
      return;
    }
    
    // Create left indicator
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'swipe-indicator left';
    leftIndicator.innerHTML = '← Previous';
    leftIndicator.id = 'swipeIndicatorLeft';
    document.body.appendChild(leftIndicator);
    
    // Create right indicator
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'swipe-indicator right';
    rightIndicator.innerHTML = 'Next →';
    rightIndicator.id = 'swipeIndicatorRight';
    document.body.appendChild(rightIndicator);

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Swipe indicators created");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error creating swipe indicators:", error);
    }
  }
}

/**
 * Show swipe indicator in specified direction
 */
function showSwipeIndicator(direction) {
  try {
    const indicator = document.getElementById(direction === 'left' ? 'swipeIndicatorRight' : 'swipeIndicatorLeft');
    if (indicator) {
      indicator.classList.add('show');
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing swipe indicator:", error);
    }
  }
}

/**
 * Hide all swipe indicators
 */
function hideSwipeIndicators() {
  try {
    const leftIndicator = document.getElementById('swipeIndicatorLeft');
    const rightIndicator = document.getElementById('swipeIndicatorRight');
    
    if (leftIndicator) leftIndicator.classList.remove('show');
    if (rightIndicator) rightIndicator.classList.remove('show');
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error hiding swipe indicators:", error);
    }
  }
}

// ===========================
// HAPTIC FEEDBACK
// ===========================

/**
 * Add haptic feedback for mobile interactions
 */
function addHapticFeedback() {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  } catch (error) {
    // Silently fail for haptic feedback
    if (typeof window.devError === 'function') {
      window.devError("Error adding haptic feedback:", error);
    }
  }
}

// ===========================
// TOUCH FEEDBACK SYSTEM
// ===========================

/**
 * Enhanced touch feedback for buttons
 */
function setupTouchFeedback() {
  try {
    // Add touch feedback class to interactive elements
    const interactiveElements = document.querySelectorAll('.nav-btn, .answer-option, .exam-load-btn, .favorites-actions button, .export-actions button');
    
    interactiveElements.forEach(element => {
      element.classList.add('touch-feedback');
      
      // Add touch feedback for mobile
      element.addEventListener('touchstart', () => {
        addHapticFeedback();
      });
    });

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Touch feedback setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up touch feedback:", error);
    }
  }
}

// ===========================
// MOBILE BOTTOM NAVIGATION
// ===========================

/**
 * Create mobile bottom navigation bar
 */
function createMobileBottomNavigation() {
  try {
    const existingNav = document.getElementById('mobileBottomNav');
    
    // Check if we're on mobile AND in an exam (not on homepage)
    if (window.innerWidth <= 480 && window.currentQuestions?.length > 0) {
      // Create mobile nav if it doesn't exist
      if (!existingNav) {
        const mobileNav = document.createElement('div');
        mobileNav.id = 'mobileBottomNav';
        mobileNav.className = 'mobile-nav-bottom';
        
        mobileNav.innerHTML = `
          <button class="nav-btn touch-feedback" onclick="navigateQuestion(-1)" data-tooltip="Previous Question">
            <i class="fas fa-chevron-left"></i>
            <span>Prev</span>
          </button>
          <button class="nav-btn touch-feedback" onclick="navigateToRandomQuestion()" data-tooltip="Random Question">
            <i class="fas fa-random"></i>
            <span>Random</span>
          </button>
          <button class="nav-btn touch-feedback" onclick="toggleSidebar()" data-tooltip="Progress Sidebar">
            <i class="fas fa-bars"></i>
            <span>Progress</span>
          </button>
          <button class="nav-btn touch-feedback" onclick="navigateQuestion(1)" data-tooltip="Next Question">
            <i class="fas fa-chevron-right"></i>
            <span>Next</span>
          </button>
        `;
        
        document.body.appendChild(mobileNav);

        if (typeof window.devLog === 'function') {
          window.devLog("📱 Mobile bottom navigation created");
        }
      }
    } else {
      // Remove mobile nav if we're on desktop OR on homepage
      if (existingNav) {
        existingNav.remove();
        if (typeof window.devLog === 'function') {
          window.devLog("📱 Mobile bottom navigation removed");
        }
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error creating mobile bottom navigation:", error);
    }
  }
}

// ===========================
// SIDEBAR SWIPE-TO-CLOSE
// ===========================

/**
 * Enhanced sidebar swipe-to-close functionality
 */
function setupSidebarSwipeToClose() {
  try {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
      if (typeof window.devError === 'function') {
        window.devError("Sidebar not found for swipe-to-close setup");
      }
      return;
    }
    
    sidebar.addEventListener('touchstart', (e) => {
      sidebarTouchStartX = e.touches[0].clientX;
      sidebarTouchStartY = e.touches[0].clientY;
    });
    
    sidebar.addEventListener('touchmove', (e) => {
      const deltaX = e.touches[0].clientX - sidebarTouchStartX;
      const deltaY = e.touches[0].clientY - sidebarTouchStartY;
      
      // If swiping left and it's a horizontal swipe
      if (deltaX < -50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        if (typeof window.closeSidebar === 'function') {
          window.closeSidebar();
        }
      }
    });

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Sidebar swipe-to-close setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up sidebar swipe-to-close:", error);
    }
  }
}

// ===========================
// MOBILE RESPONSIVE HANDLING
// ===========================

/**
 * Handle window resize for mobile navigation
 */
function handleMobileResize() {
  try {
    createMobileBottomNavigation();
    manageSwipeIndicators();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling mobile resize:", error);
    }
  }
}

/**
 * Setup mobile resize event listener
 */
function setupMobileResizeListener() {
  try {
    window.addEventListener('resize', handleMobileResize);
    
    if (typeof window.devLog === 'function') {
      window.devLog("📱 Mobile resize listener setup complete");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up mobile resize listener:", error);
    }
  }
}

// ===========================
// MOBILE INITIALIZATION
// ===========================

/**
 * Initialize all mobile navigation features
 */
function initializeMobileNavigation() {
  try {
    // Setup mobile tooltips
    setupMobileTooltips();
    
    // Setup touch gestures
    setupTouchGestures();
    
    // Setup touch feedback
    setupTouchFeedback();
    
    // Setup sidebar swipe-to-close
    setupSidebarSwipeToClose();
    
    // Setup mobile bottom navigation
    createMobileBottomNavigation();
    
    // Setup resize listener
    setupMobileResizeListener();

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Mobile navigation system initialized");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error initializing mobile navigation:", error);
    }
  }
}

/**
 * Check if device is mobile based on screen width
 */
function isMobileDevice() {
  return window.innerWidth <= 480;
}

/**
 * Refresh mobile navigation when exam changes
 */
function refreshMobileNavigation() {
  try {
    // Recreate mobile bottom navigation
    createMobileBottomNavigation();
    
    // Manage swipe indicators
    manageSwipeIndicators();
    
    // Refresh touch feedback for new elements
    setupTouchFeedback();

    if (typeof window.devLog === 'function') {
      window.devLog("📱 Mobile navigation refreshed");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error refreshing mobile navigation:", error);
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all mobile navigation functions for use in other modules
export {
  // Mobile tooltips
  setupMobileTooltips,
  
  // Touch gestures
  setupTouchGestures,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  
  // Swipe indicators
  manageSwipeIndicators,
  createSwipeIndicators,
  showSwipeIndicator,
  hideSwipeIndicators,
  
  // Haptic feedback
  addHapticFeedback,
  
  // Touch feedback
  setupTouchFeedback,
  
  // Mobile bottom navigation
  createMobileBottomNavigation,
  
  // Sidebar swipe-to-close
  setupSidebarSwipeToClose,
  
  // Mobile responsive handling
  handleMobileResize,
  setupMobileResizeListener,
  
  // Mobile utilities
  isMobileDevice,
  refreshMobileNavigation,
  
  // Main initialization
  initializeMobileNavigation,
};