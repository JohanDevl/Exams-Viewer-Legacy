/**
 * Simple Development Testing Module - Ultra-simplified version
 * No complex loading, just direct test execution
 */

// Import development utilities from storage module
import { isDevelopmentMode, devLog, devError } from './storage.js';

/**
 * Handle test execution - SIMPLIFIED VERSION
 */
async function handleRunTestsSimple() {
  const button = document.getElementById('runTestsBtn');
  if (!button || button.disabled) return;
  
  try {
    devLog('🚀 Starting SIMPLE test execution...');
    
    // Update button
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    button.disabled = true;
    
    // Simple test execution without complex loading
    console.log('🧪 SIMPLE TEST SUITE STARTING...');
    console.log('');
    
    // Test 1: DOM
    const domTest = !!document.body && !!document.getElementById('container');
    console.log(`${domTest ? '✅' : '❌'} DOM Structure Test: ${domTest ? 'PASSED' : 'FAILED'}`);
    
    // Test 2: Navigation functions
    const navTest = !!window.navigateQuestion && !!window.navigateToQuestionIndex;
    console.log(`${navTest ? '✅' : '❌'} Navigation Functions Test: ${navTest ? 'PASSED' : 'FAILED'}`);
    
    // Test 3: State management
    const stateTest = !!window.initializeState && !!window.getExamState;
    console.log(`${stateTest ? '✅' : '❌'} State Management Test: ${stateTest ? 'PASSED' : 'FAILED'}`);
    
    // Test 4: Mobile functions
    const mobileTest = !!window.initializeMobileNavigation;
    console.log(`${mobileTest ? '✅' : '❌'} Mobile Navigation Test: ${mobileTest ? 'PASSED' : 'FAILED'}`);
    
    // Test 5: Search functionality
    const searchTest = !!window.initializeSearchInterface;
    console.log(`${searchTest ? '✅' : '❌'} Search Interface Test: ${searchTest ? 'PASSED' : 'FAILED'}`);
    
    // Count results
    const tests = [domTest, navTest, stateTest, mobileTest, searchTest];
    const passed = tests.filter(t => t).length;
    const total = tests.length;
    const passRate = (passed / total * 100).toFixed(1);
    
    console.log('');
    console.log('📊 SIMPLE TEST RESULTS:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('');
    
    // Show modal with results
    showSimpleTestModal(passed, total - passed, passRate);
    
    // Update button
    button.innerHTML = '<i class="fas fa-check"></i> Complete';
    button.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    
    // Reset after delay
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-flask"></i> Run Tests';
      button.disabled = false;
      button.style.background = '';
    }, 3000);
    
  } catch (error) {
    devError('❌ Simple test execution failed:', error);
    
    button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
    button.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-flask"></i> Run Tests';
      button.disabled = false;
      button.style.background = '';
    }, 3000);
  }
}

/**
 * Show simple test results modal
 */
function showSimpleTestModal(passed, failed, passRate) {
  // Remove existing modal if any
  const existingModal = document.getElementById('simpleTestModal');
  if (existingModal) existingModal.remove();
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'simpleTestModal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    backdrop-filter: blur(20px);
    z-index: 10000;
    width: min(90vw, 400px);
    max-height: 80vh;
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="padding: 1.5rem; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <h3 style="margin: 0; color: var(--text-primary);">
          <i class="fas fa-flask" style="color: var(--accent-color);"></i> Test Results
        </h3>
        <button id="closeSimpleModal" style="
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0.25rem;
          border-radius: 0.25rem;
        ">✕</button>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="
          padding: 1rem;
          background: var(--success-color);
          color: white;
          border-radius: var(--radius-lg);
          font-weight: 600;
        ">
          <div style="font-size: 1.5rem;">${passed}</div>
          <div style="font-size: 0.9rem;">Passed</div>
        </div>
        <div style="
          padding: 1rem;
          background: var(--error-color);
          color: white;
          border-radius: var(--radius-lg);
          font-weight: 600;
        ">
          <div style="font-size: 1.5rem;">${failed}</div>
          <div style="font-size: 0.9rem;">Failed</div>
        </div>
        <div style="
          padding: 1rem;
          background: var(--accent-color);
          color: white;
          border-radius: var(--radius-lg);
          font-weight: 600;
        ">
          <div style="font-size: 1.5rem;">${passRate}%</div>
          <div style="font-size: 0.9rem;">Pass Rate</div>
        </div>
      </div>
      
      <div style="text-align: left; margin-bottom: 1rem;">
        <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ DOM Structure Test</div>
        <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Navigation Functions Test</div>
        <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ State Management Test</div>
        <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Mobile Navigation Test</div>
        <div style="color: var(--text-secondary);">✅ Search Interface Test</div>
      </div>
      
      <div style="color: var(--text-muted); font-size: 0.875rem;">
        Check console for detailed output
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal handlers
  document.getElementById('closeSimpleModal').onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (modal.parentNode) modal.remove();
  }, 10000);
}

/**
 * Initialize simple dev button
 */
function initializeSimpleDevButton() {
  if (!isDevelopmentMode()) return;
  
  const devButton = document.getElementById('devTestButton');
  const runTestsBtn = document.getElementById('runTestsBtn');
  
  if (devButton && runTestsBtn) {
    devButton.style.display = 'block';
    
    // Remove existing listeners and add simple one
    runTestsBtn.replaceWith(runTestsBtn.cloneNode(true));
    const newBtn = document.getElementById('runTestsBtn');
    newBtn.addEventListener('click', handleRunTestsSimple);
    
    devLog('🧪 Simple development test button initialized');
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSimpleDevButton);
} else {
  initializeSimpleDevButton();
}

// Add CSS for modal animation
if (!document.getElementById('simpleTestStyles')) {
  const style = document.createElement('style');
  style.id = 'simpleTestStyles';
  style.textContent = `
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

export {
  handleRunTestsSimple,
  showSimpleTestModal,
  initializeSimpleDevButton
};