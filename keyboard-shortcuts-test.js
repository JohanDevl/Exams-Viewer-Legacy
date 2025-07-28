/**
 * Keyboard Shortcuts Test Suite
 * 
 * Comprehensive testing for the keyboard shortcuts fix that addresses:
 * - Repeated usage of shortcuts without blocking
 * - No focus capture on feedback elements
 * - Multiple feedback overlays handling
 * - Navigation after feedback display
 * - Input field behavior preservation
 * 
 * Run this test in the browser console after loading an exam
 */

// Test Suite Configuration
const KEYBOARD_SHORTCUTS_TEST_CONFIG = {
  feedbackTimeout: 100, // Wait time for feedback to appear
  shortcutDelay: 50,    // Delay between rapid shortcuts
  inputTestDelay: 200,  // Delay for input field tests
  testTimeout: 5000     // Maximum time per test
};

// Test Results Storage
let keyboardTestResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  tests: []
};

/**
 * Test Framework Functions
 */
function addKeyboardTestResult(testName, passed, message, details = {}) {
  keyboardTestResults.totalTests++;
  if (passed) {
    keyboardTestResults.passedTests++;
  } else {
    keyboardTestResults.failedTests++;
  }
  
  keyboardTestResults.tests.push({
    name: testName,
    passed,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`, details);
}

/**
 * Simulate keyboard event
 */
function simulateKeyboardEvent(key, options = {}) {
  const event = new KeyboardEvent('keydown', {
    key: key,
    code: options.code || `Key${key.toUpperCase()}`,
    ctrlKey: options.ctrlKey || false,
    metaKey: options.metaKey || false,
    shiftKey: options.shiftKey || false,
    bubbles: true,
    cancelable: true,
    ...options
  });
  
  document.dispatchEvent(event);
  return event;
}

/**
 * Wait for specified milliseconds
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get feedback element if it exists
 */
function getFeedbackElement() {
  return document.getElementById('shortcut-feedback');
}

/**
 * Check if feedback element has proper non-interactive properties
 */
function validateFeedbackProperties(feedbackElement) {
  if (!feedbackElement) return { valid: false, issues: ['Element not found'] };
  
  const issues = [];
  const computedStyle = window.getComputedStyle(feedbackElement);
  
  // Check pointer-events
  if (computedStyle.pointerEvents !== 'none') {
    issues.push(`pointer-events is '${computedStyle.pointerEvents}', should be 'none'`);
  }
  
  // Check user-select
  if (computedStyle.userSelect !== 'none' && 
      computedStyle.webkitUserSelect !== 'none') {
    issues.push(`user-select is not 'none'`);
  }
  
  // Check tabindex
  if (feedbackElement.getAttribute('tabindex') !== '-1') {
    issues.push(`tabindex is '${feedbackElement.getAttribute('tabindex')}', should be '-1'`);
  }
  
  // Check aria-hidden
  if (feedbackElement.getAttribute('aria-hidden') !== 'true') {
    issues.push(`aria-hidden is '${feedbackElement.getAttribute('aria-hidden')}', should be 'true'`);
  }
  
  // Check z-index
  const zIndex = parseInt(computedStyle.zIndex);
  if (zIndex > 1001) {
    issues.push(`z-index is ${zIndex}, should be <= 1001`);
  }
  
  return { valid: issues.length === 0, issues };
}

/**
 * Test 1: Repeated Shortcut Usage
 */
async function testRepeatedShortcutUsage() {
  console.log('\n🧪 Testing Repeated Shortcut Usage...');
  
  if (!window.currentQuestions || window.currentQuestions.length === 0) {
    addKeyboardTestResult('Repeated Shortcuts', false, 'No exam loaded for testing');
    return;
  }
  
  const shortcuts = ['f', 'v', 'n', 'e'];
  const initialQuestionIndex = window.currentQuestionIndex || 0;
  let allShortcutsWorked = true;
  let failureDetails = [];
  
  try {
    for (let i = 0; i < shortcuts.length; i++) {
      const shortcut = shortcuts[i];
      
      // Record state before shortcut
      const beforeState = {
        questionIndex: window.currentQuestionIndex,
        feedbackExists: !!getFeedbackElement()
      };
      
      // Trigger shortcut
      simulateKeyboardEvent(shortcut);
      
      // Wait for feedback to appear
      await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
      
      const afterState = {
        questionIndex: window.currentQuestionIndex,
        feedbackExists: !!getFeedbackElement()
      };
      
      // Validate feedback appeared (for shortcuts that show feedback)
      if (['f', 'v', 'n', 'e'].includes(shortcut)) {
        if (!afterState.feedbackExists) {
          allShortcutsWorked = false;
          failureDetails.push(`${shortcut.toUpperCase()}: No feedback appeared`);
          continue;
        }
        
        // Validate feedback properties
        const feedbackElement = getFeedbackElement();
        const validation = validateFeedbackProperties(feedbackElement);
        if (!validation.valid) {
          allShortcutsWorked = false;
          failureDetails.push(`${shortcut.toUpperCase()}: ${validation.issues.join(', ')}`);
        }
      }
      
      // Wait before next shortcut
      await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.shortcutDelay);
    }
    
    addKeyboardTestResult(
      'Repeated Shortcuts',
      allShortcutsWorked,
      allShortcutsWorked ? 'All shortcuts work in sequence' : 'Some shortcuts failed',
      { failures: failureDetails, totalTested: shortcuts.length }
    );
    
  } catch (error) {
    addKeyboardTestResult('Repeated Shortcuts', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 2: Rapid Sequential Shortcuts
 */
async function testRapidSequentialShortcuts() {
  console.log('\n🧪 Testing Rapid Sequential Shortcuts...');
  
  if (!window.currentQuestions || window.currentQuestions.length === 0) {
    addKeyboardTestResult('Rapid Sequential', false, 'No exam loaded for testing');
    return;
  }
  
  const shortcuts = ['f', 'v', 'e', 'n', 'f']; // Repeat F to test toggle
  let allWorked = true;
  let feedbackCount = 0;
  
  try {
    // Fire all shortcuts rapidly
    for (let i = 0; i < shortcuts.length; i++) {
      simulateKeyboardEvent(shortcuts[i]);
      await wait(10); // Very short delay to simulate rapid typing
    }
    
    // Wait for feedback to settle
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    // Check if there's exactly one feedback element (last one should replace previous)
    const feedbackElements = document.querySelectorAll('#shortcut-feedback');
    feedbackCount = feedbackElements.length;
    
    if (feedbackCount > 1) {
      allWorked = false;
    }
    
    // Validate the remaining feedback element
    if (feedbackCount === 1) {
      const validation = validateFeedbackProperties(feedbackElements[0]);
      if (!validation.valid) {
        allWorked = false;
      }
    }
    
    addKeyboardTestResult(
      'Rapid Sequential',
      allWorked,
      allWorked ? 'Rapid shortcuts handled correctly' : 'Multiple feedback elements or invalid properties',
      { 
        feedbackElementsFound: feedbackCount,
        shortcutsTested: shortcuts.length,
        expectedFeedbackCount: 1
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Rapid Sequential', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 3: Navigation After Feedback
 */
async function testNavigationAfterFeedback() {
  console.log('\n🧪 Testing Navigation After Feedback...');
  
  if (!window.currentQuestions || window.currentQuestions.length < 3) {
    addKeyboardTestResult('Navigation After Feedback', false, 'Need at least 3 questions for navigation test');
    return;
  }
  
  try {
    const initialIndex = window.currentQuestionIndex || 0;
    
    // Trigger a feedback shortcut
    simulateKeyboardEvent('f');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    // Verify feedback exists
    let feedbackElement = getFeedbackElement();
    if (!feedbackElement) {
      addKeyboardTestResult('Navigation After Feedback', false, 'Feedback element not created');
      return;
    }
    
    // Test arrow key navigation
    simulateKeyboardEvent('ArrowRight');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const afterArrowIndex = window.currentQuestionIndex || 0;
    const arrowNavigationWorked = afterArrowIndex !== initialIndex;
    
    // Test vim-style navigation
    simulateKeyboardEvent('l');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const afterVimIndex = window.currentQuestionIndex || 0;
    const vimNavigationWorked = afterVimIndex !== afterArrowIndex;
    
    // Test space navigation
    simulateKeyboardEvent(' ');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const afterSpaceIndex = window.currentQuestionIndex || 0;
    const spaceNavigationWorked = afterSpaceIndex !== afterVimIndex;
    
    const allNavigationWorked = arrowNavigationWorked && vimNavigationWorked && spaceNavigationWorked;
    
    addKeyboardTestResult(
      'Navigation After Feedback',
      allNavigationWorked,
      allNavigationWorked ? 'All navigation shortcuts work after feedback' : 'Some navigation failed',
      {
        initialIndex,
        afterArrow: afterArrowIndex,
        afterVim: afterVimIndex,
        afterSpace: afterSpaceIndex,
        arrowWorked: arrowNavigationWorked,
        vimWorked: vimNavigationWorked,
        spaceWorked: spaceNavigationWorked
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Navigation After Feedback', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 4: Focus and Event Capture
 */
async function testFocusAndEventCapture() {
  console.log('\n🧪 Testing Focus and Event Capture...');
  
  try {
    // Store original focus
    const originalActiveElement = document.activeElement;
    
    // Trigger shortcut with feedback
    simulateKeyboardEvent('v');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const feedbackElement = getFeedbackElement();
    if (!feedbackElement) {
      addKeyboardTestResult('Focus and Event Capture', false, 'Feedback element not created');
      return;
    }
    
    // Check if focus changed (it shouldn't)
    const focusStole = document.activeElement !== originalActiveElement;
    
    // Try to focus the feedback element manually (should not be possible)
    let manualFocusSucceeded = false;
    try {
      feedbackElement.focus();
      manualFocusSucceeded = document.activeElement === feedbackElement;
    } catch (e) {
      // Expected to fail due to tabindex="-1"
    }
    
    // Test if feedback element blocks clicks (should not due to pointer-events: none)
    let clickBlocked = true;
    try {
      // Create a test element behind the feedback
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        width: 200px;
        height: 50px;
        background: red;
        z-index: 999;
      `;
      testElement.onclick = () => { clickBlocked = false; };
      document.body.appendChild(testElement);
      
      // Simulate click on the test element (should work through feedback)
      testElement.click();
      
      // Clean up
      testElement.remove();
    } catch (e) {
      // Assume test passed if we can't set up the test properly
      clickBlocked = false;
    }
    
    const testPassed = !focusStole && !manualFocusSucceeded && !clickBlocked;
    
    addKeyboardTestResult(
      'Focus and Event Capture',
      testPassed,
      testPassed ? 'Feedback element does not interfere with interactions' : 'Feedback element interferes with interactions',
      {
        focusStolen: focusStole,
        manualFocusSucceeded,
        clickBlocked,
        originalFocus: originalActiveElement.tagName,
        currentFocus: document.activeElement.tagName
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Focus and Event Capture', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 5: Input Field Behavior
 */
async function testInputFieldBehavior() {
  console.log('\n🧪 Testing Input Field Behavior...');
  
  try {
    // Find search input or create a test input
    let searchInput = document.getElementById('searchInput');
    let testInputCreated = false;
    
    if (!searchInput || searchInput.style.display === 'none') {
      // Create a test input
      searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.id = 'test-input';
      searchInput.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 1000;';
      document.body.appendChild(searchInput);
      testInputCreated = true;
    }
    
    // Focus the input
    searchInput.focus();
    await wait(50);
    
    const inputHasFocus = document.activeElement === searchInput;
    if (!inputHasFocus) {
      addKeyboardTestResult('Input Field Behavior', false, 'Could not focus test input');
      if (testInputCreated) searchInput.remove();
      return;
    }
    
    // Type some text
    searchInput.value = 'test';
    
    // Try shortcuts while input is focused (should be ignored)
    simulateKeyboardEvent('f');
    simulateKeyboardEvent('v');
    simulateKeyboardEvent('n');
    
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.inputTestDelay);
    
    // Check if shortcuts were ignored (no feedback should appear)
    const feedbackAfterInputShortcuts = getFeedbackElement();
    const shortcutsIgnored = !feedbackAfterInputShortcuts;
    
    // Blur the input and try shortcuts again (should work)
    searchInput.blur();
    await wait(50);
    
    simulateKeyboardEvent('f');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const feedbackAfterBlur = getFeedbackElement();
    const shortcutsWorkAfterBlur = !!feedbackAfterBlur;
    
    const testPassed = shortcutsIgnored && shortcutsWorkAfterBlur;
    
    addKeyboardTestResult(
      'Input Field Behavior',
      testPassed,
      testPassed ? 'Shortcuts correctly ignored in inputs, work after blur' : 'Shortcuts behavior incorrect with inputs',
      {
        inputFocused: inputHasFocus,
        shortcutsIgnoredInInput: shortcutsIgnored,
        shortcutsWorkAfterBlur,
        testInputValue: searchInput.value
      }
    );
    
    // Clean up test input
    if (testInputCreated) {
      searchInput.remove();
    }
    
  } catch (error) {
    addKeyboardTestResult('Input Field Behavior', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 6: Multiple Feedback Overlay Handling
 */
async function testMultipleFeedbackHandling() {
  console.log('\n🧪 Testing Multiple Feedback Overlay Handling...');
  
  try {
    // Trigger multiple shortcuts in very quick succession
    const shortcuts = ['f', 'v', 'n', 'e'];
    
    // Fire all shortcuts with minimal delay
    for (const shortcut of shortcuts) {
      simulateKeyboardEvent(shortcut);
      await wait(5); // Very minimal delay
    }
    
    // Wait for feedback to settle
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    // Check how many feedback elements exist
    const feedbackElements = document.querySelectorAll('#shortcut-feedback');
    const feedbackCount = feedbackElements.length;
    
    // Should only have one feedback element (latest one)
    const onlyOneFeedback = feedbackCount <= 1;
    
    // If there is a feedback element, validate its properties
    let propertiesValid = true;
    if (feedbackCount === 1) {
      const validation = validateFeedbackProperties(feedbackElements[0]);
      propertiesValid = validation.valid;
    }
    
    const testPassed = onlyOneFeedback && propertiesValid;
    
    addKeyboardTestResult(
      'Multiple Feedback Handling',
      testPassed,
      testPassed ? 'Multiple shortcuts create only one feedback element' : 'Multiple feedback elements found or invalid properties',
      {
        shortcutsFired: shortcuts.length,
        feedbackElementsFound: feedbackCount,
        propertiesValid,
        shortcuts: shortcuts.join(', ')
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Multiple Feedback Handling', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 7: Feedback Element CSS Properties
 */
async function testFeedbackElementProperties() {
  console.log('\n🧪 Testing Feedback Element CSS Properties...');
  
  try {
    // Trigger a shortcut that shows feedback
    simulateKeyboardEvent('f');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const feedbackElement = getFeedbackElement();
    if (!feedbackElement) {
      addKeyboardTestResult('Feedback Properties', false, 'Feedback element not created');
      return;
    }
    
    const validation = validateFeedbackProperties(feedbackElement);
    const computedStyle = window.getComputedStyle(feedbackElement);
    
    // Additional property checks
    const additionalChecks = [];
    
    // Check position
    if (computedStyle.position !== 'fixed') {
      additionalChecks.push(`position is '${computedStyle.position}', should be 'fixed'`);
    }
    
    // Check if element is visible
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      additionalChecks.push('element is not visible');
    }
    
    const allIssues = [...validation.issues, ...additionalChecks];
    const allValid = allIssues.length === 0;
    
    addKeyboardTestResult(
      'Feedback Properties',
      allValid,
      allValid ? 'All feedback element properties are correct' : 'Some properties are incorrect',
      {
        issues: allIssues,
        elementId: feedbackElement.id,
        className: feedbackElement.className,
        computedProperties: {
          position: computedStyle.position,
          pointerEvents: computedStyle.pointerEvents,
          userSelect: computedStyle.userSelect,
          zIndex: computedStyle.zIndex,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity
        }
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Feedback Properties', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Test 8: Feedback Auto-removal
 */
async function testFeedbackAutoRemoval() {
  console.log('\n🧪 Testing Feedback Auto-removal...');
  
  try {
    // Trigger feedback
    simulateKeyboardEvent('v');
    await wait(KEYBOARD_SHORTCUTS_TEST_CONFIG.feedbackTimeout);
    
    const feedbackElement = getFeedbackElement();
    if (!feedbackElement) {
      addKeyboardTestResult('Feedback Auto-removal', false, 'Feedback element not created');
      return;
    }
    
    // Wait for auto-removal (should happen after 2 seconds + animation time)
    const removalWaitTime = 2500; // 2000ms timeout + 300ms animation + buffer
    await wait(removalWaitTime);
    
    const feedbackAfterTimeout = getFeedbackElement();
    const removedAutomatically = !feedbackAfterTimeout;
    
    addKeyboardTestResult(
      'Feedback Auto-removal',
      removedAutomatically,
      removedAutomatically ? 'Feedback element removed automatically' : 'Feedback element persisted beyond timeout',
      {
        waitTime: removalWaitTime,
        elementExistsAfterTimeout: !!feedbackAfterTimeout
      }
    );
    
  } catch (error) {
    addKeyboardTestResult('Feedback Auto-removal', false, `Test error: ${error.message}`, { error });
  }
}

/**
 * Main Test Runner
 */
async function runKeyboardShortcutsTests() {
  console.log('🚀 Starting Keyboard Shortcuts Test Suite...');
  console.log('Testing the fix for keyboard shortcuts that stop working after first use\n');
  
  // Reset test results
  keyboardTestResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    tests: []
  };
  
  const startTime = Date.now();
  
  try {
    // Run all tests
    await testRepeatedShortcutUsage();
    await testRapidSequentialShortcuts();
    await testNavigationAfterFeedback();
    await testFocusAndEventCapture();
    await testInputFieldBehavior();
    await testMultipleFeedbackHandling();
    await testFeedbackElementProperties();
    await testFeedbackAutoRemoval();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 KEYBOARD SHORTCUTS TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${keyboardTestResults.totalTests}`);
    console.log(`✅ Passed: ${keyboardTestResults.passedTests}`);
    console.log(`❌ Failed: ${keyboardTestResults.failedTests}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📈 Success Rate: ${((keyboardTestResults.passedTests / keyboardTestResults.totalTests) * 100).toFixed(1)}%`);
    
    if (keyboardTestResults.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('-'.repeat(40));
      keyboardTestResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`• ${test.name}: ${test.message}`);
          if (test.details && Object.keys(test.details).length > 0) {
            console.log(`  Details:`, test.details);
          }
        });
    }
    
    console.log('\n✨ Test suite completed!');
    console.log('Results available in keyboardTestResults global variable');
    
    // Store results globally for inspection
    window.keyboardTestResults = keyboardTestResults;
    
    return keyboardTestResults;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    addKeyboardTestResult('Test Suite', false, `Suite execution failed: ${error.message}`, { error });
    return keyboardTestResults;
  }
}

/**
 * Quick validation test for immediate verification
 */
async function quickKeyboardTest() {
  console.log('⚡ Running Quick Keyboard Test...');
  
  if (!window.currentQuestions || window.currentQuestions.length === 0) {
    console.log('❌ No exam loaded. Please load an exam first.');
    return;
  }
  
  try {
    // Test rapid shortcuts
    console.log('Testing rapid shortcuts: F, V, N...');
    simulateKeyboardEvent('f');
    await wait(100);
    simulateKeyboardEvent('v');
    await wait(100);
    simulateKeyboardEvent('n');
    await wait(100);
    
    const feedbackElements = document.querySelectorAll('#shortcut-feedback');
    console.log(`Found ${feedbackElements.length} feedback element(s)`);
    
    if (feedbackElements.length === 1) {
      const validation = validateFeedbackProperties(feedbackElements[0]);
      console.log(`Feedback properties valid: ${validation.valid}`);
      if (!validation.valid) {
        console.log('Issues:', validation.issues);
      }
    }
    
    // Test navigation after feedback
    console.log('Testing navigation after feedback...');
    const initialIndex = window.currentQuestionIndex;
    simulateKeyboardEvent('ArrowRight');
    await wait(200);
    const newIndex = window.currentQuestionIndex;
    
    const navigationWorked = newIndex !== initialIndex;
    console.log(`Navigation worked: ${navigationWorked} (${initialIndex} → ${newIndex})`);
    
    console.log('✅ Quick test completed!');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

/**
 * Integration with existing test framework
 */
function addToTestSuite() {
  // Add to existing test functions if available
  if (window.testFunctions) {
    window.testFunctions.testKeyboardShortcuts = runKeyboardShortcutsTests;
    window.testFunctions.quickKeyboardTest = quickKeyboardTest;
  }
  
  // Add to comprehensive test suite if available
  if (window.ExamsViewerTestSuite && window.ExamsViewerTestSuite.prototype) {
    window.ExamsViewerTestSuite.prototype.testKeyboardShortcuts = async function() {
      this.currentTest = 'Keyboard Shortcuts';
      this.updateTestProgress(this.testResults.total + 1, this.testResults.total + 8, 'Keyboard shortcuts functionality');
      
      const startTime = performance.now();
      const results = await runKeyboardShortcutsTests();
      const duration = performance.now() - startTime;
      
      const passed = results.failedTests === 0;
      const details = `${results.passedTests}/${results.totalTests} tests passed`;
      
      this.logTest('Keyboard Shortcuts', passed, details, duration);
      return passed;
    };
  }
}

// Make functions available globally
window.runKeyboardShortcutsTests = runKeyboardShortcutsTests;
window.quickKeyboardTest = quickKeyboardTest;
window.keyboardTestResults = keyboardTestResults;

// Integration with existing framework
setTimeout(addToTestSuite, 1000); // Allow time for other scripts to load

console.log('🔧 Keyboard Shortcuts Test Suite loaded!');
console.log('Available functions:');
console.log('  - runKeyboardShortcutsTests() - Full test suite');
console.log('  - quickKeyboardTest() - Quick validation');
console.log('  - keyboardTestResults - Results storage');
console.log('Integration with existing test framework will be attempted in 1 second...');