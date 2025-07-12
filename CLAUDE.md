# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Exams-Viewer is an automated exam questions scraper and viewer for ExamTopics.com with a modern web interface. It combines Python-based web scraping automation with a vanilla JavaScript frontend for viewing and practicing exam questions.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 with dark mode support
- **Backend**: Python 3.x with requests and BeautifulSoup4
- **Data Storage**: JSON files in `/data/` directory
- **Automation**: GitHub Actions for scheduled scraping
- **Deployment**: GitHub Pages (static hosting)

## Development Commands

### Python Scripts
```bash
# Install dependencies
pip install -r requirements.txt

# Update all exams (scraping)
python scripts/update_all_exams.py

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Manual scraping (individual script)
python scripts/scraper.py
```

### Web Interface
- No build process required - open `index.html` directly in browser
- For GitHub Pages deployment: commit to main branch, Pages serves automatically
- Local development: Use any static web server (e.g., `python -m http.server`)

## Architecture

### Frontend Architecture (`script.js`, `index.html`, `styles.css`)
- **State Management**: Global variables for current exam, questions, UI state, and statistics
- **Event System**: Centralized event listener setup in `setupEventListeners()`
- **Data Flow**: Async JSON loading → state update → DOM rendering
- **Features**: Question navigation, favorites/notes system, statistics tracking, export functionality
- **Critical Pattern**: Exam lists MUST always be sorted alphabetically using `localeCompare()`

### Backend Architecture (`scripts/`)
- **Scraper (`scraper.py`)**: Core web scraping logic with rate limiting (5-10 second delays)
- **Batch Processor (`update_all_exams.py`)**: Automated exam updates with progress tracking
- **Data Format**: JSON files with standardized structure for questions and metadata

### Data Structure
```
data/
├── {EXAM_CODE}.json          # Main exam questions data
├── {EXAM_CODE}_links.json    # Scraping metadata and links
└── manifest.json             # Available exams registry
```

## Critical Business Rules

1. **Alphabetical Sorting**: Exam lists MUST be displayed alphabetically - this is enforced in multiple UI components
2. **Rate Limiting**: Respect ExamTopics.com servers with 5-10 second delays between requests
3. **Data Integrity**: Always validate JSON structure and handle malformed data gracefully
4. **Question Ordering**: Questions sorted numerically by `question_number` field
5. **Responsive Design**: Mobile-first approach with dark mode support

## Key Features

### Frontend Features
- **Question Navigation**: Previous/Next with keyboard shortcuts, random question selection
- **Answer Validation**: Compare user selections with correct answers, highlight mode for previewing
- **Favorites & Notes**: Category-based organization with custom categories and text notes
- **Statistics System**: Session tracking, progress metrics, performance analytics with local storage
- **Export Functionality**: PDF and JSON export of questions and user data
- **Settings Management**: Persistent settings for UI preferences and display options
- **Advanced Search & Filters**: Comprehensive search system with text search, auto-completion, and status filters

### Backend Features
- **Smart Scraping**: Incremental updates, change detection, robust error handling
- **Progress Tracking**: Callback-based progress reporting during batch operations
- **Data Validation**: JSON schema validation and corruption recovery

## Code Conventions

### JavaScript (ES6+)
- Use `const/let`, arrow functions, async/await, template literals
- camelCase naming, descriptive variables, JSDoc for complex functions
- **Critical**: Always sort exam arrays with `.sort((a, b) => a.code.localeCompare(b.code))`

### Python (PEP 8)
- Type hints, docstrings, f-string formatting, specific exception handling
- Modular functions with single responsibilities

### CSS
- CSS custom properties for theming, BEM methodology for classes
- Flexbox/Grid layouts, responsive design principles
- Dark mode via `prefers-color-scheme` and CSS variables

## Common Development Patterns

### Async Data Loading
```javascript
async function loadExam(examCode) {
  showLoading(true);
  try {
    const response = await fetch(`data/${examCode}.json`);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const data = await response.json();
    // Process data...
  } catch (error) {
    showError(`Error loading exam: ${error.message}`);
  } finally {
    showLoading(false);
  }
}
```

