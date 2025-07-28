/**
 * Test Suite for Issue #16: Enhanced Keyboard Shortcuts Implementation
 * 
 * This script tests the enhanced keyboard shortcuts functionality including:
 * 1. New Export shortcut (E)
 * 2. Visual feedback system for keyboard shortcuts
 * 3. Help modal (?) with E shortcut documentation
 * 4. Input field prevention
 * 5. Regression testing for existing shortcuts
 */

// Test configuration
const TEST_CONFIG = {
  FEEDBACK_TIMEOUT: 2000, // Time to wait for visual feedback
  MODAL_TIMEOUT: 1000,    // Time to wait for modal opening
  DELAY_BETWEEN_TESTS: 500 // Delay between test steps
};

// Test results storage
let testResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Utility function to wait for a specified time
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility function to simulate keyboard events
 */
function simulateKeyPress(key, options = {}) {
  const event = new KeyboardEvent('keydown', {
    key: key,
    code: key,
    ctrlKey: options.ctrlKey || false,
    shiftKey: options.shiftKey || false,
    metaKey: options.metaKey || false,
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(event);
  return event;
}

/**
 * Check if an element is visible
 */
function isElementVisible(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Wait for element to become visible
 */
async function waitForElementVisible(selector, timeout = 1000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
    await sleep(50);
  }
  return null;
}

/**
 * Test 1: Export Shortcut (E) functionality
 */
async function testExportShortcut() {
  console.log("🧪 Testing Export Shortcut (E)...");
  
  try {
    // Ensure we're in a valid state (exam loaded)
    if (!window.currentQuestions || window.currentQuestions.length === 0) {
      testResults.warnings.push("Export shortcut test skipped - no exam loaded");
      return;
    }
    
    // Check if export modal exists
    const exportModal = document.getElementById('exportOptionsModal');
    if (!exportModal) {
      testResults.failed.push("Export modal not found in DOM");
      return;
    }
    
    // Ensure modal is initially hidden
    exportModal.style.display = 'none';
    
    // Simulate E key press
    simulateKeyPress('e');
    
    // Wait for modal to appear
    await sleep(TEST_CONFIG.MODAL_TIMEOUT);
    
    // Check if modal is now visible
    if (isElementVisible(exportModal)) {
      testResults.passed.push("✅ Export shortcut (E) successfully opens export modal");
      
      // Close the modal for next tests
      if (typeof window.hideExportModal === 'function') {
        window.hideExportModal();
      } else {
        exportModal.style.display = 'none';
      }
    } else {
      testResults.failed.push("❌ Export shortcut (E) failed to open export modal");
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Export shortcut test error: ${error.message}`);
  }
}

/**
 * Test 2: Visual Feedback System
 */
async function testVisualFeedback() {
  console.log("🧪 Testing Visual Feedback System...");
  
  try {
    // Test shortcuts that should show visual feedback
    const shortcutsToTest = [
      { key: 'e', description: 'Export Modal' },
      { key: 'f', description: 'Toggle Favorite' },
      { key: 'n', description: 'Add/Edit Note' },
      { key: 'v', description: 'Validate Answers' }
    ];
    
    for (const shortcut of shortcutsToTest) {
      // Clear any existing feedback
      const existingFeedback = document.getElementById('shortcut-feedback');
      if (existingFeedback) {
        existingFeedback.remove();
      }
      
      // Simulate key press
      simulateKeyPress(shortcut.key);
      
      // Wait for feedback to appear
      await sleep(300);
      
      // Check for visual feedback
      const feedback = document.getElementById('shortcut-feedback');
      if (feedback && isElementVisible(feedback)) {
        testResults.passed.push(`✅ Visual feedback shown for shortcut: ${shortcut.key.toUpperCase()}`);
        
        // Verify feedback content
        const feedbackText = feedback.textContent;
        if (feedbackText.includes(shortcut.key.toUpperCase())) {
          testResults.passed.push(`✅ Visual feedback contains correct key: ${shortcut.key.toUpperCase()}`);
        } else {
          testResults.failed.push(`❌ Visual feedback missing key: ${shortcut.key.toUpperCase()}`);
        }
        
        // Clean up
        feedback.remove();
      } else {
        testResults.failed.push(`❌ No visual feedback shown for shortcut: ${shortcut.key.toUpperCase()}`);
      }
      
      // Delay between tests
      await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Visual feedback test error: ${error.message}`);
  }
}

/**
 * Test 3: Help Modal (?) and E shortcut documentation
 */
async function testHelpModal() {
  console.log("🧪 Testing Help Modal (?) and E shortcut documentation...");
  
  try {
    // Simulate ? key press
    simulateKeyPress('?');
    
    // Wait for modal to appear
    await sleep(TEST_CONFIG.MODAL_TIMEOUT);
    
    // Check if help modal is visible
    const helpModal = document.getElementById('keyboardHelpModal');
    if (helpModal && isElementVisible(helpModal)) {
      testResults.passed.push("✅ Help modal (?) opens successfully");
      
      // Check if E shortcut is documented in Actions section
      const modalContent = helpModal.innerHTML;
      if (modalContent.includes('<kbd>E</kbd>') && modalContent.includes('Export Modal')) {
        testResults.passed.push("✅ E shortcut is documented in help modal Actions section");
      } else {
        testResults.failed.push("❌ E shortcut not found in help modal Actions section");
      }
      
      // Close the modal
      if (typeof window.closeKeyboardHelp === 'function') {
        window.closeKeyboardHelp();
      } else {
        helpModal.style.display = 'none';
      }
      
    } else {
      testResults.failed.push("❌ Help modal (?) failed to open");
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Help modal test error: ${error.message}`);
  }
}

/**
 * Test 4: Input Field Prevention
 */
async function testInputFieldPrevention() {
  console.log("🧪 Testing Input Field Prevention...");
  
  try {
    // Find input fields to test
    const inputFields = [
      document.getElementById('questionJump'),
      document.getElementById('questionSearch'),
      document.getElementById('newCategoryInput')
    ].filter(field => field !== null);
    
    if (inputFields.length === 0) {
      testResults.warnings.push("No input fields found to test input prevention");
      return;
    }
    
    for (const inputField of inputFields) {
      // Focus the input field
      inputField.focus();
      
      // Simulate shortcut key press while focused
      simulateKeyPress('e');
      
      await sleep(300);
      
      // Check if export modal opened (it shouldn't)
      const exportModal = document.getElementById('exportOptionsModal');
      if (exportModal && isElementVisible(exportModal)) {
        testResults.failed.push(`❌ Shortcut activated while typing in input field: ${inputField.id}`);
        // Close modal
        if (typeof window.hideExportModal === 'function') {
          window.hideExportModal();
        }
      } else {
        testResults.passed.push(`✅ Shortcut correctly prevented in input field: ${inputField.id}`);
      }
      
      // Blur the input field
      inputField.blur();
      await sleep(200);
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Input field prevention test error: ${error.message}`);
  }
}

/**
 * Test 5: Regression Testing for Existing Shortcuts
 */
async function testExistingShortcuts() {
  console.log("🧪 Testing Existing Shortcuts Regression...");
  
  try {
    // Test existing shortcuts that should still work
    const existingShortcuts = [
      {
        key: 'f',
        test: () => {
          const favoriteBtn = document.getElementById('favoriteBtn');
          return favoriteBtn !== null;
        },
        description: 'Favorite button exists for F shortcut'
      },
      {
        key: 'n',
        test: () => {
          const noteBtn = document.getElementById('noteBtn');
          return noteBtn !== null;
        },
        description: 'Note button exists for N shortcut'
      },
      {
        key: 'v',
        test: () => {
          const validateBtn = document.getElementById('validateBtn');
          return validateBtn !== null;
        },
        description: 'Validate button exists for V shortcut'
      },
      {
        key: 'ArrowLeft',
        test: () => {
          return typeof window.navigateQuestion === 'function';
        },
        description: 'Navigation function exists for arrow keys'
      },
      {
        key: 'ArrowRight',
        test: () => {
          return typeof window.navigateQuestion === 'function';
        },
        description: 'Navigation function exists for arrow keys'
      }
    ];
    
    for (const shortcut of existingShortcuts) {
      if (shortcut.test()) {
        testResults.passed.push(`✅ ${shortcut.description}`);
      } else {
        testResults.failed.push(`❌ ${shortcut.description} - FAILED`);
      }
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Existing shortcuts test error: ${error.message}`);
  }
}

/**
 * Test 6: Additional Edge Cases
 */
async function testEdgeCases() {
  console.log("🧪 Testing Edge Cases...");
  
  try {
    // Test Escape key functionality
    simulateKeyPress('e'); // Open export modal
    await sleep(300);
    
    simulateKeyPress('Escape'); // Should close it
    await sleep(300);
    
    const exportModal = document.getElementById('exportOptionsModal');
    if (exportModal && !isElementVisible(exportModal)) {
      testResults.passed.push("✅ Escape key closes export modal");
    } else {
      testResults.failed.push("❌ Escape key failed to close export modal");
    }
    
    // Test with modifier keys (should not interfere)
    simulateKeyPress('e', { ctrlKey: true });
    await sleep(300);
    
    if (exportModal && !isElementVisible(exportModal)) {
      testResults.passed.push("✅ Ctrl+E does not trigger export modal (correctly)");
    } else {
      testResults.failed.push("❌ Ctrl+E incorrectly triggered export modal");
      if (typeof window.hideExportModal === 'function') {
        window.hideExportModal();
      }
    }
    
  } catch (error) {
    testResults.failed.push(`❌ Edge cases test error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runKeyboardShortcutsTests() {
  console.log("🚀 Starting Keyboard Shortcuts Test Suite for Issue #16");
  console.log("=" .repeat(60));
  
  // Reset test results
  testResults = { passed: [], failed: [], warnings: [] };
  
  // Run all tests
  await testExportShortcut();
  await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
  
  await testVisualFeedback();
  await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
  
  await testHelpModal();
  await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
  
  await testInputFieldPrevention();
  await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
  
  await testExistingShortcuts();
  await sleep(TEST_CONFIG.DELAY_BETWEEN_TESTS);
  
  await testEdgeCases();
  
  // Print results
  console.log("\n" + "=" .repeat(60));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=" .repeat(60));
  
  console.log(`\n✅ PASSED TESTS (${testResults.passed.length}):`);
  testResults.passed.forEach(test => console.log(`  ${test}`));
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${testResults.warnings.length}):`);
    testResults.warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ FAILED TESTS (${testResults.failed.length}):`);
    testResults.failed.forEach(test => console.log(`  ${test}`));
  }
  
  // Overall result
  const totalTests = testResults.passed.length + testResults.failed.length;
  const successRate = totalTests > 0 ? (testResults.passed.length / totalTests * 100).toFixed(1) : 0;
  
  console.log(`\n📈 OVERALL RESULT:`);
  console.log(`  Success Rate: ${successRate}% (${testResults.passed.length}/${totalTests})`);
  console.log(`  Warnings: ${testResults.warnings.length}`);
  
  if (testResults.failed.length === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! Issue #16 implementation appears to be working correctly.`);
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED. Please review the failed tests above.`);
  }
  
  console.log("=" .repeat(60));
  
  return {
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    warnings: testResults.warnings.length,
    successRate: parseFloat(successRate),
    details: testResults
  };
}

// Make the test function available globally
window.runKeyboardShortcutsTests = runKeyboardShortcutsTests;

// Auto-run if script is loaded directly
if (typeof document !== 'undefined' && document.readyState === 'complete') {
  console.log("🔧 Keyboard Shortcuts Test Suite loaded. Run 'runKeyboardShortcutsTests()' to start testing.");
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Keyboard Shortcuts Test Suite loaded. Run 'runKeyboardShortcutsTests()' to start testing.");
  });
}

// Export for ES6 module compatibility
export { runKeyboardShortcutsTests };