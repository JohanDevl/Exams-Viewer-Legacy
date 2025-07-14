# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.8.0] - {PR_MERGE_DATE}

### Added

- **Enhanced Mobile Navigation System**: Comprehensive touch-optimized navigation for mobile devices
  - 44px minimum touch targets for all interactive elements following iOS accessibility guidelines
  - Swipe gestures for intuitive question navigation (left swipe = next, right swipe = previous)
  - Mobile bottom navigation bar with essential controls (Previous, Random, Progress, Next)
  - Visual feedback system with swipe indicators showing navigation direction
  - Haptic feedback support using vibration API for tactile user experience
  - Contextual display - navigation only appears during active exams, not on homepage
  - Clean mobile interface with desktop navigation completely hidden on mobile
  - Responsive design with automatic adaptation between desktop and mobile modes

- **Touch Gesture Detection**: Advanced touch event handling system
  - Horizontal swipe detection with proper thresholds and timing validation
  - Conflict prevention with scrolling, form inputs, and existing controls
  - Smart gesture recognition avoiding interference with essential UI interactions
  - Performance optimizations using passive event listeners where appropriate

- **Mobile-Optimized UI Components**: Complete mobile interface overhaul
  - Thumb-friendly navigation with fixed bottom positioning for one-handed use
  - Enhanced spacing and touch target sizing for better mobile interaction
  - Touch feedback animations and visual cues for interactive elements
  - Mobile-specific CSS optimizations with media queries for different screen sizes

### Enhanced

- **Navigation Experience**: Seamless integration of touch and traditional navigation
  - Keyboard shortcuts remain fully functional alongside new touch gestures
  - Navigation history and progress tracking work with all input methods
  - Sidebar functionality enhanced with swipe-to-close gesture on mobile
  - Improved navigation state management across different device types

- **Performance Optimizations**: Efficient touch event handling and responsive design
  - Conditional feature loading based on device capabilities and screen size
  - Memory-efficient gesture detection with proper event cleanup
  - Optimized CSS rendering with mobile-first responsive design approach
  - Intelligent navigation bar management with dynamic creation and removal

### Technical

- **Cross-Platform Compatibility**: Full support for modern mobile browsers
  - iOS Safari: Complete functionality including haptic feedback
  - Android Chrome: Full feature support with vibration API integration
  - Progressive enhancement ensuring graceful degradation on older devices
  - Touch-action CSS properties for optimal touch interaction performance

## [2.7.0] - 2025-07-14

### Added

- **Informative Tooltips System**: Comprehensive tooltip guidance for better user experience
  - CSS-only tooltip implementation using pseudo-elements for optimal performance
  - Keyboard shortcuts displayed on relevant buttons and interface elements
  - Four positioning options (top, bottom, left, right) with intelligent placement
  - Disabled by default with toggle option in settings modal for user control
  - Mobile-optimized touch support with automatic 3-second display duration
  - Responsive design adapting to different screen sizes and orientations
  - Dark mode compatibility with theme-aware styling
  - Accessibility compliance with screen reader support and high contrast mode
  - Reduced motion support for users with motion sensitivity preferences

- **Enhanced User Guidance**: Contextual information for all major interface elements
  - Navigation buttons with keyboard shortcuts (←/→, H/L for vim users)
  - Action buttons showing corresponding keys (V for validate, F for favorite, N for notes)
  - Interface controls with helpful descriptions and shortcut combinations
  - Progressive disclosure of advanced features through informative tooltips
  - Consistent tooltip styling across all components with proper spacing and readability

### Enhanced

- **Settings Management**: Extended preferences system
  - New tooltip visibility control in Display Preferences section
  - Persistent setting storage with localStorage integration
  - Immediate application of tooltip visibility changes
  - Clear descriptions of tooltip functionality and keyboard shortcuts

### Fixed

