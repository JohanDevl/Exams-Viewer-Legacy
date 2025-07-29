# 🎓 Exams Viewer

> **Modern exam practice platform with automated scraping and intelligent features**

An advanced web application for practicing exam questions from ExamTopics.com with a modern modular architecture, comprehensive statistics, and enhanced user experience.

## 🌐 Live Demo

**🚀 Web Interface**: [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)

> No installation required! Responsive design, dark mode, and all features work directly in your browser.

## ✨ Key Features

### 🎯 Modern Learning Experience
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⌨️ Enhanced Keyboard Shortcuts**: Complete shortcut system with visual feedback notifications
- **📊 Visual Progress Tracking**: Interactive sidebar with real-time progress indicators
- **🎨 Smart Status System**: Color-coded question states (new, answered, correct, incorrect)
- **🏷️ Organization Tools**: Favorites, categories, personal notes, and bookmarking
- **🌙 Dark Mode**: Automatic theme detection with manual override

### 🔍 Advanced Search & Filtering
- **🔎 Intelligent Search**: Text-based search across questions, answers, and comments
- **🎯 Difficulty Rating System**: 3-level difficulty rating (Easy, Medium, Hard) with color-coded indicators
- **🏷️ Status Filters**: Filter by answered, unanswered, favorites, categories, and difficulty levels
- **💡 Auto-completion**: Smart suggestions for question numbers and search terms
- **📊 Dynamic Counters**: Real-time counts for each filter category

### 📈 Comprehensive Statistics
- **📊 Session Tracking**: Detailed progress across multiple study sessions
- **🎯 Performance Analytics**: Accuracy tracking, time spent, and improvement trends
- **📋 Global Overview**: Consolidated statistics across all exams
- **💾 Intelligent Storage**: Optimized data management with corruption prevention

### 📱 Mobile-Optimized Experience
- **👆 Touch Gestures**: Swipe navigation between questions
- **📲 Mobile Navigation**: Bottom navigation bar for thumb-friendly access
- **🔄 Haptic Feedback**: Tactile feedback for better mobile interaction
- **📱 Responsive Layout**: Adaptive UI for all screen sizes

### 🚀 Performance & Technology
- **⚡ Modular Architecture**: ES6 modules with clean separation of concerns
- **🗄️ Service Worker**: Intelligent caching for offline capability
- **🖼️ Image Optimization**: Automatic WebP compression with fallback
- **💾 Smart Storage**: Efficient data management and cleanup tools
- **🔄 Background Updates**: Automatic cache refresh for latest content

### 🤖 Automation & Scraping
- **🔄 Automated Updates**: GitHub Actions for scheduled scraping
- **🛡️ Respectful Scraping**: Built-in rate limiting and error handling
- **📊 Change Detection**: Incremental updates with smart diffing
- **🖼️ Image Processing**: Automatic compression and format optimization

## 📚 Supported Certifications

Currently supporting **20+ exams** across multiple ServiceNow certification tracks:

### Core Certifications
- **CAD** - Certified Application Developer
- **CSA** - Certified System Administrator
- **CAS-PA** - Customer Service Management Professional

### Implementation Specialist (CIS) Series
- **CIS-APM** - Application Portfolio Management
- **CIS-CSM** - Customer Service Management  
- **CIS-Discovery** - Discovery
- **CIS-EM** - Event Management
- **CIS-FSM** - Field Service Management
- **CIS-HAM** - Hardware Asset Management
- **CIS-HR** - Human Resources
- **CIS-ITSM** - IT Service Management
- **CIS-PPM** - Project Portfolio Management
- **CIS-RC** - Risk and Compliance
- **CIS-SAM** - Software Asset Management
- **CIS-SIR** - Security Incident Response
- **CIS-SM** - Service Mapping
- **CIS-SPM** - Strategic Portfolio Management
- **CIS-VR** - Vulnerability Response
- **CIS-VRM** - Vendor Risk Management

