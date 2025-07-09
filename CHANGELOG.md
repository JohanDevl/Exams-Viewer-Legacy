# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - {PR_MERGE_DATE}

### Added

- Option in Settings to show/hide the question toolbar (favorites, groups, notes)
- The question toolbar is now hidden by default and can be enabled via Display Preferences

### Enhanced

- Toolbar visibility is persistent (saved in localStorage)
- Dynamic update of the toolbar without page reload

## [2.2.0] - 2025-07-09

### Added

- Changelog functionality with Markdown rendering
- Changelog accessible from main interface with keyboard shortcut (Ctrl/Cmd+H)
- Automatic Markdown formatting for changelog display
- Visual icons for changelog sections (Added, Changed, Enhanced, etc.)
- GitHub Actions workflows for automated changelog management
- Support for 2025-07-09 placeholder replacement

### Enhanced

- Markdown parser with dynamic header counting (# symbols)
- Improved list parsing with proper multi-line handling
- Better spacing and alignment for changelog sections
- Loading states and error handling for changelog modal
- CSS styling with flexbox layout for icon alignment

## [2.1.0] - 2025-07-09

### Added

- **Favorites System**: Mark questions as favorites for quick access
- **Custom Categories**: Create and manage custom categories for organizing questions
- **Personal Notes**: Add personal notes to questions for better study management
- **Revision Mode**: Special mode to review only favorited questions and notes
- **Enhanced Statistics**: Comprehensive tracking of study sessions and performance
- **Progress Tracking**: Detailed analytics on question attempts and learning progress
- **Export/Import Favorites**: Backup and restore your favorites and notes

### Enhanced

- **User Interface**: Improved navigation and user experience
- **Performance**: Optimized loading times and data management
- **Accessibility**: Better keyboard navigation and screen reader support

### Fixed

- **Data Persistence**: Improved reliability of saving user data
- **Mobile Responsiveness**: Better display on mobile devices
- **Memory Management**: Optimized data storage and retrieval

## [2.0.0] - 2025-07-08

### Added

- **Dark Mode**: Full dark theme support with automatic detection
- **Question Statistics**: Track performance per question and exam
- **Session Management**: Monitor study sessions with detailed analytics
- **Export to PDF**: Generate PDF documents of exam questions
- **Advanced Navigation**: Jump to specific questions, random navigation
- **Highlight Feature**: Preview correct answers before validation
- **Discussion Integration**: View community discussions for questions

### Changed

- **Complete UI Redesign**: Modern, responsive interface
- **Improved Data Structure**: More efficient JSON format for exam data
- **Enhanced Error Handling**: Better error messages and recovery
- **Performance Optimization**: Faster loading and smoother navigation

### Removed

- Legacy interface components
- Deprecated API endpoints

## [1.5.0] - 2025-07-05

### Added

- **Multiple Exam Support**: Browse and select from available exams
- **Question Validation**: Check answers with detailed explanations
- **Progress Indicators**: Visual feedback on study progress
- **Responsive Design**: Mobile-friendly interface

### Enhanced

- **Loading Performance**: Faster exam data loading
- **Error Messages**: More informative error handling
- **Navigation**: Improved question browsing experience

### Fixed

- **Data Loading Issues**: Resolved JSON parsing errors
- **Browser Compatibility**: Fixed issues with older browsers
- **Memory Leaks**: Optimized memory usage

## [1.0.0] - 2025-07-04

### Added

- **Initial Release**: Basic exam question viewer
- **Scraping Engine**: Automated question extraction from ExamTopics
- **Question Display**: Clean interface for viewing exam questions
- **Answer Selection**: Interactive answer selection system
- **Basic Navigation**: Previous/Next question navigation

### Features

- Support for ServiceNow certification exams
- JSON-based data storage
- GitHub Pages deployment
- Automated scraping with GitHub Actions
- Legal compliance framework

### Technical

- Vanilla JavaScript frontend
- Python-based scraping backend
- BeautifulSoup4 for HTML parsing
- GitHub Actions for automation
- Responsive CSS design

## [0.1.0] - 2025-07-04

### Added

- **Project Initialization**: Basic project structure
- **Proof of Concept**: Initial scraping functionality
- **Basic UI**: Simple question display interface
- **Data Structure**: JSON format for storing exam questions

### Infrastructure

- GitHub repository setup
- Basic documentation
- MIT License
- Requirements specification

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Enhanced**: Improvements to existing features

## Contributing

When adding entries to this changelog:

1. **Use semantic versioning** (MAJOR.MINOR.PATCH)
2. **Group changes** by type (Added, Changed, Fixed, etc.)
3. **Be descriptive** but concise
4. **Include dates** in YYYY-MM-DD format
5. **Reference issues/PRs** when applicable
6. **Keep it user-focused** - describe impact, not implementation details

## Version History Summary

- **v2.2.x**: Changelog functionality and improvements
- **v2.1.x**: Favorites and study management features
- **v2.0.x**: Complete redesign with dark mode and statistics
- **v1.5.x**: Multi-exam support and responsive design
- **v1.0.x**: Initial stable release with core functionality
- **v0.1.x**: Proof of concept and project setup