- **Tooltip Display Issues**: Resolved visibility and positioning problems
  - Proper background sizing with max-content width calculation
  - High z-index (99999) ensuring tooltips appear above all interface elements
  - Corrected line break display using HTML entities (&#10;) instead of \n
  - Improved positioning for header buttons with top-aligned tooltips
  - Enhanced mobile touch handling with focus-based activation

## [2.6.0] - 2025-07-14

### Added

- **Enhanced Visual Status Indicators**: Comprehensive color-coded badge system for question states
  - Six distinct status types: New (gray), Viewed (orange), Correct (green), Incorrect (red), With Notes (purple), Categorized (cyan)
  - Primary status badges showing question completion states with icons and text labels
  - Secondary badges for favorites (star), notes (sticky note), and categories (tag)
  - Real-time status updates when validating answers, adding favorites, or creating notes
  - Intelligent status detection with automatic question visit tracking
  - Performance-optimized caching system with LRU management (200-item limit)
  - Full accessibility support with ARIA labels and screen reader compatibility
  - Complete dark mode integration with adaptive color schemes

- **Question Organization System**: Advanced tools for study session management
  - Automatic visit tracking when navigating to questions
  - Distinction between correct/incorrect/preview answer attempts
  - Integration with existing favorites and notes systems
  - Category-based organization with visual indicators

- **Responsive Badge System**: Mobile-optimized visual indicators
  - Adaptive badge sizing for different screen sizes (768px, 480px breakpoints)
  - Intelligent layout switching from horizontal to vertical stacking on mobile
  - Touch-friendly interactions with proper spacing and sizing
  - Consistent visual hierarchy across all device types

### Enhanced

- **Progress Sidebar**: Enriched question overview with visual status display
  - Enhanced question items showing comprehensive status information
  - Clear visual hierarchy with primary and secondary status indicators
  - Improved navigation with click-to-go functionality for all question states
  - Better mobile responsiveness with adaptive badge layouts

- **Performance Optimizations**: Intelligent caching and memory management
  - Question status cache with automatic invalidation when data changes
  - Memory-efficient status calculations for large question sets
  - Optimized DOM updates and render cycles for smooth animations
  - Background cache cleanup to prevent memory leaks

- **User Interface**: Improved visual feedback and accessibility
  - Hover effects and transitions for better interaction feedback
  - Focus management for keyboard navigation compatibility
  - Color-blind friendly design with icons complementing color coding
  - Proper contrast ratios maintained across all themes

### Fixed

- **Question Toolbar Access**: Resolved issue with category dropdown not appearing
  - Clarified that question toolbar must be enabled in Settings > Display Preferences
  - Updated documentation to explain toolbar activation requirement
  - Improved user guidance for accessing favorites, categories, and notes features

### Technical

- **Session Statistics Enhancement**: Extended session data structure
  - Added `visitedQuestions` array to track question navigation
  - Backward compatibility with existing session data
  - Compressed property names for storage efficiency
  - Proper getter methods for data access

- **Cache Management**: Intelligent status caching system
  - LRU cache implementation with automatic size management
  - Cache invalidation triggers for data consistency
  - Memory leak prevention with bounded cache size
  - Performance monitoring and optimization

## [2.5.3] - 2025-07-13

### Added

- **Enhanced Progress Indicator**: Comprehensive animated progress tracking system
  - Animated progress bar with smooth GPU-accelerated transitions and color gradients
  - Real-time statistics display showing answered questions, favorites, and remaining count
  - Dynamic percentage indicator with pulsing animations and milestone celebrations
  - Milestone effects for 25%, 50%, 75%, and 100% completion with visual celebrations
  - Current question position tracking with smooth indicator animations
  - Session isolation ensuring fresh progress tracking for each exam load
  - Optional display control via Settings > Display Preferences (enabled by default)
  - Responsive design adapting perfectly to mobile and desktop layouts
  - Full dark mode compatibility with optimized colors and animations
  - Integration with existing navigation, favorites, and statistics systems

### Enhanced

- **Settings Management**: Improved toolbar and interface control
  - Enhanced "Show question toolbar" setting now properly controls revision mode button visibility
  - Real-time toggle updates without requiring page reload for all toolbar-related elements
  - Improved settings organization with proper spacing and descriptions
  - Dynamic interface updates when settings change for better user experience

### Fixed

- **Session Statistics**: Corrected progress tracking between exam sessions
  - Fixed `isQuestionAnswered()` to only check current session instead of previous sessions
  - Ensured each exam load starts with a fresh progress count (0 answered questions)
  - Resolved issue where switching between exams showed incorrect answer counts
  - Improved session isolation for accurate progress representation

## [2.5.2] - 2025-07-13

### Fixed

- **Embedded Image Display**: Fixed display of compressed images in exam questions
  - Implemented `processEmbeddedImages()` function to handle base64 image processing
  - Fixed replacement of truncated base64 sources with complete image data
  - Added support for `data-img-id` attributes from scraper compression system
  - Enhanced image display in questions, answers, discussion comments, and PDF exports
- **Update Status Messages**: Resolved confusing error messages during exam updates
  - Modified `update_exam_data()` to return clear success/failure indicators
  - Fixed chunking operations appearing as failures instead of success notifications
  - Improved clarity of update status reporting with proper message separation

### Enhanced

- **Image Processing System**: Comprehensive improvements to embedded image handling
  - WebP format prioritization with automatic JPEG fallback for better compression
  - Added responsive styling and accessibility attributes for all processed images
  - Implemented fallback support for original URLs when embedded data unavailable
  - Enhanced PDF export to include properly formatted embedded images
- **Performance Optimizations**: Continued improvements to large exam handling
  - Refined chunking system with better status reporting
  - Enhanced data integrity with improved image compression integration
  - Optimized image loading with local base64 processing (no external requests)

## [2.5.1] - 2025-07-13

### Fixed

- **Console Errors**: Resolved JavaScript errors that appeared in browser console
  - Fixed JSON parsing errors in statistics compression/decompression with proper regex escaping
  - Added fallback parsing and default structure for corrupted localStorage data
  - Implemented automatic detection and cleanup of corrupted localStorage items
- **Browser Cache Issues**: Added console guidance for users experiencing autoPip.js MediaSession errors
  - Provides clear instructions for cache clearing and localStorage reset
  - Helps resolve stale browser cache references to non-existent files

### Enhanced

- **Data Recovery**: Improved robustness of data loading and error handling

  - Enhanced statistics data compression with proper special character handling
  - Added graceful fallbacks for corrupted or malformed data
  - Automatic cleanup prevents persistent error states

- **Changelog Display**: Improved markdown rendering with compact nested lists
  - Recursive parser supporting unlimited nesting levels
  - Compact CSS styling with progressive spacing for better readability
  - Enhanced visual hierarchy for multi-level list structures

## [2.5.0] - 2025-07-13

### Added

- **Enhanced Keyboard Navigation System**: Comprehensive shortcuts for all navigation actions
  - Vim-style navigation (`hjkl`) alongside standard arrow keys
  - Quick movement: Previous/Next 5 questions (`↑↓`), 10 questions (`Page Up/Down`)
  - Direct navigation: Number keys 1-9 for instant question jumping
  - Home/End keys for first/last question navigation
  - Modifier combinations: `Ctrl+↑/↓` for beginning/end navigation
- **Visual Progress Sidebar**: Interactive question overview with real-time status tracking
  - Comprehensive progress bar with completion percentage
  - Clickable question list with status indicators (current, answered, unanswered, favorites)
  - Question previews showing first 60 characters for easy identification
  - Auto-scroll functionality to keep current question visible
  - Responsive design: full-screen on mobile, overlay on desktop
- **Navigation History System**: Browser-like back/forward functionality
  - Intelligent history tracking with smart duplicate prevention
  - Back/Forward buttons with step counters and tooltips
  - Limited to 50 entries for optimal performance
  - Universal integration with all navigation methods
- **Action Shortcuts**: Direct keyboard access to core functions
  - `v` for answer validation, `t` for highlight toggle
  - `f` for favorites, `n` for notes, `r` for random question
  - `s` for search focus, `Ctrl+S` for sidebar toggle
  - `Esc` for universal close/cancel, `?` for keyboard help
- **Keyboard Shortcuts Help Modal**: Interactive reference guide
  - Organized shortcuts by category (Navigation, Actions, Interface)
  - Visual keyboard key representations
  - Responsive design with mobile optimization

### Enhanced

- **Navigation Flow**: Seamless integration between different navigation methods
  - Space/Enter for next question, Shift+Space for previous
  - Shift+Enter for quick answer validation
  - Context-aware shortcuts that respect input field focus
- **User Experience**: Intuitive interface improvements
  - Smooth animations and transitions (300ms duration)
  - Visual feedback for all interactive elements
  - Accessible design with proper focus management
- **Performance**: Optimized for smooth operation
  - Efficient DOM updates with batch operations
  - Memory management with automatic cleanup
  - Event delegation for optimal performance
- **State Persistence**: Intelligent settings management
  - Sidebar open/close state saved across sessions
  - Navigation preferences maintained
  - Integration with existing settings system

### Technical

- **Architecture**: Modular and maintainable code structure
  - Centralized navigation function with history support
  - Event-driven updates for real-time synchronization
  - Clean separation of concerns between components
- **Integration**: Seamless compatibility with existing features
  - Works with search/filter system maintaining context
  - Syncs with favorites and statistics systems
  - Maintains compatibility with all existing functionality

## [2.4.0] - 2025-07-13

### Added

- **Advanced Search & Filters System**: Comprehensive search functionality for questions
  - Text search across questions, answers, and comments with multi-word support
  - Question number search with real-time auto-completion suggestions
  - Status filters: Answered, Unanswered, and Favorite questions
  - Smart caching system for improved search performance
  - Combined search and filter operations support
- **Search Interface**: Collapsible search section with intuitive UX
  - Collapsed by default with full header clickable area
  - Smooth animations and visual feedback
  - Real-time result counters and status indicators
- **Settings Integration**: Optional advanced search display
  - New setting to show/hide advanced search (disabled by default)
  - Automatic state cleanup when disabling search functionality
  - Persistent user preference storage

### Enhanced

- **Question Navigation**: Improved navigation compatibility with filtered results
- **Filter Counts**: Dynamic counters showing answered/unanswered/favorite question counts
- **User Experience**: Mobile-responsive design with touch-friendly interactions
- **Performance**: Efficient question detection across current and previous sessions
- **Interface**: Clean and professional search interface with proper state management

## [2.3.0] - 2025-07-09

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

- **v2.8.x**: Enhanced mobile navigation system with swipe gestures, touch-optimized UI, and mobile bottom navigation bar
- **v2.7.x**: Informative tooltips system with keyboard shortcuts and enhanced user guidance
- **v2.6.x**: Enhanced visual status indicators with color-coded badges and question organization system
- **v2.5.x**: Enhanced navigation system with keyboard shortcuts, progress sidebar, history, animated progress indicator, embedded image display fixes, and performance optimizations
- **v2.4.x**: Advanced search and filtering system with smart auto-completion
- **v2.3.x**: Toolbar visibility toggle and UI declutter option
- **v2.2.x**: Changelog functionality and improvements
- **v2.1.x**: Favorites and study management features
- **v2.0.x**: Complete redesign with dark mode and statistics
- **v1.5.x**: Multi-exam support and responsive design
- **v1.0.x**: Initial stable release with core functionality
- **v0.1.x**: Proof of concept and project setup