> All exams include questions, explanations, discussions, and progress tracking.

## 🚀 Quick Start

### For Study & Practice
1. **Visit** [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)
2. **Select** an exam from the dropdown
3. **Start studying** with our enhanced interface
4. **Track progress** with real-time statistics

### For Development
```bash
# Clone the repository
git clone https://github.com/JohanDevl/Exams-Viewer.git
cd Exams-Viewer

# Install Python dependencies for scraping
pip install -r requirements.txt

# Start local development server
python -m http.server 8000
```

## 🏗️ Architecture

### Modern Modular Structure
```
Exams-Viewer/
├── 🏠 index.html              # Main application entry point
├── 🎨 styles.css              # Comprehensive styling with dark mode
├── 🚀 script-modular.js       # Application bootstrap and module orchestration
├── 📁 js/                     # Modular JavaScript architecture
│   ├── 🔧 core/               # Core functionality modules
│   │   ├── models.js          # Data models and statistics classes
│   │   ├── navigation.js      # Question navigation and validation
│   │   └── state.js           # Global state management
│   └── 📦 modules/            # Feature-specific modules
│       ├── enhanced-navigation.js  # Progress sidebar and keyboard shortcuts
│       ├── exam-loader.js          # Exam data loading and management
│       ├── favorites.js            # Favorites and notes system
│       ├── mobile-navigation.js    # Touch gestures and mobile UI
│       ├── search.js               # Advanced search and filtering
│       ├── settings.js             # Settings management and persistence
│       ├── statistics.js           # Statistics calculation and tracking
│       ├── storage.js              # Local storage operations and cleanup
│       └── ui-effects.js           # UI feedback, animations, and effects
├── ⚡ service-worker.js        # Intelligent caching and offline support
├── 📊 data/                   # Exam data repository
│   ├── {EXAM_CODE}/           # Individual exam folders
│   │   ├── exam.json          # Complete exam questions and answers
│   │   └── links.json         # Scraping metadata and source links
│   └── manifest.json          # Registry of available exams
├── 🛠️ scripts/               # Python automation tools
│   ├── scraper.py             # Enhanced scraper with image processing
│   ├── update_all_exams.py    # Batch update utility
│   └── create_chunks.py       # Manual chunking tool (optional)
└── 📚 docs/                   # Comprehensive documentation
```

### Key Design Principles
- **🎯 Separation of Concerns**: Each module handles specific functionality
- **🔄 Event-Driven Architecture**: Clean communication between modules
- **📱 Mobile-First Design**: Responsive and touch-optimized interface
- **⚡ Performance-Focused**: Efficient loading and caching strategies
- **🛠️ Developer-Friendly**: Clear structure and extensive documentation

## 📖 Usage Guide

### Basic Navigation
1. **Select Exam**: Choose from the dropdown list of available certifications
2. **Navigate Questions**: Use keyboard shortcuts, buttons, or touch gestures
3. **Answer Questions**: Select answers and validate to see results
4. **Track Progress**: Monitor completion via the progress bar and sidebar

### Advanced Features
- **📊 Progress Sidebar**: Press `Ctrl+S` or click menu to see detailed question overview
- **⌨️ Keyboard Shortcuts**: Press `?` for complete shortcut reference with visual feedback
- **🎯 Difficulty Rating**: Rate questions as Easy/Medium/Hard using buttons or keys (1/2/3/0)
- **🔍 Search & Filter**: Use advanced search to find specific questions and filter by difficulty
- **🏷️ Organization**: Add favorites, categories, and personal notes
- **📈 Statistics**: View detailed analytics including difficulty distribution
- **📄 Export**: Export questions and data in multiple formats (PDF, JSON, CSV)
- **🎯 Highlight Mode**: Preview correct answers before validation
- **🔄 Resume Sessions**: Continue studying where you left off

