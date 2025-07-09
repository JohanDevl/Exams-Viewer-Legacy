# Usage Guide

## 🌐 Web Interface Usage

### Getting Started

**Online Access**: Visit [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)

**Local Development**:

```bash
# Serve the application locally to avoid CORS issues
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Basic Usage

1. **Select an exam** from the dropdown (automatically sorted alphabetically)
2. **Browse questions** with intuitive navigation controls (prev/next/random/jump)
3. **Use highlight mode** to preview correct answers with detailed usage tracking
4. **Track your progress** in the comprehensive statistics panel with multiple tabs
5. **Toggle between light and dark modes** with automatic system detection
6. **Export statistics** to JSON format for external analysis
7. **Export questions** to PDF for offline study
8. **Reset question attempts** to practice again with reset tracking
9. **View per-question statistics** including reset counts and highlight usage
10. **Monitor session progress** with real-time completion tracking

## 📊 Statistics Features

### Core Statistics Usage

- **Automatic Tracking** - Sessions start automatically when loading an exam with seamless background tracking
- **Performance Metrics** - Track correct, incorrect, and preview answers with detailed analytics and scoring
- **Study Analytics** - Monitor time spent, reset patterns, and highlight usage with comprehensive insights
- **Progress Visualization** - Interactive charts showing improvement over time with trend analysis
- **Data Export** - Export statistics to JSON format for external analysis and backup
- **Storage Optimization** - Advanced compression reduces storage by 60-80% with backward compatibility
- **Mobile Optimization** - Efficient data structures optimized for mobile devices with limited storage
- **Backward Compatibility** - Automatic migration from older data formats with data preservation

### Advanced Statistics Tracking

- **First Action Priority** - Only the first interaction with each question counts toward statistics for accuracy
- **Comprehensive Metrics** - Track correct answers, incorrect answers, and preview (highlight) usage separately
- **Session Analytics** - Detailed session tracking with completion rates, time spent, and performance metrics
- **Reset Monitoring** - Track how often questions are reset and identify study patterns and difficulty areas
- **Highlight Analytics** - Monitor answer preview usage and effectiveness with detailed interaction tracking
- **Per-Exam Breakdown** - Detailed statistics for each exam type with averages, best scores, and trends
- **Progress Trends** - Visual charts showing improvement over time with performance analytics
- **Question-Level Insights** - Individual question statistics with attempt history and performance data

### Statistics Interface

- **📈 Overview Dashboard** - Total questions, accuracy rates, study time with visual pie charts
- **📚 Per-Exam Analytics** - Performance breakdown by exam type with detailed progress bars
- **🕐 Session History** - Comprehensive session tracking with timestamps and completion rates
- **📊 Progress Charts** - Visual representation of improvement over time with trend analysis
- **🎯 Highlight Tracking** - Monitor answer preview usage patterns and effectiveness metrics
- **🔄 Reset Monitoring** - Track question reset patterns and study behavior analytics
- **💾 Data Management** - Advanced storage optimization with compression and migration tools
- **📤 Export Functionality** - Full data export with statistics and session details in JSON format

## 🌙 Dark Mode Usage

### Theme Controls

- **Automatic Detection** - Application automatically detects your system's theme preference
- **Manual Toggle** - Click the theme toggle button in the header or settings panel
- **Persistent Settings** - Your theme preference is saved and remembered across sessions
- **System Integration** - Follows your OS dark/light mode changes automatically
- **Mobile Support** - Full dark mode support on mobile devices with optimized interface

### Theme Features

- **Responsive Design** - All components automatically adapt to theme changes
- **Statistics Integration** - Charts and graphs adapt to theme with proper contrast
- **Accessibility** - High contrast ratios maintained in both light and dark modes
- **Smooth Transitions** - Animated theme changes provide smooth visual feedback
- **Component Adaptation** - All UI elements automatically update colors and styling

## 🎯 Highlight System Usage

### Answer Preview

- **Toggle Visibility** - Click the highlight button to show/hide correct answers
- **Visual Feedback** - Button state changes to indicate when highlight mode is active
- **Statistics Tracking** - Highlight usage is tracked separately from regular attempts
- **Performance Impact** - Using highlights counts as "preview" actions in statistics
- **Mobile Optimization** - Touch-friendly highlight toggle with clear visual feedback

### Highlight Features

- **First Action Tracking** - Highlight usage counts as your first action for statistics
- **Reset Integration** - Highlight usage is tracked even when questions are reset
- **Usage Analytics** - Monitor how often you use highlights and their effectiveness
- **Study Patterns** - Identify which questions you preview vs. attempt directly

## 🔧 Manual Scraping Usage

### Basic Commands

```bash
# Update all exams (smart detection - only updates changed questions)
python scripts/update_all_exams.py

