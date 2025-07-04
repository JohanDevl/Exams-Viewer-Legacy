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
    └── daily-update.yml  # Daily automation
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

- **Trigger**: Daily at 2:00 AM UTC
- **Script**: `scripts/update_all_exams.py`
- **Process**: Automatically updates all exam data

### Manual Triggers

1. Go to repository "Actions" tab
2. Select "Daily Data Update"
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
3. Automation will include in daily updates

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
