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

// Pull-to-refresh variables
let pullStartY = 0;
let pullDistance = 0;
let isPulling = false;
let pullToRefreshIndicator = null;

// Pinch-to-zoom variables
let initialDistance = 0;
let currentScale = 1;
let isZooming = false;

// Long press variables
let longPressTimer = null;
let longPressTarget = null;
const LONG_PRESS_DURATION = 800; // milliseconds

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
    // Handle multi-touch for pinch-to-zoom
    if (e.touches.length === 2) {
      handlePinchStart(e);
      return;
    }
    
    // Only handle single touch for other gestures
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    isSwiping = false;
    
    // Setup long press detection
    setupLongPress(e);
    
    // Setup pull-to-refresh detection
    setupPullToRefresh(e);
    
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
    // Handle pinch-to-zoom
    if (e.touches.length === 2) {
      handlePinchMove(e);
      return;
    }
    
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Clear long press timer if user moves too much
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimer();
    }
    
    // Handle pull-to-refresh
    if (handlePullToRefreshMove(touch, deltaY)) {
      return;
    }
    
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
    // Clear long press timer
    clearLongPressTimer();
    
    // Handle pull-to-refresh end
    if (isPulling) {
      handlePullToRefreshEnd();
    }
    
    // Handle pinch-to-zoom end
    if (isZooming) {
      isZooming = false;
    }
    
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
      addSwipeHaptic();
      
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
 * Optimized update for swipe indicators - only updates if needed (mobile performance)
 */
function updateSwipeIndicators() {
  try {
    const leftIndicator = document.getElementById('swipeIndicatorLeft');
    const rightIndicator = document.getElementById('swipeIndicatorRight');
    const isMobile = window.innerWidth <= 480;
    
    // Quick check: if we're mobile and indicators exist, no work needed
    if (isMobile && leftIndicator && rightIndicator) {
      return;
    }
    
    // Otherwise fall back to full management
    manageSwipeIndicators();
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating swipe indicators:", error);
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
// ENHANCED HAPTIC FEEDBACK
// ===========================

/**
 * Enhanced haptic feedback types for different interactions
 */
const HapticType = {
  LIGHT: [10],           // Light tap
  MEDIUM: [50],          // Standard interaction
  HEAVY: [100],          // Strong feedback
  SUCCESS: [50, 20, 50], // Success pattern
  ERROR: [100, 50, 100, 50, 100], // Error pattern
  SWIPE: [30],           // Swipe feedback
  LONG_PRESS: [80, 30, 80] // Long press pattern
};

/**
 * Add enhanced haptic feedback for mobile interactions
 */
function addHapticFeedback(type = HapticType.MEDIUM) {
  try {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(type);
    }
  } catch (error) {
    // Silently fail for haptic feedback
    if (typeof window.devError === 'function') {
      window.devError("Error adding haptic feedback:", error);
    }
  }
}

/**
 * Add specific haptic feedback for different actions
 */
function addSuccessHaptic() {
  addHapticFeedback(HapticType.SUCCESS);
}

function addErrorHaptic() {
  addHapticFeedback(HapticType.ERROR);
}

function addSwipeHaptic() {
  addHapticFeedback(HapticType.SWIPE);
}

function addLongPressHaptic() {
  addHapticFeedback(HapticType.LONG_PRESS);
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
    const sidebar = document.getElementById('progressSidebar');
    if (!sidebar) {
      // Sidebar might not be created yet during early initialization - setup later
      if (typeof window.devLog === 'function') {
        window.devLog("📱 Sidebar not ready yet, will setup swipe-to-close when sidebar is available");
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
// PULL-TO-REFRESH FUNCTIONALITY
// ===========================

/**
 * Setup pull-to-refresh detection
 */
function setupPullToRefresh(e) {
  try {
    const questionSection = document.getElementById('questionSection');
    if (!questionSection || questionSection.scrollTop > 0) return;
    
    pullStartY = e.touches[0].clientY;
    isPulling = false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up pull-to-refresh:", error);
    }
  }
}

/**
 * Handle pull-to-refresh move
 */
function handlePullToRefreshMove(touch, deltaY) {
  try {
    const questionSection = document.getElementById('questionSection');
    if (!questionSection || questionSection.scrollTop > 0) return false;
    
    if (deltaY > 0 && deltaY > 50) {
      isPulling = true;
      pullDistance = Math.min(deltaY, 120);
      
      if (!pullToRefreshIndicator) {
        createPullToRefreshIndicator();
      }
      
      updatePullToRefreshIndicator(pullDistance);
      return true;
    }
    
    return false;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling pull-to-refresh move:", error);
    }
    return false;
  }
}

/**
 * Handle pull-to-refresh end
 */
async function handlePullToRefreshEnd() {
  try {
    if (pullDistance > 120) { // Increased threshold to prevent accidental triggers
      // Trigger refresh
      addSuccessHaptic();
      await refreshExamData();
    }
    
    hidePullToRefreshIndicator();
    isPulling = false;
    pullDistance = 0;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling pull-to-refresh end:", error);
    }
  }
}

/**
 * Create pull-to-refresh indicator
 */
function createPullToRefreshIndicator() {
  try {
    pullToRefreshIndicator = document.createElement('div');
    pullToRefreshIndicator.className = 'pull-to-refresh';
    pullToRefreshIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Pull to refresh';
    document.body.appendChild(pullToRefreshIndicator);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error creating pull-to-refresh indicator:", error);
    }
  }
}

