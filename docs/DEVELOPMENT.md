# 🛠️ Development Guide - Exams Viewer

> **Comprehensive guide for developers working with the modular architecture**

This guide covers the development setup, architecture patterns, and contribution guidelines for the Exams Viewer project.

## 🏗️ Project Architecture

### Modern Modular Structure

```
Exams-Viewer/
├── 🏠 index.html              # Main application entry point
├── 🎨 styles.css              # Comprehensive styling with CSS variables
├── 🚀 script-modular.js       # Application bootstrap and orchestration
├── ⚡ service-worker.js        # Intelligent caching and offline support
├── 📁 js/                     # Modular JavaScript architecture
│   ├── 🔧 core/               # Core functionality modules
│   │   ├── models.js          # Data models and classes
│   │   ├── navigation.js      # Navigation and validation logic
│   │   └── state.js           # Global state management
│   └── 📦 modules/            # Feature-specific modules
│       ├── enhanced-navigation.js  # Progress sidebar and shortcuts
│       ├── exam-loader.js          # Data loading and management
│       ├── favorites.js            # Favorites and notes system
│       ├── mobile-navigation.js    # Touch gestures and mobile UI
│       ├── search.js               # Advanced search and filtering
│       ├── settings.js             # Settings management
│       ├── statistics.js           # Statistics and analytics
│       ├── storage.js              # Local storage operations
│       └── ui-effects.js           # UI feedback and animations
├── 📊 data/                   # Exam data repository
│   ├── {EXAM_CODE}/           # Individual exam folders
│   │   ├── exam.json          # Complete exam data
│   │   └── links.json         # Scraping metadata
│   └── manifest.json          # Registry of available exams
├── 🛠️ scripts/               # Python automation tools
│   ├── scraper.py             # Enhanced scraper with compression
│   ├── update_all_exams.py    # Batch update utility
│   └── create_chunks.py       # Manual chunking tool
├── 📚 docs/                   # Documentation
├── 🔄 .github/workflows/      # CI/CD automation
└── 📋 requirements.txt        # Python dependencies
```

## 🔧 Development Setup

### Prerequisites

- **Node.js 18+** - For modern JavaScript features and ES modules
- **Python 3.11+** - For scraping scripts and automation
- **Git** - Version control and collaboration
- **Modern Browser** - Chrome, Firefox, Safari, Edge with DevTools
- **Code Editor** - VS Code recommended with extensions:
  - ES6 Modules
  - JavaScript (ES6) code snippets
  - Live Server
  - Python extension

### Local Development Setup

1. **Clone and Initialize**
   ```bash
   git clone https://github.com/JohanDevl/Exams-Viewer-Legacy.git
   cd Exams-Viewer-Legacy
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Start local development server
   python -m http.server 8000
   # OR use VS Code Live Server extension
   ```

2. **Development Environment**
   ```bash
   # Access local development
   http://localhost:8000
   
   # Browser DevTools recommended settings:
   # - Network tab for module loading
   # - Console for debugging
   # - Application tab for storage inspection
   ```

## 🏛️ Architecture Patterns

### Module System

#### ES6 Modules Structure
```javascript
// Module export pattern
export {
  functionName,
  ClassName,
  CONSTANT_NAME
};

// Module import pattern  
import {
  functionName,
  ClassName
} from './path/to/module.js';

// Global function assignment
window.functionName = functionName;
```

#### Core Modules (`js/core/`)

- **`models.js`**: Data structures and classes
  - ExamSession, QuestionAttempt classes
  - Statistics calculation logic
  - Data validation utilities

- **`navigation.js`**: Navigation and validation
  - Question navigation functions
  - Answer validation logic
  - Keyboard event handlers

- **`state.js`**: Global state management
  - Application state container
  - State synchronization utilities
  - Cross-module communication

#### Feature Modules (`js/modules/`)

Each module follows single responsibility principle:

- **Encapsulation**: Private functions and public API
- **Event-driven**: Minimal direct dependencies
- **Configurable**: Settings-based behavior
- **Testable**: Clear input/output patterns

