/**
 * Developer Testing Module
 * Handles test execution and development tools
 */

// Import development utilities from storage module
import { isDevelopmentMode, devLog, devError } from './storage.js';

// ===========================
// DEV BUTTON MANAGEMENT
// ===========================

/**
 * Initialize development test button
 */
function initializeDevButton() {
  try {
    if (!isDevelopmentMode()) {
      return; // Don't show in production
    }
    
    const devButton = document.getElementById('devTestButton');
    const runTestsBtn = document.getElementById('runTestsBtn');
    
    if (devButton && runTestsBtn) {
      // Show the dev button
      devButton.style.display = 'block';
      
      // Add click handler
      runTestsBtn.addEventListener('click', handleRunTests);
      
      devLog('🧪 Development test button initialized');
    }
  } catch (error) {
    console.error('Error initializing dev button:', error);
  }
}

/**
 * Handle test execution
 */
async function handleRunTests() {
  try {
    const button = document.getElementById('runTestsBtn');
    if (!button) return;
    
    // Update button state
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    button.disabled = true;
    
    // Load test scripts dynamically
    await loadTestScripts();
    
    // Run the tests
    if (typeof window.runComprehensiveTests === 'function') {
      await window.runComprehensiveTests();
    } else {
      throw new Error('Test functions not loaded');
    }
    
    // Update button state
    button.innerHTML = '<i class="fas fa-check"></i> Tests Complete';
    button.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    
    // Reset button after delay
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.disabled = false;
      button.style.background = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error running tests:', error);
    
    // Update button to show error
    const button = document.getElementById('runTestsBtn');
    if (button) {
      button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
      button.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
      
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-flask"></i> Run Tests';
        button.disabled = false;
        button.style.background = '';
      }, 3000);
    }
  }
}

// ===========================
// DYNAMIC TEST SCRIPT LOADING
// ===========================

/**
 * Load test scripts dynamically
 */
async function loadTestScripts() {
  try {
    const testScripts = [
      'tests/comprehensive-test-suite.js',
      'tests/automated-test-report.js',
      'tests/run-tests.js'
    ];
    
    for (const scriptPath of testScripts) {
      await loadScript(scriptPath);
    }
    
    devLog('🧪 Test scripts loaded successfully');
  } catch (error) {
    console.error('Error loading test scripts:', error);
    throw error;
  }
}

/**
 * Load a single script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

// ===========================
// DEVELOPER UTILITIES
// ===========================

/**
 * Enable enhanced developer console logging (extends storage.js functions)
 */
function enableDeveloperLogging() {
  if (!isDevelopmentMode()) return;
  
  // Extend existing devLog and devError from storage.js with additional logging functions
  window.devWarn = function(message, ...args) {
    console.warn(`%c[DEV] ${message}`, 'color: #d97706; font-weight: bold;', ...args);
  };
  
  window.devInfo = function(message, ...args) {
    console.info(`%c[DEV] ${message}`, 'color: #2563eb; font-weight: bold;', ...args);
  };
  
  // Enhance existing devLog with colored output for consistency
  const originalDevLog = window.devLog;
  window.devLog = function(message, ...args) {
    if (isDevelopmentMode()) {
      console.log(`%c[DEV] ${message}`, 'color: #059669; font-weight: bold;', ...args);
    }
  };
  
  // Enhance existing devError with colored output for consistency
  window.devError = function(message, ...args) {
    console.error(`%c[DEV] ${message}`, 'color: #dc2626; font-weight: bold;', ...args);
  };
}

/**
 * Show development info in console
 */
function showDevelopmentInfo() {
  if (!isDevelopmentMode()) return;
  
  console.log(`
%c🧪 EXAMS-VIEWER DEVELOPMENT MODE 🧪
%c
• Modern Design System Active
• All ES6 Modules Loaded
• Touch Gestures Enhanced
• Development Testing Available
• Performance Monitoring Active

%cCommands:
%c• Click the test button or use ?dev=1 in URL
• runComprehensiveTests() - Run all tests
• window.debugState() - Show current state
• localStorage.clear() - Reset all data

%cHappy coding! 🚀
  `, 
    'color: #8b7bd8; font-size: 16px; font-weight: bold;',
    'color: #6b7280;',
    'color: #059669; font-weight: bold;',
    'color: #374151;',
    'color: #8b7bd8; font-weight: bold;'
  );
}

/**
 * Add keyboard shortcuts for development
 */
function addDeveloperKeyboardShortcuts() {
  if (!isDevelopmentMode()) return;
  
  document.addEventListener('keydown', (e) => {
    try {
      // Ctrl/Cmd + Shift + T = Run Tests
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleRunTests();
      }
      
      // Ctrl/Cmd + Shift + D = Show Debug Info
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (typeof window.debugState === 'function') {
          window.debugState();
        } else {
          console.log('Debug state function not available');
        }
      }
      
      // Ctrl/Cmd + Shift + R = Reset All Data
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (confirm('Reset all localStorage data?')) {
          localStorage.clear();
          location.reload();
        }
      }
    } catch (error) {
      console.error('Error handling dev keyboard shortcut:', error);
    }
  });
}

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize development testing module
 */
function initializeDevelopmentTesting() {
  try {
    if (!isDevelopmentMode()) {
      return; // Skip in production
    }
    
    // Enable developer features
    enableDeveloperLogging();
    showDevelopmentInfo();
    addDeveloperKeyboardShortcuts();
    
    // Initialize dev button when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeDevButton);
    } else {
      initializeDevButton();
    }
    
    devLog('🧪 Development testing module initialized');
  } catch (error) {
    console.error('Error initializing development testing:', error);
  }
}

// Auto-initialize
initializeDevelopmentTesting();

// ===========================
// EXPORTS
// ===========================

export {
  // Button management
  initializeDevButton,
  handleRunTests,
  
  // Script loading
  loadTestScripts,
  loadScript,
  
  // Developer utilities
  enableDeveloperLogging,
  showDevelopmentInfo,
  addDeveloperKeyboardShortcuts,
  
  // Initialization
  initializeDevelopmentTesting
};