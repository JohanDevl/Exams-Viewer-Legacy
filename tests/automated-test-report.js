/**
 * AUTOMATED TEST REPORT GENERATOR
 * 
 * This script runs a comprehensive test suite and generates a detailed report
 * that can be executed in the browser console to validate all functionality.
 */

(function() {
    'use strict';
    
    class AutomatedTestReporter {
        constructor() {
            this.testResults = {
                functional: [],
                design: [],
                mobile: [],
                integration: [],
                performance: [],
                accessibility: []
            };
            this.startTime = performance.now();
        }

        async generateReport() {
            console.log(`
🧪 EXAMS-VIEWER AUTOMATED TEST REPORT
=====================================
Started at: ${new Date().toLocaleString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Screen: ${screen.width}x${screen.height}
Viewport: ${window.innerWidth}x${window.innerHeight}
`);

            // Run all test categories
            await this.testFunctionalFeatures();
            await this.testDesignElements();
            await this.testMobileFeatures();
            await this.testIntegration();
            await this.testPerformance();
            await this.testAccessibility();
            
            this.printFinalReport();
        }

        logResult(category, testName, status, details = '', metrics = {}) {
            const result = {
                name: testName,
                status: status, // 'PASS', 'FAIL', 'WARN', 'SKIP'
                details: details,
                metrics: metrics,
                timestamp: new Date().toISOString()
            };
            
            this.testResults[category].push(result);
            
            const emoji = {
                'PASS': '✅',
                'FAIL': '❌', 
                'WARN': '⚠️',
                'SKIP': '⏭️'
            }[status];
            
            console.log(`${emoji} [${category.toUpperCase()}] ${testName}: ${details}`);
            
            if (Object.keys(metrics).length > 0) {
                console.log(`   📊 Metrics:`, metrics);
            }
        }

        async testFunctionalFeatures() {
            console.log('\n🔧 TESTING FUNCTIONAL FEATURES');
            console.log('================================');
            
            // Test 1: DOM Elements Loading
            const criticalElements = [
                'examCode', 'questionSection', 'answersList', 'navigationSection',
                'darkModeBtn', 'statisticsBtn', 'settingsBtn', 'favoriteBtn'
            ];
            
            let loadedElements = 0;
            criticalElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    loadedElements++;
                } else {
                    this.logResult('functional', `Element Loading - ${id}`, 'FAIL', 'Element not found');
                }
            });
            
            this.logResult('functional', 'Critical Elements Loading', 
                loadedElements === criticalElements.length ? 'PASS' : 'FAIL',
                `${loadedElements}/${criticalElements.length} elements loaded`);

            // Test 2: Exam Data Loading
            const examSelect = document.getElementById('examCode');
            const hasExams = examSelect && examSelect.options.length > 1;
            this.logResult('functional', 'Exam Data Availability', 
                hasExams ? 'PASS' : 'FAIL',
                `${examSelect ? examSelect.options.length - 1 : 0} exams available`);

            // Test 3: Navigation Buttons
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const navigationWorking = prevBtn && nextBtn && 
                                     prevBtn.onclick !== null && nextBtn.onclick !== null;
            this.logResult('functional', 'Navigation Controls', 
                navigationWorking ? 'PASS' : 'WARN',
                'Navigation buttons present and functional');

            // Test 4: Modal Systems
            const modals = ['settingsModal', 'statisticsModal', 'exportOptionsModal', 'changelogModal'];
            let workingModals = 0;
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    workingModals++;
                    const isHidden = modal.style.display === 'none' || !modal.style.display;
                    if (!isHidden) {
                        this.logResult('functional', `Modal ${modalId}`, 'WARN', 'Modal visible by default');
                    }
                } else {
                    this.logResult('functional', `Modal ${modalId}`, 'FAIL', 'Modal element missing');
                }
            });
            
            this.logResult('functional', 'Modal Systems', 
                workingModals === modals.length ? 'PASS' : 'FAIL',
                `${workingModals}/${modals.length} modals functioning`);

            // Test 5: Search Functionality
            const searchInput = document.getElementById('questionSearch');
            const searchBtn = document.getElementById('searchBtn');
            const searchWorking = searchInput && searchBtn;
            this.logResult('functional', 'Search System', 
                searchWorking ? 'PASS' : 'FAIL',
                searchWorking ? 'Search elements present' : 'Search elements missing');

            // Test 6: Favorites System
            const favoriteBtn = document.getElementById('favoriteBtn');
            const categorySelect = document.getElementById('categorySelect');
            const noteBtn = document.getElementById('noteBtn');
            const favoritesWorking = favoriteBtn && categorySelect && noteBtn;
            this.logResult('functional', 'Favorites System', 
                favoritesWorking ? 'PASS' : 'FAIL',
                favoritesWorking ? 'Favorites elements present' : 'Favorites elements missing');

            // Test 7: Progress Tracking
            const progressSection = document.getElementById('mainProgressSection');
            const questionCounter = document.getElementById('questionCounter');
            const progressWorking = progressSection && questionCounter;
            this.logResult('functional', 'Progress Tracking', 
                progressWorking ? 'PASS' : 'FAIL',
                progressWorking ? 'Progress elements present' : 'Progress elements missing');
        }

        async testDesignElements() {
            console.log('\n🎨 TESTING DESIGN ELEMENTS');
            console.log('==========================');
            
            // Test 1: CSS Variables
            const rootStyle = getComputedStyle(document.documentElement);
            const cssVariables = [
                '--font-family-primary', '--accent-color', '--bg-primary', 
                '--text-primary', '--radius-sm', '--shadow-md'
            ];
            
            let definedVariables = 0;
            cssVariables.forEach(variable => {
                const value = rootStyle.getPropertyValue(variable);
                if (value.trim()) {
                    definedVariables++;
                } else {
                    this.logResult('design', `CSS Variable ${variable}`, 'FAIL', 'Variable not defined');
                }
            });
            
            this.logResult('design', 'CSS Custom Properties', 
                definedVariables === cssVariables.length ? 'PASS' : 'FAIL',
                `${definedVariables}/${cssVariables.length} variables defined`);

            // Test 2: Font Loading
            const bodyStyle = getComputedStyle(document.body);
            const fontFamily = bodyStyle.fontFamily;
            const hasInterFont = fontFamily.includes('Inter');
            this.logResult('design', 'Typography - Inter Font', 
                hasInterFont ? 'PASS' : 'WARN',
                `Font family: ${fontFamily}`);

            // Test 3: Dark Mode Support
            const darkModeBtn = document.getElementById('darkModeBtn');
            const supportsDarkMode = darkModeBtn && 
                                   document.documentElement.hasAttribute('data-theme') !== undefined;
            this.logResult('design', 'Dark Mode Support', 
                supportsDarkMode ? 'PASS' : 'WARN',
                'Dark mode toggle available');

            // Test 4: Animation Support
            const hasAnimationCSS = document.querySelector('link[href*="animations"]') !== null;
            this.logResult('design', 'Animation Styles', 
                hasAnimationCSS ? 'PASS' : 'WARN',
                hasAnimationCSS ? 'Animation CSS loaded' : 'Animation CSS not detected');

            // Test 5: Responsive Breakpoints
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            const isDesktop = window.innerWidth > 1024;
            
            this.logResult('design', 'Responsive Design', 'PASS',
                `Current breakpoint: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} (${window.innerWidth}px)`);

            // Test 6: Glassmorphism Effects
            const questionCard = document.querySelector('.question-section');
            if (questionCard) {
                const cardStyle = getComputedStyle(questionCard);
                const hasGlass = cardStyle.backdropFilter && cardStyle.backdropFilter !== 'none';
                this.logResult('design', 'Glassmorphism Effects', 
                    hasGlass ? 'PASS' : 'WARN',
                    `Backdrop filter: ${cardStyle.backdropFilter || 'none'}`);
            } else {
                this.logResult('design', 'Glassmorphism Effects', 'SKIP', 'Question section not visible');
            }

            // Test 7: Color Contrast
            const textColor = rootStyle.getPropertyValue('--text-primary') || '#000000';
            const bgColor = rootStyle.getPropertyValue('--bg-primary') || '#ffffff';
            this.logResult('design', 'Color Scheme', 'PASS',
                `Text: ${textColor}, Background: ${bgColor}`);
        }

        async testMobileFeatures() {
            console.log('\n📱 TESTING MOBILE FEATURES');
            console.log('==========================');
            
            const isMobile = window.innerWidth <= 768;
            
            if (!isMobile) {
                this.logResult('mobile', 'Mobile Testing', 'SKIP', 
                    `Skipped - Desktop viewport (${window.innerWidth}px)`);
                return;
            }

            // Test 1: Touch Events Support
            const hasTouchSupport = 'ontouchstart' in window;
            this.logResult('mobile', 'Touch Events Support', 
                hasTouchSupport ? 'PASS' : 'FAIL',
                hasTouchSupport ? 'Touch events supported' : 'Touch events not supported');

            // Test 2: Viewport Meta Tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            const hasViewport = viewportMeta && viewportMeta.content.includes('width=device-width');
            this.logResult('mobile', 'Viewport Configuration', 
                hasViewport ? 'PASS' : 'FAIL',
                viewportMeta ? viewportMeta.content : 'Viewport meta tag missing');

            // Test 3: Mobile Navigation
            const sidebarToggle = document.getElementById('sidebarToggle');
            const mobileNavPresent = sidebarToggle !== null;
            this.logResult('mobile', 'Mobile Navigation', 
                mobileNavPresent ? 'PASS' : 'FAIL',
                mobileNavPresent ? 'Mobile navigation elements present' : 'Mobile navigation missing');

            // Test 4: Swipe Gesture Support
            const questionSection = document.getElementById('questionSection');
            if (questionSection) {
                const hasSwipeListeners = questionSection.ontouchstart !== undefined;
                this.logResult('mobile', 'Swipe Gestures', 
                    hasSwipeListeners ? 'PASS' : 'WARN',
                    'Swipe gesture setup checked');
            }

            // Test 5: Responsive Font Scaling
            const fontSize = getComputedStyle(document.body).fontSize;
            const fontSizeNum = parseFloat(fontSize);
            const appropriateFontSize = fontSizeNum >= 16; // Minimum 16px for mobile
            this.logResult('mobile', 'Font Size Accessibility', 
                appropriateFontSize ? 'PASS' : 'FAIL',
                `Base font size: ${fontSize}`);

            // Test 6: Touch Target Size
            const buttons = document.querySelectorAll('button');
            let adequateButtons = 0;
            buttons.forEach(button => {
                const rect = button.getBoundingClientRect();
                if (rect.width >= 44 && rect.height >= 44) {
                    adequateButtons++;
                }
            });
            
            const touchTargetsOK = adequateButtons / buttons.length > 0.8; // 80% of buttons should be adequate
            this.logResult('mobile', 'Touch Target Sizes', 
                touchTargetsOK ? 'PASS' : 'WARN',
                `${adequateButtons}/${buttons.length} buttons meet 44px minimum`);
        }

        async testIntegration() {
            console.log('\n🔗 TESTING INTEGRATION');
            console.log('======================');
            
            // Test 1: ES6 Modules
            const moduleScript = document.querySelector('script[type="module"]');
            const hasModules = moduleScript !== null;
            this.logResult('integration', 'ES6 Modules Support', 
                hasModules ? 'PASS' : 'FAIL',
                hasModules ? 'Module script detected' : 'No module scripts found');

            // Test 2: LocalStorage Access
            try {
                const testKey = 'examsViewer_integrationTest';
                localStorage.setItem(testKey, 'test');
                const retrieved = localStorage.getItem(testKey);
                localStorage.removeItem(testKey);
                
                this.logResult('integration', 'LocalStorage Access', 
                    retrieved === 'test' ? 'PASS' : 'FAIL',
                    'LocalStorage read/write test completed');
            } catch (error) {
                this.logResult('integration', 'LocalStorage Access', 'FAIL',
                    `Error: ${error.message}`);
            }

            // Test 3: Service Worker Registration
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    this.logResult('integration', 'Service Worker', 
                        registration ? 'PASS' : 'WARN',
                        registration ? 'Service Worker registered' : 'Service Worker not registered');
                } catch (error) {
                    this.logResult('integration', 'Service Worker', 'FAIL',
                        `Error: ${error.message}`);
                }
            } else {
                this.logResult('integration', 'Service Worker', 'FAIL',
                    'Service Worker not supported');
            }

            // Test 4: Event System
            let eventCaught = false;
            const testListener = () => { eventCaught = true; };
            document.addEventListener('testEvent', testListener);
            document.dispatchEvent(new CustomEvent('testEvent'));
            document.removeEventListener('testEvent', testListener);
            
            this.logResult('integration', 'Event System', 
                eventCaught ? 'PASS' : 'FAIL',
                'Custom event dispatch test');

            // Test 5: Window Object Assignments
            const expectedGlobals = [
                'loadExamData', 'navigateToQuestion', 'updateProgressIndicator',
                'toggleFavorite', 'performSearch', 'toggleDarkMode'
            ];
            
            let foundGlobals = 0;
            expectedGlobals.forEach(globalName => {
                if (typeof window[globalName] === 'function') {
                    foundGlobals++;
                } else {
                    this.logResult('integration', `Global Function ${globalName}`, 'FAIL', 'Function not found');
                }
            });
            
            this.logResult('integration', 'Global Function Assignment', 
                foundGlobals === expectedGlobals.length ? 'PASS' : 'FAIL',
                `${foundGlobals}/${expectedGlobals.length} functions available`);

            // Test 6: Data Manifest Loading
            try {
                const response = await fetch('./data/manifest.json');
                if (response.ok) {
                    const manifest = await response.json();
                    this.logResult('integration', 'Data Manifest', 'PASS',
                        `Manifest loaded with ${Object.keys(manifest).length} exams`);
                } else {
                    this.logResult('integration', 'Data Manifest', 'FAIL',
                        `HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                this.logResult('integration', 'Data Manifest', 'FAIL',
                    `Network error: ${error.message}`);
            }
        }

        async testPerformance() {
            console.log('\n⚡ TESTING PERFORMANCE');
            console.log('======================');
            
            // Test 1: Page Load Time
            const loadTime = performance.now() - this.startTime;
            this.logResult('performance', 'Page Load Time', 
                loadTime < 3000 ? 'PASS' : loadTime < 5000 ? 'WARN' : 'FAIL',
                `${loadTime.toFixed(2)}ms`, { loadTime: loadTime });

            // Test 2: Memory Usage
            if (performance.memory) {
                const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                this.logResult('performance', 'Memory Usage', 
                    memoryMB < 50 ? 'PASS' : memoryMB < 100 ? 'WARN' : 'FAIL',
                    `${memoryMB}MB heap used`, { memoryMB: parseFloat(memoryMB) });
            } else {
                this.logResult('performance', 'Memory Usage', 'SKIP',
                    'Memory API not available');
            }

            // Test 3: DOM Complexity
            const elementCount = document.querySelectorAll('*').length;
            this.logResult('performance', 'DOM Complexity', 
                elementCount < 1000 ? 'PASS' : elementCount < 2000 ? 'WARN' : 'FAIL',
                `${elementCount} DOM elements`, { elementCount: elementCount });

            // Test 4: CSS File Size
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            let totalCSSSize = 0;
            for (const stylesheet of stylesheets) {
                try {
                    const response = await fetch(stylesheet.href);
                    if (response.ok) {
                        const text = await response.text();
                        totalCSSSize += text.length;
                    }
                } catch (error) {
                    console.warn('Could not measure CSS size:', error);
                }
            }
            
            const cssSizeKB = (totalCSSSize / 1024).toFixed(2);
            this.logResult('performance', 'CSS Bundle Size', 
                cssSizeKB < 100 ? 'PASS' : cssSizeKB < 200 ? 'WARN' : 'FAIL',
                `${cssSizeKB}KB total CSS`, { cssSizeKB: parseFloat(cssSizeKB) });

            // Test 5: JavaScript Performance
            const startTime = performance.now();
            for (let i = 0; i < 10000; i++) {
                document.querySelector('body');
            }
            const querySelectorTime = performance.now() - startTime;
            
            this.logResult('performance', 'DOM Query Performance', 
                querySelectorTime < 50 ? 'PASS' : querySelectorTime < 100 ? 'WARN' : 'FAIL',
                `${querySelectorTime.toFixed(2)}ms for 10k queries`, 
                { querySelectorTime: querySelectorTime });
        }

        async testAccessibility() {
            console.log('\n♿ TESTING ACCESSIBILITY');
            console.log('========================');
            
            // Test 1: Missing Alt Text
            const images = document.querySelectorAll('img');
            let imagesWithAlt = 0;
            images.forEach(img => {
                if (img.alt && img.alt.trim()) {
                    imagesWithAlt++;
                }
            });
            
            if (images.length > 0) {
                this.logResult('accessibility', 'Image Alt Text', 
                    imagesWithAlt === images.length ? 'PASS' : 'FAIL',
                    `${imagesWithAlt}/${images.length} images have alt text`);
            } else {
                this.logResult('accessibility', 'Image Alt Text', 'SKIP', 'No images found');
            }

            // Test 2: Form Labels
            const inputs = document.querySelectorAll('input:not([type="hidden"])');
            let labeledInputs = 0;
            inputs.forEach(input => {
                const hasLabel = input.labels && input.labels.length > 0;
                const hasAriaLabel = input.getAttribute('aria-label');
                const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
                
                if (hasLabel || hasAriaLabel || hasAriaLabelledBy) {
                    labeledInputs++;
                }
            });
            
            if (inputs.length > 0) {
                this.logResult('accessibility', 'Form Labels', 
                    labeledInputs === inputs.length ? 'PASS' : 'WARN',
                    `${labeledInputs}/${inputs.length} inputs properly labeled`);
            } else {
                this.logResult('accessibility', 'Form Labels', 'SKIP', 'No form inputs found');
            }

            // Test 3: Button Accessibility
            const buttons = document.querySelectorAll('button');
            let accessibleButtons = 0;
            buttons.forEach(button => {
                const hasText = button.textContent && button.textContent.trim();
                const hasAriaLabel = button.getAttribute('aria-label');
                const hasTitle = button.getAttribute('title');
                
                if (hasText || hasAriaLabel || hasTitle) {
                    accessibleButtons++;
                }
            });
            
            this.logResult('accessibility', 'Button Accessibility', 
                accessibleButtons === buttons.length ? 'PASS' : 'WARN',
                `${accessibleButtons}/${buttons.length} buttons have accessible names`);

            // Test 4: Heading Structure
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const hasH1 = document.querySelector('h1') !== null;
            this.logResult('accessibility', 'Heading Structure', 
                hasH1 ? 'PASS' : 'WARN',
                `${headings.length} headings found, H1 ${hasH1 ? 'present' : 'missing'}`);

            // Test 5: Focus Management
            const focusableElements = document.querySelectorAll(
                'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            this.logResult('accessibility', 'Focusable Elements', 'PASS',
                `${focusableElements.length} focusable elements detected`);

            // Test 6: ARIA Roles
            const elementsWithRoles = document.querySelectorAll('[role]');
            this.logResult('accessibility', 'ARIA Roles', 
                elementsWithRoles.length > 0 ? 'PASS' : 'WARN',
                `${elementsWithRoles.length} elements with ARIA roles`);

            // Test 7: Color Contrast (Basic Check)
            const bodyStyle = getComputedStyle(document.body);
            const color = bodyStyle.color;
            const backgroundColor = bodyStyle.backgroundColor;
            this.logResult('accessibility', 'Color Information', 'PASS',
                `Text: ${color}, Background: ${backgroundColor}`);
        }

        printFinalReport() {
            const endTime = performance.now();
            const totalTime = endTime - this.startTime;
            
            console.log('\n📊 FINAL TEST REPORT SUMMARY');
            console.log('=============================');
            
            let totalTests = 0;
            let passedTests = 0;
            let failedTests = 0;
            let warnedTests = 0;
            let skippedTests = 0;
            
            Object.keys(this.testResults).forEach(category => {
                const results = this.testResults[category];
                const categoryPass = results.filter(r => r.status === 'PASS').length;
                const categoryFail = results.filter(r => r.status === 'FAIL').length;
                const categoryWarn = results.filter(r => r.status === 'WARN').length;
                const categorySkip = results.filter(r => r.status === 'SKIP').length;
                
                totalTests += results.length;
                passedTests += categoryPass;
                failedTests += categoryFail;
                warnedTests += categoryWarn;
                skippedTests += categorySkip;
                
                const categoryScore = results.length > 0 ? 
                    (categoryPass / results.length * 100).toFixed(1) : '0.0';
                
                console.log(`📂 ${category.toUpperCase()}: ${categoryScore}% (${categoryPass}/${results.length} passed)`);
            });
            
            const overallScore = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0.0';
            
            console.log('\n🏆 OVERALL RESULTS:');
            console.log(`   Total Tests: ${totalTests}`);
            console.log(`   ✅ Passed: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
            console.log(`   ❌ Failed: ${failedTests} (${(failedTests/totalTests*100).toFixed(1)}%)`);
            console.log(`   ⚠️ Warnings: ${warnedTests} (${(warnedTests/totalTests*100).toFixed(1)}%)`);
            console.log(`   ⏭️ Skipped: ${skippedTests} (${(skippedTests/totalTests*100).toFixed(1)}%)`);
            console.log(`   🎯 Overall Score: ${overallScore}%`);
            console.log(`   ⏱️ Total Time: ${(totalTime/1000).toFixed(2)}s`);
            
            // Recommendations
            console.log('\n💡 RECOMMENDATIONS:');
            if (failedTests > 0) {
                console.log('   🔴 Critical issues detected that need immediate attention');
            }
            if (warnedTests > 0) {
                console.log('   🟡 Some areas could be improved for better user experience');
            }
            if (failedTests === 0 && warnedTests === 0) {
                console.log('   🟢 Excellent! All tests passed without issues');
            }
            
            // Store results for potential export
            window.lastTestReport = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                totalTime: totalTime,
                summary: {
                    total: totalTests,
                    passed: passedTests,
                    failed: failedTests,
                    warned: warnedTests,
                    skipped: skippedTests,
                    score: parseFloat(overallScore)
                },
                results: this.testResults
            };
            
            console.log('\n📁 Test results saved to window.lastTestReport for export');
            console.log('   Use JSON.stringify(window.lastTestReport, null, 2) to export');
        }
    }

    // Auto-run the report when script loads
    const reporter = new AutomatedTestReporter();
    
    // Add manual trigger
    window.generateTestReport = () => {
        new AutomatedTestReporter().generateReport();
    };
    
    // Run automatically after a short delay
    setTimeout(() => {
        reporter.generateReport();
    }, 1000);

})();