# Update all exams with force rescan of links
python scripts/update_all_exams.py --force-rescan

# Force update ALL existing questions (ignores change detection)
python scripts/update_all_exams.py --force-update

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Update specific exam with force rescan + force update
python scripts/update_all_exams.py --exam CAD --force-rescan --force-update
```

### GitHub Actions Usage

**Manual trigger with options:**

1. Go to the "Actions" tab on GitHub
2. Select "Manual Data Update"
3. Click "Run workflow"
4. **Available Options:**
   - **Force rescan**: Check to force rescan all links
   - **Force update**: Check to force update all existing questions
   - **Specific exam**: Enter an exam code to update only that exam

#### Advanced Update Options

**Force Rescan** is useful when:

- New questions have been added to ExamTopics but the links file shows "complete"
- You want to ensure all links are refreshed
- There have been changes to the ExamTopics website structure

**Force Update** is useful when:

- You want to refresh all existing questions with the latest data
- Apply scraper improvements to previously scraped questions
- Update `most_voted` answers that were previously `null`
- Ensure all questions benefit from enhanced extraction logic

## 📱 Mobile Usage

### Mobile Interface

- **Responsive Design** - Optimized for all screen sizes with touch-friendly controls
- **Statistics Panel** - Mobile-optimized statistics interface with swipe navigation
- **Theme Support** - Full dark mode support with mobile-specific optimizations
- **Touch Controls** - All buttons and controls optimized for touch interaction
- **Performance** - Optimized data structures for mobile devices with limited storage

### Mobile Features

- **Swipe Navigation** - Swipe between questions on mobile devices
- **Touch Highlights** - Touch-friendly highlight toggle with visual feedback
- **Mobile Charts** - Statistics charts optimized for mobile screens
- **Offline Support** - Export functionality works on mobile browsers
- **Storage Efficiency** - Advanced compression optimized for mobile storage limitations

## 🔍 Search and Filtering

### Search Features

- **Text Search** - Search question content, answers, and discussions
- **Filter Options** - Filter by exam type, difficulty, or completion status
- **Quick Navigation** - Jump to specific question numbers
- **Random Practice** - Random question selection for varied practice
- **Bookmark System** - Mark questions for later review

### Advanced Filtering

- **Performance Filters** - Filter by your performance (correct/incorrect/not attempted)
- **Time Filters** - Filter by time spent on questions
- **Reset Filters** - Filter by questions you've reset multiple times
- **Highlight Filters** - Filter by questions where you used highlights

## 📄 Export Features

### PDF Export

- **Question Export** - Export questions to PDF for offline study
- **Custom Formatting** - Choose formatting options for exported content
- **Answer Inclusion** - Option to include or exclude answers in export
- **Browser Compatibility** - Works across all modern browsers

### Statistics Export

- **JSON Export** - Export complete statistics data to JSON format
- **Data Portability** - Use exported data in external analysis tools
- **Backup Creation** - Create backups of your study progress
- **Migration Support** - Export data for migration to other devices

## ⚙️ Settings and Customization

### User Preferences

- **Theme Selection** - Choose between light, dark, or automatic theme
- **Navigation Settings** - Customize navigation behavior and shortcuts
- **Display Options** - Adjust question display format and layout
- **Export Settings** - Configure default export options and formats

### Advanced Settings

- **Statistics Configuration** - Configure what statistics to track
- **Performance Settings** - Adjust interface performance for your device
- **Storage Management** - View and manage stored data and statistics
- **Reset Options** - Reset statistics, settings, or individual exam progress

## 🔧 Troubleshooting

### Common Issues

- **Questions not loading** - Check browser console for errors, verify JSON file exists
- **Statistics not saving** - Ensure localStorage is enabled in your browser
- **Export not working** - Check browser compatibility and disable popup blockers
- **Theme not switching** - Clear browser cache and reload the page

### Performance Issues

- **Slow loading** - Check storage usage and consider resetting old statistics
- **Memory issues** - Use the statistics compression feature to reduce memory usage
- **Mobile performance** - Enable mobile optimizations in settings
- **Storage full** - Export and clear old statistics data

### Data Issues

- **Missing statistics** - Check if data migration is needed for older formats
- **Corrupted data** - Use the reset options to clear corrupted statistics
- **Sync issues** - Export data before making changes to prevent loss
- **Migration problems** - Check console for migration errors and warnings