### Data Flow Architecture

```
User Input → Event Handlers → State Updates → UI Updates
     ↓              ↓              ↓           ↓
Navigation.js → State.js → Statistics.js → UI-Effects.js
```

## 🎯 Development Guidelines

### Code Style

#### JavaScript (ES6+)
```javascript
// Use modern JavaScript features
const data = await loadExamData(examCode);
const results = questions.map(q => processQuestion(q));

// Destructuring and template literals
const { questionNumber, answers } = question;
const message = `Question ${questionNumber}: ${status}`;

// Arrow functions for callbacks
array.filter(item => item.isValid)
     .map(item => ({ ...item, processed: true }));

// Async/await over Promises
async function updateStatistics() {
  try {
    const stats = await calculateStats();
    updateUI(stats);
  } catch (error) {
    handleError(error);
  }
}
```

#### Module Structure Template
```javascript
/**
 * Module: Feature Name
 * Description: What this module does
 * Dependencies: List of dependencies
 */

// Private variables and functions
let privateState = {};

function privateHelper() {
  // Implementation
}

// Public API
export function publicFunction() {
  // Implementation
}

export class PublicClass {
  constructor() {
    // Implementation
  }
}

// Constants
export const CONSTANTS = {
  DEFAULT_VALUE: 'value'
};
```

#### CSS Architecture
```css
/* CSS Custom Properties for theming */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
}

/* BEM methodology for class naming */
.component-name {
  /* Block styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}

/* Responsive design patterns */
@media (max-width: 768px) {
  .component-name {
    /* Mobile adaptations */
  }
}
```

### File Organization

#### New Module Creation
1. **Create module file** in appropriate directory (`core/` or `modules/`)
2. **Define clear public API** with exports
3. **Add to main script-modular.js** imports and window assignments
4. **Update documentation** with module purpose and API
5. **Add tests** if applicable

#### File Naming Conventions
- **kebab-case** for file names: `enhanced-navigation.js`
- **camelCase** for JavaScript variables and functions
- **PascalCase** for classes and constructors
- **UPPER_SNAKE_CASE** for constants

### Performance Considerations

#### Module Loading
- Use **dynamic imports** for large optional features
- Implement **lazy loading** for non-critical functionality
- Optimize **bundle size** by tree-shaking unused exports

#### Memory Management
- Clean up **event listeners** when modules are destroyed
- Use **WeakMap** and **WeakSet** for memory-efficient caching
- Implement **cleanup functions** for stateful modules

#### Caching Strategy
- **Service Worker** for static assets and API responses
- **LocalStorage** for user preferences and session data
- **Memory caching** for frequently accessed computed values

## 🧪 Testing and Debugging

### Browser DevTools

#### Module Debugging
```javascript
// Add debug logging
if (window.isDevelopmentMode) {
  console.log('Module loaded:', moduleName);
  console.log('State updated:', newState);
}

// Performance monitoring
performance.mark('module-start');
// ... module operations
performance.mark('module-end');
performance.measure('module-duration', 'module-start', 'module-end');
```

#### Network Analysis
- Monitor **module loading** in Network tab
- Check **service worker** cache hits
- Analyze **JSON data loading** performance

#### Storage Inspection
- **Application → Local Storage** for settings and statistics
- **Application → Service Workers** for cache management
- **Console** for storage debugging utilities

### Common Debugging Patterns

#### Module Not Loading
```javascript
// Check import/export syntax
console.log('Module exports:', Object.keys(moduleObject));

// Verify script-modular.js assignments
console.log('Window functions:', Object.keys(window).filter(k => k.startsWith('module')));
```

#### State Management Issues
```javascript
// Add state debugging
window.debugState = () => {
  console.log('Current state:', window.currentState);
  console.log('Statistics:', window.statistics);
  console.log('Settings:', window.settings);
};
```

## 🚀 Deployment and Production

### GitHub Pages Deployment

#### Automatic Deployment
- **Push to main** triggers automatic deployment
- **Service Worker** handles cache invalidation
- **Relative paths** ensure compatibility

