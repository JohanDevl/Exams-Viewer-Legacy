# Development Guide - Exams Viewer

## 🏗️ Project Structure

```
Exams-Viewer/
├── index.html              # GitHub Pages main page
├── styles.css              # Web interface styles
├── script.js               # Frontend JavaScript
├── README.md              # Main documentation
├── requirements.txt        # Python dependencies
├── .gitignore             # Git ignore rules
├── scripts/               # Python automation scripts
│   ├── scraper.py         # Main scraping logic
│   └── update_all_exams.py # Automation script
├── data/                  # Exam data (JSON files)
│   ├── CAD.json          # Exam questions
│   ├── CAD_links.json    # Question links
│   └── ... (other exams)
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   └── DEVELOPMENT.md    # This file
└── .github/workflows/     # GitHub Actions
    └── weekly-update.yml  # Weekly automation
```

## 🔧 Development Setup

### Prerequisites

- Python 3.11+
- Git
- GitHub account (for automation)
- Modern web browser
- Code editor (VS Code recommended)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Exams-Viewer
   ```

2. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run manual update**

   ```bash
   python scripts/update_all_exams.py
   ```

4. **Test scraper directly**

   ```bash
   python -c "from scripts.scraper import update_exam_data; update_exam_data('CAD', None)"
   ```

5. **Serve web interface locally**

   ```bash
   # Use Python to serve static files
   python -m http.server 8000

   # Or use Node.js if available
   npx http-server -p 8000
   ```

   Then open `http://localhost:8000` in your browser.

## 🌐 GitHub Pages

The project serves a web interface via GitHub Pages:

- **URL**: `https://username.github.io/Exams-Viewer/`
- **Files**: `index.html`, `styles.css`, `script.js`
- **Data**: Loaded from `data/` directory via JavaScript

### Web Interface Features

- Browse exam questions
- Search and filter
- View answers and discussions
- Responsive design
- PDF export
- Customizable settings
- Random navigation

## 🤖 Automation

### GitHub Actions Workflow

- **Trigger**: Weekly on Saturday at 2:00 AM UTC
- **Script**: `scripts/update_all_exams.py`
- **Process**: Automatically updates all exam data

### Manual Triggers

1. Go to repository "Actions" tab
2. Select "Weekly Data Update"
3. Click "Run workflow"
4. Configure options if needed

## 📊 Data Management

### JSON Structure

```json
{
  "status": "complete",
  "error": null,
  "questions": [
    {
      "question": "Question text...",
      "answers": ["A. Option 1", "B. Option 2"],
      "comments": [...],
      "most_voted": "A",
      "question_number": "1",
      "link": "https://...",
      "error": null
    }
  ]
}
```

### Adding New Exams

1. Run scraper for new exam code
2. Commit generated JSON files
3. Automation will include in weekly updates

## 🚀 Deployment

### GitHub Pages

- Automatic deployment from `main` branch
- Static files served directly
- No build process required
- Automatic SSL/HTTPS

### Python Scripts

- Run via GitHub Actions
- Can be executed locally
- Respect rate limiting

## 🔍 Monitoring

### Logs

- GitHub Actions logs
- `update_log.json` generated per run
- Console output for debugging

### Error Handling

- Graceful failure handling
- Retry logic for network issues
- Detailed error reporting

## 🛠️ Contributing

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Test changes locally
4. Submit a pull request
5. Ensure CI passes

### Types of Contributions

- **Bug fixes**: Improve reliability
- **New features**: Enhance user interface
- **Documentation**: Improve clarity
- **Performance**: Optimize scripts
- **Tests**: Improve test coverage

## 📝 Code Style

### Python

- PEP 8 compliance
- Docstrings for all functions
- Proper error handling
- Type hints recommended

### JavaScript

- Modern ES6+ syntax
- Clear comments
- Async/await error handling
- Modular and reusable code

### HTML/CSS

- Semantic markup
- WCAG accessibility
- Responsive design
- CSS variables for consistency

## 🔒 Security

### Best Practices

- No API keys in repository
- Rate limiting respected
- HTTPS for all requests
- Safe HTML rendering
- User input validation

### Security Considerations

- Sanitize ExamTopics data
- XSS protection
- Client and server-side validation
- Secure error handling

## 🧪 Testing

### Local Testing

```bash
# Test exam scraping
python -c "from scripts.scraper import update_exam_data; print(update_exam_data('CAD')['status'])"

# Verify JSON data
python -c "import json; print(len(json.load(open('data/CAD.json'))['questions']))"

# Test web interface
python -m http.server 8000
```

### Automated Testing

- Unit tests for scraping functions
- Integration tests for workflows
- UI tests (coming soon)

## 🎨 Interface Customization

### Modifying Styles

1. Edit `styles.css`
2. Use CSS variables for consistency
3. Test on different screen sizes
4. Verify accessibility

### Adding Features

1. Modify `script.js` for logic
2. Update `index.html` if needed
3. Add styles in `styles.css`
4. Test browser compatibility

## 📱 Mobile Development

### Responsive Considerations

- Breakpoints for tablets and mobile
- Optimized touch navigation
- Readable font sizes
- Appropriate button sizes

### Mobile Testing

- Test on different devices
- Verify performance
- Optimize for slow connections

## 🔧 Development Tools

### Recommended Editor: VS Code

Useful extensions:

- Python
- Prettier (formatting)
- ESLint (JavaScript linting)
- Live Server (local server)

### Command Line Tools

```bash
# Python formatting
black scripts/

# JavaScript linting
eslint script.js

# Local server
python -m http.server 8000
```

## 📈 Performance