### Mobile Features
- **👆 Swipe Navigation**: Swipe left/right to navigate questions
- **📱 Bottom Navigation**: Thumb-friendly controls for mobile devices
- **🔄 Haptic Feedback**: Tactile response for better interaction

## 🔧 Configuration

### Settings Panel
Access via the gear icon to customize:
- **🎨 Theme**: Light/dark mode preferences
- **⌨️ Navigation**: Keyboard shortcut configurations
- **📊 Statistics**: Progress tracking options
- **📱 Mobile**: Touch gesture settings
- **🔄 Session Management**: Auto-save and resume options

### Developer Configuration
```bash
# Update all exams manually
python scripts/update_all_exams.py

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Process images with compression
python scripts/scraper.py --compress-images
```

## 📚 Documentation

### User Guides
- **[📋 Installation Guide](docs/INSTALLATION.md)** - Setup and configuration
- **[📖 Usage Guide](docs/USAGE.md)** - Complete feature walkthrough
- **[🎯 Features Overview](docs/FEATURES.md)** - Detailed feature descriptions

### Technical Documentation
- **[🛠️ Development Guide](docs/DEVELOPMENT.md)** - Developer setup and contribution guidelines
- **[📊 Statistics System](docs/STATISTICS.md)** - Analytics and tracking implementation
- **[⌨️ Navigation System](docs/NAVIGATION.md)** - Keyboard shortcuts and navigation features
- **[🎨 Visual Indicators](docs/VISUAL_STATUS_INDICATORS.md)** - Status system and color coding
- **[⚡ Performance Guide](docs/PERFORMANCE_OPTIMIZATIONS.md)** - Optimization techniques
- **[📋 API Reference](docs/API.md)** - Technical API documentation
- **[🔧 Scraper Documentation](docs/SCRAPER_IMPROVEMENTS.md)** - Scraping system details

## ⚖️ Legal & Ethics

### 📚 Educational Purpose
This application is designed **exclusively for educational use** and personal study preparation. Commercial use is strictly prohibited.

### 🔒 Content Attribution
- All exam content is sourced from **ExamTopics.com**
- Original content ownership belongs to respective certification providers
- This tool provides a practice interface under fair use principles
- No content is claimed as original work of this project

### 🛡️ Responsible Scraping
- **Rate Limiting**: 5-10 second delays between requests
- **Server Respect**: Automatic detection of rate limiting responses
- **Error Handling**: Graceful handling of server errors and timeouts
- **Minimal Impact**: Incremental updates to reduce server load

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/Exams-Viewer.git
cd Exams-Viewer

# Install dependencies
pip install -r requirements.txt

# Start development server
python -m http.server 8000
```

See [Development Guide](docs/DEVELOPMENT.md) for detailed contribution guidelines.

## 🆘 Support

### Getting Help
1. **📚 Check Documentation**: Browse the comprehensive docs in `/docs/`
2. **🔍 Search Issues**: Look through [existing issues](../../issues)
3. **🆕 Create Issue**: Submit a [new issue](../../issues/new) with details
4. **💬 Discussions**: Join [GitHub Discussions](../../discussions)

### Common Issues
- **Loading Problems**: Check browser console for JavaScript errors
- **Mobile Issues**: Ensure touch gestures are enabled in settings
- **Performance**: Use browser dev tools to monitor network and performance
- **Data Issues**: Use Statistics panel cleanup tools to reset corrupted data

## 📊 Project Status

- **🎯 Active Development**: Regular updates and feature additions
- **📱 Production Ready**: Stable and fully functional
- **🔧 Continuous Integration**: Automated testing and deployment
- **📈 Growing**: Expanding exam coverage and features

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and feature updates.

## 📜 License

**Educational Use License**: This project is licensed for educational purposes only. All exam content remains the property of its respective owners. See the legal compliance section above for full details.

---

<div align="center">

**🎓 Happy Studying! 📚**

*Built with ❤️ for the ServiceNow community*

</div>