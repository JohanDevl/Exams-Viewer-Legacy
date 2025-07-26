/**
 * MANUAL TEST RUNNER FOR EXAMS-VIEWER
 * 
 * This script provides manual testing functions that can be called
 * from the browser console to test specific functionalities.
 */

// Manual test launcher function
window.runManualTests = function() {
    console.log('🧪 Starting Manual Test Suite...');
    
    if (window.testSuite) {
        window.testSuite.runAllTests();
    } else {
        console.error('❌ Test suite not loaded. Please refresh the page.');
    }
};

// Individual test functions for manual execution
window.testFunctions = {
    // Navigation tests
    testNavigation: () => {
        if (window.testSuite) {
            window.testSuite.testNavigationFunctionality();
        }
    },
    
    // Search tests
    testSearch: () => {
        if (window.testSuite) {
            window.testSuite.testSearchSystem();
        }
    },
    
    // Favorites tests
    testFavorites: () => {
        if (window.testSuite) {
            window.testSuite.testFavoritesSystem();
        }
    },
    
    // Settings tests
    testSettings: () => {
        if (window.testSuite) {
            window.testSuite.testSettingsAndModals();
        }
    },
    
    // Design tests
    testDesign: () => {
        if (window.testSuite) {
            window.testSuite.testModernDesign();
        }
    },
    
    // Mobile tests
    testMobile: () => {
        if (window.testSuite) {
            window.testSuite.testMobileAdvancedFeatures();
        }
    },
    
    // Integration tests
    testIntegration: () => {
        if (window.testSuite) {
            window.testSuite.testIntegration();
        }
    },
    
    // Performance tests
    testPerformance: () => {
        if (window.testSuite) {
            window.testSuite.testPerformanceAndRegression();
        }
    }
};

// Test specific exam loading with detailed reporting
window.testExamLoading = async function(examCode = null) {
    console.log('🔍 Testing Exam Loading...');
    
    const examSelect = document.getElementById('examCode');
    if (!examSelect) {
        console.error('❌ Exam select element not found');
        return;
    }

    // If no exam code specified, use first available
    if (!examCode && examSelect.options.length > 1) {
        examCode = examSelect.options[1].value;
    }

    if (!examCode) {
        console.error('❌ No exam available to test');
        return;
    }

    console.log(`📚 Loading exam: ${examCode}`);
    
    const startTime = performance.now();
    
    // Select the exam
    examSelect.value = examCode;
    const changeEvent = new Event('change', { bubbles: true });
    examSelect.dispatchEvent(changeEvent);
    
    // Monitor loading
    const checkLoading = setInterval(() => {
        const loadingSection = document.getElementById('loadingSection');
        const questionSection = document.getElementById('questionSection');
        
        if (loadingSection && loadingSection.style.display === 'none' &&
            questionSection && questionSection.style.display !== 'none') {
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            console.log(`✅ Exam loaded successfully in ${loadTime.toFixed(2)}ms`);
            
            // Check question content
            const questionText = document.getElementById('questionText');
            const answersList = document.getElementById('answersList');
            const questionCounter = document.getElementById('questionCounter');
            
            console.log(`📊 Question content loaded: ${questionText && questionText.innerHTML.trim().length > 0}`);
            console.log(`📝 Answers loaded: ${answersList && answersList.children.length > 0}`);
            console.log(`🔢 Question counter: ${questionCounter ? questionCounter.textContent : 'not found'}`);
            
            clearInterval(checkLoading);
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkLoading);
        console.log('⏰ Loading test timed out after 10 seconds');
    }, 10000);
};

// Test all available exams
window.testAllExams = async function() {
    console.log('🌐 Testing All Available Exams...');
    
    const examSelect = document.getElementById('examCode');
    if (!examSelect || examSelect.options.length <= 1) {
        console.error('❌ No exams available to test');
        return;
    }

    const examCodes = [];
    for (let i = 1; i < examSelect.options.length; i++) {
        examCodes.push(examSelect.options[i].value);
    }

    console.log(`📚 Found ${examCodes.length} exams to test`);

    for (const examCode of examCodes) {
        console.log(`\n🔍 Testing exam: ${examCode}`);
        await window.testExamLoading(examCode);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
    }

    console.log('\n✅ All exams tested');
};