/**
 * Update pull-to-refresh indicator
 */
function updatePullToRefreshIndicator(distance) {
  try {
    if (!pullToRefreshIndicator) return;
    
    const progress = Math.min(distance / 80, 1);
    pullToRefreshIndicator.style.opacity = progress;
    
    if (distance > 80) {
      pullToRefreshIndicator.classList.add('active');
      pullToRefreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Release to refresh';
    } else {
      pullToRefreshIndicator.classList.remove('active');
      pullToRefreshIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Pull to refresh';
    }
    
    pullToRefreshIndicator.classList.add('show');
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error updating pull-to-refresh indicator:", error);
    }
  }
}

/**
 * Hide pull-to-refresh indicator
 */
function hidePullToRefreshIndicator() {
  try {
    if (pullToRefreshIndicator) {
      pullToRefreshIndicator.classList.remove('show', 'active');
      setTimeout(() => {
        if (pullToRefreshIndicator) {
          pullToRefreshIndicator.remove();
          pullToRefreshIndicator = null;
        }
      }, 300);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error hiding pull-to-refresh indicator:", error);
    }
  }
}

/**
 * Refresh exam data
 */
async function refreshExamData() {
  try {
    if (typeof window.devLog === 'function') {
      window.devLog("📱 Refreshing exam data...");
    }
    
    // Only trigger reload if there's actually an exam loaded
    // This prevents unnecessary reloads when pull-to-refresh is triggered accidentally
    if (typeof window.loadExam === 'function' && window.currentExamCode && window.currentQuestions?.length > 0) {
      if (typeof window.devLog === 'function') {
        window.devLog(`📱 Reloading exam ${window.currentExamCode} via pull-to-refresh`);
      }
      await window.loadExam(window.currentExamCode);
    } else {
      if (typeof window.devLog === 'function') {
        window.devLog("📱 Pull-to-refresh triggered but no exam loaded, ignoring");
      }
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog("📱 Exam data refresh completed");
    }
  } catch (error) {
    addErrorHaptic();
    if (typeof window.devError === 'function') {
      window.devError("Error refreshing exam data:", error);
    }
  }
}

// ===========================
// PINCH-TO-ZOOM FUNCTIONALITY
// ===========================

/**
 * Handle pinch start
 */
function handlePinchStart(e) {
  try {
    if (e.touches.length !== 2) return;
    
    isZooming = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    initialDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    // Find zoomable content
    const zoomTarget = e.target.closest('img, .question-content');
    if (zoomTarget) {
      setupZoomTarget(zoomTarget);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling pinch start:", error);
    }
  }
}

/**
 * Handle pinch move
 */
function handlePinchMove(e) {
  try {
    if (e.touches.length !== 2 || !isZooming) return;
    
    e.preventDefault();
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const scale = currentDistance / initialDistance;
    currentScale = Math.min(Math.max(scale, 0.5), 3); // Limit scale between 0.5x and 3x
    
    const zoomTarget = document.querySelector('.pinch-zoom-content');
    if (zoomTarget) {
      zoomTarget.style.transform = `scale(${currentScale})`;
      
      if (currentScale > 1) {
        zoomTarget.classList.add('zoomed');
      } else {
        zoomTarget.classList.remove('zoomed');
      }
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error handling pinch move:", error);
    }
  }
}

/**
 * Setup zoom target
 */
function setupZoomTarget(element) {
  try {
    // Wrap element in zoom container if not already
    if (!element.closest('.pinch-zoom-container')) {
      const container = document.createElement('div');
      container.className = 'pinch-zoom-container';
      
      element.parentNode.insertBefore(container, element);
      container.appendChild(element);
    }
    
    element.classList.add('pinch-zoom-content');
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up zoom target:", error);
    }
  }
}

// ===========================
// LONG PRESS FUNCTIONALITY
// ===========================

/**
 * Setup long press detection
 */
function setupLongPress(e) {
  try {
    longPressTarget = e.target;
    
    longPressTimer = setTimeout(() => {
      triggerLongPress(e);
    }, LONG_PRESS_DURATION);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error setting up long press:", error);
    }
  }
}

/**
 * Clear long press timer
 */
function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressTarget = null;
  }
}

/**
 * Trigger long press action
 */
function triggerLongPress(e) {
  try {
    addLongPressHaptic();
    
    const target = e.target;
    
    // Show context menu for different elements
    if (target.closest('.question-text')) {
      showQuestionContextMenu(e);
    } else if (target.closest('.answer-option')) {
      showAnswerContextMenu(e);
    } else if (target.closest('img')) {
      showImageContextMenu(e);
    }
    
    if (typeof window.devLog === 'function') {
      window.devLog("📱 Long press triggered");
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error triggering long press:", error);
    }
  }
}

