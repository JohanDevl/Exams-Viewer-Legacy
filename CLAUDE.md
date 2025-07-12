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

## File Locations

- Main interface: `/index.html`, `/script.js`, `/styles.css`
- Python scripts: `/scripts/scraper.py`, `/scripts/update_all_exams.py`
- Documentation: `/docs/` (comprehensive guides for features and development)
- Data files: `/data/{EXAM_CODE}.json` and `/data/{EXAM_CODE}_links.json`
- Dependencies: `/requirements.txt` (requests==2.32.3, beautifulsoup4==4.13.4)