### Python Scraping with Error Handling
```python
def scrape_page(link):
    try:
        response = requests.get(link, headers=HEADERS)
        response.raise_for_status()
        # Process response...
    except Exception as e:
        return {"error": f"Request failed: {e}"}
```

## Testing and Validation

- Test with multiple exam codes to ensure compatibility
- Verify alphabetical sorting in all exam list displays
- Validate export functionality across browsers
- Test error handling with malformed JSON data
- Verify rate limiting compliance in scraping operations

## Deployment Notes

### GitHub Pages
- All paths must be relative for proper GitHub Pages hosting
- Ensure CORS compatibility for JSON data loading
- Test with full GitHub Pages URL structure before deployment

### Security and Ethics
- Respect ExamTopics.com rate limits and terms of service
- Educational use only - all exam content belongs to respective owners
- Implement proper input sanitization and data validation
- No sensitive data should ever be committed to repository

## Advanced Search & Filters System

### Architecture
- **State Management**: Global variables `allQuestions`, `filteredQuestions`, `isSearchActive`, `searchCache`
- **Search Logic**: Text-based search across questions, answers, and comments with multi-word support
- **Filter System**: Status-based filters (answered, unanswered, favorites) with dynamic counting
- **Auto-completion**: Real-time question number suggestions with visual highlighting
- **Integration**: Seamless integration with existing navigation and statistics systems

### Key Components
- **Search Interface**: Collapsible section with full header clickability (collapsed by default)
- **Text Search**: `searchQuestions()` function with caching for performance optimization
- **Status Detection**: Smart detection of answered questions across current and previous sessions
- **Filter Application**: `applyFilters()` combines search results with status filters
- **Settings Integration**: Optional display via `showAdvancedSearch` setting (false by default)

### Critical Implementation Details
- **Question Detection**: Uses `statistics.currentSession.questions` and `statistics.sessions` to track answered questions
- **Search State**: Maintains separate arrays for original (`allQuestions`) and filtered (`currentQuestions`) states
- **Cache Management**: Search results cached by query string for performance
- **Mobile Responsive**: Adaptive UI for mobile devices with touch-friendly interactions
- **State Cleanup**: Automatic reset of search state when disabling the feature

### Developer Notes
- Always call `updateFilterCounts()` after answer validation or favorite changes
- Search section visibility controlled by `updateAdvancedSearchVisibility()`
- Navigation functions work with current filtered results, not original question set
- Auto-completion shows max 5 suggestions to avoid UI clutter

## Documentation and Changelog Management

### Changelog Structure (`CHANGELOG.md`)
- **Format**: Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standard
- **Sections**: Added, Enhanced, Changed, Fixed, Security, etc.
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Date Placeholder**: Use `{PR_MERGE_DATE}` for automated date replacement by GitHub Actions
- **Version History Summary**: Always update the summary section at the end when adding new versions

### Critical Changelog Requirements
1. **Date Placeholder**: NEVER replace `{PR_MERGE_DATE}` manually - it's handled by automated workflows
2. **Version History Summary**: Always add new version entries in the summary section (e.g., `v2.4.x: Advanced search and filtering system`)
3. **User-Focused**: Describe impact and benefits, not implementation details
4. **Consistent Format**: Group changes by type, use bullet points, maintain proper hierarchy
5. **Workflow Integration**: The changelog is automatically processed by `.github/workflows/update-changelog.yml`

### Example Changelog Entry
```markdown
## [2.4.0] - {PR_MERGE_DATE}

### Added
- **Feature Name**: Brief description
  - Sub-feature 1
  - Sub-feature 2

### Enhanced
- **Component**: Improvement description

## Version History Summary
- **v2.4.x**: Brief version summary
- **v2.3.x**: Previous version...
```

## File Locations

- Main interface: `/index.html`, `/script.js`, `/styles.css`
- Python scripts: `/scripts/scraper.py`, `/scripts/update_all_exams.py`
- Documentation: `/docs/` (comprehensive guides for features and development)
- Data files: `/data/{EXAM_CODE}.json` and `/data/{EXAM_CODE}_links.json`
- Dependencies: `/requirements.txt` (requests==2.32.3, beautifulsoup4==4.13.4)