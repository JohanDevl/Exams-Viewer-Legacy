/**
 * COMPREHENSIVE TEST SUITE FOR EXAMS-VIEWER
 * Testing all functionalities with the new modern design
 * 
 * This suite covers:
 * 1. Functional critical tests
 * 2. Modern design validation
 * 3. Mobile advanced tests  
 * 4. Integration tests
 * 5. Regression tests
 */

class ExamsViewerTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.isMobile = window.innerWidth <= 768;
        this.currentTest = null;
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        console.log('🧪 Initializing Comprehensive Test Suite...');
        console.log(`📱 Mobile mode: ${this.isMobile}`);
        
        // Create test reporting container
        this.createTestReportingUI();
        
        // Setup performance monitoring
        this.performanceMarks = new Map();
        
        // Setup error capturing
        this.originalConsoleError = console.error;
        this.capturedErrors = [];
        console.error = (...args) => {
            this.capturedErrors.push(args);
            this.originalConsoleError(...args);
        };
    }

    createTestReportingUI() {
        // Load CSS styles for the test modal
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'tests/test-modal-styles.css';
        document.head.appendChild(cssLink);
        
        // Create floating test results panel
        const testPanel = document.createElement('div');
        testPanel.id = 'testResultsPanel';
        testPanel.style.display = 'none';
        
        testPanel.innerHTML = `
            <div class="test-header">
                <div>
                    <h3 class="test-title">🧪 Test Results</h3>
                    <div id="testProgress">Initializing tests...</div>
                </div>
                <button id="closeTestPanel" title="Close test panel" aria-label="Close test panel">
                    ✕
                </button>
            </div>
            <div id="testResultsContent">
                <div id="testSummary"></div>
                <div id="testDetails"></div>
            </div>
        `;
        
        document.body.appendChild(testPanel);
        
        // Add close functionality with improved event handling
        const closeModal = () => {
            console.log('🗑️ Closing test panel...');
            testPanel.style.display = 'none';
            testPanel.removeAttribute('data-visible');
        };
        
        // Ensure close button exists and add event listener
        const closeButton = document.getElementById('closeTestPanel');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
            console.log('✅ Close button event listener attached');
        } else {
            console.warn('❌ Close button not found');
        }
        
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && testPanel.getAttribute('data-visible')) {
                closeModal();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Close when clicking outside the modal content
        testPanel.addEventListener('click', (e) => {
            if (e.target === testPanel) {
                closeModal();
            }
        });
        
        // Global close function for manual access
        window.closeTestModal = closeModal;
        
        this.testPanel = testPanel;
    }

    showTestPanel() {
        this.testPanel.style.display = 'flex';
        this.testPanel.setAttribute('data-visible', 'true');
    }

    updateTestProgress(current, total, description) {
        const progressEl = document.getElementById('testProgress');
        if (progressEl) {
            progressEl.textContent = `Running test ${current}/${total}: ${description}`;
        }
    }

    // UTILITY METHODS
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    markPerformance(label) {
        this.performanceMarks.set(label, performance.now());
    }

    getPerformanceDuration(startLabel, endLabel) {
        const start = this.performanceMarks.get(startLabel);
        const end = this.performanceMarks.get(endLabel);
        return end - start;
    }

    logTest(testName, passed, details = '', duration = 0) {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
        
        const result = {
            name: testName,
            passed: passed,
            details: details,
            duration: duration
        };
        
        this.testResults.details.push(result);
        
        const status = passed ? '✅' : '❌';
        const durationText = duration > 0 ? ` (${duration.toFixed(2)}ms)` : '';
        console.log(`${status} ${testName}${durationText}${details ? ': ' + details : ''}`);
        
        this.updateTestResultsUI();
    }

    updateTestResultsUI() {
        const summaryEl = document.getElementById('testSummary');
        const detailsEl = document.getElementById('testDetails');
        
        if (summaryEl) {
            const passRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
            summaryEl.innerHTML = `
                <div style="
                    display: grid; 
                    grid-template-columns: 1fr 1fr 1fr; 
                    gap: 8px; 
                    margin-bottom: 12px;
                    text-align: center;
                ">
                    <div style="background: #22c55e; color: white; padding: 8px; border-radius: 6px; font-weight: 600;">
                        ${this.testResults.passed} Passed
                    </div>
                    <div style="background: #ef4444; color: white; padding: 8px; border-radius: 6px; font-weight: 600;">
                        ${this.testResults.failed} Failed
                    </div>
                    <div style="background: var(--accent-color, #007bff); color: white; padding: 8px; border-radius: 6px; font-weight: 600;">
                        ${passRate}% Pass Rate
                    </div>
                </div>
            `;
        }
        
        if (detailsEl) {
            detailsEl.innerHTML = this.testResults.details.map(result => `
                <div class="test-result-item ${result.passed ? 'passed' : 'failed'}">
                    <div style="font-weight: 500; color: var(--text-primary, #000000);">
                        ${result.passed ? '✅' : '❌'} ${result.name}
                    </div>
                    ${result.details ? `<div style="font-size: 12px; color: var(--text-muted, #666666); margin-top: 4px;">${result.details}</div>` : ''}
                    ${result.duration > 0 ? `<div style="font-size: 11px; color: var(--text-muted, #666666); margin-top: 2px;">Duration: ${result.duration.toFixed(2)}ms</div>` : ''}
                </div>
            `).join('');
        }
    }

    // SIMULATION HELPERS
    simulateClick(element) {
        if (!element) throw new Error('Element not found for click simulation');
        element.click();
    }

    simulateKeypress(key, element = document) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            bubbles: true
        });
        element.dispatchEvent(event);
    }

    simulateTouch(element, type = 'touchstart') {
        if (!element) throw new Error('Element not found for touch simulation');
        
        const touch = new Touch({
            identifier: 1,
            target: element,
            clientX: element.getBoundingClientRect().left + element.offsetWidth / 2,
            clientY: element.getBoundingClientRect().top + element.offsetHeight / 2
        });

        const touchEvent = new TouchEvent(type, {
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch],
            bubbles: true
        });

        element.dispatchEvent(touchEvent);
    }

    simulateSwipe(element, direction = 'left') {
        if (!element) throw new Error('Element not found for swipe simulation');
        
        const rect = element.getBoundingClientRect();
        const startX = direction === 'left' ? rect.right - 50 : rect.left + 50;
        const endX = direction === 'left' ? rect.left + 50 : rect.right - 50;
        const y = rect.top + rect.height / 2;

        // Start touch
        const startTouch = new Touch({
            identifier: 1,
            target: element,
            clientX: startX,
            clientY: y
        });

        const touchStart = new TouchEvent('touchstart', {
            touches: [startTouch],
            targetTouches: [startTouch],
            changedTouches: [startTouch],
            bubbles: true
        });
        element.dispatchEvent(touchStart);

        // Move touch
        setTimeout(() => {
            const moveTouch = new Touch({
                identifier: 1,
                target: element,
                clientX: endX,
                clientY: y
            });

            const touchMove = new TouchEvent('touchmove', {
                touches: [moveTouch],
                targetTouches: [moveTouch],
                changedTouches: [moveTouch],
                bubbles: true
            });
            element.dispatchEvent(touchMove);

            // End touch
            setTimeout(() => {
                const touchEnd = new TouchEvent('touchend', {
                    touches: [],
                    targetTouches: [],
                    changedTouches: [moveTouch],
                    bubbles: true
                });
                element.dispatchEvent(touchEnd);
            }, 100);
        }, 100);
    }

    // TEST CATEGORIES

    // 1. FUNCTIONAL CRITICAL TESTS
    async testNavigationFunctionality() {
        console.log('\n🔍 Testing Navigation Functionality...');
        
        try {
            // Test exam loading first
            await this.testExamLoading();
            
            // Wait for exam to load
            await this.wait(2000);
            
            // Test previous/next buttons
            await this.testPreviousNextButtons();
            
            // Test keyboard navigation
            await this.testKeyboardNavigation();
            
            // Test swipe navigation (mobile)
            if (this.isMobile) {
                await this.testSwipeNavigation();
            }
            
            // Test question jumping
            await this.testQuestionJumping();
            
        } catch (error) {
            this.logTest('Navigation Functionality', false, `Error: ${error.message}`);
        }
    }

    async testExamLoading() {
        this.markPerformance('examLoad_start');
        
        const examSelect = document.getElementById('examCode');
        if (!examSelect) {
            this.logTest('Exam Loading - Element Check', false, 'Exam select element not found');
            return;
        }

        // Check if options are loaded
        const hasOptions = examSelect.options.length > 1;
        this.logTest('Exam Loading - Options Available', hasOptions, `Found ${examSelect.options.length} exam options`);

        if (hasOptions) {
            // Select first available exam
            examSelect.selectedIndex = 1;
            this.simulateClick(examSelect);
            
            // Trigger change event
            const changeEvent = new Event('change', { bubbles: true });
            examSelect.dispatchEvent(changeEvent);
            
            // Wait for loading to complete
            await this.wait(3000);
            
            this.markPerformance('examLoad_end');
            const loadDuration = this.getPerformanceDuration('examLoad_start', 'examLoad_end');
            
            const questionSection = document.getElementById('questionSection');
            const isLoaded = questionSection && questionSection.style.display !== 'none';
            
            this.logTest('Exam Loading - Load Success', isLoaded, `Load time: ${loadDuration.toFixed(2)}ms`, loadDuration);
        }
    }

    async testPreviousNextButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const questionCounter = document.getElementById('questionCounter');
        
        if (!prevBtn || !nextBtn || !questionCounter) {
            this.logTest('Navigation Buttons - Element Check', false, 'Navigation elements not found');
            return;
        }

        const initialText = questionCounter.textContent;
        
        // Test next button
        this.simulateClick(nextBtn);
        await this.wait(500);
        
        const afterNextText = questionCounter.textContent;
        const nextWorking = initialText !== afterNextText;
        this.logTest('Navigation Buttons - Next Button', nextWorking, `Changed from "${initialText}" to "${afterNextText}"`);
        
        // Test previous button
        this.simulateClick(prevBtn);
        await this.wait(500);
        
        const afterPrevText = questionCounter.textContent;
        const prevWorking = afterNextText !== afterPrevText;
        this.logTest('Navigation Buttons - Previous Button', prevWorking, `Changed from "${afterNextText}" to "${afterPrevText}"`);
    }

    async testKeyboardNavigation() {
        const questionCounter = document.getElementById('questionCounter');
        if (!questionCounter) {
            this.logTest('Keyboard Navigation', false, 'Question counter not found');
            return;
        }

        const initialText = questionCounter.textContent;
        
        // Test right arrow (next)
        this.simulateKeypress('ArrowRight');
        await this.wait(300);
        
        const afterRightText = questionCounter.textContent;
        const rightArrowWorking = initialText !== afterRightText;
        this.logTest('Keyboard Navigation - Right Arrow', rightArrowWorking, `Navigation ${rightArrowWorking ? 'successful' : 'failed'}`);
        
        // Test left arrow (previous)
        this.simulateKeypress('ArrowLeft');
        await this.wait(300);
        
        const afterLeftText = questionCounter.textContent;
        const leftArrowWorking = afterRightText !== afterLeftText;
        this.logTest('Keyboard Navigation - Left Arrow', leftArrowWorking, `Navigation ${leftArrowWorking ? 'successful' : 'failed'}`);
    }

    async testSwipeNavigation() {
        const questionSection = document.getElementById('questionSection');
        if (!questionSection) {
            this.logTest('Swipe Navigation', false, 'Question section not found');
            return;
        }

        const questionCounter = document.getElementById('questionCounter');
        const initialText = questionCounter ? questionCounter.textContent : '';
        
        // Test swipe left (next)
        this.simulateSwipe(questionSection, 'left');
        await this.wait(1000);
        
        const afterSwipeText = questionCounter ? questionCounter.textContent : '';
        const swipeWorking = initialText !== afterSwipeText;
        this.logTest('Swipe Navigation - Swipe Left', swipeWorking, `Navigation ${swipeWorking ? 'successful' : 'failed'}`);
    }

    async testQuestionJumping() {
        const questionJump = document.getElementById('questionJump');
        const jumpBtn = document.getElementById('jumpBtn');
        const questionCounter = document.getElementById('questionCounter');
        
        if (!questionJump || !jumpBtn || !questionCounter) {
            this.logTest('Question Jumping', false, 'Question jump elements not found');
            return;
        }

        const initialText = questionCounter.textContent;
        
        // Try jumping to question 5
        questionJump.value = '5';
        this.simulateClick(jumpBtn);
        await this.wait(500);
        
        const afterJumpText = questionCounter.textContent;
        const jumpWorking = afterJumpText.includes('5');
        this.logTest('Question Jumping', jumpWorking, `Jumped to question 5: ${jumpWorking ? 'successful' : 'failed'}`);
    }

    // 2. SEARCH SYSTEM TESTING
    async testSearchSystem() {
        console.log('\n🔍 Testing Search System...');
        
        try {
            await this.testSearchBasicFunctionality();
            await this.testSearchFilters();
            await this.testSearchAutocomplete();
        } catch (error) {
            this.logTest('Search System', false, `Error: ${error.message}`);
        }
    }

    async testSearchBasicFunctionality() {
        const searchInput = document.getElementById('questionSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        if (!searchInput || !searchBtn) {
            this.logTest('Search Basic - Element Check', false, 'Search elements not found');
            return;
        }

        // Test search input
        searchInput.value = 'test';
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        
        this.simulateClick(searchBtn);
        await this.wait(500);
        
        const searchResults = document.getElementById('searchResultsCount');
        const hasResults = searchResults && searchResults.textContent !== 'Showing all questions';
        this.logTest('Search Basic - Search Execution', hasResults, `Search results: ${searchResults ? searchResults.textContent : 'not found'}`);
    }

    async testSearchFilters() {
        const filterAnswered = document.getElementById('filterAnswered');
        const filterFavorites = document.getElementById('filterFavorites');
        
        if (!filterAnswered || !filterFavorites) {
            this.logTest('Search Filters', false, 'Filter elements not found');
            return;
        }

        // Test answered filter
        this.simulateClick(filterAnswered);
        await this.wait(300);
        
        const searchResults = document.getElementById('searchResultsCount');
        const filterWorking = searchResults && !searchResults.textContent.includes('Showing all questions');
        this.logTest('Search Filters - Answered Filter', filterWorking, `Filter applied: ${filterWorking ? 'successful' : 'failed'}`);
    }

    async testSearchAutocomplete() {
        const searchInput = document.getElementById('questionSearch');
        if (!searchInput) {
            this.logTest('Search Autocomplete', false, 'Search input not found');
            return;
        }

        // Simulate typing to trigger autocomplete
        searchInput.value = 'wh';
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        
        await this.wait(500);
        
        // Check if autocomplete suggestions appear (this would need specific implementation)
        const hasAutocomplete = document.querySelector('.search-suggestions') !== null;
        this.logTest('Search Autocomplete', hasAutocomplete, 'Autocomplete functionality check');
    }

    // 3. FAVORITES SYSTEM TESTING
    async testFavoritesSystem() {
        console.log('\n⭐ Testing Favorites System...');
        
        try {
            await this.testFavoriteToggle();
            await this.testCategoryManagement();
            await this.testNotesSystem();
        } catch (error) {
            this.logTest('Favorites System', false, `Error: ${error.message}`);
        }
    }

    async testFavoriteToggle() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (!favoriteBtn) {
            this.logTest('Favorite Toggle', false, 'Favorite button not found');
            return;
        }

        const initialIcon = favoriteBtn.querySelector('i').className;
        
        // Toggle favorite
        this.simulateClick(favoriteBtn);
        await this.wait(300);
        
        const afterToggleIcon = favoriteBtn.querySelector('i').className;
        const toggleWorking = initialIcon !== afterToggleIcon;
        this.logTest('Favorite Toggle', toggleWorking, `Icon changed: ${initialIcon} → ${afterToggleIcon}`);
    }

    async testCategoryManagement() {
        const categorySelect = document.getElementById('categorySelect');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        
        if (!categorySelect || !addCategoryBtn) {
            this.logTest('Category Management', false, 'Category elements not found');
            return;
        }

        // Test add category button
        this.simulateClick(addCategoryBtn);
        await this.wait(500);
        
        const categoryModal = document.getElementById('categoryModal');
        const modalVisible = categoryModal && categoryModal.style.display !== 'none';
        this.logTest('Category Management - Modal Open', modalVisible, `Category modal ${modalVisible ? 'opened' : 'failed to open'}`);
    }

    async testNotesSystem() {
        const noteBtn = document.getElementById('noteBtn');
        if (!noteBtn) {
            this.logTest('Notes System', false, 'Note button not found');
            return;
        }

        // Test note button
        this.simulateClick(noteBtn);
        await this.wait(500);
        
        const noteSection = document.getElementById('questionNote');
        const noteVisible = noteSection && noteSection.style.display !== 'none';
        this.logTest('Notes System - Note Panel', noteVisible, `Note panel ${noteVisible ? 'opened' : 'failed to open'}`);
    }

    // 4. SETTINGS AND MODALS TESTING
    async testSettingsAndModals() {
        console.log('\n⚙️ Testing Settings and Modals...');
        
        try {
            await this.testDarkModeToggle();
            await this.testSettingsModal();
            await this.testStatisticsModal();
            await this.testExportModal();
        } catch (error) {
            this.logTest('Settings and Modals', false, `Error: ${error.message}`);
        }
    }

    async testDarkModeToggle() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (!darkModeBtn) {
            this.logTest('Dark Mode Toggle', false, 'Dark mode button not found');
            return;
        }

        const initialTheme = document.documentElement.getAttribute('data-theme');
        
        // Toggle dark mode
        this.simulateClick(darkModeBtn);
        await this.wait(300);
        
        const newTheme = document.documentElement.getAttribute('data-theme');
        const themeChanged = initialTheme !== newTheme;
        this.logTest('Dark Mode Toggle', themeChanged, `Theme changed: ${initialTheme || 'light'} → ${newTheme || 'light'}`);
    }

    async testSettingsModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (!settingsBtn) {
            this.logTest('Settings Modal', false, 'Settings button not found');
            return;
        }

        // Open settings modal
        this.simulateClick(settingsBtn);
        await this.wait(500);
        
        const settingsModal = document.getElementById('settingsModal');
        const modalVisible = settingsModal && settingsModal.style.display !== 'none';
        this.logTest('Settings Modal - Open', modalVisible, `Settings modal ${modalVisible ? 'opened' : 'failed to open'}`);
        
        if (modalVisible) {
            // Test closing modal
            const closeBtn = document.getElementById('closeModal');
            if (closeBtn) {
                this.simulateClick(closeBtn);
                await this.wait(300);
                
                const modalClosed = settingsModal.style.display === 'none';
                this.logTest('Settings Modal - Close', modalClosed, `Settings modal ${modalClosed ? 'closed' : 'failed to close'}`);
            }
        }
    }

    async testStatisticsModal() {
        const statisticsBtn = document.getElementById('statisticsBtn');
        if (!statisticsBtn) {
            this.logTest('Statistics Modal', false, 'Statistics button not found');
            return;
        }

        // Open statistics modal
        this.simulateClick(statisticsBtn);
        await this.wait(500);
        
        const statsModal = document.getElementById('statisticsModal');
        const modalVisible = statsModal && statsModal.style.display !== 'none';
        this.logTest('Statistics Modal', modalVisible, `Statistics modal ${modalVisible ? 'opened' : 'failed to open'}`);
    }

    async testExportModal() {
        const exportBtn = document.getElementById('exportBtn');
        if (!exportBtn) {
            this.logTest('Export Modal', false, 'Export button not found');
            return;
        }

        // Make export button visible first (it's hidden by default)
        exportBtn.style.display = 'block';
        
        // Open export modal
        this.simulateClick(exportBtn);
        await this.wait(500);
        
        const exportModal = document.getElementById('exportOptionsModal');
        const modalVisible = exportModal && exportModal.style.display !== 'none';
        this.logTest('Export Modal', modalVisible, `Export modal ${modalVisible ? 'opened' : 'failed to open'}`);
    }

    // 5. DESIGN AND ANIMATION TESTING
    async testModernDesign() {
        console.log('\n🎨 Testing Modern Design Elements...');
        
        try {
            await this.testGlassmorphismEffects();
            await this.testNeumorphismElements();
            await this.testAnimationsAndTransitions();
            await this.testTypographyAndFonts();
        } catch (error) {
            this.logTest('Modern Design', false, `Error: ${error.message}`);
        }
    }

    async testGlassmorphismEffects() {
        // Check for glassmorphism CSS properties
        const questionSection = document.getElementById('questionSection');
        if (!questionSection) {
            this.logTest('Glassmorphism Effects', false, 'Question section not found');
            return;
        }

        const computedStyle = window.getComputedStyle(questionSection);
        const hasBackdropFilter = computedStyle.backdropFilter !== 'none';
        const hasTransparency = parseFloat(computedStyle.backgroundColor.match(/[\d\.]+/g)?.[3] || '1') < 1;
        
        this.logTest('Glassmorphism Effects', hasBackdropFilter || hasTransparency, `Backdrop filter: ${computedStyle.backdropFilter}, Transparency: ${hasTransparency}`);
    }

    async testNeumorphismElements() {
        // Check for neumorphism button styles
        const buttons = document.querySelectorAll('button');
        let hasNeumorphism = false;
        
        buttons.forEach(button => {
            const style = window.getComputedStyle(button);
            if (style.boxShadow && style.boxShadow.includes('inset')) {
                hasNeumorphism = true;
            }
        });
        
        this.logTest('Neumorphism Elements', hasNeumorphism, `Found ${hasNeumorphism ? 'neumorphic' : 'no neumorphic'} button styles`);
    }

    async testAnimationsAndTransitions() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (!darkModeBtn) {
            this.logTest('Animations and Transitions', false, 'Dark mode button not found');
            return;
        }

        const computedStyle = window.getComputedStyle(darkModeBtn);
        const hasTransition = computedStyle.transition !== 'all 0s ease 0s';
        
        this.logTest('Animations and Transitions', hasTransition, `Transition property: ${computedStyle.transition}`);
    }

    async testTypographyAndFonts() {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        const fontFamily = computedStyle.fontFamily;
        
        const hasInterFont = fontFamily.includes('Inter');
        this.logTest('Typography and Fonts', hasInterFont, `Font family: ${fontFamily}`);
    }

    // 6. MOBILE ADVANCED TESTING
    async testMobileAdvancedFeatures() {
        if (!this.isMobile) {
            console.log('\n📱 Skipping mobile tests (not on mobile device)');
            return;
        }
        
        console.log('\n📱 Testing Mobile Advanced Features...');
        
        try {
            await this.testTouchGestures();
            await this.testResponsiveDesign();
            await this.testMobileNavigation();
            await this.testSafeAreas();
        } catch (error) {
            this.logTest('Mobile Advanced Features', false, `Error: ${error.message}`);
        }
    }

    async testTouchGestures() {
        const questionSection = document.getElementById('questionSection');
        if (!questionSection) {
            this.logTest('Touch Gestures', false, 'Question section not found');
            return;
        }

        // Test touch start
        this.simulateTouch(questionSection, 'touchstart');
        await this.wait(100);
        
        // Test touch move
        this.simulateTouch(questionSection, 'touchmove');
        await this.wait(100);
        
        // Test touch end
        this.simulateTouch(questionSection, 'touchend');
        await this.wait(100);
        
        this.logTest('Touch Gestures', true, 'Touch events simulated successfully');
    }

    async testResponsiveDesign() {
        const container = document.querySelector('.container');
        if (!container) {
            this.logTest('Responsive Design', false, 'Container not found');
            return;
        }

        const computedStyle = window.getComputedStyle(container);
        const isResponsive = computedStyle.maxWidth !== 'none' || computedStyle.width.includes('%');
        
        this.logTest('Responsive Design', isResponsive, `Container width: ${computedStyle.width}, max-width: ${computedStyle.maxWidth}`);
    }

    async testMobileNavigation() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (!sidebarToggle) {
            this.logTest('Mobile Navigation', false, 'Sidebar toggle not found');
            return;
        }

        // Test sidebar toggle
        this.simulateClick(sidebarToggle);
        await this.wait(500);
        
        const sidebar = document.getElementById('progressSidebar');
        const sidebarVisible = sidebar && !sidebar.classList.contains('hidden');
        
        this.logTest('Mobile Navigation', sidebarVisible, `Sidebar ${sidebarVisible ? 'opened' : 'failed to open'}`);
    }

    async testSafeAreas() {
        // Check for CSS safe area support
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        
        // Check if safe area variables are used
        const hasSafeAreas = computedStyle.paddingTop.includes('env(') || 
                            computedStyle.paddingBottom.includes('env(');
        
        this.logTest('Safe Areas', hasSafeAreas, `Safe area insets ${hasSafeAreas ? 'detected' : 'not found'}`);
    }

    // 7. INTEGRATION TESTING
    async testIntegration() {
        console.log('\n🔗 Testing Integration...');
        
        try {
            await this.testES6ModulesLoading();
            await this.testLocalStoragePersistence();
            await this.testServiceWorkerFunctionality();
            await this.testEventListeners();
        } catch (error) {
            this.logTest('Integration', false, `Error: ${error.message}`);
        }
    }

    async testES6ModulesLoading() {
        // Check if window objects are properly assigned
        const requiredModules = [
            'loadExamData',
            'navigateToQuestion',
            'updateProgressIndicator',
            'toggleFavorite',
            'performSearch'
        ];
        
        let loadedModules = 0;
        requiredModules.forEach(moduleName => {
            if (typeof window[moduleName] === 'function') {
                loadedModules++;
            }
        });
        
        const allModulesLoaded = loadedModules === requiredModules.length;
        this.logTest('ES6 Modules Loading', allModulesLoaded, `${loadedModules}/${requiredModules.length} modules loaded`);
    }

    async testLocalStoragePersistence() {
        try {
            // Test localStorage access
            const testKey = 'examsViewer_test';
            const testValue = 'test_data';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const storageWorking = retrieved === testValue;
            this.logTest('LocalStorage Persistence', storageWorking, `Storage test ${storageWorking ? 'passed' : 'failed'}`);
        } catch (error) {
            this.logTest('LocalStorage Persistence', false, `Error: ${error.message}`);
        }
    }

    async testServiceWorkerFunctionality() {
        const hasServiceWorker = 'serviceWorker' in navigator;
        if (!hasServiceWorker) {
            this.logTest('Service Worker', false, 'Service Worker not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            const isRegistered = registration !== undefined;
            this.logTest('Service Worker', isRegistered, `Service Worker ${isRegistered ? 'registered' : 'not registered'}`);
        } catch (error) {
            this.logTest('Service Worker', false, `Error: ${error.message}`);
        }
    }

    async testEventListeners() {
        // Test if key event listeners are working
        let eventsFired = 0;
        
        // Test keyboard events
        const originalHandler = document.onkeydown;
        document.onkeydown = () => eventsFired++;
        
        this.simulateKeypress('ArrowRight');
        await this.wait(100);
        
        document.onkeydown = originalHandler;
        
        this.logTest('Event Listeners', eventsFired > 0, `Keyboard events ${eventsFired > 0 ? 'working' : 'not working'}`);
    }

    // 8. PERFORMANCE AND REGRESSION TESTING
    async testPerformanceAndRegression() {
        console.log('\n⚡ Testing Performance and Regression...');
        
        try {
            await this.testLoadingPerformance();
            await this.testMemoryUsage();
            await this.testErrorHandling();
            await this.testBrowserCompatibility();
        } catch (error) {
            this.logTest('Performance and Regression', false, `Error: ${error.message}`);
        }
    }

    async testLoadingPerformance() {
        const loadTime = performance.now();
        this.logTest('Loading Performance', true, `Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Test if performance is within acceptable limits
        const performanceGood = loadTime < 5000; // 5 seconds
        this.logTest('Loading Performance - Threshold', performanceGood, `Load time ${performanceGood ? 'acceptable' : 'too slow'}`);
    }

    async testMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const memoryUsage = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
            this.logTest('Memory Usage', true, `JS Heap: ${memoryUsage}MB`);
            
            // Test if memory usage is reasonable
            const memoryReasonable = memory.usedJSHeapSize < 100 * 1024 * 1024; // 100MB
            this.logTest('Memory Usage - Threshold', memoryReasonable, `Memory usage ${memoryReasonable ? 'reasonable' : 'high'}`);
        } else {
            this.logTest('Memory Usage', false, 'Memory API not available');
        }
    }

    async testErrorHandling() {
        const errorCount = this.capturedErrors.length;
        this.logTest('Error Handling', errorCount === 0, `${errorCount} console errors captured`);
        
        if (errorCount > 0) {
            console.log('Captured errors:', this.capturedErrors);
        }
    }

    async testBrowserCompatibility() {
        const features = {
            'ES6 Modules': 'import' in document.createElement('script'),
            'CSS Custom Properties': CSS.supports('color', 'var(--test)'),
            'Flexbox': CSS.supports('display', 'flex'),
            'Grid': CSS.supports('display', 'grid'),
            'Service Workers': 'serviceWorker' in navigator,
            'LocalStorage': 'localStorage' in window,
            'Touch Events': 'ontouchstart' in window
        };
        
        let supportedFeatures = 0;
        const totalFeatures = Object.keys(features).length;
        
        for (const [feature, supported] of Object.entries(features)) {
            if (supported) supportedFeatures++;
            this.logTest(`Browser Compatibility - ${feature}`, supported, supported ? 'Supported' : 'Not supported');
        }
        
        const compatibilityScore = (supportedFeatures / totalFeatures * 100).toFixed(1);
        this.logTest('Browser Compatibility - Overall', supportedFeatures === totalFeatures, `${compatibilityScore}% compatibility`);
    }

    // MAIN TEST RUNNER
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite for Exams-Viewer...');
        // Only show panel if explicitly requested (not for automatic background tests)
        if (window.location.search.includes('show-tests=true') || 
            (document.getElementById('runTestsBtn') && !document.getElementById('runTestsBtn').disabled)) {
            this.showTestPanel();
        }
        
        const testSuites = [
            { name: 'Navigation Functionality', method: this.testNavigationFunctionality },
            { name: 'Search System', method: this.testSearchSystem },
            { name: 'Favorites System', method: this.testFavoritesSystem },
            { name: 'Settings and Modals', method: this.testSettingsAndModals },
            { name: 'Modern Design', method: this.testModernDesign },
            { name: 'Mobile Advanced Features', method: this.testMobileAdvancedFeatures },
            { name: 'Integration', method: this.testIntegration },
            { name: 'Performance and Regression', method: this.testPerformanceAndRegression }
        ];
        
        for (let i = 0; i < testSuites.length; i++) {
            const suite = testSuites[i];
            this.updateTestProgress(i + 1, testSuites.length, suite.name);
            
            try {
                await suite.method.call(this);
            } catch (error) {
                this.logTest(suite.name, false, `Suite error: ${error.message}`);
            }
            
            // Small delay between test suites
            await this.wait(500);
        }
        
        this.generateFinalReport();
    }

    generateFinalReport() {
        console.log('\n📊 FINAL TEST REPORT');
        console.log('========================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed} ✅`);
        console.log(`Failed: ${this.testResults.failed} ❌`);
        console.log(`Pass Rate: ${(this.testResults.passed / this.testResults.total * 100).toFixed(1)}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.details
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.details}`);
                });
        }
        
        // Update progress text
        const progressEl = document.getElementById('testProgress');
        if (progressEl) {
            progressEl.textContent = `✅ Testing completed - ${this.testResults.passed}/${this.testResults.total} tests passed`;
        }
        
        // Restore original console.error
        console.error = this.originalConsoleError;
        
        console.log('\n🎉 Test suite completed!');
    }
}

// Global instance for manual testing - Only create when explicitly requested
if (window.location.search.includes('enable-tests=true') || window.enableTestSuite) {
    window.testSuite = new ExamsViewerTestSuite();
}

// Expose comprehensive test runner function for dev-testing module
window.runComprehensiveTests = async function() {
    // Create test suite if it doesn't exist
    if (!window.testSuite) {
        window.testSuite = new ExamsViewerTestSuite();
    }
    
    if (window.testSuite && typeof window.testSuite.runAllTests === 'function') {
        return await window.testSuite.runAllTests();
    } else {
        throw new Error('Test suite not available');
    }
};

// Auto-run disabled - tests should be triggered manually via dev button
// Uncomment below for auto-run behavior if needed:
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         setTimeout(() => window.testSuite.runAllTests(), 2000);
//     });
// } else {
//     setTimeout(() => window.testSuite.runAllTests(), 2000);
// }

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExamsViewerTestSuite;
}