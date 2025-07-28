/**
 * Demo Script for Issue #16 - Enhanced Keyboard Shortcuts
 * 
 * This script provides a guided demonstration of the new keyboard shortcuts
 * functionality implemented for Issue #16.
 */

// Demo configuration
const DEMO_CONFIG = {
  STEP_DELAY: 2000,      // Delay between demo steps
  FEEDBACK_DURATION: 1500 // How long to show each feedback
};

// Demo state
let demoRunning = false;
let demoStep = 0;

/**
 * Demo steps definition
 */
const DEMO_STEPS = [
  {
    title: "Welcome to Issue #16 Demo",
    description: "This demo will showcase the enhanced keyboard shortcuts implementation.",
    action: () => console.log("🎬 Starting keyboard shortcuts demo...")
  },
  {
    title: "Step 1: Export Shortcut (E)",
    description: "Press 'E' to open the export modal",
    action: async () => {
      console.log("📤 Demonstrating Export shortcut...");
      simulateKeyPress('e');
      await sleep(1000);
      // Close modal after showing
      if (typeof window.hideExportModal === 'function') {
        window.hideExportModal();
      }
    }
  },
  {
    title: "Step 2: Visual Feedback for Actions",
    description: "Watch for visual feedback when using action shortcuts",
    action: async () => {
      console.log("✨ Demonstrating visual feedback...");
      
      // Demonstrate F (favorite)
      simulateKeyPress('f');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
      
      // Demonstrate N (note)
      simulateKeyPress('n');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
      
      // Demonstrate V (validate)
      simulateKeyPress('v');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
    }
  },
  {
    title: "Step 3: Help Modal (?)",
    description: "Press '?' to see the keyboard shortcuts help",
    action: async () => {
      console.log("❓ Opening help modal...");
      simulateKeyPress('?');
      await sleep(2000);
      // Close help modal
      if (typeof window.closeKeyboardHelp === 'function') {
        window.closeKeyboardHelp();
      }
    }
  },
  {
    title: "Step 4: Navigation Shortcuts", 
    description: "Arrow keys and vim-style navigation with visual feedback",
    action: async () => {
      console.log("🧭 Demonstrating navigation shortcuts...");
      
      // Right arrow
      simulateKeyPress('ArrowRight');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
      
      // Left arrow  
      simulateKeyPress('ArrowLeft');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
      
      // Vim style - L
      simulateKeyPress('l');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
      
      // Vim style - H
      simulateKeyPress('h');
      await sleep(DEMO_CONFIG.FEEDBACK_DURATION);
    }
  },
  {
    title: "Step 5: Input Field Prevention",
    description: "Shortcuts are disabled when typing in input fields",
    action: async () => {
      console.log("🚫 Demonstrating input field prevention...");
      
      // Find an input field
      const searchInput = document.getElementById('questionSearch');
      if (searchInput) {
        searchInput.focus();
        console.log("📝 Focused on search input - shortcuts should be disabled");
        
        // Try to trigger export (should not work)
        simulateKeyPress('e');
        await sleep(1000);
        
        // Blur the input
        searchInput.blur();
        console.log("👍 Input blurred - shortcuts re-enabled");
      }
    }
  }
];

/**
 * Utility function to simulate key presses
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
 * Utility sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show demo step information
 */
function showDemoStep(step) {
  const stepInfo = DEMO_STEPS[step];
  if (!stepInfo) return;
  
  console.log(`\n🎯 ${stepInfo.title}`);
  console.log(`📝 ${stepInfo.description}`);
  console.log('─'.repeat(50));
}

/**
 * Run the complete demo
 */
async function runKeyboardShortcutsDemo() {
  if (demoRunning) {
    console.log("⚠️ Demo already running!");
    return;
  }
  
  demoRunning = true;
  demoStep = 0;
  
  console.log("🚀 Starting Issue #16 Keyboard Shortcuts Demo");
  console.log("=" .repeat(60));
  
  try {
    for (let i = 0; i < DEMO_STEPS.length; i++) {
      demoStep = i;
      showDemoStep(i);
      
      // Execute the step action
      if (DEMO_STEPS[i].action) {
        await DEMO_STEPS[i].action();
      }
      
      // Wait before next step (except for last step)
      if (i < DEMO_STEPS.length - 1) {
        console.log(`⏳ Waiting ${DEMO_CONFIG.STEP_DELAY}ms before next step...\n`);
        await sleep(DEMO_CONFIG.STEP_DELAY);
      }
    }
    
    console.log("\n🎉 Demo completed successfully!");
    console.log("=" .repeat(60));
    console.log("📋 Summary of features demonstrated:");
    console.log("  ✅ Export shortcut (E) - Opens export modal");
    console.log("  ✅ Visual feedback system - Shows action confirmations");
    console.log("  ✅ Help modal (?) - Documents all shortcuts");
    console.log("  ✅ Navigation shortcuts - Arrow keys and vim-style");
    console.log("  ✅ Input field prevention - Disabled when typing");
    console.log("\n💡 Try the shortcuts yourself now!");
    
  } catch (error) {
    console.error("❌ Demo error:", error);
  } finally {
    demoRunning = false;
    demoStep = 0;
  }
}

/**
 * Run a quick test of all shortcuts
 */
async function quickShortcutsTest() {
  console.log("⚡ Running quick shortcuts test...");
  
  const shortcuts = [
    { key: 'e', name: 'Export Modal' },
    { key: 'f', name: 'Toggle Favorite' },
    { key: 'n', name: 'Add Note' },
    { key: 'v', name: 'Validate Answers' },
    { key: '?', name: 'Help Modal' }
  ];
  
  for (const shortcut of shortcuts) {
    console.log(`🧪 Testing ${shortcut.key.toUpperCase()} - ${shortcut.name}`);
    simulateKeyPress(shortcut.key);
    await sleep(800);
    
    // Close any opened modals
    if (shortcut.key === 'e' && typeof window.hideExportModal === 'function') {
      window.hideExportModal();
    }
    if (shortcut.key === '?' && typeof window.closeKeyboardHelp === 'function') {
      window.closeKeyboardHelp();
    }
  }
  
  console.log("✅ Quick test completed!");
}

/**
 * Show available demo commands
 */
function showDemoHelp() {
  console.log("🎬 Issue #16 Demo Commands:");
  console.log("=" .repeat(40));
  console.log("runKeyboardShortcutsDemo() - Full guided demo");
  console.log("quickShortcutsTest()       - Quick test all shortcuts");
  console.log("showDemoHelp()             - Show this help");
  console.log("\n📋 Manual Testing:");
  console.log("Press E - Export modal");  
  console.log("Press F - Toggle favorite");
  console.log("Press N - Add/edit note");
  console.log("Press V - Validate answers");
  console.log("Press ? - Help modal");
  console.log("Press ← → ↑ ↓ - Navigation");
  console.log("Press H J K L - Vim navigation");
  console.log("Press Esc - Close modals");
}

// Make functions available globally
window.runKeyboardShortcutsDemo = runKeyboardShortcutsDemo;
window.quickShortcutsTest = quickShortcutsTest;
window.showDemoHelp = showDemoHelp;

// Auto-show help when loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("🎬 Issue #16 Demo loaded!");
    showDemoHelp();
  });
}

// Export for ES6 module compatibility
export { runKeyboardShortcutsDemo, quickShortcutsTest, showDemoHelp };