#### Production Checklist
- [ ] Remove debug logging
- [ ] Optimize images and assets
- [ ] Test service worker functionality
- [ ] Verify responsive design
- [ ] Check browser compatibility
- [ ] Validate HTML/CSS/JS

### Performance Optimization

#### Production Build Process
1. **Minification**: Consider JavaScript minification for larger deployments
2. **Compression**: Enable gzip/brotli on server
3. **Caching**: Configure proper cache headers
4. **Monitoring**: Set up performance monitoring

## 🤝 Contributing Guidelines

### Git Workflow

#### Branch Strategy
```bash
# Feature development
git checkout -b feature/new-module-name

# Bug fixes  
git checkout -b fix/issue-description

# Documentation updates
git checkout -b docs/update-section
```

#### Commit Messages
```bash
# Format: type: description
feat: add enhanced navigation module
fix: resolve validation feedback display issue
docs: update development guide for modular architecture
refactor: reorganize core modules structure
```

### Pull Request Process

1. **Create Feature Branch** from main
2. **Implement Changes** following guidelines
3. **Test Thoroughly** in multiple browsers
4. **Update Documentation** as needed
5. **Submit Pull Request** with detailed description
6. **Address Review Feedback** promptly

### Code Review Checklist

#### Functionality
- [ ] Feature works as intended
- [ ] No regressions in existing functionality
- [ ] Mobile compatibility maintained
- [ ] Error handling implemented

#### Code Quality
- [ ] Follows established patterns
- [ ] Proper module exports/imports
- [ ] Documentation updated
- [ ] Performance considerations addressed

#### Architecture
- [ ] Maintains separation of concerns
- [ ] Follows modular principles
- [ ] Proper state management
- [ ] Clean module interfaces

## 📊 Monitoring and Analytics

### Development Metrics

#### Performance Monitoring
```javascript
// Module loading performance
const moduleLoadTime = performance.getEntriesByType('measure')
  .filter(m => m.name.includes('module'));

// Memory usage tracking
const memoryInfo = performance.memory || {};
console.log('Memory usage:', memoryInfo);

// User interaction tracking
function trackUserAction(action, module) {
  console.log(`Action: ${action} in ${module} at ${Date.now()}`);
}
```

### Error Handling

#### Global Error Handler
```javascript
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service in production
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

## 🔧 Build Tools and Automation

### Python Scripts

#### Scraping Development
```bash
# Test scraping functionality
python scripts/scraper.py --exam CAD --test-mode

# Update all exams with verbose output
python scripts/update_all_exams.py --verbose

# Create development data subset
python scripts/create_test_data.py
```

#### Development Utilities
```bash
# Validate JSON structure
python scripts/validate_data.py

# Performance analysis
python scripts/analyze_data_size.py

# Generate development documentation
python scripts/generate_docs.py
```

### GitHub Actions

#### Automated Workflows
- **Scraping Updates**: Scheduled exam data updates
- **Deployment**: Automatic GitHub Pages deployment
- **Quality Checks**: Linting and validation
- **Documentation**: Automatic doc generation

## 📚 Additional Resources

### Learning Resources
- **[MDN ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)**
- **[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)**
- **[Web Performance](https://web.dev/performance/)**
- **[Modern JavaScript](https://javascript.info/)**

### Tools and Extensions
- **Browser DevTools**: Chrome, Firefox developer tools
- **VS Code Extensions**: ES6 snippets, Live Server, Python
- **Performance Tools**: Lighthouse, WebPageTest
- **Debugging**: Vue DevTools for state inspection

### Project Resources
- **[Architecture Decisions](../docs/API.md)**: Technical architecture decisions
- **[Performance Guide](../docs/PERFORMANCE_OPTIMIZATIONS.md)**: Optimization techniques
- **[Features Overview](../docs/FEATURES.md)**: Complete feature documentation

---

This development guide provides the foundation for contributing to and extending the Exams Viewer project. For specific implementation details, refer to the individual module documentation and source code comments.