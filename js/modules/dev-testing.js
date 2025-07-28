/**
 * Developer Testing Module
 * Handles test execution and development tools
 */

// Import development utilities from storage module
import { isDevelopmentMode, devLog, devError } from './storage.js';

// Add devWarn if it doesn't exist
const devWarn = (...args) => {
  if (isDevelopmentMode()) {
    console.warn(...args);
  }
};

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
      
      // Initialize button state
      updateButtonState(runTestsBtn, 'ready');
      
      // Add click handler
      runTestsBtn.addEventListener('click', handleRunTests);
      
      // Preload test scripts in background to reduce first-click delay
      preloadTestScripts();
      
      devLog('🧪 Development test button initialized');
    }
  } catch (error) {
    console.error('Error initializing dev button:', error);
  }
}

/**
 * Update button state with consistent styling
 */
function updateButtonState(button, state) {
  if (!button) return;
  
  const states = {
    ready: {
      html: '<i class="fas fa-flask"></i> Run Tests',
      disabled: false,
      background: '',
      title: 'Run comprehensive tests'
    },
    loading: {
      html: '<i class="fas fa-spinner fa-spin"></i> Loading Scripts...',
      disabled: true,
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      title: 'Loading test scripts...'
    },
    running: {
      html: '<i class="fas fa-spinner fa-spin"></i> Running Tests...',
      disabled: true,
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      title: 'Running tests...'
    },
    success: {
      html: '<i class="fas fa-check"></i> Tests Complete',
      disabled: true,
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      title: 'Tests completed successfully'
    },
    error: {
      html: '<i class="fas fa-exclamation-triangle"></i> Error',
      disabled: true,
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      title: 'Error occurred during testing'
    }
  };
  
  const config = states[state];
  if (config) {
    button.innerHTML = config.html;
    button.disabled = config.disabled;
    button.style.background = config.background;
    button.title = config.title;
  }
}

/**
 * Preload test scripts in background to reduce delay
 */
async function preloadTestScripts() {
  try {
    devLog('🔄 Preloading test scripts in background...');
    await loadTestScripts();
    devLog('✅ Test scripts preloaded successfully');
  } catch (error) {
    devWarn('⚠️ Failed to preload test scripts:', error);
    // Don't throw error - this is just an optimization
  }
}

/**
 * Handle test execution
 */