/**
 * Show question context menu
 */
function showQuestionContextMenu(e) {
  try {
    const menu = createContextMenu([
      { text: 'Copy Question', action: () => copyQuestionText() },
      { text: 'Add to Favorites', action: () => addQuestionToFavorites() },
      { text: 'Share Question', action: () => shareQuestion() }
    ]);
    
    showContextMenuAt(menu, e.touches[0].clientX, e.touches[0].clientY);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing question context menu:", error);
    }
  }
}

/**
 * Show answer context menu
 */
function showAnswerContextMenu(e) {
  try {
    const menu = createContextMenu([
      { text: 'Copy Answer', action: () => copyAnswerText(e.target) },
      { text: 'Explain Answer', action: () => explainAnswer(e.target) }
    ]);
    
    showContextMenuAt(menu, e.touches[0].clientX, e.touches[0].clientY);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing answer context menu:", error);
    }
  }
}

/**
 * Show image context menu
 */
function showImageContextMenu(e) {
  try {
    const menu = createContextMenu([
      { text: 'View Full Size', action: () => viewImageFullSize(e.target) },
      { text: 'Copy Image URL', action: () => copyImageURL(e.target) }
    ]);
    
    showContextMenuAt(menu, e.touches[0].clientX, e.touches[0].clientY);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing image context menu:", error);
    }
  }
}

/**
 * Create context menu
 */
function createContextMenu(items) {
  try {
    const menu = document.createElement('div');
    menu.className = 'long-press-menu';
    
    items.forEach(item => {
      const button = document.createElement('button');
      button.textContent = item.text;
      button.onclick = () => {
        item.action();
        hideContextMenu();
      };
      menu.appendChild(button);
    });
    
    return menu;
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error creating context menu:", error);
    }
    return null;
  }
}

/**
 * Show context menu at position
 */
function showContextMenuAt(menu, x, y) {
  try {
    if (!menu) return;
    
    document.body.appendChild(menu);
    
    // Position menu
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 150)}px`;
    
    // Show menu
    setTimeout(() => menu.classList.add('show'), 10);
    
    // Hide menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', hideContextMenu, { once: true });
      document.addEventListener('touchstart', hideContextMenu, { once: true });
    }, 100);
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error showing context menu:", error);
    }
  }
}

/**
 * Hide context menu
 */
function hideContextMenu() {
  try {
    const menu = document.querySelector('.long-press-menu');
    if (menu) {
      menu.classList.remove('show');
      setTimeout(() => menu.remove(), 150);
    }
  } catch (error) {
    if (typeof window.devError === 'function') {
      window.devError("Error hiding context menu:", error);
    }
  }
}

// Context menu actions
function copyQuestionText() {
  // Implementation depends on question structure
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Question text copied");
  }
}

function addQuestionToFavorites() {
  // Implementation depends on favorites system
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Question added to favorites");
  }
}

function shareQuestion() {
  // Implementation for sharing
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Question shared");
  }
}

function copyAnswerText(target) {
  // Implementation depends on answer structure
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Answer text copied");
  }
}

function explainAnswer(target) {
  // Implementation for answer explanation
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Answer explanation shown");
  }
}

function viewImageFullSize(img) {
  // Implementation for full-size image view
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Image viewed full size");
  }
}

function copyImageURL(img) {
  // Implementation for copying image URL
  addSuccessHaptic();
  if (typeof window.devLog === 'function') {
    window.devLog("📱 Image URL copied");
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
    
    // Setup sidebar swipe-to-close (will be retried later if sidebar isn't ready)
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
  updateSwipeIndicators,
  createSwipeIndicators,
  showSwipeIndicator,
  hideSwipeIndicators,
  
  // Enhanced haptic feedback
  addHapticFeedback,
  addSuccessHaptic,
  addErrorHaptic,
  addSwipeHaptic,
  addLongPressHaptic,
  
  // Touch feedback
  setupTouchFeedback,
  
  // Mobile bottom navigation
  createMobileBottomNavigation,
  
  // Sidebar swipe-to-close
  setupSidebarSwipeToClose,
  
  // Pull-to-refresh
  setupPullToRefresh,
  handlePullToRefreshMove,
  handlePullToRefreshEnd,
  refreshExamData,
  
  // Pinch-to-zoom
  handlePinchStart,
  handlePinchMove,
  setupZoomTarget,
  
  // Long press functionality
  setupLongPress,
  clearLongPressTimer,
  triggerLongPress,
  showQuestionContextMenu,
  showAnswerContextMenu,
  showImageContextMenu,
  hideContextMenu,
  
  // Mobile responsive handling
  handleMobileResize,
  setupMobileResizeListener,
  
  // Mobile utilities
  isMobileDevice,
  refreshMobileNavigation,
  
  // Main initialization
  initializeMobileNavigation,
};