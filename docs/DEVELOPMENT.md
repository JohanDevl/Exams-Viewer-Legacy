# Development Guide - Exams Viewer

## 🏗️ Project Structure

```
Exams-Viewer/
├── index.html              # GitHub Pages main page
├── styles.css              # Web interface styles with dark mode
├── script.js               # Frontend JavaScript with statistics
├── README.md              # Main documentation
├── requirements.txt        # Python dependencies
├── scripts/               # Python automation scripts
│   ├── scraper.py         # Main scraping logic
│   └── update_all_exams.py # Automation script
├── data/                  # Exam data (JSON files)
│   ├── CAD.json          # Exam questions
│   ├── CAD_links.json    # Question links
│   └── ... (other exams)
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── FEATURES.md       # Feature documentation
│   ├── USAGE.md          # Usage guide
│   ├── INSTALLATION.md   # Installation guide
│   ├── STATISTICS.md     # Statistics system
│   └── DEVELOPMENT.md    # This file
└── .github/workflows/     # GitHub Actions
    └── manual-update.yml  # Manual update workflow
```

## 🔧 Development Setup

### Prerequisites

- **Python 3.11+** - For running scraper scripts
- **Git** - For version control
- **GitHub account** - For automation and contributions
- **Modern web browser** - Chrome, Firefox, Safari, Edge
- **Code editor** - VS Code recommended with extensions

### Local Development

1. **Clone and setup**

   ```bash
   git clone https://github.com/JohanDevl/Exams-Viewer.git
   cd Exams-Viewer
   pip install -r requirements.txt
   ```

2. **Test scraper**

   ```bash
   python scripts/update_all_exams.py --exam CAD
   ```

3. **Serve web interface**
   ```bash
   python -m http.server 8000
   # Open http://localhost:8000
   ```

## 🌐 GitHub Pages Deployment

- **Automatic deployment** from `main` branch
- **Static files** served directly (no build process)
- **URL**: `https://JohanDevl.github.io/Exams-Viewer/`
- **Files**: `index.html`, `styles.css`, `script.js`, `data/`

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

1. Run scraper: `python scripts/update_all_exams.py --exam NEW_CODE`
2. Verify files: `data/NEW_CODE.json` and `data/NEW_CODE_links.json`
3. Commit and push changes
4. New exam appears automatically in web interface

## 🤖 Manual Updates

### GitHub Actions

1. Go to repository "Actions" tab
2. Select "Manual Data Update"
3. Click "Run workflow"
4. Configure options:
   - **Force rescan**: Refresh all links
   - **Force update**: Update all existing questions
   - **Specific exam**: Target single exam

### Command Line Options

```bash
# Update all exams (smart detection)
python scripts/update_all_exams.py

# Force rescan all links
python scripts/update_all_exams.py --force-rescan

# Force update all questions
python scripts/update_all_exams.py --force-update

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Combine options
python scripts/update_all_exams.py --exam CAD --force-rescan --force-update
```

## 📝 Code Style Guidelines

### Python (scripts/)

- **PEP 8 compliance** - Standard Python style
- **Type hints** - Use where appropriate
- **Docstrings** - All functions must have docstrings
- **Error handling** - Graceful exception handling
- **f-strings** - Preferred for string formatting

### JavaScript (script.js)

- **ES6+ features** - const/let, arrow functions, async/await
- **camelCase** - Naming convention
- **JSDoc comments** - For complex functions
- **Async/await** - Preferred over Promises
- **Template literals** - For string interpolation

### HTML/CSS

- **Semantic HTML5** - Proper element usage
- **2-space indentation** - Consistent formatting
- **ARIA labels** - Accessibility support
- **CSS custom properties** - For theming
- **BEM methodology** - CSS class naming

## 🔒 Security Best Practices

### Frontend Security

- **Input sanitization** - All user inputs
- **XSS protection** - Safe HTML rendering
- **HTTPS only** - All external requests
- **Error boundaries** - Graceful error handling

### Backend Security

- **Rate limiting** - Respect server limits (5-10 second delays)
- **Proper headers** - HTTP request headers
- **Data validation** - All external data
- **No credentials** - No API keys in repository

## 🧪 Testing

### Local Testing

```bash
# Test scraper functionality
python -c "from scripts.scraper import update_exam_data; print(update_exam_data('CAD')['status'])"

# Validate JSON data
python -c "import json; print(len(json.load(open('data/CAD.json'))['questions']))"

# Test web interface
python -m http.server 8000
```

### Testing Checklist

- [ ] Scraper runs without errors
- [ ] JSON files are valid
- [ ] Web interface loads correctly
- [ ] Exam lists are alphabetically sorted
- [ ] Statistics system functions
- [ ] Dark mode toggle works
- [ ] Export features work
- [ ] Mobile responsive design

## 🛠️ Contributing

### Contribution Process

1. **Fork** the repository
2. **Create branch** - `feature/feature-name` or `fix/bug-name`
3. **Develop and test** locally
4. **Follow code style** guidelines
5. **Submit pull request** with clear description

### Types of Contributions

- **Bug fixes** - Improve reliability and fix issues
- **New features** - Enhance functionality
- **Documentation** - Improve clarity and completeness
- **Performance** - Optimize code and reduce load times
- **Testing** - Add or improve test coverage

## 📈 Performance Considerations

### Frontend Optimizations

- **Lazy loading** - Load exam data on demand
- **Caching** - Cache exam metadata
- **DOM optimization** - Efficient manipulation
- **Compression** - Statistics data compression (60-80% reduction)

### Backend Optimizations

- **Smart updates** - Only update changed content
- **Batch processing** - Process multiple items efficiently
- **Memory management** - Efficient resource usage
- **Parallel processing** - Where safe to implement

## 🔧 Development Tools

### Recommended VS Code Extensions

- **Python** - Python language support
- **Prettier** - Code formatting
- **ESLint** - JavaScript linting
- **Live Server** - Local development server

### Useful Commands

```bash
# Python formatting
black scripts/

# JavaScript linting
eslint script.js

# Local server
python -m http.server 8000

# Git workflow
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 🔍 Monitoring and Debugging

### Logs and Monitoring

- **GitHub Actions logs** - Workflow execution details
- **Console output** - Local debugging information
- **Browser DevTools** - Frontend debugging
- **Error reporting** - Detailed error messages

### Common Issues

**Frontend Issues:**

- Exam list not alphabetical → Check sorting functions
- Questions not loading → Verify JSON file structure
- Export not working → Check browser compatibility

**Backend Issues:**

- Scraping failures → Check rate limits and website changes
- Data corruption → Verify atomic file operations
- Performance issues → Review request patterns

## 📋 Critical Requirements

### Business Rules

1. **Exam lists MUST be alphabetically sorted** - Critical requirement
2. **Questions sorted by question_number** - Numerical order
3. **Backward compatibility** - Maintain existing JSON format
4. **Rate limiting** - Respect ExamTopics.com limits (5-10 seconds)

### Data Integrity

- **JSON validation** - Before processing
- **Error handling** - Graceful degradation
- **Atomic operations** - Prevent data corruption
- **Backup considerations** - Safe file operations

This development guide covers the essential information needed to contribute to the Exams Viewer project. For detailed feature documentation, see the other files in the `docs/` directory.