### Frontend Optimizations

- Lazy loading of data
- Exam caching
- Image compression
- Asset minification (coming soon)

### Backend Optimizations

- Rate limiting
- Exponential backoff retry
- Batch processing
- Efficient memory management

## 🔄 Development Workflow

### Feature Development

1. Create `feature/feature-name` branch
2. Develop and test locally
3. Commit with descriptive messages
4. Push and create PR
5. Code review and merge

### Bug Fixes

1. Create `fix/bug-name` branch
2. Reproduce bug locally
3. Implement fix
4. Test the fix
5. Create PR with detailed description

## 🎯 Roadmap

### Planned Features

- [ ] Dark mode
- [ ] Advanced search
- [ ] Progress statistics
- [ ] Custom data export
- [ ] Multi-language interface
- [ ] Offline mode
- [ ] Complete automated testing

### Technical Improvements

- [ ] Performance optimization
- [ ] Better error handling
- [ ] Legacy code refactoring
- [ ] Complete API documentation
- [ ] Monitoring and alerts

## 🤝 Community

### Communication Channels

- GitHub Issues for bugs
- GitHub Discussions for questions
- Pull Requests for contributions
- Wiki for community documentation

### Contributing to Documentation

- Improve existing guides
- Add usage examples
- Translate documentation
- Create video tutorials

## 🎯 Cursor Rules

This project includes comprehensive Cursor Rules to ensure consistent development practices and maintain code quality.

### 📁 Rules Location

The Cursor Rules are stored in `.cursor/rules/exams-viewer.mdc` and are automatically applied to all development sessions.

### 🔧 Key Guidelines

#### Critical Business Rules

1. **Exam lists MUST be displayed in alphabetical order** - This is a critical requirement stored in memory
2. Questions must be sorted numerically by question_number
3. Maintain backward compatibility with existing JSON data format
4. Respect ExamTopics.com rate limits (5-10 second delays)

#### Code Style Standards

**JavaScript (script.js)**

- Use ES6+ features (const/let, arrow functions, async/await)
- Follow camelCase naming convention
- Add JSDoc comments for complex functions
- Prefer async/await over Promises for readability
- Use template literals for string interpolation

**Python (scripts/)**

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Add docstrings for all functions
- Prefer f-strings for string formatting
- Handle exceptions gracefully with specific error messages

**HTML/CSS**

- Use semantic HTML5 elements with proper indentation (2 spaces)
- Include appropriate ARIA labels for accessibility
- Use CSS custom properties for consistent theming
- Follow BEM methodology for class naming
- Maintain responsive design principles

#### Architecture Patterns

**Frontend Architecture**

- **State Management**: Global state variables for current exam, questions, and UI state
- **Event Handling**: Centralized event listener setup in setupEventListeners()
- **Data Flow**: Async data loading → state update → UI rendering
- **Error Handling**: Centralized error/success message display functions

**Backend Architecture**

- **Scraping Logic**: Modular functions for different scraping phases
- **Data Persistence**: JSON file storage with atomic updates
- **Rate Limiting**: Built-in delays to respect server limits
- **Progress Tracking**: Callback-based progress reporting

#### Common Development Patterns

**Async Data Loading**

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

**Python Error Handling**

```python
def scrape_page(link):
    try:
        response = requests.get(link, headers=HEADERS)
        response.raise_for_status()
        # Process response...
    except Exception as e:
        return {"error": f"Request failed: {e}"}
```

**Alphabetical Sorting (Critical)**

```javascript
// Always sort exam lists alphabetically
const sortedExamCodes = Object.keys(availableExams).sort();
examOptions.sort((a, b) => a.code.localeCompare(b.code));
```

### 🔍 Code Review Checklist

The Cursor Rules include a comprehensive checklist:

- [ ] Exam lists are sorted alphabetically
- [ ] Error handling is implemented
- [ ] Loading states are shown for async operations
- [ ] Data validation is performed
- [ ] Rate limiting is respected in scraping
- [ ] Responsive design is maintained
- [ ] Accessibility features are preserved
- [ ] JSON data format is consistent
- [ ] Performance optimizations are applied
- [ ] Security best practices are followed

### 🚨 Common Issues and Solutions

**Frontend Issues**

- **Exam list not alphabetical**: Check sorting in populateExamDropdown() and displayAvailableExams()
- **Questions not loading**: Verify JSON file exists and has correct structure
- **Export not working**: Check browser compatibility and PDF generation logic

**Backend Issues**

- **Scraping failures**: Check rate limits and website structure changes
- **Data corruption**: Implement atomic file writes and validation
- **Performance issues**: Review request patterns and implement caching

### 📋 File Structure Conventions

**Data Files**

- `{EXAM_CODE}.json`: Main exam data with questions
- `{EXAM_CODE}_links.json`: Question links and scraping metadata
- All exam codes should be uppercase (e.g., "CIS-ITSM", "CAD")

**Script Organization**

- `scraper.py`: Core scraping logic and utilities
- `update_all_exams.py`: Automation and batch processing
- Keep scripts focused on single responsibilities

### 🛡️ Security Guidelines

- Sanitize all user inputs in frontend
- Use proper HTTP headers in scraping requests
- Validate all external data before processing
- Implement proper error boundaries

### ⚡ Performance Considerations

- Use HEAD requests for existence checks
- Implement parallel processing where safe
- Cache exam metadata to reduce API calls
- Optimize DOM manipulation in frontend

The Cursor Rules ensure that all development follows these established patterns and maintains the project's quality standards. They are automatically applied when working with Cursor IDE and help maintain consistency across all contributions.
