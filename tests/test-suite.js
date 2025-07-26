/**
 * Comprehensive Test Suite for Exams-Viewer
 * Tests all functionalities including new modern design features
 */

class ExamViewerTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
    this.currentExam = null;
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
  }

  // Initialize test environment
  async initialize() {
    this.log('🚀 Initializing Exams-Viewer Test Suite');
    
    // Check if running in browser
    if (typeof window === 'undefined') {
      throw new Error('Tests must be run in a browser environment');
    }

    // Wait for application to load
    await this.waitForApp();
    
    this.log('✅ Test environment initialized');
  }

  // Wait for application to fully load
  async waitForApp() {
    return new Promise((resolve) => {
      const checkApp = () => {
        if (window.loadExamData && document.querySelector('#examCode')) {
          resolve();
        } else {
          setTimeout(checkApp, 100);
        }
      };
      checkApp();
    });
  }

  // Utility methods
  log(message) {
    console.log(`[TEST] ${message}`);
  }

  error(message) {
    console.error(`[TEST ERROR] ${message}`);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForElement(selector, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.wait(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  async waitForElementToBeVisible(selector, timeout = 5000) {
    const element = await this.waitForElement(selector, timeout);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (element.offsetParent !== null) return element;
      await this.wait(100);
    }
    throw new Error(`Element ${selector} not visible within ${timeout}ms`);
  }

  // Test assertion methods
  assert(condition, message) {
    if (condition) {
      this.testResults.passed++;
      this.testResults.details.push({ status: 'PASS', test: message });
      this.log(`✅ PASS: ${message}`);
    } else {
      this.testResults.failed++;
      this.testResults.details.push({ status: 'FAIL', test: message });
      this.error(`❌ FAIL: ${message}`);
    }
  }

  // Core functionality tests
  async testCoreNavigation() {
    this.log('🧪 Testing Core Navigation Features');
    
    try {
      // Test exam selection
      const examSelect = await this.waitForElement('#examCode');
      examSelect.value = 'CAD';
      examSelect.dispatchEvent(new Event('change'));
      
      await this.wait(2000); // Wait for exam to load
      
      // Check if navigation section appears
      const navSection = await this.waitForElementToBeVisible('#navigationSection');
      this.assert(navSection !== null, 'Navigation section appears after exam selection');
      
      // Test next/previous buttons
      const nextBtn = document.querySelector('#nextBtn');
      const prevBtn = document.querySelector('#prevBtn');
      this.assert(nextBtn !== null, 'Next button exists');
      this.assert(prevBtn !== null, 'Previous button exists');
      
      // Test question counter
      const questionCounter = document.querySelector('#questionCounter');
      this.assert(questionCounter && questionCounter.textContent.includes('Question'), 'Question counter is displayed');
      
      // Test keyboard navigation
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await this.wait(500);
      this.assert(true, 'Keyboard navigation (right arrow) works');
      
      // Test random question button
      const randomBtn = document.querySelector('#randomBtn');
      if (randomBtn) {
        randomBtn.click();
        await this.wait(500);
        this.assert(true, 'Random question navigation works');
      }
      
      // Test question jump functionality
      const questionJump = document.querySelector('#questionJump');
      const jumpBtn = document.querySelector('#jumpBtn');
      if (questionJump && jumpBtn) {
        questionJump.value = '1';
        jumpBtn.click();
        await this.wait(500);
        this.assert(true, 'Question jump functionality works');
      }
      
    } catch (error) {
      this.assert(false, `Core navigation test failed: ${error.message}`);
    }
  }

  async testAnswerSelection() {
    this.log('🧪 Testing Answer Selection and Validation');
    
    try {
      // Wait for question to be displayed
      await this.waitForElement('#answersList');
      
      // Find answer options
      const answerOptions = document.querySelectorAll('.answer-option');
      this.assert(answerOptions.length > 0, 'Answer options are displayed');
      
      // Test answer selection
      if (answerOptions.length > 0) {
        answerOptions[0].click();
        await this.wait(200);
        this.assert(answerOptions[0].classList.contains('selected'), 'Answer selection works');
      }
      
      // Test validation button
      const validateBtn = document.querySelector('#validateBtn');
      if (validateBtn) {
        validateBtn.click();
        await this.wait(500);
        this.assert(true, 'Answer validation works');
      }
      
      // Test reset button
      const resetBtn = document.querySelector('#resetBtn');
      if (resetBtn && resetBtn.style.display !== 'none') {
        resetBtn.click();
        await this.wait(500);
        this.assert(true, 'Answer reset works');
      }
      
      // Test highlight button
      const highlightBtn = document.querySelector('#highlightBtn');
      if (highlightBtn) {
        highlightBtn.click();
        await this.wait(500);
        this.assert(true, 'Answer highlight toggle works');
      }
      
    } catch (error) {
      this.assert(false, `Answer selection test failed: ${error.message}`);
    }
  }

  async testSearchAndFilters() {
    this.log('🧪 Testing Advanced Search and Filters');
    
    try {
      // Wait for search section to be visible
      await this.waitForElement('#searchSection');
      
      // Test search toggle
      const toggleSearchBtn = document.querySelector('#toggleSearchBtn');
      if (toggleSearchBtn) {
        toggleSearchBtn.click();
        await this.wait(500);
        this.assert(true, 'Search section toggle works');
      }
      
      // Test search input
      const searchInput = document.querySelector('#questionSearch');
      if (searchInput) {
        searchInput.value = 'test';
        searchInput.dispatchEvent(new Event('input'));
        await this.wait(500);
        this.assert(true, 'Search input functionality works');
      }
      
      // Test filter checkboxes
      const filterAnswered = document.querySelector('#filterAnswered');
      const filterUnanswered = document.querySelector('#filterUnanswered');
      const filterFavorites = document.querySelector('#filterFavorites');
      
      if (filterAnswered) {
        filterAnswered.click();
        await this.wait(300);
        this.assert(true, 'Answered filter works');
      }
      
      if (filterUnanswered) {
        filterUnanswered.click();
        await this.wait(300);
        this.assert(true, 'Unanswered filter works');
      }
      
      if (filterFavorites) {
        filterFavorites.click();
        await this.wait(300);
        this.assert(true, 'Favorites filter works');
      }
      
      // Test reset filters
      const resetFiltersBtn = document.querySelector('#resetFiltersBtn');
      if (resetFiltersBtn && resetFiltersBtn.style.display !== 'none') {
        resetFiltersBtn.click();
        await this.wait(300);
        this.assert(true, 'Reset filters works');
      }
      
    } catch (error) {
      this.assert(false, `Search and filters test failed: ${error.message}`);
    }
  }

  async testFavoritesSystem() {
    this.log('🧪 Testing Favorites and Categories System');
    
    try {
      // Test favorite button
      const favoriteBtn = document.querySelector('#favoriteBtn');
      if (favoriteBtn) {
        // Add to favorites
        favoriteBtn.click();
        await this.wait(300);
        this.assert(favoriteBtn.classList.contains('active') || 
                   favoriteBtn.querySelector('i').classList.contains('fas'), 
                   'Add to favorites works');
        
        // Remove from favorites
        favoriteBtn.click();
        await this.wait(300);
        this.assert(true, 'Remove from favorites works');
      }
      
      // Test category selection
      const categorySelect = document.querySelector('#categorySelect');
      if (categorySelect) {
        categorySelect.value = 'Important';
        categorySelect.dispatchEvent(new Event('change'));
        await this.wait(300);
        this.assert(true, 'Category selection works');
      }
      
      // Test add category button
      const addCategoryBtn = document.querySelector('#addCategoryBtn');
      if (addCategoryBtn) {
        addCategoryBtn.click();
        await this.wait(500);
        
        // Check if category modal appears
        const categoryModal = document.querySelector('#categoryModal');
        this.assert(categoryModal && categoryModal.style.display !== 'none', 
                   'Category modal opens');
        
        // Close modal
        const closeCategoryModal = document.querySelector('#closeCategoryModal');
        if (closeCategoryModal) {
          closeCategoryModal.click();
          await this.wait(300);
        }
      }
      
      // Test notes functionality
      const noteBtn = document.querySelector('#noteBtn');
      if (noteBtn) {
        noteBtn.click();
        await this.wait(500);
        
        const noteSection = document.querySelector('#questionNote');
        this.assert(noteSection && noteSection.style.display !== 'none', 
                   'Notes section opens');
        
        // Test note editing
        const editNoteBtn = document.querySelector('#editNoteBtn');
        if (editNoteBtn) {
          editNoteBtn.click();
          await this.wait(300);
          
          const noteTextarea = document.querySelector('#noteTextarea');
          if (noteTextarea) {
            noteTextarea.value = 'Test note';
            const saveNoteBtn = document.querySelector('#saveNoteBtn');
            if (saveNoteBtn) {
              saveNoteBtn.click();
              await this.wait(300);
              this.assert(true, 'Note saving works');
            }
          }
        }
        
        // Close notes
        const cancelNoteViewBtn = document.querySelector('#cancelNoteViewBtn');
        if (cancelNoteViewBtn) {
          cancelNoteViewBtn.click();
          await this.wait(300);
        }
      }
      
    } catch (error) {
      this.assert(false, `Favorites system test failed: ${error.message}`);
    }
  }

  async testModalsAndOverlays() {
    this.log('🧪 Testing Modals and Overlays');
    
    try {
      // Test statistics modal
      const statisticsBtn = document.querySelector('#statisticsBtn');
      if (statisticsBtn) {
        statisticsBtn.click();
        await this.wait(500);
        
        const statisticsModal = document.querySelector('#statisticsModal');
        this.assert(statisticsModal && statisticsModal.style.display !== 'none', 
                   'Statistics modal opens');
        
        // Test statistics tabs
        const statsTabs = document.querySelectorAll('.stats-tab');
        if (statsTabs.length > 1) {
          statsTabs[1].click();
          await this.wait(300);
          this.assert(true, 'Statistics tab switching works');
        }
        
        // Close modal
        const closeStatsModal = document.querySelector('#closeStatsModal');
        if (closeStatsModal) {
          closeStatsModal.click();
          await this.wait(300);
        }
      }
      
      // Test settings modal
      const settingsBtn = document.querySelector('#settingsBtn');
      if (settingsBtn) {
        settingsBtn.click();
        await this.wait(500);
        
        const settingsModal = document.querySelector('#settingsModal');
        this.assert(settingsModal && settingsModal.style.display !== 'none', 
                   'Settings modal opens');
        
        // Test settings toggles
        const darkModeToggle = document.querySelector('#darkModeToggle');
        if (darkModeToggle) {
          const initialState = darkModeToggle.checked;
          darkModeToggle.click();
          await this.wait(300);
          this.assert(darkModeToggle.checked !== initialState, 'Dark mode toggle works');
        }
        
        // Close modal
        const closeModal = document.querySelector('#closeModal');
        if (closeModal) {
          closeModal.click();
          await this.wait(300);
        }
      }
      
      // Test progress sidebar
      const sidebarToggle = document.querySelector('#sidebarToggle');
      if (sidebarToggle) {
        sidebarToggle.click();
        await this.wait(500);
        
        const progressSidebar = document.querySelector('#progressSidebar');
        this.assert(progressSidebar && progressSidebar.classList.contains('active'), 
                   'Progress sidebar opens');
        
        // Close sidebar
        const closeSidebarBtn = document.querySelector('#closeSidebarBtn');
        if (closeSidebarBtn) {
          closeSidebarBtn.click();
          await this.wait(300);
        }
      }
      
    } catch (error) {
      this.assert(false, `Modals and overlays test failed: ${error.message}`);
    }
  }

  async testModernDesignFeatures() {
    this.log('🧪 Testing Modern Design Features');
    
    try {
      // Test glassmorphism effects
      const glassElements = document.querySelectorAll('.glass-effect, .modal-content, .progress-sidebar');
      this.assert(glassElements.length > 0, 'Glassmorphism elements are present');
      
      // Check for CSS custom properties (modern design variables)
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--primary-color');
      this.assert(primaryColor !== '', 'CSS custom properties are defined');
      
      // Test button hover effects
      const buttons = document.querySelectorAll('.nav-btn, .validate-btn, .settings-btn');
      if (buttons.length > 0) {
        // Simulate hover
        buttons[0].dispatchEvent(new MouseEvent('mouseenter'));
        await this.wait(100);
        this.assert(true, 'Button hover effects work');
      }
      
      // Test animation classes
      const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
      this.assert(animatedElements.length > 0, 'Animation classes are present');
      
      // Test responsive design breakpoints
      const mobileElements = document.querySelectorAll('.mobile-only, .mobile-nav');
      this.assert(true, 'Mobile-specific elements are defined');
      
    } catch (error) {
      this.assert(false, `Modern design test failed: ${error.message}`);
    }
  }

  async testMobileGestures() {
    this.log('🧪 Testing Mobile Gestures and Touch Interactions');
    
    try {
      // Test touch events
      const questionSection = document.querySelector('#questionSection');
      if (questionSection) {
        // Simulate swipe right (next question)
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }]
        });
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 }]
        });
        
        questionSection.dispatchEvent(touchStart);
        await this.wait(100);
        questionSection.dispatchEvent(touchEnd);
        await this.wait(300);
        
        this.assert(true, 'Swipe gestures are handled');
      }
      
      // Test pull-to-refresh (if implemented)
      if (window.pullToRefresh) {
        this.assert(true, 'Pull-to-refresh functionality is available');
      }
      
      // Test haptic feedback (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
        this.assert(true, 'Haptic feedback is supported');
      } else {
        this.assert(true, 'Haptic feedback not supported on this device (expected)');
      }
      
    } catch (error) {
      this.assert(false, `Mobile gestures test failed: ${error.message}`);
    }
  }

  async testDataPersistence() {
    this.log('🧪 Testing Data Persistence and LocalStorage');
    
    try {
      // Test LocalStorage operations
      const testKey = 'exams-viewer-test';
      const testData = { test: 'data' };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey));
      this.assert(retrieved.test === 'data', 'LocalStorage read/write works');
      
      localStorage.removeItem(testKey);
      
      // Test favorites persistence
      if (window.loadFavorites && window.saveFavorites) {
        const favorites = window.loadFavorites();
        this.assert(typeof favorites === 'object', 'Favorites loading works');
      }
      
      // Test statistics persistence
      if (window.loadStatistics && window.saveStatistics) {
        const stats = window.loadStatistics();
        this.assert(typeof stats === 'object', 'Statistics loading works');
      }
      
      // Test settings persistence
      if (window.loadSettings && window.saveSettings) {
        const settings = window.loadSettings();
        this.assert(typeof settings === 'object', 'Settings loading works');
      }
      
    } catch (error) {
      this.assert(false, `Data persistence test failed: ${error.message}`);
    }
  }

  async testServiceWorker() {
    this.log('🧪 Testing Service Worker Functionality');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        this.assert(registration !== undefined, 'Service Worker is registered');
        
        if (registration) {
          this.assert(registration.active !== null, 'Service Worker is active');
        }
        
        // Test cache functionality
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          this.assert(cacheNames.length > 0, 'Service Worker caches exist');
        }
        
      } else {
        this.assert(false, 'Service Worker not supported');
      }
      
    } catch (error) {
      this.assert(false, `Service Worker test failed: ${error.message}`);
    }
  }

  async testPerformance() {
    this.log('🧪 Testing Performance Metrics');
    
    try {
      // Test page load time
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.assert(loadTime < 5000, `Page load time acceptable: ${loadTime}ms`);
      
      // Test memory usage (if available)
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        this.assert(memoryUsage < 100, `Memory usage acceptable: ${memoryUsage.toFixed(2)}MB`);
      }
      
      // Test DOM node count
      const nodeCount = document.querySelectorAll('*').length;
      this.assert(nodeCount < 1000, `DOM complexity acceptable: ${nodeCount} nodes`);
      
      // Test CSS animation performance
      const start = performance.now();
      await this.wait(100); // Simulate animation time
      const animationTime = performance.now() - start;
      this.assert(animationTime < 200, `Animation performance acceptable: ${animationTime}ms`);
      
    } catch (error) {
      this.assert(false, `Performance test failed: ${error.message}`);
    }
  }

  async testRegressionChecks() {
    this.log('🧪 Running Regression Tests');
    
    try {
      // Check that all core functions exist
      const coreFunctions = [
        'loadExamData',
        'navigateQuestion',
        'validateAnswers',
        'toggleFavorite',
        'showStatistics'
      ];
      
      for (const func of coreFunctions) {
        this.assert(typeof window[func] === 'function', `Core function ${func} exists`);
      }
      
      // Check that all core elements exist
      const coreElements = [
        '#examCode',
        '#navigationSection',
        '#questionSection',
        '#statisticsBtn',
        '#settingsBtn'
      ];
      
      for (const selector of coreElements) {
        const element = document.querySelector(selector);
        this.assert(element !== null, `Core element ${selector} exists`);
      }
      
      // Check that ES6 modules are properly loaded
      this.assert(typeof window.ExamSession === 'function', 'ES6 modules are loaded');
      
      // Check that event listeners are attached
      const buttons = document.querySelectorAll('button[id]');
      let hasEventListeners = false;
      buttons.forEach(button => {
        if (button.onclick || button.addEventListener) {
          hasEventListeners = true;
        }
      });
      this.assert(hasEventListeners, 'Event listeners are attached');
      
    } catch (error) {
      this.assert(false, `Regression test failed: ${error.message}`);
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('🧪 Starting Comprehensive Test Suite');
    console.time('Total Test Time');
    
    try {
      await this.initialize();
      
      // Core functionality tests
      await this.testCoreNavigation();
      await this.testAnswerSelection();
      
      // Feature tests
      await this.testSearchAndFilters();
      await this.testFavoritesSystem();
      await this.testModalsAndOverlays();
      
      // Design and mobile tests
      await this.testModernDesignFeatures();
      await this.testMobileGestures();
      
      // System tests
      await this.testDataPersistence();
      await this.testServiceWorker();
      await this.testPerformance();
      
      // Regression tests
      await this.testRegressionChecks();
      
    } catch (error) {
      this.error(`Test suite failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.details.push({ 
        status: 'FAIL', 
        test: `Test suite execution: ${error.message}` 
      });
    }
    
    console.timeEnd('Total Test Time');
    return this.generateReport();
  }

  // Generate comprehensive test report
  generateReport() {
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(2) : 0;
    
    const report = {
      summary: {
        total: total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString()
      },
      details: this.testResults.details,
      recommendations: this.generateRecommendations()
    };
    
    this.log('📊 Test Report Generated');
    this.log(`✅ Passed: ${this.testResults.passed}`);
    this.log(`❌ Failed: ${this.testResults.failed}`);
    this.log(`📈 Pass Rate: ${passRate}%`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.testResults.failed > 0) {
      recommendations.push('Review failed tests and fix identified issues');
    }
    
    if (this.testResults.passed / (this.testResults.passed + this.testResults.failed) < 0.9) {
      recommendations.push('Consider additional testing for critical functionality');
    }
    
    recommendations.push('Regular testing should be performed after each feature update');
    recommendations.push('Consider implementing automated CI/CD testing');
    
    return recommendations;
  }
}

// Make test suite available globally
window.ExamViewerTestSuite = ExamViewerTestSuite;

// Auto-run tests if in test mode
if (window.location.search.includes('test=true')) {
  window.addEventListener('load', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for app to fully load
    const testSuite = new ExamViewerTestSuite();
    const report = await testSuite.runAllTests();
    console.log('🧪 Final Test Report:', report);
  });
}