// Test design responsiveness
window.testResponsiveness = function() {
    console.log('📱 Testing Responsive Design...');
    
    const viewports = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 1440, height: 900, name: 'Desktop' }
    ];

    viewports.forEach((viewport, index) => {
        setTimeout(() => {
            window.resizeTo(viewport.width, viewport.height);
            console.log(`📏 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
            
            // Check if layout adapts
            const container = document.querySelector('.container');
            if (container) {
                const computedStyle = window.getComputedStyle(container);
                console.log(`   Container width: ${computedStyle.width}`);
                console.log(`   Font size: ${computedStyle.fontSize}`);
            }
            
            // Check mobile navigation
            if (viewport.width <= 768) {
                const mobileElements = document.querySelectorAll('[class*="mobile"]');
                console.log(`   Mobile elements visible: ${mobileElements.length}`);
            }
        }, index * 1000);
    });
};

// Performance monitoring
window.monitorPerformance = function(duration = 30000) {
    console.log(`⚡ Monitoring performance for ${duration/1000} seconds...`);
    
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const startTime = performance.now();
    
    const monitor = setInterval(() => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        
        if (performance.memory) {
            const currentMemory = performance.memory.usedJSHeapSize;
            const memoryDelta = ((currentMemory - initialMemory) / 1024 / 1024).toFixed(2);
            console.log(`💾 Memory change: ${memoryDelta}MB (${elapsed.toFixed(0)}ms elapsed)`);
        }
        
        // Check for performance issues
        const entries = performance.getEntriesByType('measure');
        if (entries.length > 0) {
            const slowEntries = entries.filter(entry => entry.duration > 100);
            if (slowEntries.length > 0) {
                console.warn(`⚠️ Slow operations detected:`, slowEntries);
            }
        }
    }, 5000);
    
    setTimeout(() => {
        clearInterval(monitor);
        console.log('✅ Performance monitoring completed');
    }, duration);
};

// Accessibility audit
window.testAccessibility = function() {
    console.log('♿ Testing Accessibility...');
    
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        if (!img.alt) {
            issues.push(`Image ${index + 1} missing alt text`);
        }
    });
    
    // Check for missing labels
    const inputs = document.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach((input, index) => {
        if (!input.labels || input.labels.length === 0) {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                issues.push(`Input ${index + 1} missing label or aria-label`);
            }
        }
    });
    
    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    console.log(`🎯 Found ${focusableElements.length} focusable elements`);
    
    // Check for ARIA labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            issues.push(`Button ${index + 1} missing text or aria-label`);
        }
    });
    
    if (issues.length === 0) {
        console.log('✅ No accessibility issues found');
    } else {
        console.warn(`⚠️ Found ${issues.length} accessibility issues:`);
        issues.forEach(issue => console.warn(`  - ${issue}`));
    }
    
    return issues;
};

// Console help
window.showTestHelp = function() {
    console.log(`
🧪 EXAMS-VIEWER TEST SUITE HELP
==============================

Available Test Functions:
- runManualTests()           : Run complete test suite
- testExamLoading(examCode)  : Test loading specific exam
- testAllExams()             : Test all available exams
- testResponsiveness()       : Test responsive design
- monitorPerformance(ms)     : Monitor performance for duration
- testAccessibility()        : Run accessibility audit

Individual Test Categories:
- testFunctions.testNavigation()   : Test navigation features
- testFunctions.testSearch()       : Test search functionality
- testFunctions.testFavorites()    : Test favorites system
- testFunctions.testSettings()     : Test settings and modals
- testFunctions.testDesign()       : Test modern design elements
- testFunctions.testMobile()       : Test mobile features
- testFunctions.testIntegration()  : Test integration
- testFunctions.testPerformance()  : Test performance

Examples:
  runManualTests()                    // Run all tests
  testExamLoading('CAD')             // Test CAD exam
  monitorPerformance(60000)          // Monitor for 1 minute
  testFunctions.testNavigation()     // Test only navigation
    `);
};

// Auto-display help when loaded
console.log('🧪 Test suite loaded! Type showTestHelp() for available commands.');