async function handleRunTests() {
  try {
    const button = document.getElementById('runTestsBtn');
    if (!button) return;
    
    // Prevent multiple simultaneous test runs
    if (button.disabled) {
      devLog('Tests already running, ignoring click');
      return;
    }
    
    // Update button state to loading
    updateButtonState(button, 'loading');
    
    devLog('🔄 Loading test scripts...');
    
    // Load test scripts dynamically with error handling
    await loadTestScripts();
    
    // Update button to running state
    updateButtonState(button, 'running');
    
    devLog('🧪 Starting test execution...');
    
    // Wait a moment for scripts to fully initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify that test functions are now available
    devLog('🔍 Checking available test functions...');
    devLog('window.testSuite:', !!window.testSuite);
    devLog('window.runComprehensiveTests:', !!window.runComprehensiveTests);
    devLog('window.ExamsViewerTestSuite:', !!window.ExamsViewerTestSuite);
    
    // Try different test execution methods in order of preference
    let testsExecuted = false;
    
    // Method 1: Check for testSuite object and runAllTests method
    if (window.testSuite && typeof window.testSuite.runAllTests === 'function') {
      devLog('✅ Found testSuite.runAllTests, executing...');
      await window.testSuite.runAllTests();
      testsExecuted = true;
    }
    // Method 2: Check for runComprehensiveTests function
    else if (typeof window.runComprehensiveTests === 'function') {
      devLog('✅ Found runComprehensiveTests, executing...');
      await window.runComprehensiveTests();
      testsExecuted = true;
    }
    // Method 3: Check for runManualTests function
    else if (typeof window.runManualTests === 'function') {
      devLog('✅ Found runManualTests, executing...');
      await window.runManualTests();
      testsExecuted = true;
    }
    // Method 4: Try to create test suite manually
    else if (window.ExamsViewerTestSuite) {
      devLog('✅ Found ExamsViewerTestSuite class, creating instance...');
      const testSuite = new window.ExamsViewerTestSuite();
      await testSuite.runAllTests();
      testsExecuted = true;
    }
    
    if (!testsExecuted) {
      // Log detailed debugging information
      const availableFunctions = [];
      if (window.testSuite) {
        availableFunctions.push(`testSuite (has runAllTests: ${!!window.testSuite.runAllTests})`);
      }
      if (window.runComprehensiveTests) availableFunctions.push('runComprehensiveTests');
      if (window.runManualTests) availableFunctions.push('runManualTests');
      if (window.ExamsViewerTestSuite) availableFunctions.push('ExamsViewerTestSuite');
      
      devError('❌ No test functions could be executed');
      devError('Available functions:', availableFunctions);
      devError('Scripts loaded but functions not initialized properly');
      
      // Try to force creation of test suite if class is available
      if (window.ExamsViewerTestSuite && !window.testSuite) {
        devLog('🔧 Attempting to manually create test suite...');
        try {
          window.testSuite = new window.ExamsViewerTestSuite();
          if (window.testSuite && typeof window.testSuite.runAllTests === 'function') {
            devLog('✅ Manually created test suite, executing...');
            await window.testSuite.runAllTests();
            testsExecuted = true;
          }
        } catch (createError) {
          devError('Failed to manually create test suite:', createError);
        }
      }
      
      if (!testsExecuted) {
        throw new Error(`Test functions not properly loaded. Available: ${availableFunctions.join(', ')}`);
      }
    }
    
    // Update button state to success
    updateButtonState(button, 'success');
    
    devLog('✅ Tests completed successfully');
    
    // Reset button after delay
    setTimeout(() => {
      updateButtonState(button, 'ready');
    }, 3000);
    
  } catch (error) {
    devError('Error running tests:', error);
    
    // Update button to show error
    const button = document.getElementById('runTestsBtn');
    if (button) {
      updateButtonState(button, 'error');
      button.title = `Test Error: ${error.message}`;
      
      setTimeout(() => {
        updateButtonState(button, 'ready');
      }, 5000); // Longer delay for error state
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
      { path: 'tests/comprehensive-test-suite.js', required: true },
      { path: 'tests/automated-test-report.js', required: false },
      { path: 'tests/run-tests.js', required: false }
    ];
    
    const loadPromises = [];
    
    for (const script of testScripts) {
      try {
        devLog(`📂 Loading ${script.path}...`);
        const loadPromise = loadScript(script.path);
        loadPromises.push(loadPromise);
        
        // Wait for required scripts, but continue if optional scripts fail
        if (script.required) {
          await loadPromise;
          devLog(`✅ Required script loaded: ${script.path}`);
        }
      } catch (error) {
        if (script.required) {
          devError(`❌ Failed to load required script: ${script.path}`, error);
          throw new Error(`Required test script failed to load: ${script.path}`);
        } else {
          devWarn(`⚠️ Optional script failed to load: ${script.path}`, error);
        }
      }
    }
    
    // Wait for all optional scripts to finish (but don't fail if they error)
    try {
      await Promise.allSettled(loadPromises);
    } catch (error) {
      devWarn('Some optional scripts failed to load, continuing with available scripts');
    }
    
    // Give scripts time to initialize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    devLog('🧪 Test scripts loading completed');
    
    // Verify that at least one test execution method is available
    const hasTestSuite = window.testSuite && typeof window.testSuite.runAllTests === 'function';
    const hasRunComprehensive = typeof window.runComprehensiveTests === 'function';
    const hasRunManual = typeof window.runManualTests === 'function';
    const hasTestSuiteClass = typeof window.ExamsViewerTestSuite === 'function';
    
    if (!hasTestSuite && !hasRunComprehensive && !hasRunManual && !hasTestSuiteClass) {
      throw new Error('No test execution methods found after loading scripts');
    }
    
    devLog('✅ Test execution methods verified');
    
  } catch (error) {
    devError('Error loading test scripts:', error);
    throw error;
  }
}

/**
 * Load a single script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      devLog(`📜 Script already loaded: ${src}`);
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading ${src}`));
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      devLog(`✅ Script loaded successfully: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      const errorMsg = `Failed to load ${src}: ${error.message || 'Unknown error'}`;
      devError(errorMsg);
      reject(new Error(errorMsg));
    };
    
    // Set script attributes for better loading
    script.async = true;
    script.defer = false;
    
    document.head.appendChild(script);
    devLog(`📥 Loading script: ${src}`);
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
  updateButtonState,
  preloadTestScripts,
  
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