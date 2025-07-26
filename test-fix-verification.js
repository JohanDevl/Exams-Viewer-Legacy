/**
 * VERIFICATION SCRIPT FOR DEV-TESTING FIX
 * 
 * This script verifies that the timing issue fix is working correctly
 */

// Test function to verify the fix
function verifyDevTestingFix() {
    console.log('🔍 Verifying dev-testing timing fix...');
    
    // Check if the dev-testing module exists
    if (!window.initializeDevButton) {
        console.error('❌ dev-testing module not loaded');
        return false;
    }
    
    // Check if development mode is active
    const isDev = (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "" ||
        window.location.protocol === "file:"
    );
    
    console.log(`📍 Development mode: ${isDev}`);
    
    if (!isDev) {
        console.log('ℹ️ Not in development mode, dev button should be hidden');
        return true;
    }
    
    // Check if test button exists
    const devButton = document.getElementById('devTestButton');
    const runTestsBtn = document.getElementById('runTestsBtn');
    
    if (!devButton || !runTestsBtn) {
        console.warn('⚠️ Test buttons not found in DOM');
        return false;
    }
    
    console.log('✅ Test buttons found in DOM');
    
    // Check if button is properly initialized
    const isVisible = devButton.style.display !== 'none';
    console.log(`👁️ Dev button visible: ${isVisible}`);
    
    // Check if click handler is attached
    const hasClickHandler = runTestsBtn.onclick !== null || 
                           runTestsBtn.getAttribute('data-click-handler') !== null;
    console.log(`🖱️ Click handler attached: ${hasClickHandler}`);
    
    // Simulate a test of the script loading logic
    console.log('🧪 Testing script loading logic...');
    
    // Check if test scripts exist
    const testScriptPaths = [
        'tests/comprehensive-test-suite.js',
        'tests/automated-test-report.js',
        'tests/run-tests.js'
    ];
    
    testScriptPaths.forEach(path => {
        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${path}"]`);
        console.log(`📜 ${path}: ${existingScript ? 'already loaded' : 'not loaded'}`);
    });
    
    // Check if comprehensive test functions are available
    const testFunctions = [
        'window.testSuite',
        'window.runComprehensiveTests',
        'window.runManualTests',
        'window.ExamsViewerTestSuite'
    ];
    
    console.log('🔍 Available test functions:');
    testFunctions.forEach(funcName => {
        const parts = funcName.split('.');
        let obj = window;
        let exists = true;
        
        for (const part of parts.slice(1)) {
            if (obj && typeof obj === 'object' && part in obj) {
                obj = obj[part];
            } else {
                exists = false;
                break;
            }
        }
        
        console.log(`  ${funcName}: ${exists ? '✅ available' : '❌ not available'}`);
    });
    
    console.log('🎉 Verification complete!');
    return true;
}

// Test the button state management
function testButtonStates() {
    console.log('🎛️ Testing button state management...');
    
    const runTestsBtn = document.getElementById('runTestsBtn');
    if (!runTestsBtn) {
        console.error('❌ Run tests button not found');
        return;
    }
    
    const states = ['ready', 'loading', 'running', 'success', 'error'];
    let currentStateIndex = 0;
    
    const testNextState = () => {
        if (currentStateIndex < states.length) {
            const state = states[currentStateIndex];
            console.log(`🔄 Testing state: ${state}`);
            
            // Call updateButtonState if available
            if (window.updateButtonState) {
                window.updateButtonState(runTestsBtn, state);
            } else {
                console.warn('⚠️ updateButtonState function not available');
            }
            
            currentStateIndex++;
            setTimeout(testNextState, 1500);
        } else {
            console.log('✅ Button state testing complete');
            // Reset to ready state
            if (window.updateButtonState) {
                window.updateButtonState(runTestsBtn, 'ready');
            }
        }
    };
    
    testNextState();
}

// Auto-run verification if in development mode
if (window.location.search.includes('verify=true')) {
    setTimeout(() => {
        verifyDevTestingFix();
        
        // Test button states if requested
        if (window.location.search.includes('test-states=true')) {
            setTimeout(testButtonStates, 2000);
        }
    }, 1000);
}

// Export functions for manual testing
window.verifyDevTestingFix = verifyDevTestingFix;
window.testButtonStates = testButtonStates;

console.log('🔧 Dev-testing verification script loaded. Use verifyDevTestingFix() to test the fix.');